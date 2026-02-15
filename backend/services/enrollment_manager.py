"""Gestione enrollment profili - CRUD e generazione encodings."""

import os
import pickle
import uuid
import time
import json
import base64
import cv2
import numpy as np
import face_recognition
from config.settings import (
    ENCODINGS_FILE, ENROLLED_FACES_DIR, MAX_PROFILES,
    ENROLLMENT_SAMPLES, TOTAL_ENROLLMENT_SAMPLES
)


class EnrollmentManager:
    def __init__(self):
        self.profiles = []
        self.current_enrollment = None
        self._load_profiles()

    def _load_profiles(self):
        """Carica profili da file pickle."""
        if os.path.exists(ENCODINGS_FILE):
            with open(ENCODINGS_FILE, 'rb') as f:
                self.profiles = pickle.load(f)
        else:
            self.profiles = []

    def _save_profiles(self):
        """Salva profili su file pickle."""
        with open(ENCODINGS_FILE, 'wb') as f:
            pickle.dump(self.profiles, f)

    def get_profiles(self):
        """Ritorna lista profili (senza encodings per response leggera)."""
        return [{
            'id': p['id'],
            'name': p['name'],
            'color': p['color'],
            'samples_count': p['samples_count'],
            'created_at': p['created_at'],
            'thumbnail': p.get('thumbnail', None),
        } for p in self.profiles]

    def get_full_profiles(self):
        """Ritorna profili completi con encodings (per recognizer)."""
        return self.profiles

    def start_enrollment(self, name, color):
        """
        Inizia processo enrollment per nuovo profilo.
        Ritorna enrollment session info.
        """
        if len(self.profiles) >= MAX_PROFILES:
            return {'error': f'Massimo {MAX_PROFILES} profili raggiunto'}

        # Controlla nome duplicato
        for p in self.profiles:
            if p['name'].lower() == name.lower():
                return {'error': f'Profilo "{name}" già esistente'}

        self.current_enrollment = {
            'id': str(uuid.uuid4())[:8],
            'name': name,
            'color': color,
            'samples': {
                'front': [],
                'right': [],
                'left': [],
                'up': [],
                'down': [],
            },
            'encodings': [],
            'started_at': time.time(),
        }

        return {
            'status': 'started',
            'id': self.current_enrollment['id'],
            'name': name,
            'required_samples': ENROLLMENT_SAMPLES,
            'total_required': TOTAL_ENROLLMENT_SAMPLES,
        }

    def capture_sample(self, frame_data, step):
        """
        Cattura un sample per l'enrollment corrente.
        frame_data: base64 encoded image
        step: 'front', 'right', 'left', 'up', 'down'
        """
        if not self.current_enrollment:
            return {'error': 'Nessun enrollment attivo'}

        if step not in ENROLLMENT_SAMPLES:
            return {'error': f'Step non valido: {step}'}

        required = ENROLLMENT_SAMPLES[step]
        current = len(self.current_enrollment['samples'][step])

        if current >= required:
            return {'error': f'Step {step} già completato'}

        # Decodifica frame
        frame = self._decode_frame(frame_data)
        if frame is None:
            return {'error': 'Frame non valido'}

        # Rileva volto
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        locations = face_recognition.face_locations(rgb)

        if len(locations) == 0:
            return {'error': 'Nessun volto rilevato', 'quality': 'no_face'}

        if len(locations) > 1:
            return {'error': 'Troppi volti nel frame, inquadra solo il tuo', 'quality': 'multiple_faces'}

        # Genera encoding
        encoding = face_recognition.face_encodings(rgb, locations)
        if not encoding:
            return {'error': 'Impossibile generare encoding', 'quality': 'encoding_failed'}

        # Salva sample
        self.current_enrollment['samples'][step].append(encoding[0].tolist())
        self.current_enrollment['encodings'].append(encoding[0].tolist())

        # Genera thumbnail dal primo sample frontale
        thumbnail = None
        if step == 'front' and current == 0:
            top, right, bottom, left = locations[0]
            # Aggiungi padding
            pad = 30
            h, w = frame.shape[:2]
            top = max(0, top - pad)
            left = max(0, left - pad)
            bottom = min(h, bottom + pad)
            right = min(w, right + pad)
            face_img = frame[top:bottom, left:right]
            face_img = cv2.resize(face_img, (100, 100))
            _, buffer = cv2.imencode('.jpg', face_img)
            thumbnail = base64.b64encode(buffer).decode('utf-8')
            self.current_enrollment['thumbnail'] = thumbnail

        # Calcola progresso
        total_captured = sum(len(s) for s in self.current_enrollment['samples'].values())

        return {
            'status': 'captured',
            'step': step,
            'step_progress': current + 1,
            'step_required': required,
            'total_progress': total_captured,
            'total_required': TOTAL_ENROLLMENT_SAMPLES,
            'thumbnail': thumbnail,
        }

    def complete_enrollment(self):
        """Completa enrollment e salva profilo."""
        if not self.current_enrollment:
            return {'error': 'Nessun enrollment attivo'}

        total_captured = sum(len(s) for s in self.current_enrollment['samples'].values())

        # Permetti completamento anche con samples parziali (minimo 3)
        if total_captured < 3:
            return {'error': f'Servono almeno 3 samples (catturati: {total_captured})'}

        profile = {
            'id': self.current_enrollment['id'],
            'name': self.current_enrollment['name'],
            'color': self.current_enrollment['color'],
            'encodings': self.current_enrollment['encodings'],
            'samples_count': total_captured,
            'created_at': time.time(),
            'thumbnail': self.current_enrollment.get('thumbnail'),
        }

        self.profiles.append(profile)
        self._save_profiles()
        self.current_enrollment = None

        return {
            'status': 'completed',
            'profile': {
                'id': profile['id'],
                'name': profile['name'],
                'color': profile['color'],
                'samples_count': profile['samples_count'],
            }
        }

    def delete_profile(self, profile_id):
        """Elimina un profilo."""
        self.profiles = [p for p in self.profiles if p['id'] != profile_id]
        self._save_profiles()
        return {'status': 'deleted', 'id': profile_id}

    def cancel_enrollment(self):
        """Cancella enrollment in corso."""
        self.current_enrollment = None
        return {'status': 'cancelled'}

    def get_enrollment_status(self):
        """Ritorna stato enrollment corrente."""
        if not self.current_enrollment:
            return {'active': False}

        progress = {}
        for step, samples in self.current_enrollment['samples'].items():
            progress[step] = {
                'captured': len(samples),
                'required': ENROLLMENT_SAMPLES[step],
            }

        total_captured = sum(len(s) for s in self.current_enrollment['samples'].values())

        return {
            'active': True,
            'id': self.current_enrollment['id'],
            'name': self.current_enrollment['name'],
            'progress': progress,
            'total_captured': total_captured,
            'total_required': TOTAL_ENROLLMENT_SAMPLES,
        }

    def _decode_frame(self, frame_data):
        """Decodifica frame da base64 a numpy array OpenCV."""
        try:
            # Rimuovi header data URI se presente
            if ',' in frame_data:
                frame_data = frame_data.split(',')[1]
            img_bytes = base64.b64decode(frame_data)
            nparr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return frame
        except Exception:
            return None
