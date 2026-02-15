"""Pipeline di processing video - orchestra detection e recognition."""

import base64
import time
import cv2
import numpy as np
from config.settings import FRAME_RESIZE_WIDTH


class VideoProcessor:
    def __init__(self, face_detector, face_recognizer, analytics_tracker):
        self.detector = face_detector
        self.recognizer = face_recognizer
        self.tracker = analytics_tracker

        self.frame_count = 0
        self.fps = 0
        self.last_fps_time = time.time()
        self.fps_frame_count = 0
        self.show_landmarks = False
        self.detect_emotions = False

        # Timing per pipeline visualization
        self.pipeline_timing = {}

    def process_frame(self, frame_data):
        """
        Pipeline completa di processing frame.
        Ritorna risultati per il frontend.
        """
        start_time = time.time()

        # Step 1: Decode
        t0 = time.time()
        frame = self._decode_frame(frame_data)
        if frame is None:
            return None
        self.pipeline_timing['decode'] = round((time.time() - t0) * 1000, 1)

        # Step 2: Pre-processing (resize)
        t0 = time.time()
        frame = self._preprocess(frame)
        self.pipeline_timing['preprocess'] = round((time.time() - t0) * 1000, 1)

        # Step 3: Face Detection
        t0 = time.time()
        face_locations = self.detector.detect_faces(frame)
        self.pipeline_timing['detection'] = round((time.time() - t0) * 1000, 1)

        # Step 4: Face Encoding
        t0 = time.time()
        face_encodings = self.detector.get_face_encodings(frame, face_locations)
        self.pipeline_timing['encoding'] = round((time.time() - t0) * 1000, 1)

        # Step 5: Recognition
        t0 = time.time()
        results = self.recognizer.recognize_faces(face_encodings, face_locations)
        self.pipeline_timing['recognition'] = round((time.time() - t0) * 1000, 1)

        # Step 6: Landmarks (opzionale)
        landmarks_data = None
        if self.show_landmarks and face_locations:
            t0 = time.time()
            landmarks_list = self.detector.get_face_landmarks(frame, face_locations)
            landmarks_data = landmarks_list
            self.pipeline_timing['landmarks'] = round((time.time() - t0) * 1000, 1)

        # Calcola FPS
        self.fps_frame_count += 1
        elapsed = time.time() - self.last_fps_time
        if elapsed >= 1.0:
            self.fps = round(self.fps_frame_count / elapsed, 1)
            self.fps_frame_count = 0
            self.last_fps_time = time.time()

        # Latenza totale
        total_latency = round((time.time() - start_time) * 1000, 1)
        self.pipeline_timing['total'] = total_latency

        # Aggiorna analytics
        self.tracker.track_detection(results, self.fps, total_latency)

        # Prepara risposta
        response = {
            'faces': results,
            'fps': self.fps,
            'latency': total_latency,
            'timestamp': time.time(),
            'face_count': len(results),
            'pipeline_timing': self.pipeline_timing.copy(),
        }

        if landmarks_data:
            for i, face in enumerate(response['faces']):
                if i < len(landmarks_data):
                    face['landmarks'] = landmarks_data[i]

        self.frame_count += 1
        return response

    def _decode_frame(self, frame_data):
        """Decodifica frame base64 → OpenCV numpy array."""
        try:
            if ',' in frame_data:
                frame_data = frame_data.split(',')[1]
            img_bytes = base64.b64decode(frame_data)
            nparr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return frame
        except Exception:
            return None

    def _preprocess(self, frame):
        """Ridimensiona frame per performance."""
        h, w = frame.shape[:2]
        if w > FRAME_RESIZE_WIDTH:
            scale = FRAME_RESIZE_WIDTH / w
            new_w = FRAME_RESIZE_WIDTH
            new_h = int(h * scale)
            frame = cv2.resize(frame, (new_w, new_h))
        return frame

    def update_settings(self, settings):
        """Aggiorna impostazioni processing."""
        if 'show_landmarks' in settings:
            self.show_landmarks = settings['show_landmarks']
        if 'detect_emotions' in settings:
            self.detect_emotions = settings['detect_emotions']
        if 'threshold' in settings:
            self.recognizer.set_threshold(settings['threshold'])

    def get_performance_stats(self):
        """Stats per Tech showcase / Performance monitor."""
        return {
            'fps': self.fps,
            'frame_count': self.frame_count,
            'pipeline_timing': self.pipeline_timing,
            'settings': {
                'show_landmarks': self.show_landmarks,
                'detect_emotions': self.detect_emotions,
                'threshold': self.recognizer.threshold,
            }
        }
