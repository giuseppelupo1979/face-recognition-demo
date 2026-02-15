# Face Recognition Demo

Una demo interattiva e visivamente impressionante che mostra tutte le potenzialita del riconoscimento facciale in tempo reale usando la webcam. L'applicazione e una vetrina tecnologica completa con enrollment, recognition live, stress test e analytics.

---

## Indice

- [Panoramica](#panoramica)
- [Funzionalita](#funzionalita)
- [Stack Tecnologico](#stack-tecnologico)
- [Architettura](#architettura)
- [Prerequisiti](#prerequisiti)
- [Installazione](#installazione)
- [Avvio](#avvio)
- [Come Usare](#come-usare)
- [Struttura Progetto](#struttura-progetto)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

---

## Panoramica

Questa applicazione permette di:

- **Registrare volti** (fino a 4 profili) catturando diverse angolazioni
- **Riconoscere volti in tempo reale** con bounding box colorati, confidence percentuale e landmarks
- **Testare la robustezza** del sistema con 6 challenge diverse (luce, angolazione, occlusione, distanza, velocita, multi-face)
- **Analizzare le performance** con grafici real-time, timeline, heatmap e distribuzione confidence
- **Esplorare la tecnologia** con visualizzazione della pipeline ML, performance monitor e info modello
- **Esportare i dati** in formato JSON e CSV

Il frontend comunica con il backend via WebSocket (Socket.IO) per garantire bassa latenza nel processing dei frame video.

---

## Funzionalita

### 1. Face Enrollment (Registrazione Volti)

Wizard guidato per registrare un nuovo profilo:

- **Step 1** - Inserimento nome e selezione colore per la label
- **Step 2** - Cattura frontale (5 samples)
- **Step 3** - Cattura profilo destro (5 samples)
- **Step 4** - Cattura profilo sinistro (5 samples)
- **Step 5** - Cattura dall'alto (3 samples)
- **Step 6** - Cattura dal basso (3 samples)

Durante la cattura il sistema fornisce feedback in tempo reale sulla qualita:
- "Luce insufficiente" / "Troppa luce"
- "Troppo vicino/lontano dalla camera"
- "Volto non centrato"
- "Immagine sfocata, resta fermo"
- "Perfetto!" quando il frame e buono

Supporta massimo 4 profili. Ogni profilo puo essere eliminato.

### 2. Live Recognition Arena

Riconoscimento facciale in tempo reale dalla webcam:

- Detection simultanea fino a 4 volti
- Bounding box colorato per ogni volto (colore del profilo assegnato)
- Nome persona + confidence percentuale (es. "Giuseppe 98.7%")
- Colore confidence: verde (>90%), giallo (70-90%), rosso (<70%)
- Label "Unknown" per volti non riconosciuti
- Toggle landmarks on/off (68 punti facciali)
- Slider threshold riconoscimento (50-99%)
- Screenshot del frame corrente
- FPS counter e latency indicator in tempo reale
- Pipeline timing breakdown (decode, preprocess, detection, encoding, recognition)

### 3. Stress Test Challenges

6 scenari di test, ognuno da 60 secondi con punteggio 0-10:

| Challenge | Cosa testa | Come |
|-----------|-----------|------|
| **Lighting** | Robustezza a luce variabile | Copri/scopri fonti di luce |
| **Angle** | Continuita tracking in rotazione | Ruota la testa in tutte le direzioni |
| **Occlusion** | Riconoscimento con occlusioni | Mani, occhiali, mascherina, cappello |
| **Distance** | Range di detection | Avvicinati e allontanati dalla camera |
| **Speed** | Stabilita con movimenti rapidi | Movimenti veloci, entra/esci dal frame |
| **Multi-Face** | Accuracy simultanea | Piu persone insieme davanti alla camera |

Ogni challenge mostra un risultato finale con score, stelle e rating.

### 4. Analytics Dashboard

- **4 stat card**: detections totali, FPS medio, latenza media, confidence media
- **Timeline Chart**: grafico a barre per persona negli ultimi 10 minuti
- **Confidence Distribution**: istogramma distribuzione confidence scores
- **Detections per Persona**: classifica con barre proporzionali
- **Heatmap Posizioni**: griglia 10x10 che mostra dove si posizionano i volti nel frame
- **Session History**: tabella ultimi eventi con timestamp, nome, confidence
- **Export**: download dati sessione in JSON o CSV

### 5. Tech Showcase

- **Pipeline Visualization**: diagramma animato dei 5 step di processing (Input → Pre-process → Detection → Encoding → Recognition) con timing per ogni step
- **Performance Monitor**: grafici LineChart real-time di FPS e Latency
- **Model Info**: dettagli sul modello (dlib HOG, embedding 128-d, threshold), spiegazione dell'algoritmo

---

## Stack Tecnologico

### Frontend
| Tecnologia | Versione | Uso |
|-----------|---------|-----|
| React | 18 | UI framework |
| TypeScript | 5 | Type safety |
| Vite | 5 | Build tool e dev server |
| TailwindCSS | 3.4 | Styling utility-first |
| Framer Motion | 10 | Animazioni (face box, transizioni, pipeline) |
| Recharts | 2.10 | Grafici (timeline, confidence, FPS) |
| Lucide React | 0.300 | Icone |
| Socket.IO Client | 4.6 | Comunicazione real-time con backend |
| React Router | 6.20 | Routing SPA |

### Backend
| Tecnologia | Versione | Uso |
|-----------|---------|-----|
| Python | 3.11+ | Runtime |
| Flask | 3.x | Web framework |
| Flask-SocketIO | 5.x | WebSocket server |
| Flask-CORS | 4.x+ | Cross-origin requests |
| face_recognition | 1.3.0 | Detection e recognition (basato su dlib) |
| OpenCV (cv2) | 4.9+ | Video/image processing |
| dlib | 20.x | ML engine per face detection |
| NumPy | 1.26+ | Calcoli numerici |
| Pillow | 10.x+ | Image handling |
| eventlet | 0.35+ | Async server per SocketIO |

---

## Architettura

```
┌──────────────────────┐         WebSocket (Socket.IO)         ┌──────────────────────┐
│                      │  ────────────────────────────────────> │                      │
│   Frontend (React)   │                                       │   Backend (Flask)    │
│                      │  <──────────────────────────────────── │                      │
│  - Cattura frame     │         Frame processati + risultati  │  - Decode base64     │
│  - Mostra overlay    │                                       │  - Resize 640px      │
│  - UI interattiva    │         REST API (/api/*)             │  - Face detection    │
│  - Dashboard         │  ────────────────────────────────────> │  - Encoding 128-d    │
│  - Grafici           │                                       │  - Recognition       │
│                      │  <──────────────────────────────────── │  - Analytics         │
│  Porta 3000          │         JSON responses                │  Porta 5001          │
└──────────────────────┘                                       └──────────────────────┘
                                                                        │
                                                                        ▼
                                                               ┌──────────────────────┐
                                                               │  face_recognition    │
                                                               │  (dlib + OpenCV)     │
                                                               │                      │
                                                               │  - HOG face detector │
                                                               │  - 68 landmarks      │
                                                               │  - 128-d embeddings  │
                                                               │  - Euclidean distance│
                                                               └──────────────────────┘
```

### Flusso dati:
1. Il browser cattura frame dalla webcam (10 FPS)
2. Ogni frame viene codificato in base64 e inviato al server via WebSocket
3. Il server decodifica, ridimensiona a 640px, rileva volti con HOG
4. Per ogni volto genera un embedding 128-dimensionale
5. Confronta gli embedding con i profili enrollati (distanza euclidea)
6. Ritorna risultati (bounding box, nome, confidence) via WebSocket
7. Il frontend disegna gli overlay animati sul video

---

## Prerequisiti

Prima di iniziare, assicurati di avere installato:

- **Node.js** >= 18 ([nodejs.org](https://nodejs.org))
- **Python** >= 3.11 ([python.org](https://python.org))
- **CMake** (necessario per compilare dlib)
- **Webcam** funzionante

### Installare CMake su Mac

```bash
brew install cmake
```

### Installare CMake su Ubuntu/Debian

```bash
sudo apt install cmake
```

### Installare CMake su Windows

Scarica l'installer da [cmake.org](https://cmake.org/download/) e assicurati di aggiungerlo al PATH durante l'installazione.

---

## Installazione

### 1. Clona il repository

```bash
git clone https://github.com/TUO_USERNAME/face-recognition-demo.git
cd face-recognition-demo
```

### 2. Setup Backend

```bash
cd backend

# Crea virtual environment Python
python3 -m venv venv

# Attiva il virtual environment
source venv/bin/activate        # Mac/Linux
# oppure
venv\Scripts\activate           # Windows

# Aggiorna pip e installa setuptools (necessario per Python 3.13)
pip install --upgrade pip "setuptools<81" wheel

# Installa tutte le dipendenze
pip install -r requirements.txt
```

**Nota:** L'installazione di `dlib` richiede la compilazione C++ e potrebbe impiegare qualche minuto. Assicurati che CMake sia installato correttamente.

### 3. Setup Frontend

```bash
cd ../frontend

# Installa le dipendenze Node.js
npm install
```

---

## Avvio

Servono **due terminali** separati, uno per il backend e uno per il frontend.

### Terminale 1 - Backend

```bash
cd face-recognition-demo/backend
source venv/bin/activate    # Mac/Linux
python app.py
```

Vedrai:
```
==================================================
  Face Recognition Demo - Backend
  Server: http://0.0.0.0:5001
  Profili caricati: 0
==================================================
```

### Terminale 2 - Frontend

```bash
cd face-recognition-demo/frontend
npm run dev
```

Vedrai:
```
VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

### Apri il browser

Vai su **http://localhost:3000**

La homepage mostrera lo stato del server (Online/Offline) e le feature disponibili.

---

## Come Usare

### Passo 1: Registra un profilo

1. Clicca su **"Enrollment"** nella sidebar (o dalla homepage)
2. Clicca **"Inizia Enrollment"**
3. Inserisci il tuo **nome** e scegli un **colore** per la label
4. Clicca **"Inizia Cattura"**
5. Segui le istruzioni per ogni step:
   - **Frontale**: guarda dritto verso la camera, clicca "Cattura" 5 volte
   - **Profilo Destro**: ruota leggermente la testa a destra, cattura 5 volte
   - **Profilo Sinistro**: ruota a sinistra, cattura 5 volte
   - **Dall'alto**: alza il mento, cattura 3 volte
   - **Dal basso**: abbassa il mento, cattura 3 volte
6. Il pulsante cattura si attiva solo quando la qualita e buona (indicatore verde)
7. Puoi saltare step con il bottone "Skip"
8. Al completamento il profilo viene salvato

### Passo 2: Prova il riconoscimento live

1. Vai su **"Recognition"** nella sidebar
2. Clicca **"Start Camera"** per attivare la webcam
3. La detection parte automaticamente
4. Vedrai i bounding box con il tuo nome e la confidence percentuale
5. Usa i controlli:
   - **Landmarks**: mostra i 68 punti facciali
   - **Threshold**: regola la sensibilita del riconoscimento
   - **Screenshot**: salva il frame corrente

### Passo 3: Testa con le challenge

1. Vai su **"Challenges"**
2. Scegli una delle 6 challenge
3. Leggi le istruzioni e clicca **"Inizia Challenge"**
4. Hai 60 secondi per completare lo scenario
5. Al termine vedrai il tuo punteggio (0-10) con stelle e rating

### Passo 4: Analizza i risultati

1. Vai su **"Analytics"** per vedere tutti i grafici
2. I dati si aggiornano automaticamente ogni 5 secondi
3. Puoi esportare i dati in JSON o CSV

### Passo 5: Esplora la tecnologia

1. Vai su **"Tech"** per vedere la pipeline di processing
2. Ogni step mostra il tempo impiegato in millisecondi
3. I grafici FPS e Latency mostrano le performance in tempo reale

---

## Struttura Progetto

```
face-recognition-demo/
│
├── frontend/                          # App React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Sidebar.tsx        # Navigazione laterale con 6 route
│   │   │   │   ├── Header.tsx         # Barra stato (FPS, latency, connessione)
│   │   │   │   └── Dashboard.tsx      # Layout wrapper
│   │   │   ├── Webcam/
│   │   │   │   ├── LiveFeed.tsx       # Video webcam con overlay
│   │   │   │   ├── DetectionOverlay.tsx # Contenitore face box
│   │   │   │   └── CameraControls.tsx # Controlli camera e detection
│   │   │   ├── Enrollment/
│   │   │   │   ├── EnrollmentWizard.tsx # Wizard 4 fasi (idle/setup/capture/complete)
│   │   │   │   ├── CaptureStep.tsx    # Step singolo con cattura guidata
│   │   │   │   ├── ProfileList.tsx    # Lista profili con thumbnail
│   │   │   │   └── QualityIndicator.tsx # Feedback qualita verde/rosso
│   │   │   ├── Recognition/
│   │   │   │   ├── LiveRecognition.tsx # Pagina recognition completa
│   │   │   │   ├── FaceBox.tsx        # Box animato con corner accents
│   │   │   │   ├── ConfidenceBar.tsx  # Barra confidence colorata
│   │   │   │   └── StatsPanel.tsx     # Pannello statistiche + pipeline timing
│   │   │   ├── Challenges/
│   │   │   │   ├── ChallengeSelector.tsx # Griglia 6 challenge
│   │   │   │   ├── ChallengeRunner.tsx # Engine generico (intro/running/result)
│   │   │   │   ├── ScoreCard.tsx      # Card risultato con stelle
│   │   │   │   ├── LightingChallenge.tsx
│   │   │   │   ├── AngleChallenge.tsx
│   │   │   │   ├── OcclusionChallenge.tsx
│   │   │   │   ├── DistanceChallenge.tsx
│   │   │   │   ├── SpeedChallenge.tsx
│   │   │   │   └── MultiFaceChallenge.tsx
│   │   │   ├── Analytics/
│   │   │   │   ├── AnalyticsDashboard.tsx # Dashboard completo
│   │   │   │   ├── TimelineChart.tsx  # Grafico timeline per persona
│   │   │   │   ├── ConfidenceChart.tsx # Istogramma confidence
│   │   │   │   ├── SessionHistory.tsx # Tabella ultimi eventi
│   │   │   │   └── ExportPanel.tsx    # Bottoni export JSON/CSV
│   │   │   └── Tech/
│   │   │       ├── PipelineViz.tsx    # Pipeline 5 step animata
│   │   │       ├── PerformanceMonitor.tsx # Grafici FPS e Latency
│   │   │       └── ModelInfo.tsx      # Info modello e algoritmo
│   │   ├── hooks/
│   │   │   ├── useWebcam.ts           # Gestione webcam browser
│   │   │   ├── useSocketIO.ts         # Connessione WebSocket
│   │   │   ├── useFaceDetection.ts    # Streaming frame + settings
│   │   │   └── useAnalytics.ts        # Polling dati analytics
│   │   ├── services/
│   │   │   ├── api.ts                 # Client REST per tutti gli endpoint
│   │   │   └── websocket.ts           # Singleton Socket.IO
│   │   ├── types/
│   │   │   └── index.ts              # Interfacce TypeScript
│   │   ├── utils/
│   │   │   ├── canvas.ts             # Drawing overlay su canvas
│   │   │   └── formatters.ts         # Formattazione valori
│   │   ├── pages/
│   │   │   └── Home.tsx              # Homepage con status e feature cards
│   │   ├── App.tsx                    # Router con 6 route
│   │   ├── main.tsx                   # Entry point React
│   │   └── index.css                  # Stili globali + TailwindCSS
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts                 # Dev server porta 3000, proxy verso 5001
│   ├── tailwind.config.js             # Tema dark custom
│   └── postcss.config.js
│
├── backend/                           # Server Flask
│   ├── app.py                         # Server principale (15 REST + 6 WS)
│   ├── requirements.txt               # Dipendenze Python
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py               # Configurazione centralizzata
│   ├── services/
│   │   ├── __init__.py
│   │   ├── face_detector.py           # Detection + landmarks + quality check
│   │   ├── face_recognizer.py         # Recognition + confidence + confusion matrix
│   │   ├── enrollment_manager.py      # CRUD profili + cattura samples
│   │   ├── analytics_tracker.py       # Tracking eventi + stats + export
│   │   └── video_processor.py         # Pipeline processing orchestration
│   ├── models/                        # File pickle con encoding salvati
│   └── data/
│       ├── enrolled_faces/
│       └── sessions/
│
├── CLAUDE.md                          # Documentazione tecnica progetto
├── INFO.md                            # Riepilogo lavoro svolto
├── README.md                          # Questo file
└── .env.example                       # Configurazioni esempio
```

---

## API Reference

### REST Endpoints

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `GET` | `/health` | Health check del server |
| `GET` | `/api/profiles` | Lista profili enrollati |
| `POST` | `/api/enrollment/start` | Inizia enrollment (body: `{name, color}`) |
| `POST` | `/api/enrollment/capture` | Cattura sample (body: `{frame, step}`) |
| `POST` | `/api/enrollment/complete` | Completa enrollment |
| `POST` | `/api/enrollment/cancel` | Cancella enrollment in corso |
| `GET` | `/api/enrollment/status` | Stato enrollment corrente |
| `DELETE` | `/api/enrollment/profile/:id` | Elimina profilo |
| `GET` | `/api/analytics/session` | Statistiche sessione corrente |
| `GET` | `/api/analytics/timeline` | Dati timeline (query: `seconds`) |
| `GET` | `/api/analytics/confidence` | Distribuzione confidence |
| `GET` | `/api/analytics/heatmap` | Griglia heatmap posizioni |
| `GET` | `/api/analytics/events` | Ultimi eventi (query: `limit`) |
| `GET` | `/api/analytics/challenges` | Punteggi challenge |
| `GET` | `/api/analytics/export/json` | Export sessione JSON |
| `GET` | `/api/analytics/export/csv` | Export eventi CSV |
| `GET` | `/api/performance` | Stats performance pipeline |

### WebSocket Events

| Evento | Direzione | Descrizione |
|--------|-----------|-------------|
| `video_frame` | Client → Server | Frame webcam in base64 |
| `frame_processed` | Server → Client | Risultati detection (faces, fps, latency) |
| `update_settings` | Client → Server | Aggiorna threshold/landmarks/emotions |
| `enrollment_frame` | Client → Server | Frame per quality check enrollment |
| `enrollment_feedback` | Server → Client | Feedback qualita (is_good, message, face_box) |
| `challenge_frame` | Client → Server | Frame per challenge |
| `challenge_result` | Server → Client | Risultati challenge |
| `save_challenge_score` | Client → Server | Salva punteggio challenge |

---

## Troubleshooting

### dlib non si installa

**Causa:** CMake non e installato o non e nel PATH.

```bash
# Mac
brew install cmake

# Ubuntu/Debian
sudo apt install cmake

# Verifica
cmake --version
```

### Errore "No module named 'distutils'" (Python 3.13)

**Causa:** Python 3.13 ha rimosso il modulo distutils.

```bash
pip install --upgrade pip "setuptools<81" wheel
```

### Errore "No module named 'pkg_resources'"

**Causa:** setuptools >= 82 ha rimosso pkg_resources.

```bash
pip install "setuptools<81"
```

### Porta 5000 occupata su Mac

**Causa:** macOS usa la porta 5000 per AirPlay Receiver.

Il backend e gia configurato per usare la porta **5001**. Se vuoi disabilitare AirPlay:
- Impostazioni di Sistema → Generali → AirDrop e Handoff → disattiva AirPlay Receiver

### Webcam non funziona

- Verifica che il browser abbia i permessi per accedere alla camera
- Chrome: clicca sull'icona lucchetto nella barra indirizzi → Autorizzazioni → Camera → Consenti
- Prova a chiudere altre app che usano la webcam

### Server backend non raggiungibile

- Verifica che il backend sia in esecuzione: `curl http://localhost:5001/health`
- Verifica di aver attivato il virtual environment: `source venv/bin/activate`
- Controlla i log nel terminale del backend per eventuali errori

### FPS bassi

- Chiudi altre applicazioni che usano CPU
- Il modello HOG e piu veloce di CNN (gia configurato come default)
- I frame vengono ridimensionati a 640px per performance
- Il send rate e 10 FPS per bilanciare fluidita e carico server

### TypeError o errori TypeScript

```bash
cd frontend
npx tsc --noEmit   # Verifica compilazione
npm run build       # Verifica build production
```

---

## Note Tecniche

- I profili enrollati vengono salvati in `backend/models/face_encodings.pkl` (file pickle)
- I dati analytics sono in-memory e si resettano al riavvio del server
- Il tema e dark mode con accent cyan (#00d9ff), green (#00ff88), yellow (#ffd700), red (#ff4444)
- Le animazioni usano Framer Motion con transizioni spring e ease
- Il proxy Vite gestisce CORS in development (frontend 3000 → backend 5001)

---

## Licenza

Progetto dimostrativo a scopo educativo.
