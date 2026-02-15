"""Configurazione applicazione Face Recognition Demo."""

import os

# Percorsi
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
DATA_DIR = os.path.join(BASE_DIR, 'data')
ENROLLED_FACES_DIR = os.path.join(DATA_DIR, 'enrolled_faces')
SESSIONS_DIR = os.path.join(DATA_DIR, 'sessions')
ENCODINGS_FILE = os.path.join(MODELS_DIR, 'face_encodings.pkl')

# Crea directory se non esistono
for d in [MODELS_DIR, DATA_DIR, ENROLLED_FACES_DIR, SESSIONS_DIR]:
    os.makedirs(d, exist_ok=True)

# Face Detection
MAX_PROFILES = 4
FRAME_RESIZE_WIDTH = 640
DETECTION_MODEL = 'hog'  # 'hog' (veloce) o 'cnn' (accurato)
DEFAULT_THRESHOLD = 0.6  # Distanza massima per match (più basso = più strict)
MIN_FACE_SIZE = 40  # Pixel minimi per lato bounding box

# Enrollment
ENROLLMENT_SAMPLES = {
    'front': 5,
    'right': 5,
    'left': 5,
    'up': 3,
    'down': 3,
}
TOTAL_ENROLLMENT_SAMPLES = sum(ENROLLMENT_SAMPLES.values())  # 21

# Quality Checks
MIN_BRIGHTNESS = 40
MAX_BRIGHTNESS = 220
MIN_FACE_RATIO = 0.08  # Face area / frame area minimo
MAX_FACE_RATIO = 0.85  # Face area / frame area massimo
BLUR_THRESHOLD = 50.0  # Soglia Laplacian variance

# Performance
TARGET_FPS = 15
FRAME_SKIP = 2  # Processa 1 frame ogni N ricevuti

# Server
HOST = '0.0.0.0'
PORT = 5001
DEBUG = True
