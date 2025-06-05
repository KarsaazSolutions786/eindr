Software Design Specification (SDS)
Product Name: Eindr 
Prepared By: Idrees Khan

1. Introduction
This Software Design Specification (SDS) provides a comprehensive technical blueprint for the Eindr mobile application, detailing its architecture, components, data structures, interfaces, and deployment model. It incorporates all voice-based, multilingual, AI-integrated, and productivity-focused functionalities.

2. System Overview
Eindr is a multilingual, voice-first productivity app for setting smart reminders, sharing tasks, managing habits, tracking IOUs (ledger), and taking notes. It operates offline for core alarm functionalities and scales with advanced AI modules and third-party integrations like Google/Apple Calendar.

3. System Architecture
Architecture Style: Modular Monolith → Microservices-ready
 Deployment Strategy: Fully containerized backend and AI services via Docker, orchestrated via Kubernetes (post-MVP).
3.1 High-Level Components
Mobile App (React Native)

Backend API (FastAPI)

AI/NLP Services (Whisper, Bloom 560M, Coqui TTS, MiniLM)

PostgreSQL + pgvector Database

Firebase Authentication & Notifications

Scheduler (APScheduler)

Admin Dashboard (internal use)

3.2 Data Flow
User speaks → STT → Intent Detection → Action Engine

Commands classified as reminder, ledger, note, or cancellation

AI confirms → Task saved → Notified via Firebase/APNs

Embedding stored for habit learning (pgvector)


4. Module Design
4.1 Mobile App (React Native)
UI Components: Assistant animation, scrollable reminder cards, settings screen

Voice Interaction: Wakeword detection + Mic recording + STT call

Features:

Voice notes, reminders, ledger commands

Cancel or edit tasks via voice

Settings: language, TTS voice, reminder tone, friend permissions

Voice history view (chat-style)

4.2 Backend API (FastAPI)
Routes:

/api/reminders, /api/notes, /api/ledger, /api/friends, /api/preferences

Services:

ReminderService, LedgerService, NoteService, UserService, FriendService

Security:

Firebase JWT-based auth, role control, rate limiting

4.3 AI Services (Containerized)
STT: Whisper Tiny (local) + Whisper API fallback

TTS: Coqui TTS + Google API fallback

Intent Classification: MiniLM or MobileBERT (quantized)

Conversational/Contextual AI: Bloom 560M via vLLM

Habit & Ledger Embeddings: Stored via pgvector

4.4 Scheduler (APScheduler)
Handles local & timezone-aware alarms

Bulk scheduling + cancellation by command

Linked to reminder database triggers

4.5 Database (PostgreSQL + pgvector)
Tables:

users, preferences, reminders, notes, ledger\_entries, embeddings, friendships, permissions

Vector index on embeddings for similarity/habit match


5. Interface Design
Mobile → Backend
Auth: Firebase JWT

API: RESTful JSON requests/responses

Permissions handled per user context

Backend → AI Services
Internal API: Docker bridged

LangChain manages input→intent→response chaining

Backend → DB
SQLAlchemy 2.0 (async) or asyncpg

Task creation/edit/delete tracked with timestamps and user actions


6. Data Structures (Sample)
Reminder: {
 id: UUID,
 user\_id: UUID,
 title: string,
 time: datetime,
 repeat: string,
 is\_shared: boolean,
 created\_by: UUID
}

LedgerEntry: {
 id: UUID,
 user\_id: UUID,
 contact\_name: string,
 amount: number,
 direction: "owe" | "owed",
 created\_at: datetime
}


7. Error Handling & Logging
Centralized error management (FastAPI exception handlers)

Logging: Uvicorn + Sentry for errors, Prometheus for metrics

Retry logic for failed tasks and AI model timeouts


8. Security Design
HTTPS for all external APIs

Firebase Auth token validation + session rate limits

Sanitized input + strict access scopes per module

User-level visibility filtering for shared content


9. Deployment Strategy
MVP: Deploy to Railway / Render / Fly.io

Scale-Up: Dockerized microservices on AWS ECS/GCP GKE

GPU models: Bloom 560M via vLLM or RunPod

Monitoring: Sentry (error), Prometheus + Grafana (performance)


10. Conclusion
This SDS defines the infrastructure and system-level design necessary to deliver Eindr’s multilingual, AI-powered, voice-first productivity experience. All major user-facing and backend services are modular, scalable, and built with privacy, performance, and extensibility in mind.
