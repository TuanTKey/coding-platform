# 🎯 CodeJudge Mobile App - React Native/Expo

Mobile application for CodeJudge Online Coding Platform built with React Native and Expo.

## 📱 Features

### Authentication
- User registration with role selection (Student/Teacher)
- Secure JWT-based authentication
- Token persistence with encrypted secure storage

### Problem Solving
- Browse all coding problems
- View problem details with descriptions
- Support for multiple programming languages
- Difficulty levels (Easy, Medium, Hard)
- Submission tracking

### Contests
- View and browse online contests
- Contest status (Active/Upcoming)
- Join/Leave contests
- Contest leaderboard
- Real-time participant count

### User Profile
- View user statistics (submissions, solved problems)
- User rating and rank
- Edit profile information
- View submission history
- Secure logout

## 🛠️ Tech Stack

- **Frontend Framework**: React Native with Expo
- **State Management**: Zustand
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **HTTP Client**: Axios
- **Storage**: Expo Secure Store (for tokens)
- **UI Components**: Custom styled components + Linear Gradient

## 📦 Installation

### Prerequisites
- Node.js >= 18.x
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Setup Steps

1. **Navigate to mobile folder:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure API URL** in `.env.local`:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_BACKEND_IP:5000/api
   ```
   > For Android emulator use `10.0.2.2:5000` instead of `localhost:5000`

## 🚀 Running the App

### Development (Android)
```bash
npm run android
```

### Development (iOS)
```bash
npm run ios
```

### Development (Web)
```bash
npm run web
```

### Using Expo Go
```bash
npm start
```

Then scan the QR code with Expo Go app on your phone.

## 📁 Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── Button.jsx      # Gradient buttons and cards
│   ├── screens/            # Screen components
│   │   ├── LoginScreen.jsx
│   │   ├── RegisterScreen.jsx
│   │   ├── ProblemsScreen.jsx
│   │   ├── ContestsScreen.jsx
│   │   └── ProfileScreen.jsx
│   ├── services/           # API integration
│   │   ├── api.js          # Axios instance with interceptors
│   │   └── authAPI.js      # Service functions for each endpoint
│   ├── stores/             # Zustand state management
│   │   └── authStore.js
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── navigation/         # Navigation setup
│       └── RootNavigator.jsx
├── App.jsx                 # App entry point
├── index.js               # React Native entry
├── app.json               # Expo configuration
├── package.json
└── README.md
```

## 🔑 API Endpoints Integration

The app connects to the following backend endpoints:

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Problems
- `GET /problems` - List all problems (paginated)
- `GET /problems/:slug` - Get problem details

### Submissions
- `POST /submissions` - Submit code
- `POST /submissions/run` - Run code
- `GET /submissions` - Get user submissions

### Contests
- `GET /contests` - List all contests
- `GET /contests/:id` - Get contest details
- `POST /contests/:id/join` - Join contest
- `POST /contests/:id/leaderboard` - Get leaderboard

### Users
- `GET /users/:id` - Get user profile
- `GET /users/:id/stats` - Get user statistics
- `GET /users/leaderboard` - Global leaderboard

## 🔐 Security Features

- **JWT Authentication**: Token-based authentication
- **Secure Storage**: Tokens stored in encrypted secure storage
- **Request Interceptors**: Automatic token injection in headers
- **Response Interceptors**: Automatic logout on 401 errors
- **HTTPS Ready**: Supports both HTTP and HTTPS

## 🎨 UI/UX Features

- **Gradient Design**: Modern gradient buttons and backgrounds
- **Card Components**: Reusable card layouts
- **Bottom Tab Navigation**: Easy access to main features
- **Loading States**: Activity indicators for async operations
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on different screen sizes

## 📝 Authentication Flow

1. **First Launch**
   - App checks for stored token
   - If found, user is logged in
   - If not, shows login/register screen

2. **Registration**
   - User creates account with name, email, password, and role
   - Backend returns JWT token
   - Token is stored securely
   - User is redirected to main app

3. **Login**
   - User enters email and password
   - Backend validates and returns JWT token
   - Token is stored securely
   - User is redirected to main app

4. **Logout**
   - Token is deleted from secure storage
   - User is redirected to login screen

## 🧪 Development Tips

### API Testing
- Backend must be running on configured IP/port
- Use Postman or similar tool to test API endpoints
- Check Network tab in Expo DevTools for requests

### Debugging
- Use React Native Debugger
- Access Expo DevTools with `d` key during development
- Check console logs in terminal

### Building for Production

**Android APK:**
```bash
eas build --platform android
```

**iOS App:**
```bash
eas build --platform ios
```

> Requires EAS (Expo Application Services) account

## 📱 Supported Devices

- Android 5.1+ (API 22+)
- iOS 13.0+
- Web browsers (Chromium-based preferred)

## 🐛 Troubleshooting

### App won't connect to backend
- Check if backend is running
- Verify API URL in `.env.local`
- For emulator, use `10.0.2.2` instead of `localhost`

### Token not persisting
- Clear app cache: `npm expo prebuild --clean`
- Check Secure Store permissions

### UI looks wrong
- Clear cache: `npm expo build:web --clear`
- Try different device simulator

## 📚 Related Documentation

- [Backend README](../README.md)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Zustand](https://github.com/pmndrs/zustand)

## 👨‍💻 Future Enhancements

- [ ] Code editor with syntax highlighting
- [ ] Real-time code execution
- [ ] Offline mode support
- [ ] Push notifications
- [ ] Social features (follow, messaging)
- [ ] Dark mode theme
- [ ] Multiple language support
- [ ] Advanced contest features

## 📄 License

Same as main project

## 🤝 Contributing

Follow the same contribution guidelines as the main CodeJudge project.
