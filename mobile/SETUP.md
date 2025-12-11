# 📱 CodeJudge Mobile App - Quick Start Guide

## Prerequisites

Ensure you have the following installed:
- Node.js >= 18.x
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

## Installation

### 1. Navigate to Mobile Directory
```bash
cd mobile
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment

Create `.env.local` file in the mobile directory:

```env
EXPO_PUBLIC_API_URL=http://YOUR_BACKEND_IP:5000/api
```

**Important for Android Emulator:**
- Use `10.0.2.2:5000` instead of `localhost:5000`
- This is the special Android emulator host address for localhost

**For Physical Device:**
- Use your computer's actual IP address (find with `ipconfig` on Windows or `ifconfig` on Mac/Linux)
- Example: `http://192.168.1.100:5000/api`

## Running the App

### Option 1: Using Expo Go (Easiest for Development)

1. Start the development server:
   ```bash
   npm start
   ```

2. Scan the QR code with:
   - **Android**: Expo Go app
   - **iOS**: Camera app or Expo Go

### Option 2: Android Emulator

1. Start the development server:
   ```bash
   npm start
   ```

2. Press `a` to open Android Emulator

### Option 3: iOS Simulator (Mac only)

1. Start the development server:
   ```bash
   npm start
   ```

2. Press `i` to open iOS Simulator

### Option 4: Web Browser

1. Start the development server:
   ```bash
   npm start
   ```

2. Press `w` to open in web browser

## Project Structure Overview

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Screen components
│   ├── services/           # API service functions
│   ├── stores/             # Zustand state management
│   ├── navigation/         # Navigation setup
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Utility functions
├── App.jsx                 # Main app component
├── index.js               # Entry point
├── app.json               # Expo configuration
└── package.json
```

## Supported Screens

### Authentication
- **LoginScreen**: User login
- **RegisterScreen**: User registration with role selection

### Main Features
- **ProblemsScreen**: Browse coding problems
- **ProblemDetailScreen**: View problem and submit code
- **ContestsScreen**: Browse contests
- **ContestDetailScreen**: Contest details and join
- **ProfileScreen**: User profile and statistics
- **MySubmissionsScreen**: View submission history
- **LeaderboardScreen**: Global rankings

## Key Features

✅ **User Authentication**
- Secure login/registration
- JWT token management
- Encrypted token storage

✅ **Problem Solving**
- Browse problems by difficulty
- View detailed problem descriptions
- Multi-language support (Python, JavaScript, C++, Java)
- Code submission

✅ **Contests**
- Browse active and upcoming contests
- Join contests
- View contest leaderboard

✅ **User Profile**
- View statistics and ratings
- Submission history
- Global leaderboard

## Debugging Tips

### Check if Backend is Running
```bash
curl http://localhost:5000/api/health
```

### View Network Requests
- Press `d` in Expo CLI
- Select "View network requests in debugger"

### Check Logs
- Open Expo DevTools
- Select "View logs"

### Clear Cache
```bash
npm expo prebuild --clean
npx expo-cli start -c
```

## Common Issues & Solutions

### App can't connect to API
- Verify backend is running
- Check `.env.local` has correct IP
- For emulator: use `10.0.2.2` instead of `localhost`

### Token not persisting
- Clear app cache
- Check Secure Store permissions

### UI looks wrong
- Try different device/simulator
- Clear cache and rebuild

## API Connection

The app uses axios to connect to the backend. Key endpoints:

- `POST /auth/login` - Login
- `POST /auth/register` - Register
- `GET /problems` - List problems
- `POST /submissions` - Submit code
- `GET /contests` - List contests
- `GET /users/:id/stats` - User statistics

All requests automatically include the JWT token in headers.

## Next Steps

1. ✅ Backend must be running (`cd ../backend && npm run dev`)
2. ✅ Configure `.env.local` with correct API URL
3. ✅ Run `npm start` to start development
4. ✅ Scan QR code or select simulator
5. ✅ Log in or register an account
6. ✅ Start exploring problems and contests!

## Need Help?

- Check the main [README.md](./README.md)
- Review the [Backend README](../README.md)
- Check the API documentation in backend

Happy Coding! 🚀
