# INFO - Riepilogo completo di tutto il lavoro svolto

## Fase 1: Creazione struttura progetto

Ho creato l'intera struttura directory sotto `/Users/giuseppelupo/face-recognition-demo/` con tutte le cartelle necessarie per frontend e backend:

```
face-recognition-demo/
├── CLAUDE.md
├── README.md
├── INFO.md (questo file)
├── .env.example
├── frontend/
│   ├── public/vite.svg
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.tsx
│       ├── index.css
│       ├── App.tsx
│       ├── types/index.ts
│       ├── services/api.ts
│       ├── services/websocket.ts
│       ├── hooks/useWebcam.ts
│       ├── hooks/useSocketIO.ts
│       ├── hooks/useFaceDetection.ts
│       ├── hooks/useAnalytics.ts
│       ├── utils/canvas.ts
│       ├── utils/formatters.ts
│       ├── pages/Home.tsx
│       ├── components/Layout/Sidebar.tsx
│       ├── components/Layout/Header.tsx
│       ├── components/Layout/Dashboard.tsx
│       ├── components/Webcam/LiveFeed.tsx
│       ├── components/Webcam/DetectionOverlay.tsx
│       ├── components/Webcam/CameraControls.tsx
│       ├── components/Enrollment/EnrollmentWizard.tsx
│       ├── components/Enrollment/CaptureStep.tsx
│       ├── components/Enrollment/ProfileList.tsx
│       ├── components/Enrollment/QualityIndicator.tsx
│       ├── components/Recognition/LiveRecognition.tsx
│       ├── components/Recognition/FaceBox.tsx
│       ├── components/Recognition/ConfidenceBar.tsx
│       ├── components/Recognition/StatsPanel.tsx
│       ├── components/Challenges/ChallengeSelector.tsx
│       ├── components/Challenges/ChallengeRunner.tsx
│       ├── components/Challenges/ScoreCard.tsx
│       ├── components/Challenges/LightingChallenge.tsx
│       ├── components/Challenges/AngleChallenge.tsx
│       ├── components/Challenges/OcclusionChallenge.tsx
│       ├── components/Challenges/DistanceChallenge.tsx
│       ├── components/Challenges/SpeedChallenge.tsx
│       ├── components/Challenges/MultiFaceChallenge.tsx
│       ├── components/Analytics/AnalyticsDashboard.tsx
│       ├── components/Analytics/TimelineChart.tsx
│       ├── components/Analytics/ConfidenceChart.tsx
│       ├── components/Analytics/SessionHistory.tsx
│       ├── components/Analytics/ExportPanel.tsx
│       ├── components/Tech/PipelineViz.tsx
│       ├── components/Tech/PerformanceMonitor.tsx
│       └── components/Tech/ModelInfo.tsx
└── backend/
    ├── app.py
    ├── requirements.txt
    ├── config/__init__.py
    ├── config/settings.py
    ├── services/__init__.py
    ├── services/face_detector.py
    ├── services/face_recognizer.py
    ├── services/enrollment_manager.py
    ├── services/analytics_tracker.py
    ├── services/video_processor.py
    ├── models/ (directory per pickle encodings)
    └── data/
        ├── enrolled_faces/
        └── sessions/
```

---

## Fase 2: Backend Python (Flask + SocketIO)

### File creati:

**config/settings.py** - Configurazione centralizzata con:
- Percorsi directory (models, data, enrolled_faces, sessions)
- Parametri detection (model HOG, threshold 0.6, min face size 40px)
- Parametri enrollment (5 front, 5 right, 5 left, 3 up, 3 down = 21 samples)
- Quality checks (brightness 40-220, blur threshold 50, face ratio)
- Performance (target FPS 15, frame skip 2, resize 640px)
- Server (host 0.0.0.0, porta 5001)

**services/face_detector.py** - Servizio detection con:
- `detect_faces()`: rileva volti usando face_recognition.face_locations() con modello HOG
- `get_face_landmarks()`: estrae 68 face landmarks
- `get_face_encodings()`: genera embedding 128-dimensionali
- `check_quality()`: verifica luminosita, blur, dimensione, centramento per enrollment
- `estimate_face_angle()`: stima rotazione testa dai landmarks

**services/face_recognizer.py** - Servizio recognition con:
- `load_profiles()`: carica profili enrollati con encoding, nomi, colori
- `recognize_faces()`: confronta encoding con profili noti, calcola distanza euclidea, ritorna match + confidence
- `set_threshold()`: aggiorna soglia (converte da percentuale frontend a distanza)
- `get_confusion_data()`: genera matrice di confusione per Multi-Face Challenge

**services/enrollment_manager.py** - Gestione profili con:
- `start_enrollment()`: inizializza sessione enrollment (max 4 profili, no duplicati)
- `capture_sample()`: cattura singolo sample (decode base64, detect, encode, salva)
- `complete_enrollment()`: completa enrollment (minimo 3 samples), salva in pickle
- `delete_profile()`: elimina profilo e aggiorna pickle
- `cancel_enrollment()`: annulla enrollment in corso
- Persistenza su file pickle (`face_encodings.pkl`)

**services/analytics_tracker.py** - Tracking statistiche con:
- `track_detection()`: registra ogni evento detection con timestamp, nome, confidence, posizione
- `get_session_stats()`: calcola FPS avg/min/max, latenza, confidence stats, durata sessione
- `get_timeline_data()`: raggruppa eventi in bucket da 10 secondi per chart
- `get_confidence_distribution()`: istogramma confidence in bins 5%
- `get_heatmap_data()`: griglia 10x10 posizioni volti
- `export_json()` / `export_csv()`: export dati sessione
- Auto-cleanup dati oltre 10 minuti

**services/video_processor.py** - Pipeline orchestrazione con:
- `process_frame()`: pipeline completa decode → preprocess → detection → encoding → recognition
- Timing per ogni step della pipeline (per Tech Showcase)
- Calcolo FPS reale
- Toggle landmarks e emotions
- `get_performance_stats()`: stats per frontend

**app.py** - Server Flask principale con:
- 15 REST endpoints: health, profiles, enrollment (start/capture/complete/cancel/status), analytics (session/timeline/confidence/heatmap/events/challenges/export-json/export-csv), performance
- 6 WebSocket handlers: connect, disconnect, video_frame, update_settings, enrollment_frame, challenge_frame, save_challenge_score
- CORS configurato per tutti gli origin
- SocketIO con async_mode eventlet, buffer 10MB per frame

**requirements.txt** - Dipendenze (versioni flessibili per Python 3.13):
- flask, flask-socketio, flask-cors
- opencv-python, face-recognition, numpy, Pillow
- python-socketio, eventlet

---

## Fase 3: Frontend React + TypeScript

### Configurazione:

**package.json** - Dipendenze:
- react 18, react-dom, react-router-dom 6
- socket.io-client 4, framer-motion 10, recharts 2, lucide-react
- DevDeps: vite 5, typescript 5, tailwindcss 3, autoprefixer, postcss

**vite.config.ts** - Dev server porta 3000, proxy /api e /socket.io verso backend 5001

**tailwind.config.js** - Tema custom:
- Colori dark (900: #0a0e27, 800: #111633, 700: #1a1f3a, ecc.)
- Accent colors (cyan #00d9ff, green #00ff88, yellow #ffd700, red #ff4444, purple, orange)
- Font mono JetBrains Mono
- Animazione glow personalizzata

**index.css** - Stili globali: dark theme, scrollbar custom, glow effects, scan line animation

### TypeScript Types (types/index.ts):
- FaceData, FrameResult, PipelineTiming, Profile, EnrollmentStatus, EnrollmentResult
- QualityFeedback, EnrollmentFeedback, SessionStats, ChallengeScore
- ChallengeType, AppSettings

### Services:
**api.ts** - Client REST con fetch wrapper, funzioni per ogni endpoint
**websocket.ts** - Singleton Socket.IO con reconnection automatica

### Hooks:
**useWebcam.ts** - Gestione webcam: start/stop camera, captureFrame, takeScreenshot, cleanup
**useSocketIO.ts** - Gestione Socket.IO: connessione, faces, fps, latency, sendFrame, enrollment feedback
**useFaceDetection.ts** - Combina webcam + socket: streaming loop a 10 FPS, settings management
**useAnalytics.ts** - Polling analytics ogni 5 secondi: stats, timeline, confidence, heatmap, events

### Utils:
**canvas.ts** - drawDetectionOverlay (bounding box con corner accents), getConfidenceColor, downloadCanvasAsImage
**formatters.ts** - formatConfidence, formatTime, formatDuration, formatLatency, PROFILE_COLORS, getStarRating, getEmotionEmoji

### Componenti Layout:
**Sidebar.tsx** - Navigazione verticale con 6 route, icone Lucide, indicatore attivo animato con Framer Motion
**Header.tsx** - Barra stato: logo, face count, FPS (colorato verde/giallo/rosso), latency, connection status
**Dashboard.tsx** - Layout wrapper: sidebar + header + main content area

### Componenti Webcam:
**LiveFeed.tsx** - Video specchiato (selfie mode), canvas nascosto per cattura, overlay detection, stati inattivo/errore
**DetectionOverlay.tsx** - Container per FaceBox, effetto scan line animato quando ci sono faces
**CameraControls.tsx** - Bottoni start/stop camera e detection, toggle landmarks, screenshot, slider threshold 50-99%

### Componenti Recognition:
**FaceBox.tsx** - Bounding box animato con border colorato, corner accents (angoli), label nome+confidence, barra confidence sotto, landmarks SVG opzionali
**ConfidenceBar.tsx** - Barra orizzontale animata con nome, colore, percentuale (verde/giallo/rosso)
**StatsPanel.tsx** - 4 stat card (detected, FPS, latency, recognized), confidence bars per ogni face, pipeline timing breakdown
**LiveRecognition.tsx** - Pagina principale: video feed 2/3 + stats panel 1/3, camera controls, badge LIVE animato

### Componenti Enrollment:
**QualityIndicator.tsx** - Indicatore verde/rosso con messaggio quality (Perfetto/Luce insufficiente/etc.)
**ProfileList.tsx** - Lista profili enrollati con thumbnail, nome colorato, sample count, data, bottone elimina
**CaptureStep.tsx** - Step singolo enrollment: video con guida ovale, feedback quality real-time dal server, bottone cattura, progress bar, skip
**EnrollmentWizard.tsx** - Wizard 4 fasi (idle → setup → capturing → complete): form nome+colore, 5 step di cattura (front/right/left/up/down), step indicator, completamento con animazione successo

### Componenti Challenges:
**ScoreCard.tsx** - Card risultato: cerchio SVG animato con score, 5 stelle, rating testuale, bottoni riprova/chiudi
**ChallengeRunner.tsx** - Engine generico challenge: fasi intro/running/result, timer countdown 60s, barra progresso, video feed, calcolo score
**LightingChallenge.tsx** - Score basato su detection rate + avg confidence
**AngleChallenge.tsx** - Score basato su continuita tracking durante rotazione
**OcclusionChallenge.tsx** - Score basato su % riconoscimento con occlusioni
**DistanceChallenge.tsx** - Score basato su varieta dimensioni face box
**SpeedChallenge.tsx** - Score basato su stabilita tracking + basse false transitions
**MultiFaceChallenge.tsx** - Score basato su numero volti distinti riconosciuti simultaneamente
**ChallengeSelector.tsx** - Griglia 6 carte challenge con icone, colori, descrizioni, click per avviare

### Componenti Analytics:
**TimelineChart.tsx** - BarChart Recharts con barre stackate per persona, asse X tempo
**ConfidenceChart.tsx** - BarChart distribuzione confidence con bins percentuali
**SessionHistory.tsx** - Lista ultimi eventi: timestamp, nome, confidence colorata
**ExportPanel.tsx** - Bottoni export JSON e CSV con download automatico
**AnalyticsDashboard.tsx** - Pagina completa: 4 stat card top, 2 chart, detection counts, heatmap griglia, export + history

### Componenti Tech:
**PerformanceMonitor.tsx** - 2 LineChart real-time: FPS timeline (verde) e Latency timeline (giallo)
**ModelInfo.tsx** - Info modello: detection model, embedding size, profili, threshold, spiegazione algoritmo
**PipelineViz.tsx** - Pipeline 5 step animata (Input → Pre-process → Detection → Encoding → Recognition), timing per step con fill proporzionale, total pipeline + max FPS teorico

### Pagina Home:
**Home.tsx** - Dashboard iniziale: hero con logo FR, status server (online/offline), quick start se 0 profili, 5 feature card con link alle pagine, tech stack footer

### App.tsx:
- BrowserRouter con 6 route: /, /enrollment, /recognition, /challenges, /analytics, /tech
- Layout Dashboard come wrapper

---

## Fase 4: Verifica e Build

1. **TypeScript compilation** - `npx tsc --noEmit` passato senza errori (dopo fix tipo RefObject)
2. **Vite production build** - Riuscita: 19.76KB CSS + 767.85KB JS (225.76KB gzip)
3. **Fix applicato**: tipo `RefObject<HTMLVideoElement | null>` → `RefObject<HTMLVideoElement>` in LiveFeed.tsx

---

## Fase 5: Setup ambiente e avvio

### Problemi risolti durante l'installazione:

1. **Python 3.13 + distutils**: Python 3.13 ha rimosso il modulo `distutils`. Risolto installando `setuptools` nel venv e usando versioni aggiornate dei pacchetti.

2. **numpy vecchio incompatibile**: `numpy==1.24.3` non compila su Python 3.13 (usa `pkg_resources.ImpImporter` rimosso). Risolto usando `numpy>=1.26.0`.

3. **cmake per dlib**: Il cmake installato via `pip install cmake` creava conflitti nell'ambiente di build isolato di dlib. Risolto:
   - Rimosso cmake da pip
   - Installato cmake via Homebrew (`brew install cmake`)
   - dlib compilato correttamente con cmake di sistema

4. **face_recognition_models + pkg_resources**: Il pacchetto usa `from pkg_resources import resource_filename` che in Python 3.13 richiede setuptools esplicito. `setuptools>=82` ha rimosso `pkg_resources`. Risolto con `pip install "setuptools<81"`.

5. **Porta 5000 occupata da AirPlay Receiver (macOS)**: Il processo `ControlCenter` di macOS occupa la porta 5000 per AirPlay. Risolto cambiando la porta del backend a **5001** in:
   - `backend/config/settings.py`: PORT = 5001
   - `frontend/vite.config.ts`: proxy verso localhost:5001

### Stato finale:
- **Backend Flask** in esecuzione su `http://localhost:5001` (health check OK)
- **Frontend Vite** in esecuzione su `http://localhost:3000`
- **Proxy configurato**: /api e /socket.io dal frontend verso il backend

### Versioni installate nel venv:
- Python 3.13.1
- flask 3.1.2, flask-socketio 5.6.0, flask-cors 6.0.2
- opencv-python 4.13.0.92
- face-recognition 1.3.0, dlib 20.0.0
- numpy 2.4.2, Pillow 12.1.1
- eventlet 0.40.4, python-socketio 5.16.1
- setuptools 80.10.2 (con pkg_resources)

---

## Riepilogo numeri

| Cosa | Quantita |
|------|----------|
| File frontend creati | 38 |
| File backend creati | 9 |
| File config/doc creati | 6 |
| **Totale file** | **53** |
| Componenti React | 27 |
| Custom hooks | 4 |
| REST endpoints | 15 |
| WebSocket handlers | 6 |
| Challenge types | 6 |
| Recharts grafici | 4 |
| Pacchetti npm | 13 |
| Pacchetti pip | ~20 |
