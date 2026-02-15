"""Tracker analytics - registra eventi detection e calcola statistiche."""

import time
import json
import os
import csv
import io
from collections import defaultdict
from config.settings import SESSIONS_DIR


class AnalyticsTracker:
    def __init__(self):
        self.session_id = f"session_{int(time.time())}"
        self.events = []
        self.fps_history = []
        self.latency_history = []
        self.detection_counts = defaultdict(int)
        self.confidence_scores = []
        self.face_positions = []  # Per heatmap
        self.session_start = time.time()
        self.challenge_scores = {}

    def track_detection(self, faces, fps, latency_ms):
        """Registra evento di detection."""
        timestamp = time.time()

        self.fps_history.append({'time': timestamp, 'fps': fps})
        self.latency_history.append({'time': timestamp, 'latency': latency_ms})

        # Mantieni solo ultimi 10 minuti di dati
        cutoff = timestamp - 600
        self.fps_history = [x for x in self.fps_history if x['time'] > cutoff]
        self.latency_history = [x for x in self.latency_history if x['time'] > cutoff]

        for face in faces:
            name = face.get('name', 'Unknown')
            confidence = face.get('confidence', 0)
            box = face.get('box', [0, 0, 0, 0])

            self.detection_counts[name] += 1
            self.confidence_scores.append({
                'time': timestamp,
                'name': name,
                'confidence': confidence,
            })

            # Posizione per heatmap (centro del box normalizzato 0-1)
            if box[2] > 0 and box[3] > 0:
                cx = (box[0] + box[2] / 2) / 640  # Normalizzato su 640px
                cy = (box[1] + box[3] / 2) / 480
                self.face_positions.append({'x': cx, 'y': cy, 'name': name})

            self.events.append({
                'timestamp': timestamp,
                'name': name,
                'confidence': confidence,
                'box': box,
            })

        # Limita eventi a ultimi 10 minuti
        self.events = [e for e in self.events if e['timestamp'] > cutoff]
        self.confidence_scores = [c for c in self.confidence_scores if c['time'] > cutoff]

    def get_session_stats(self):
        """Ritorna statistiche sessione corrente."""
        now = time.time()
        duration = now - self.session_start

        # FPS stats
        fps_values = [x['fps'] for x in self.fps_history[-100:]]
        fps_avg = sum(fps_values) / len(fps_values) if fps_values else 0
        fps_min = min(fps_values) if fps_values else 0
        fps_max = max(fps_values) if fps_values else 0

        # Latency stats
        lat_values = [x['latency'] for x in self.latency_history[-100:]]
        lat_avg = sum(lat_values) / len(lat_values) if lat_values else 0

        # Confidence stats
        conf_values = [c['confidence'] for c in self.confidence_scores]
        conf_avg = sum(conf_values) / len(conf_values) if conf_values else 0
        conf_min = min(conf_values) if conf_values else 0
        conf_max = max(conf_values) if conf_values else 0

        return {
            'session_id': self.session_id,
            'duration': round(duration, 1),
            'total_detections': len(self.events),
            'unique_faces': len(self.detection_counts),
            'detection_counts': dict(self.detection_counts),
            'fps': {
                'current': fps_values[-1] if fps_values else 0,
                'avg': round(fps_avg, 1),
                'min': round(fps_min, 1),
                'max': round(fps_max, 1),
            },
            'latency': {
                'avg': round(lat_avg, 1),
            },
            'confidence': {
                'avg': round(conf_avg, 3),
                'min': round(conf_min, 3),
                'max': round(conf_max, 3),
            },
        }

    def get_timeline_data(self, last_seconds=600):
        """Dati per timeline chart (ultimi N secondi)."""
        cutoff = time.time() - last_seconds
        recent = [e for e in self.events if e['timestamp'] > cutoff]

        # Raggruppa per intervalli di 10 secondi
        buckets = defaultdict(lambda: defaultdict(int))
        for event in recent:
            bucket = int(event['timestamp'] / 10) * 10
            buckets[bucket][event['name']] += 1

        timeline = []
        for ts in sorted(buckets.keys()):
            entry = {'timestamp': ts}
            entry.update(buckets[ts])
            timeline.append(entry)

        return timeline

    def get_confidence_distribution(self):
        """Distribuzione confidence scores per istogramma."""
        if not self.confidence_scores:
            return []

        # Crea bins da 0 a 1 con step 0.05
        bins = {}
        for i in range(20):
            lower = i * 0.05
            upper = (i + 1) * 0.05
            label = f"{int(lower*100)}-{int(upper*100)}%"
            bins[label] = 0

        for score in self.confidence_scores:
            idx = min(int(score['confidence'] / 0.05), 19)
            label = f"{idx*5}-{(idx+1)*5}%"
            bins[label] = bins.get(label, 0) + 1

        return [{'range': k, 'count': v} for k, v in bins.items()]

    def get_heatmap_data(self):
        """Dati posizioni per heatmap."""
        # Griglia 10x10
        grid = [[0] * 10 for _ in range(10)]
        for pos in self.face_positions[-500:]:
            gx = min(int(pos['x'] * 10), 9)
            gy = min(int(pos['y'] * 10), 9)
            grid[gy][gx] += 1
        return grid

    def get_recent_events(self, limit=50):
        """Ultimi eventi per tabella storia."""
        return sorted(self.events[-limit:], key=lambda x: x['timestamp'], reverse=True)

    def record_challenge_score(self, challenge_name, score, details=None):
        """Registra punteggio challenge."""
        self.challenge_scores[challenge_name] = {
            'score': score,
            'max_score': 10,
            'timestamp': time.time(),
            'details': details or {},
        }

    def get_challenge_scores(self):
        """Ritorna punteggi challenge."""
        return self.challenge_scores

    def export_json(self):
        """Export dati sessione in JSON."""
        return {
            'session': self.get_session_stats(),
            'events': self.events[-1000:],
            'timeline': self.get_timeline_data(),
            'confidence_distribution': self.get_confidence_distribution(),
            'challenge_scores': self.challenge_scores,
        }

    def export_csv(self):
        """Export eventi in formato CSV."""
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['timestamp', 'name', 'confidence', 'box_x', 'box_y', 'box_w', 'box_h'])
        for event in self.events:
            box = event.get('box', [0, 0, 0, 0])
            writer.writerow([
                event['timestamp'],
                event['name'],
                event['confidence'],
                box[0], box[1], box[2], box[3],
            ])
        return output.getvalue()

    def reset_session(self):
        """Reset sessione corrente."""
        self.__init__()
