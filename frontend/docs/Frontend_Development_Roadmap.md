# Eindr React Native Frontend Development Roadmap

## Overview

This roadmap outlines the step-by-step plan for building the Eindr mobile app frontend using React Native, based on the product documentation and requirements. Each phase includes a percentage estimate of total effort for better planning and tracking.

---

### 1. Project Setup & Core Architecture (10%)

- React Native project initialization
- Folder structure, navigation setup (React Navigation)
- State management setup (Context API/Zustand)
- Theming (light/dark mode, Tailwind if using RN version)
- Basic app shell, splash, onboarding

### 2. Voice Interaction Core (20%)

- Integrate Speech-to-Text (Whisper Tiny or API fallback)
- Integrate Text-to-Speech (Coqui TTS/Google TTS)
- Wake word detection (Mycroft Precise)
- Voice command UI (mic button, animated wave, feedback)

### 3. Reminders & Notes (20%)

- Reminder creation via voice and UI
- Bulk reminder setup (multiple in one command)
- Reminder list/cards UI (with cancel, edit, complete)
- Smart notes via voice ("note that..." flow)
- Offline reminder/alarm support

### 4. Voice Ledger & Habit Detection (10%)

- Voice-based ledger (add/view debts/credits)
- Habit detection UI (suggestions, recurring reminders)

### 5. Friend System & Sharing (10%)

- Friend list, add/search friends (contact sync)
- Shared reminders/notes (approval & trusted flows)
- Notifications for shared actions

### 6. Multilingual Support (5%)

- Language selection in settings
- STT/TTS for 36+ languages
- UI localization

### 7. Calendar & Contact Integration (5%)

- Google/Apple Calendar sync (for reminders)
- Contact sync for friend discovery

### 8. User Preferences & Premium Locks (5%)

- Settings panel (language, tones, permissions)
- Premium feature gating (calendar sync, limits, etc.)

### 9. Assistant History & UI Polish (5%)

- Chat/history view for past commands/interactions
- Animated assistant icon, feedback, and polish

### 10. QA, Testing, and Optimization (10%)

- Unit & integration tests
- Performance optimization (load time, latency)
- Accessibility, edge case handling

---

**Total: 100%**

> This roadmap is designed for a 2-person team (1 lead, 1 junior dev) working 5 days, 8 hours/day, using Cursor AI for productivity. Prioritize MVP features first, and move advanced polish or rare edge-cases to post-MVP if needed.
