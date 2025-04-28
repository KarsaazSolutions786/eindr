Technology Stack & Justification – Eindr

Prepared By: Idrees Khan 
Owner: Karsaaz Solutions


---

1. Mobile Application Stack

Framework: React Native

Why: Cross-platform native compilation, fast UI, smooth animations, and wide device support.

Benefits:

One codebase for Android and iOS

Hot reload for rapid development

Strong Google support

Custom UI capabilities (ideal for assistant animations)


Scalability: Easily handles millions of users with minimal device-level issues



---

2. Backend Stack

Language & Framework: Python + FastAPI

Why: Modern async framework with great performance, especially for APIs and AI workflows.

Benefits:

Fast performance (async-first)

Lightweight and modular

Easy to containerize with Docker

Ideal for ML/AI integration



Database: PostgreSQL + pgvector

Why: Robust relational database with native support for AI-based similarity search

Benefits:

Mature, secure, scalable

Vector extension for habit tracking

Open-source and cloud-optimized



Task Scheduler: APScheduler

Why: Lightweight, flexible, and works seamlessly with FastAPI

Use: Time-based alarms, reminders, recurring jobs


WebSocket (Optional): Starlette (FastAPI-based)

Why: Enables real-time syncing (e.g., shared reminders)


Authentication: Firebase Auth

Why: Secure, easy social login, and offloads auth security


Notifications: Firebase Cloud Messaging (Android) + Apple Push Notification Service (iOS)

Why: Native systems, free at scale, reliable delivery



---

3. AI/NLP Stack

Wake Word Detection: Mycroft Precise

Lightweight and on-device friendly for privacy and performance


Speech-to-Text (STT): Whisper Tiny (local) + API fallback (Whisper API)

Combines speed and accuracy for multilingual use


Intent Classifier: MiniLM / MobileBERT (quantized)

Low-latency classification of commands (e.g., reminder vs note)


Conversational AI: Bloom 560 via vLLM

Fast LLMs for lightweight but smart responses

Future-ready for personalized contextual responses


Text-to-Speech (TTS): Coqui TTS (local) + Google TTS API fallback

Customizable and natural-sounding voice generation


Habit Detection: Embedding with MiniLM + pgvector similarity search

Real-time suggestion engine for repeated behaviors


Orchestration: LangChain

Chains AI flows (e.g., voice → intent → habit → action)


---

4. Infrastructure & DevOps

Containerization: Docker

All services (backend, AI models) are Dockerized for portability


Hosting (MVP): Railway / Render / Fly.io

Quick to deploy, autoscaling, low maintenance


Hosting (Scale): AWS / GCP (ECS, EKS, GKE)

Load balancing, autoscaling, global CDN support


Monitoring: Sentry (frontend/backend) + Prometheus + Grafana (infra)

CI/CD: GitHub Actions or Railway-integrated pipelines

Security: OAuth 2.0 (Firebase), HTTPS, rate limiting, encrypted storage


---

5. Future Scalability Benefits

All services are modular and ready for microservice transition

Models are containerized for horizontal scaling

PostgreSQL supports clustering and partitioning for millions of rows

Firebase and push infrastructure scale globally


---



Conclusion:

This stack is designed to support Eindr’s growth from MVP to 10M+ users with minimal re-architecture. It's light, reliable, developer-friendly, and fully prepared for global scale and AI integration.
