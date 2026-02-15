# Face Recognition Demo - Documentazione Progetto

## Panoramica
Demo interattiva riconoscimento facciale real-time con webcam.
Stack: React + TypeScript + Flask + face_recognition
Obiettivo: Vetrina tecnologica capabilities AI face detection/recognition

**Stato Attuale:** Completato v1.0
**Versione:** 1.0.0
**Ultimo Aggiornamento:** 2026-02-15

## Architettura
```
Frontend (React + Vite + TailwindCSS)
    ↓ WebSocket (Socket.IO)
Backend (Flask + Flask-SocketIO)
    ↓ face_recognition library
Python ML Pipeline (OpenCV + dlib)
```

### Componenti Principali:
- **Frontend:** React SPA con routing, real-time UI updates via Socket.IO
- **Backend:** Flask API + WebSocket server
- **ML Engine:** face_recognition (dlib-based) per detection/recognition
- **Storage:** Pickle files per encodings, JSON per sessions

## Struttura Progetto
```
face-recognition-demo/
├── CLAUDE.md                    ← Questo file
├── README.md                    ← User documentation
├── frontend/                    ← React app
│   ├── src/
│   │   ├── components/          ← React components
│   │   │   ├── Layout/          ← Sidebar, Header, Dashboard
│   │   │   ├── Webcam/          ← LiveFeed, DetectionOverlay, CameraControls
│   │   │   ├── Enrollment/      ← EnrollmentWizard, CaptureStep, ProfileList
│   │   │   ├── Recognition/     ← LiveRecognition, FaceBox, ConfidenceBar
│   │   │   ├── Challenges/      ← ChallengeSelector + 6 challenges
│   │   │   ├── Analytics/       ← Dashboard, Charts, Export
│   │   │   └── Tech/            ← PipelineViz, PerformanceMonitor
│   │   ├── hooks/               ← useWebcam, useSocketIO, useFaceDetection
│   │   ├── services/            ← API client, WebSocket service
│   │   ├── types/               ← TypeScript interfaces
│   │   └── utils/               ← Canvas helpers, formatters
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/
│   ├── app.py                   ← Main Flask + SocketIO app
│   ├── services/
│   │   ├── face_detector.py     ← Detection + landmarks
│   │   ├── face_recognizer.py   ← Recognition + confidence
│   │   ├── enrollment_manager.py← Profile CRUD + encoding generation
│   │   ├── analytics_tracker.py ← Stats tracking + export
│   │   └── video_processor.py   ← Frame processing pipeline
│   ├── models/                  ← Pickle encodings
│   ├── data/                    ← User data + sessions
│   ├── config/settings.py       ← App configuration
│   └── requirements.txt
└── docker-compose.yml (TODO)
```

## API Reference

### REST Endpoints
| Method | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | /api/profiles | Lista profili enrollati |
| POST | /api/enrollment/start | Inizia enrollment nuovo profilo |
| POST | /api/enrollment/capture | Cattura sample per enrollment |
| POST | /api/enrollment/complete | Completa enrollment profilo |
| DELETE | /api/enrollment/profile/<id> | Elimina profilo |
| GET | /api/analytics/session | Dati sessione corrente |
| GET | /api/analytics/export | Export dati (CSV/JSON) |

### WebSocket Events
| Event | Direzione | Descrizione |
|-------|-----------|-------------|
| video_frame | Client → Server | Frame webcam base64 |
| frame_processed | Server → Client | Risultati detection/recognition |
| update_settings | Client → Server | Aggiorna threshold/settings |
| enrollment_feedback | Server → Client | Quality feedback enrollment |

## Decisioni Architetturali
1. **Socket.IO per video streaming:** Bassa latenza vs REST polling
2. **face_recognition library:** Basata su dlib, buon tradeoff accuracy/performance
3. **Pickle per encodings:** Semplice, veloce per demo (non production)
4. **Frame resize a 640px:** Performance optimization per processing real-time
5. **10 FPS send rate:** Bilanciamento tra fluidità e carico server

## Componenti Implementati

### Frontend (32 file)
- **Layout:** Sidebar (nav animata), Header (status bar), Dashboard (layout wrapper)
- **Webcam:** LiveFeed (video + overlay), DetectionOverlay (face boxes animati), CameraControls
- **Enrollment:** EnrollmentWizard (4 fasi), CaptureStep (cattura guidata), ProfileList, QualityIndicator
- **Recognition:** LiveRecognition (pagina principale), FaceBox (box animato con corner accents), ConfidenceBar, StatsPanel
- **Challenges:** ChallengeSelector (6 carte), ChallengeRunner (engine generico), 6 challenge specifiche, ScoreCard
- **Analytics:** AnalyticsDashboard, TimelineChart, ConfidenceChart, SessionHistory, ExportPanel
- **Tech:** PipelineViz (pipeline animata), PerformanceMonitor (grafici real-time), ModelInfo
- **Hooks:** useWebcam, useSocketIO, useFaceDetection, useAnalytics
- **Services:** api.ts (REST client), websocket.ts (Socket.IO singleton)
- **Utils:** canvas.ts (draw overlay), formatters.ts (format helpers)
- **Pages:** Home (dashboard con status server + feature cards)

### Backend (7 file)
- **app.py:** Flask + SocketIO server, 15 REST endpoints, 6 WebSocket handlers
- **face_detector.py:** Detection (HOG), landmarks (68 punti), quality checks, angle estimation
- **face_recognizer.py:** Encoding comparison, confidence scoring, threshold management, confusion matrix
- **enrollment_manager.py:** Profile CRUD, sample capture, pickle persistence, quality validation
- **analytics_tracker.py:** Event tracking, timeline, confidence distribution, heatmap, CSV/JSON export
- **video_processor.py:** Full pipeline orchestration, timing per step, settings management
- **config/settings.py:** Centralised configuration

## Changelog
- 2026-02-15: Progetto completato v1.0
  - Struttura directory completa
  - Backend Flask + SocketIO con 5 servizi
  - Frontend React + TypeScript con 32+ componenti
  - 6 challenge di stress test
  - Analytics dashboard con charts
  - Tech showcase con pipeline visualization
  - TypeScript compila senza errori
  - Vite build production riuscita
  - README.md con setup instructions
  - .env.example per configurazione
