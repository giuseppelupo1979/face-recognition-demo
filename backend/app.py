"""
Face Recognition Demo - Backend Flask + SocketIO
Server principale per detection, recognition, enrollment e analytics.
"""

import time
import json
from flask import Flask, jsonify, request, Response
from flask_socketio import SocketIO, emit
from flask_cors import CORS

from services.face_detector import FaceDetector
from services.face_recognizer import FaceRecognizer
from services.enrollment_manager import EnrollmentManager
from services.analytics_tracker import AnalyticsTracker
from services.video_processor import VideoProcessor
from config.settings import HOST, PORT, DEBUG

# Inizializza Flask
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet',
                    max_http_buffer_size=10 * 1024 * 1024)  # 10MB per frame

# Inizializza servizi
face_detector = FaceDetector()
face_recognizer = FaceRecognizer()
enrollment_mgr = EnrollmentManager()
analytics_tracker = AnalyticsTracker()
video_processor = VideoProcessor(face_detector, face_recognizer, analytics_tracker)

# Carica profili esistenti nel recognizer
face_recognizer.load_profiles(enrollment_mgr.get_full_profiles())


# ==========================================
# REST API Endpoints
# ==========================================

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'timestamp': time.time(),
        'profiles_loaded': len(enrollment_mgr.profiles),
    })


@app.route('/api/profiles', methods=['GET'])
def get_profiles():
    """Lista profili enrollati."""
    return jsonify({
        'profiles': enrollment_mgr.get_profiles(),
        'max_profiles': 4,
    })


@app.route('/api/enrollment/start', methods=['POST'])
def start_enrollment():
    """Inizia enrollment nuovo profilo."""
    data = request.json
    name = data.get('name', '').strip()
    color = data.get('color', '#00d9ff')

    if not name:
        return jsonify({'error': 'Nome richiesto'}), 400

    result = enrollment_mgr.start_enrollment(name, color)
    if 'error' in result:
        return jsonify(result), 400

    return jsonify(result)


@app.route('/api/enrollment/capture', methods=['POST'])
def capture_enrollment():
    """Cattura sample per enrollment."""
    data = request.json
    frame_data = data.get('frame', '')
    step = data.get('step', 'front')

    if not frame_data:
        return jsonify({'error': 'Frame richiesto'}), 400

    result = enrollment_mgr.capture_sample(frame_data, step)
    if 'error' in result:
        return jsonify(result), 400

    return jsonify(result)


@app.route('/api/enrollment/complete', methods=['POST'])
def complete_enrollment():
    """Completa enrollment e salva profilo."""
    result = enrollment_mgr.complete_enrollment()
    if 'error' in result:
        return jsonify(result), 400

    # Ricarica profili nel recognizer
    face_recognizer.load_profiles(enrollment_mgr.get_full_profiles())

    return jsonify(result)


@app.route('/api/enrollment/cancel', methods=['POST'])
def cancel_enrollment():
    """Cancella enrollment in corso."""
    result = enrollment_mgr.cancel_enrollment()
    return jsonify(result)


@app.route('/api/enrollment/status', methods=['GET'])
def enrollment_status():
    """Stato enrollment corrente."""
    return jsonify(enrollment_mgr.get_enrollment_status())


@app.route('/api/enrollment/profile/<profile_id>', methods=['DELETE'])
def delete_profile(profile_id):
    """Elimina profilo."""
    result = enrollment_mgr.delete_profile(profile_id)

    # Ricarica profili nel recognizer
    face_recognizer.load_profiles(enrollment_mgr.get_full_profiles())

    return jsonify(result)


@app.route('/api/analytics/session', methods=['GET'])
def session_stats():
    """Statistiche sessione corrente."""
    return jsonify(analytics_tracker.get_session_stats())


@app.route('/api/analytics/timeline', methods=['GET'])
def timeline_data():
    """Dati timeline per chart."""
    seconds = request.args.get('seconds', 600, type=int)
    return jsonify(analytics_tracker.get_timeline_data(seconds))


@app.route('/api/analytics/confidence', methods=['GET'])
def confidence_distribution():
    """Distribuzione confidence."""
    return jsonify(analytics_tracker.get_confidence_distribution())


@app.route('/api/analytics/heatmap', methods=['GET'])
def heatmap_data():
    """Dati heatmap posizioni."""
    return jsonify(analytics_tracker.get_heatmap_data())


@app.route('/api/analytics/events', methods=['GET'])
def recent_events():
    """Ultimi eventi detection."""
    limit = request.args.get('limit', 50, type=int)
    return jsonify(analytics_tracker.get_recent_events(limit))


@app.route('/api/analytics/challenges', methods=['GET'])
def challenge_scores():
    """Punteggi challenge."""
    return jsonify(analytics_tracker.get_challenge_scores())


@app.route('/api/analytics/export/json', methods=['GET'])
def export_json():
    """Export sessione JSON."""
    data = analytics_tracker.export_json()
    return jsonify(data)


@app.route('/api/analytics/export/csv', methods=['GET'])
def export_csv():
    """Export eventi CSV."""
    csv_data = analytics_tracker.export_csv()
    return Response(
        csv_data,
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=session_events.csv'}
    )


@app.route('/api/performance', methods=['GET'])
def performance_stats():
    """Stats performance per Tech showcase."""
    return jsonify(video_processor.get_performance_stats())


# ==========================================
# WebSocket Handlers
# ==========================================

@socketio.on('connect')
def handle_connect():
    print('[WS] Client connesso')
    emit('connected', {'status': 'ok'})


@socketio.on('disconnect')
def handle_disconnect():
    print('[WS] Client disconnesso')


@socketio.on('video_frame')
def handle_video_frame(data):
    """Riceve frame video, processa e ritorna risultati."""
    frame_data = data.get('frame', '')
    if not frame_data:
        return

    result = video_processor.process_frame(frame_data)
    if result:
        emit('frame_processed', result)


@socketio.on('update_settings')
def handle_update_settings(data):
    """Aggiorna impostazioni processing."""
    video_processor.update_settings(data)
    emit('settings_updated', {'status': 'ok', 'settings': data})


@socketio.on('enrollment_frame')
def handle_enrollment_frame(data):
    """Frame dedicato per enrollment con quality check."""
    frame_data = data.get('frame', '')
    if not frame_data:
        return

    # Quick detection per quality feedback
    import cv2
    import numpy as np
    import base64

    try:
        raw = frame_data.split(',')[1] if ',' in frame_data else frame_data
        img_bytes = base64.b64decode(raw)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            emit('enrollment_feedback', {'quality': {'is_good': False, 'message': 'Frame non valido'}})
            return

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        import face_recognition
        locations = face_recognition.face_locations(rgb, model='hog')

        if not locations:
            emit('enrollment_feedback', {
                'quality': {'is_good': False, 'message': 'Nessun volto rilevato'},
                'face_count': 0,
            })
            return

        if len(locations) > 1:
            emit('enrollment_feedback', {
                'quality': {'is_good': False, 'message': 'Troppi volti, inquadra solo il tuo'},
                'face_count': len(locations),
            })
            return

        quality = face_detector.check_quality(frame, locations[0])
        top, right, bottom, left = locations[0]

        emit('enrollment_feedback', {
            'quality': quality,
            'face_count': 1,
            'face_box': [left, top, right - left, bottom - top],
        })
    except Exception as e:
        emit('enrollment_feedback', {
            'quality': {'is_good': False, 'message': f'Errore: {str(e)}'},
        })


@socketio.on('challenge_frame')
def handle_challenge_frame(data):
    """Frame per challenge con metriche aggiuntive."""
    frame_data = data.get('frame', '')
    challenge_type = data.get('challenge', '')

    if not frame_data:
        return

    result = video_processor.process_frame(frame_data)
    if result:
        result['challenge'] = challenge_type
        emit('challenge_result', result)


@socketio.on('save_challenge_score')
def handle_challenge_score(data):
    """Salva punteggio challenge."""
    name = data.get('challenge', '')
    score = data.get('score', 0)
    details = data.get('details', {})
    analytics_tracker.record_challenge_score(name, score, details)
    emit('challenge_saved', {'status': 'ok'})


# ==========================================
# Main
# ==========================================

if __name__ == '__main__':
    print('=' * 50)
    print('  Face Recognition Demo - Backend')
    print(f'  Server: http://{HOST}:{PORT}')
    print(f'  Profili caricati: {len(enrollment_mgr.profiles)}')
    print('=' * 50)
    socketio.run(app, host=HOST, port=PORT, debug=DEBUG)
