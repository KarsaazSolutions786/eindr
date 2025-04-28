Eindr App - Official Feature List & Architecture Overview
Tagline: Forget Forgetting

Core Architecture
Wake Word Detection: Mycroft Precise

Speech-to-Text (STT): Whisper Tiny

Intent Classification: MiniLM-L12-v2

Habit Detection: Embedding + Search on PostgreSQL

Conversational AI: Bloom 560M

Text-to-Speech (TTS): Coqui TTS

Context Management & Flow: Langchain

Infrastructure:

Scheduler: APScheduler

Database: PostgreSQL

Notifications: Firebase Cloud Messaging & APNs


Supported Languages (36 Total)
English, Spanish, French, German, Italian, Portuguese, Polish, Turkish, Russian, Dutch, Czech, Arabic, Chinese, Japanese, Hungarian, Korean, Vietnamese, Hindi, Ukrainian, Swedish, Finnish, Romanian, Thai, Hebrew, Malay, Bengali, Greek, Macedonian, Serbian, Albanian, Swahili, Gujarati, Yoruba, Tamil, Telugu, Punjabi, Luganda


Core Features
Voice-Based Reminders

Users set reminders through conversational voice commands

Option to sync with calendar (Google/Apple) or operate independently

Bulk Reminder Setup via Voice

Users can set multiple reminders in a single command (e.g., “Remind me to drink coffee at 7, go on a walk at 8, and watch a movie at 9.”)

Voice-Based Reminder Cancellation

Cancel reminders by voice using name, time, or bulk commands

Each reminder card also includes a cancel (X) option

Offline Reliability

Once a reminder is set, it will still trigger even without internet

Smart Notes by Voice

Saying "note that..." creates and saves a note in the app

Voice Ledger

Users can record debts and credits via voice (e.g., “Saad owes me 5000”)

Totals calculated for what you owe and what others owe you

Habit Detection Engine

Analyzes recurring behavior to suggest/remind tasks intelligently

Push Notifications & Alarms

Notification types: One-time, Repeating, or Scheduled Alarms

Friend-based Reminder & Note Sharing

Add friends within the app

Settings allow for two types:

Regular friends (require approval to set reminders/notes)

Trusted friends (can set reminders/notes without approval)

Users receive push + in-app notifications

Multilingual Input & TTS Output

Speech input and AI responses both support the user’s selected language

Voice Assistant Chat History

Optionally stores past interactions (reminders, notes, commands)

Will follow privacy-compliant storage practices

Contact Sync for Friend Discovery

Detect friends already using Eindr via contact sync

Premium-Only Feature Locks

Features like calendar sync, reminder limits, note duration, etc. will be exclusive to paid users (defined in pricing plans)

Premium Minimal UI

Floating voice assistant icon

Animated wave/microphone during conversations

Scrollable card-based layout for reminders/notes

Instant feedback through checkmarks or dismiss animations

User Settings & Preferences Panel

Manage app language, notification sounds, friend permissions, calendar sync, and more


Let the UI/UX designer use this doc to build complete screens, including friend-based interactions, reminder/ledger/note flows, and multilingual assistant behaviors.
