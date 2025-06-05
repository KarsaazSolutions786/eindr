Software Requirements Specification (SRS)
Product Name: Eindr 
Prepared By: Idrees Khan

1. Introduction
1.1 Purpose
 This document defines the software requirements for the Eindr mobile application. It serves as a foundation for design, development, testing, and future enhancements.
1.2 Scope
 Eindr is a voice-first AI-powered reminder app that supports intelligent voice interaction for setting reminders, taking notes, managing task history, syncing contacts, and tracking debts via voice. The app is built with scalability and multilingual support in mind, with features like friend-sharing, TTS responses, calendar sync, ledger logs, and offline reminder reliability.
1.3 Intended Audience
Mobile & Backend Developers

UI/UX Designers

Project Managers

QA Engineers

Stakeholders

1.4 Definitions
STT: Speech-to-Text

TTS: Text-to-Speech

LLM: Large Language Model

MVP: Minimum Viable Product


2. Functional Requirements
2.1 Voice Reminders
User can set reminders via voice input.

App transcribes voice using STT.

Classifies intent and schedules reminders.

Reminder cards are created and displayed.

2.2 Bulk Reminder Setup via Voice
Multiple reminders can be set through a single voice command.

2.3 Voice-Based Reminder Cancellation
Cancel reminders by name, time, or in bulk via voice.

Option to cancel through UI card action.

2.4 Offline Reminder Support
Alarms/reminders still trigger when the device is offline.

2.5 Smart Notes
User can say "note that..." to record a note.

Notes are transcribed, categorized, and saved.

2.6 Voice Ledger
Users can log financial IOUs using voice (e.g., “Yasir owes me 10,000”).

System maintains totals and user-based balances.

2.7 Shared Reminder & Notes System
Friend list with two permission types:

Trusted (auto-sets reminders)

Standard (requires approval)

Notifications and in-app request approval.

2.8 Habit Detection
System tracks user behavior via vector embeddings.

Suggests reminders based on patterns.

2.9 Calendar Integration
Sync with Google and Apple Calendar APIs.

2.10 App Preferences & Permissions
Manage TTS language, notification tones, sharing permissions.

Control friend approval settings.

2.11 Multilingual Input/Output
STT and TTS handle 36+ languages.

Responses are returned in selected language.

2.12 Contact Sync for Friend Discovery
App scans device contacts and identifies friends using Eindr.

2.13 Voice Assistant History (Chat View)
Log and display previous reminders, commands, and AI replies.

History is user-accessible and privacy-compliant.

2.14 Premium Feature Locks
Exclusive access to: calendar sync, note duration, high-frequency reminders.

Determined by active subscription status.


3. Non-Functional Requirements
App load time < 2 seconds

STT response latency < 1 second

Offline reminder trigger accuracy > 99%

Multilingual accuracy > 90%

End-to-end encrypted data

Scalable infrastructure for 10M+ users


4. System Requirements
4.1 Mobile Platform
Android 10+

iOS 14+

Framework: React Native

4.2 Backend Services
RESTful APIs (FastAPI)

WebSocket (optional for real-time updates)

4.3 Database
PostgreSQL with pgvector for habit and ledger tracking

4.4 Model Hosting
Containerized AI models via Docker (on AWS/RunPod)


5. External Interfaces
Firebase Auth: login/signup

FCM / APNs: push notifications

LangChain: AI orchestration

PostgreSQL: persistent and vector data storage

Google/Apple Calendar APIs: sync services


6. Assumptions and Constraints
Initial deployment via Railway / Render / Fly.io

Scaling via AWS or GCP with Kubernetes

Chat history must be stored securely and optionally cleared by users

Paid features unlocked post trial (7 days)


7. Future Enhancements (Post-MVP)
Shared ledger history between friends

Groups creation and reminders


8. Approval & Version Control
Version 1.0 (MVP) – Approved by Product Owner

