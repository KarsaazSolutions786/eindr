This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

# Eindr Mobile App

## Environment Setup

### Environment Variables

The app uses environment variables for different configurations. We use `react-native-config` to manage these variables.

#### Available Environment Files

- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.example` - Template for creating new environment files

#### Environment Variables

| Variable               | Description                    | Example                   |
| ---------------------- | ------------------------------ | ------------------------- |
| API_URL                | Base URL for API calls         | http://localhost:8000/api |
| ENABLE_ANALYTICS       | Enable/disable analytics       | true/false                |
| ENABLE_CRASH_REPORTING | Enable/disable crash reporting | true/false                |
| APP_NAME               | Name of the application        | Eindr                     |
| APP_VERSION            | Version of the application     | 1.0.0                     |
| DEBUG_MODE             | Enable/disable debug mode      | true/false                |
| SENTRY_DSN             | Sentry DSN for error tracking  |                           |
| GOOGLE_ANALYTICS_ID    | Google Analytics ID            |                           |

### Running the App

#### Development

```bash
# Start Metro bundler in development mode
npm run start:dev

# Run on Android in development mode
npm run android:dev

# Run on iOS in development mode
npm run ios:dev
```

#### Production

```bash
# Start Metro bundler in production mode
npm run start:prod

# Run on Android in production mode
npm run android:prod

# Run on iOS in production mode
npm run ios:prod
```

### Setting Up a New Environment

1. Copy `.env.example` to create a new environment file:

   ```bash
   cp .env.example .env.development
   ```

2. Update the values in the new environment file

3. Add the new environment file to `.gitignore` if it contains sensitive information

### Best Practices

1. Never commit sensitive information in environment files
2. Always use `.env.example` as a template for new environment files
3. Keep environment files in sync across team members
4. Use different environment files for different stages (development, staging, production)
