<a name="_1028upflux2t"></a>Eindr App - Official Feature List & Architecture Overview

**Tagline**: Forget Forgetting

-----
### <a name="_jg0wq28jxh74"></a>**Core Architecture**
1. **Wake Word Detection**: Mycroft Precise
1. **Speech-to-Text (STT)**: Whisper Tiny
1. **Intent Classification**: MiniLM-L12-v2
1. **Habit Detection**: Embedding + Search on PostgreSQL
1. **Conversational AI**: Bloom 560M
1. **Text-to-Speech (TTS)**: Coqui TTS
1. **Context Management & Flow**: Langchain
1. **Infrastructure**:
   1. Scheduler: APScheduler
   1. Database: PostgreSQL
   1. Notifications: Firebase Cloud Messaging & APNs
-----
### <a name="_fhs6wc7w1ihr"></a>**Supported Languages (36 Total)**
English, Spanish, French, German, Italian, Portuguese, Polish, Turkish, Russian, Dutch, Czech, Arabic, Chinese, Japanese, Hungarian, Korean, Vietnamese, Hindi, Ukrainian, Swedish, Finnish, Romanian, Thai, Hebrew, Malay, Bengali, Greek, Macedonian, Serbian, Albanian, Swahili, Gujarati, Yoruba, Tamil, Telugu, Punjabi, Luganda

-----
###
### <a name="_ne4qkcgcmfxt"></a><a name="_ctvftd1z7ohs"></a>**Core Features**
1. **Voice-Based Reminders**

   1. Users set reminders through conversational voice commands
   1. Option to sync with calendar (Google/Apple) or operate independently
1. **Bulk Reminder Setup via Voice**

   1. Users can set multiple reminders in a single command (e.g., “Remind me to drink coffee at 7, go on a walk at 8, and watch a movie at  9.”)
1. **Voice-Based Reminder Cancellation**

   1. Cancel reminders by voice using name, time, or bulk commands
   1. Each reminder card also includes a cancel (X) option
1. **Offline Reliability**

   1. Once a reminder is set, it will still trigger even without internet
1. **Smart Notes by Voice**

   1. Saying "note that..." creates and saves a note in the app
1. **Voice Ledger**

   1. Users can record debts and credits via voice (e.g., “Saad owes me 5000”)
   1. Totals calculated for what you owe and what others owe you
1. **Habit Detection Engine**

   1. Analyzes recurring behavior to suggest/remind tasks intelligently
1. **Push Notifications & Alarms**

   1. Notification types: One-time, Repeating, or Scheduled Alarms
1. **Friend-based Reminder & Note Sharing**

   1. Add friends within the app
   1. Settings allow for two types:
      1. Regular friends (require approval to set reminders/notes)
      1. Trusted friends (can set reminders/notes without approval)
   1. Users receive push + in-app notifications
1. **Multilingual Input & TTS Output**

- Speech input and AI responses both support the user’s selected language
11. **Voice Assistant Chat History**

- Optionally stores past interactions (reminders, notes, commands)
- Will follow privacy-compliant storage practices
12. **Contact Sync for Friend Discovery**

- Detect friends already using Eindr via contact sync
13. **Premium-Only Feature Locks**

- Features like calendar sync, reminder limits, note duration, etc. will be exclusive to paid users (defined in pricing plans)
14. **Premium Minimal UI**

- Floating voice assistant icon
- Animated wave/microphone during conversations
- Scrollable card-based layout for reminders/notes
- Instant feedback through checkmarks or dismiss animations
15. **User Settings & Preferences Panel**

- Manage app language, notification sounds, friend permissions, calendar sync, and more
-----
Let the UI/UX designer use this doc to build complete screens, including friend-based interactions, reminder/ledger/note flows, and multilingual assistant behaviors.

