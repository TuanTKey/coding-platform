# 🚀 Getting Started with CodeJudge Mobile

## 5-Minute Quick Start

### Step 1: Install & Setup (2 minutes)

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Step 2: Configure Backend Connection (1 minute)

Edit `.env.local`:
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

For physical device/emulator, use your computer's IP:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api
```

### Step 3: Start Development Server (1 minute)

```bash
npm start
```

You'll see the Expo menu. Choose your platform:
- Press `a` for Android Emulator
- Press `i` for iOS Simulator  
- Press `w` for Web Browser

### Step 4: Make Sure Backend is Running (1 minute)

In another terminal:
```bash
cd backend
npm run dev
```

---

## What's Inside?

✅ **9 Fully Functional Screens**
- Login & Registration
- Problem Browser
- Code Editor & Submission
- Contests
- Leaderboard
- User Profile
- Submission History

✅ **Complete API Integration**
- JWT Authentication
- Axios with Interceptors
- Secure Token Storage
- Auto Error Handling

✅ **Professional State Management**
- Redux Toolkit for global state
- Async thunks for API calls
- Clean reducers

✅ **Beautiful UI**
- Responsive Design
- Consistent Styling
- Loading States
- Error Handling

---

## How to Use

### Login
1. Open app
2. Tap "Sign up" or use demo account
3. Create account with username, email, password, class

### Solve Problems
1. Go to "Problems" tab
2. Browse problems by difficulty
3. Tap a problem to open editor
4. Write code in Python, JavaScript, C++, or Java
5. Click "Submit" to check solution

### Join Contests
1. Go to "Contests" tab
2. Browse upcoming/running contests
3. Tap contest for details
4. Solve problems within contest

### Track Progress
1. Go to "Leaderboard" tab to see global rankings
2. Go to "Profile" tab for your stats
3. View submission history

---

## File Structure at a Glance

```
mobile/
├── src/
│   ├── screens/          # 11 screen components
│   ├── components/       # Reusable UI components
│   ├── services/         # API integration
│   ├── store/            # Redux state management
│   ├── navigation/       # Screen navigation
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Helper functions
├── App.js               # Main app entry
└── app.json            # Expo configuration
```

---

## Common Commands

```bash
# Start development
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web

# Clear cache and restart
npm start -- --reset-cache

# Install new package
npm install <package-name>
```

---

## Connecting to Backend

The app makes API calls to:
`http://localhost:5000/api`

**Ensure backend is running:**
```bash
cd ../backend
npm run dev
```

Backend endpoints used:
- `POST /auth/login` - Login
- `POST /auth/register` - Register
- `GET /problems` - Get problems
- `POST /submissions` - Submit code
- `GET /contests` - Get contests
- `GET /users/leaderboard` - Get leaderboard

---

## Authentication Flow

```
1. User enters credentials
2. App sends to `/auth/login` endpoint
3. Backend returns JWT token
4. Token stored securely in Expo Secure Store
5. Token added to all subsequent API requests
6. Auto logout if token expires (401 error)
```

---

## Troubleshooting

**App won't start?**
```bash
npm install
npm start -- --reset-cache
```

**Can't connect to backend?**
- Check backend is running: `npm run dev` in backend folder
- Check `.env.local` has correct API URL
- For emulator, try using computer IP instead of localhost

**Android emulator issues?**
```bash
# Make sure emulator is running
# Or restart it:
adb kill-server && adb start-server
```

**Port 8081 in use?**
```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo |
| Navigation | React Navigation v6 |
| State | Redux Toolkit |
| API | Axios |
| Forms | React Hook Form |
| Storage | Expo Secure Store |

---

## Key Features Explained

### 🔐 Secure Authentication
- Credentials encrypted with bcrypt
- JWT tokens for API calls
- Secure storage with Expo Secure Store
- Auto logout on token expiration

### 📝 Problem Solving
- Multiple programming languages
- Real-time code execution
- Test case validation
- AI-powered feedback

### 🏆 Contests & Leaderboard
- Time-limited contests
- Global ranking system
- Performance metrics
- Progress tracking

### 👤 User Profile
- Statistics dashboard
- Submission history
- Rating system
- Profile customization

---

## Next Steps

1. **Explore the code**
   - Look at screen components in `src/screens/`
   - Check Redux slices in `src/store/slices/`
   - Review API services in `src/services/`

2. **Customize the app**
   - Add your branding in `app.json`
   - Modify colors in component styles
   - Add new screens or features

3. **Deploy**
   - Build APK: `eas build --platform android`
   - Build IPA: `eas build --platform ios`
   - Publish: `eas submit`

---

## Learn More

- [React Native Docs](https://reactnative.dev)
- [Expo Docs](https://docs.expo.dev)
- [Redux Docs](https://redux.js.org)
- [React Navigation Docs](https://reactnavigation.org)

---

**Happy Coding! 🎉**

Questions? Check out the full [README.md](./README.md) for detailed documentation.
