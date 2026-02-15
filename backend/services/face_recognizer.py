"""Servizio di Face Recognition - confronta volti con profili enrollati."""

import numpy as np
import face_recognition
from config.settings import DEFAULT_THRESHOLD


class FaceRecognizer:
    def __init__(self):
        self.threshold = DEFAULT_THRESHOLD
        self.known_encodings = []  # Lista di encoding arrays
        self.known_names = []       # Lista di nomi corrispondenti
        self.known_colors = []      # Lista di colori per UI
        self.known_ids = []         # Lista di profile IDs

    def load_profiles(self, profiles):
        """Carica i profili enrollati per il confronto."""
        self.known_encodings = []
        self.known_names = []
        self.known_colors = []
        self.known_ids = []

        for profile in profiles:
            for encoding in profile['encodings']:
                self.known_encodings.append(np.array(encoding))
                self.known_names.append(profile['name'])
                self.known_colors.append(profile.get('color', '#00d9ff'))
                self.known_ids.append(profile['id'])

    def recognize_faces(self, frame_encodings, face_locations):
        """
        Confronta face encodings con profili noti.
        Ritorna lista di risultati per ogni volto trovato.
        """
        results = []

        if not self.known_encodings:
            # Nessun profilo enrollato, tutti i volti sono unknown
            for i, loc in enumerate(face_locations):
                top, right, bottom, left = loc
                results.append({
                    'box': [left, top, right - left, bottom - top],
                    'name': 'Unknown',
                    'confidence': 0.0,
                    'color': '#666666',
                    'profile_id': None,
                })
            return results

        for i, encoding in enumerate(frame_encodings):
            # Calcola distanze da tutti gli encoding noti
            distances = face_recognition.face_distance(self.known_encodings, encoding)

            if len(distances) == 0:
                top, right, bottom, left = face_locations[i]
                results.append({
                    'box': [left, top, right - left, bottom - top],
                    'name': 'Unknown',
                    'confidence': 0.0,
                    'color': '#666666',
                    'profile_id': None,
                })
                continue

            # Trova il match migliore
            best_idx = np.argmin(distances)
            best_distance = distances[best_idx]

            # Converti distanza in confidence (0-1)
            # Distanza 0 = match perfetto, distanza 0.6 = soglia default
            confidence = max(0.0, 1.0 - best_distance)

            top, right, bottom, left = face_locations[i]

            if best_distance <= self.threshold:
                results.append({
                    'box': [left, top, right - left, bottom - top],
                    'name': self.known_names[best_idx],
                    'confidence': round(confidence, 3),
                    'color': self.known_colors[best_idx],
                    'profile_id': self.known_ids[best_idx],
                })
            else:
                results.append({
                    'box': [left, top, right - left, bottom - top],
                    'name': 'Unknown',
                    'confidence': round(confidence, 3),
                    'color': '#666666',
                    'profile_id': None,
                })

        return results

    def set_threshold(self, threshold):
        """
        Aggiorna soglia riconoscimento.
        threshold: valore 0.0-1.0, convertito da percentuale frontend (50-99%).
        Più basso = più strict.
        """
        # Frontend invia percentuale (50-99), convertiamo in distanza
        # 99% → distanza 0.3 (molto strict), 50% → distanza 0.8 (permissivo)
        self.threshold = 1.0 - (threshold / 100.0)

    def get_confusion_data(self, frame_encodings, face_locations):
        """
        Per Multi-Face Challenge: genera matrice di confusione.
        Mostra quanto ogni volto assomiglia a ogni profilo.
        """
        if not self.known_encodings or not frame_encodings:
            return []

        confusion = []
        # Raggruppa encoding per profilo
        profile_names = list(dict.fromkeys(self.known_names))  # Nomi unici ordinati

        for i, encoding in enumerate(frame_encodings):
            distances = face_recognition.face_distance(self.known_encodings, encoding)
            row = {}
            for j, name in enumerate(self.known_names):
                dist = distances[j]
                conf = max(0.0, 1.0 - dist)
                if name not in row or conf > row[name]:
                    row[name] = round(conf, 3)

            top, right, bottom, left = face_locations[i]
            confusion.append({
                'face_index': i,
                'box': [left, top, right - left, bottom - top],
                'similarities': row
            })

        return confusion
