# Eindr - AI-Powered Task Management App

Eindr is a sophisticated React Native application that combines AI-powered task management with voice commands, reminders, and social features. Built with TypeScript and modern React Native practices, it offers a seamless and intuitive user experience.

## Core Features

### 1. AI-Powered Task Management

- **Smart Voice Commands**: Create and manage tasks using natural language
- **Intelligent Task Processing**: AI-driven understanding of task context and requirements
- **Wake Word Detection**: Custom wake word system using TensorFlow Lite
- **Voice-to-Text Integration**: Real-time voice command processing

### 2. Reminders & Calendar

- **Smart Reminders**: Voice-based reminder creation and management
- **Calendar Integration**: Sync with device calendar
- **Multiple Views**: Today, Weekly, and Monthly calendar views
- **Categories**: Organize reminders by category
- **Time-based Organization**: Automatic sorting and scheduling

### 3. Notes & Lists

- **Rich Text Notes**: Create and edit detailed notes
- **Quick Lists**: Easy creation of shopping lists, to-dos, etc.
- **Pin Important Notes**: Keep critical information easily accessible
- **Favorites System**: Mark and organize favorite notes
- **Search Functionality**: Quick search through all notes

### 4. Ledger Management

- **Financial Tracking**: Keep track of money lent and borrowed
- **Transaction History**: Detailed history of all financial transactions
- **Payment Integration**: Secure card management and payments
- **Due Date Reminders**: Automatic reminders for pending payments

### 5. Social Features

- **Friend System**: Connect with other users
- **Shared Tasks**: Collaborate on tasks and reminders
- **Activity Tracking**: View friends' public activities
- **Profile Management**: Customize profile and privacy settings

### 6. Premium Features

- **Starter Plan** ($6.99/month):

  - 50 Reminders
  - Basic TTS voice assistant
  - Notes & lists
  - 2 Languages
  - Voice reminder creation

- **Pro Plan** ($12.99/month):

  - Unlimited reminders
  - AI voice assistant + TTS
  - Habit Tracking
  - 10 languages
  - Share with 3 friends
  - Calendar sync

- **Elite Plan**:
  - All Pro features
  - Health tracking
  - Premium support
  - Advanced AI features

## Technical Architecture

### Frontend (React Native)

- TypeScript for type safety
- Redux for state management
- React Navigation for routing
- Custom UI components with gradient borders
- Responsive design for all device sizes

### AI & Voice Processing

- TensorFlow Lite for wake word detection
- Custom voice activity detection
- MFCC feature extraction
- Real-time audio processing
- Voice-to-text API integration

### Security

- Secure authentication system
- Protected API endpoints
- Encrypted data storage
- Privacy-focused design

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- React Native development environment
- CocoaPods (for iOS)
- Android Studio (for Android)

### Installation

1. Clone the repository:

```sh
git clone [repository-url]
```

2. Install dependencies:

```sh
npm install
```

3. Install CocoaPods (iOS):

```sh
bundle install
bundle exec pod install
```

4. Set up environment variables:

- Copy `.env.example` to `.env.development`
- Update variables as needed

### Running the App

#### Development Mode

```sh
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

#### Production Mode

```sh
# Android
npm run android:prod

# iOS
npm run ios:prod
```

## Project Structure

```
src/
├── assets/          # Images, fonts, and static files
├── components/      # Reusable UI components
├── screens/         # Application screens
├── navigation/      # Navigation configuration
├── services/        # API and business logic
├── store/          # Redux store and slices
├── theme/          # Theme configuration
├── utils/          # Utility functions
└── wakeword/       # Wake word detection system
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is proprietary and confidential. All rights reserved.

## Support

For support, please contact our team at [support-email].
