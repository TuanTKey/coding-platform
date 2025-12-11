# 🎯 CodeJudge Mobile App Setup Guide

This guide will help you get the CodeJudge mobile app running locally.

## Prerequisites

Make sure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Android Studio + Android SDK (for Android) or Xcode (for iOS)

## Installation Steps

### 1. Navigate to the mobile directory

```bash
cd mobile
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the mobile directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and update the API URL:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

For iOS (use your computer's IP address):
```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:5000/api
```

### 4. Start the development server

```bash
npm start
```

## Running on Different Platforms

### Android
Press `a` in the terminal to open in Android emulator, or:
```bash
npm run android
```

### iOS
Press `i` in the terminal to open in iOS simulator, or:
```bash
npm run ios
```

### Web
Press `w` in the terminal to open in web browser, or:
```bash
npm run web
```

## Troubleshooting

### Port 8081 already in use
```bash
# Kill the process using port 8081
lsof -ti:8081 | xargs kill -9
```

### Metro bundler issues
```bash
# Clear cache and restart
npm start -- --reset-cache
```

### Unable to connect to backend
- Make sure backend is running on port 5000
- Check your `.env.local` file has correct API URL
- For emulator/physical device, use your computer's IP address instead of localhost

### Android emulator issues
```bash
# List available emulators
$ANDROID_HOME/emulator/emulator -list-avds

# Start specific emulator
$ANDROID_HOME/emulator/emulator -avd <emulator-name>
```

## File Structure

```
mobile/
├── App.js                      # Main app entry point
├── app.json                    # Expo configuration
├── package.json                # Dependencies
├── babel.config.js             # Babel configuration
└── src/
    ├── screens/               # Screen components
    ├── components/            # Reusable components
    ├── services/              # API service layer
    ├── store/                 # Redux store & slices
    ├── navigation/            # Navigation setup
    ├── hooks/                 # Custom hooks
    └── utils/                 # Utility functions
```

## Key Features

✅ User Authentication (Login/Register)
✅ Browse & Solve Problems
✅ Submit Code Solutions
✅ View Submission Results
✅ Participate in Contests
✅ View Global Leaderboard
✅ User Profile Management
✅ Submission History
✅ AI Code Analysis (when enabled)

## API Integration

The mobile app connects to the same backend API as the web frontend:
- Base URL: `http://localhost:5000/api`
- Authentication: JWT tokens stored securely in Expo Secure Store
- Auto token refresh and logout on 401 errors

## Development Tips

- Use React Native Debugger for debugging
- Use Redux DevTools for state management debugging
- Check Expo documentation for device permissions
- Test on both Android and iOS simulators

## Next Steps

1. Make sure backend is running: `cd ../backend && npm run dev`
2. Start mobile app: `npm start`
3. Open on your preferred platform
4. Create account and start solving problems!

For more information, see [README.md](./README.md)
