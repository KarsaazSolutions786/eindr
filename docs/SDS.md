<a name="_s5cmutldhe22"></a>Software Design Specification (SDS)

**Product Name**: Eindr 

**Prepared By**: Idrees Khan

-----
### <a name="_ggef99553kb0"></a>**1. Introduction**
This Software Design Specification (SDS) provides a comprehensive technical blueprint for the Eindr mobile application, detailing its architecture, components, data structures, interfaces, and deployment model. It incorporates all voice-based, multilingual, AI-integrated, and productivity-focused functionalities.

-----
### <a name="_uj0v2tbay9od"></a>**2. System Overview**
Eindr is a multilingual, voice-first productivity app for setting smart reminders, sharing tasks, managing habits, tracking IOUs (ledger), and taking notes. It operates offline for core alarm functionalities and scales with advanced AI modules and third-party integrations like Google/Apple Calendar.

-----
### <a name="_qex33doelsie"></a>**3. System Architecture**
**Architecture Style**: Modular Monolith → Microservices-ready
` `**Deployment Strategy**: Fully containerized backend and AI services via Docker, orchestrated via Kubernetes (post-MVP).
#### <a name="_hjzut1i5jaff"></a>**3.1 High-Level Components**
- Mobile App (React Native)
- Backend API (FastAPI)
- AI/NLP Services (Whisper, Bloom 560M, Coqui TTS, MiniLM)
- PostgreSQL + pgvector Database
- Firebase Authentication & Notifications
- Scheduler (APScheduler)
- Admin Dashboard (internal use)
#### <a name="_lk6qa1dew27z"></a>**3.2 Data Flow**
1. User speaks → STT → Intent Detection → Action Engine
1. Commands classified as reminder, ledger, note, or cancellation
1. AI confirms → Task saved → Notified via Firebase/APNs
1. Embedding stored for habit learning (pgvector)
-----
### <a name="_abct3mjqm4sk"></a>**4. Module Design**
#### <a name="_gyxizowuixof"></a>**4.1 Mobile App (React Native)**
- UI Components: Assistant animation, scrollable reminder cards, settings screen
- Voice Interaction: Wakeword detection + Mic recording + STT call
- Features:
  - Voice notes, reminders, ledger commands
  - Cancel or edit tasks via voice
  - Settings: language, TTS voice, reminder tone, friend permissions
  - Voice history view (chat-style)
#### <a name="_yfvzc04ge0cm"></a>**4.2 Backend API (FastAPI)**
- Routes:
  - /api/reminders, /api/notes, /api/ledger, /api/friends, /api/preferences
- Services:
  - ReminderService, LedgerService, NoteService, UserService, FriendService
- Security:
  - Firebase JWT-based auth, role control, rate limiting
#### <a name="_jhmzzoxx4sgp"></a>**4.3 AI Services (Containerized)**
- STT: Whisper Tiny (local) + Whisper API fallback
- TTS: Coqui TTS + Google API fallback
- Intent Classification: MiniLM or MobileBERT (quantized)
- Conversational/Contextual AI: Bloom 560M via vLLM
- Habit & Ledger Embeddings: Stored via pgvector
#### <a name="_pdkj8p5dbmeg"></a>**4.4 Scheduler (APScheduler)**
- Handles local & timezone-aware alarms
- Bulk scheduling + cancellation by command
- Linked to reminder database triggers
#### <a name="_72capezy53z"></a>**4.5 Database (PostgreSQL + pgvector)**
- Tables:
  - users, preferences, reminders, notes, ledger\_entries, embeddings, friendships, permissions
- Vector index on embeddings for similarity/habit match
-----
### <a name="_fdclczm3ygn2"></a>**5. Interface Design**
#### <a name="_rvys4ic6sr96"></a>**Mobile → Backend**
- Auth: Firebase JWT
- API: RESTful JSON requests/responses
- Permissions handled per user context
#### <a name="_dd0sjk7ljksi"></a>**Backend → AI Services**
- Internal API: Docker bridged
- LangChain manages input→intent→response chaining
#### <a name="_bfzjqvhtg4p"></a>**Backend → DB**
- SQLAlchemy 2.0 (async) or asyncpg
- Task creation/edit/delete tracked with timestamps and user actions
-----
### <a name="_u5moj8qlg11q"></a>**6. Data Structures (Sample)**
Reminder: {

`  `id: UUID,

`  `user\_id: UUID,

`  `title: string,

`  `time: datetime,

`  `repeat: string,

`  `is\_shared: boolean,

`  `created\_by: UUID

}

LedgerEntry: {

`  `id: UUID,

`  `user\_id: UUID,

`  `contact\_name: string,

`  `amount: number,

`  `direction: "owe" | "owed",

`  `created\_at: datetime

}

-----
### <a name="_s7ndrrp6ykzn"></a>**7. Error Handling & Logging**
- Centralized error management (FastAPI exception handlers)
- Logging: Uvicorn + Sentry for errors, Prometheus for metrics
- Retry logic for failed tasks and AI model timeouts
-----
### <a name="_9ez0n2eep5r1"></a>**8. Security Design**
- HTTPS for all external APIs
- Firebase Auth token validation + session rate limits
- Sanitized input + strict access scopes per module
- User-level visibility filtering for shared content
-----
### <a name="_ggs8so9jurpm"></a>**9. Deployment Strategy**
- MVP: Deploy to Railway / Render / Fly.io
- Scale-Up: Dockerized microservices on AWS ECS/GCP GKE
- GPU models: Bloom 560M via vLLM or RunPod
- Monitoring: Sentry (error), Prometheus + Grafana (performance)
-----
### <a name="_fthlym4yen9e"></a>**10. Conclusion**
This SDS defines the infrastructure and system-level design necessary to deliver Eindr’s multilingual, AI-powered, voice-first productivity experience. All major user-facing and backend services are modular, scalable, and built with privacy, performance, and extensibility in mind.

