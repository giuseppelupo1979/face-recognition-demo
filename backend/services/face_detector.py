"""Servizio di Face Detection - rileva volti e landmarks nel frame."""

import cv2
import numpy as np
import face_recognition
from config.settings import (
    DETECTION_MODEL, MIN_FACE_SIZE, MIN_BRIGHTNESS,
    MAX_BRIGHTNESS, BLUR_THRESHOLD, MIN_FACE_RATIO, MAX_FACE_RATIO
)


class FaceDetector:
    def __init__(self):
        self.model = DETECTION_MODEL

    def detect_faces(self, frame):
        """
        Rileva volti nel frame.
        Ritorna lista di dict con bounding box e landmarks.
        """
        # face_recognition usa RGB, OpenCV usa BGR
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Rileva posizioni volti (top, right, bottom, left)
        face_locations = face_recognition.face_locations(rgb_frame, model=self.model)

        # Filtra volti troppo piccoli
        valid_faces = []
        for loc in face_locations:
            top, right, bottom, left = loc
            w = right - left
            h = bottom - top
            if w >= MIN_FACE_SIZE and h >= MIN_FACE_SIZE:
                valid_faces.append(loc)

        return valid_faces

    def get_face_landmarks(self, frame, face_locations=None):
        """Estrai i 68 face landmarks per ogni volto."""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        landmarks_list = face_recognition.face_landmarks(rgb_frame, face_locations)
        return landmarks_list

    def get_face_encodings(self, frame, face_locations=None):
        """Genera i 128-d face encodings per ogni volto."""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        encodings = face_recognition.face_encodings(rgb_frame, face_locations)
        return encodings

    def check_quality(self, frame, face_location):
        """
        Verifica qualità del frame per enrollment.
        Ritorna dict con feedback specifici.
        """
        quality = {
            'is_good': True,
            'brightness': 'ok',
            'blur': 'ok',
            'size': 'ok',
            'centered': 'ok',
            'message': 'Perfetto!'
        }

        h, w = frame.shape[:2]
        top, right, bottom, left = face_location
        face_w = right - left
        face_h = bottom - top
        face_area = face_w * face_h
        frame_area = w * h

        # Check luminosità
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        brightness = np.mean(gray)
        if brightness < MIN_BRIGHTNESS:
            quality['brightness'] = 'low'
            quality['is_good'] = False
            quality['message'] = 'Luce insufficiente'
            return quality
        elif brightness > MAX_BRIGHTNESS:
            quality['brightness'] = 'high'
            quality['is_good'] = False
            quality['message'] = 'Troppa luce'
            return quality

        # Check blur (Laplacian variance)
        face_roi = gray[top:bottom, left:right]
        if face_roi.size > 0:
            blur_score = cv2.Laplacian(face_roi, cv2.CV_64F).var()
            if blur_score < BLUR_THRESHOLD:
                quality['blur'] = 'blurry'
                quality['is_good'] = False
                quality['message'] = 'Immagine sfocata, resta fermo'
                return quality

        # Check dimensione volto
        face_ratio = face_area / frame_area
        if face_ratio < MIN_FACE_RATIO:
            quality['size'] = 'too_far'
            quality['is_good'] = False
            quality['message'] = 'Troppo lontano dalla camera'
            return quality
        elif face_ratio > MAX_FACE_RATIO:
            quality['size'] = 'too_close'
            quality['is_good'] = False
            quality['message'] = 'Troppo vicino alla camera'
            return quality

        # Check centramento
        face_center_x = (left + right) / 2
        face_center_y = (top + bottom) / 2
        frame_center_x = w / 2
        frame_center_y = h / 2

        offset_x = abs(face_center_x - frame_center_x) / w
        offset_y = abs(face_center_y - frame_center_y) / h

        if offset_x > 0.25 or offset_y > 0.25:
            quality['centered'] = 'off_center'
            quality['is_good'] = False
            quality['message'] = 'Volto non centrato'
            return quality

        return quality

    def estimate_face_angle(self, landmarks):
        """
        Stima approssimativa dell'angolo del volto basata sui landmarks.
        Utile per verificare pose durante enrollment.
        """
        if not landmarks:
            return None

        nose_bridge = landmarks.get('nose_bridge', [])
        chin = landmarks.get('chin', [])

        if not nose_bridge or not chin:
            return None

        # Stima yaw (rotazione laterale) dalla posizione del naso
        nose_tip = nose_bridge[-1] if nose_bridge else None
        if nose_tip and chin:
            chin_left = chin[0]
            chin_right = chin[-1]
            chin_center_x = (chin_left[0] + chin_right[0]) / 2
            face_width = chin_right[0] - chin_left[0]

            if face_width > 0:
                yaw_ratio = (nose_tip[0] - chin_center_x) / face_width
                return {
                    'yaw': yaw_ratio,  # -0.5 a 0.5 (negativo = sinistra, positivo = destra)
                    'is_frontal': abs(yaw_ratio) < 0.1,
                    'is_right': yaw_ratio > 0.15,
                    'is_left': yaw_ratio < -0.15,
                }

        return None
