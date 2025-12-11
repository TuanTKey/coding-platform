# Coding Platform - React Native Mobile App

A comprehensive React Native mobile application built with Expo and Zustand, providing a mobile-first experience for competitive coding platform.

## 📱 Features

- **User Authentication**

  - Sign up with class selection
  - Secure login with JWT tokens
  - Persistent authentication using Secure Store

- **Problem Solving**

  - Browse problems by difficulty (Easy, Medium, Hard)
  - Search and filter problems
  - Write code in multiple languages (JavaScript, Python, Java, C++, C)
  - Real-time submission feedback

- **Contests**

  - View upcoming and ongoing contests
  - Join contests
  - Track contest progress
  - View contest leaderboards

- **Submissions**

  - Track all submissions
  - View detailed submission results
  - Test case execution details
  - Error tracking and analysis

- **User Profile**

  - View personal statistics
  - Edit profile information
  - Track solved problems
  - View acceptance rate

- **Dark Mode Support**
  - System theme detection
  - Manual theme toggle
  - Persistent theme preference

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **HTTP Client**: Axios
- **Storage**: Expo Secure Store
- **Authentication**: JWT

## 📋 Prerequisites

- Node.js 16+ and npm
- Expo CLI: `npm install -g expo-cli`
- Android Studio or Xcode (for running on simulators)
- For physical device: Expo Go app

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure Environment

Create `.env` file in the mobile folder:

```env
EXPO_PUBLIC_API_URL=http://YOUR_BACKEND_URL:5000/api
```

For local development:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api  # Android emulator
EXPO_PUBLIC_API_URL=http://localhost:5000/api # iOS simulator or physical device with appropriate IP
```

### 3. Start the Development Server

```bash
npm start
```

### 4. Run on Emulator/Device

**Android Emulator:**

```bash
npm run android
```

**iOS Simulator (macOS only):**

```bash
npm run ios
```

**Web Browser:**

```bash
npm run web
```

**Physical Device:**

- Install Expo Go from App Store or Google Play
- Scan QR code from terminal

## 📁 Project Structure

```
mobile/
├── app/                          # App router screens
│   ├── _layout.js               # Root layout
│   ├── auth/                    # Authentication screens
│   │   ├── login.js
│   │   ├── register.js
│   │   └── _layout.js
│   ├── (tabs)/                  # Main tabs navigation
│   │   ├── problems.js          # Problems list
│   │   ├── contests.js          # Contests list
│   │   ├── submissions.js       # User submissions
│   │   ├── profile.js           # User profile
│   │   └── _layout.js
│   ├── problems/[id].js         # Problem detail & code editor
│   ├── contests/[id].js         # Contest detail
│   ├── submissions/[id].js      # Submission detail
│   └── profile/edit.js          # Edit profile
├── services/                     # API services
│   ├── api.js                   # Axios config & interceptors
│   ├── auth.js                  # Authentication
│   ├── problem.js               # Problem operations
│   ├── submission.js            # Submission operations
│   ├── contest.js               # Contest operations
│   └── user.js                  # User operations
├── stores/                      # Zustand state management
│   ├── authStore.js            # Auth state
│   ├── problemStore.js         # Problem state
│   └── submissionStore.js      # Submission state
├── components/                  # Reusable components
│   ├── Common.jsx              # Common UI components
│   ├── Layout.jsx              # Layout components
│   ├── Badge.jsx               # Badge components
│   └── Form.jsx                # Form components
├── contexts/                    # React contexts
│   └── ThemeContext.js         # Theme (dark/light mode)
├── hooks/                       # Custom hooks
│   └── useAuth.js              # Auth hook
├── utils/                       # Utility functions
│   └── helpers.js              # Helper functions
├── app.json                     # Expo configuration
├── package.json
├── tailwind.config.js
├── babel.config.js
└── metro.config.js
```

## 🔌 API Integration

The app connects to your backend API. Make sure your backend is running on the configured URL.

### Authentication Flow

1. User registers/logs in
2. Backend returns JWT token
3. Token stored in secure storage
4. Token automatically attached to all API requests
5. 401 responses trigger re-authentication

### API Endpoints Used

**Auth:**

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

**Problems:**

- `GET /problems` - List all problems
- `GET /problems/:id` - Get problem details
- `GET /problems/slug/:slug` - Get problem by slug

**Submissions:**

- `POST /submissions` - Submit solution
- `GET /submissions/:id` - Get submission status
- `GET /submissions` - Get user submissions

**Contests:**

- `GET /contests` - List all contests
- `GET /contests/:id` - Get contest details
- `POST /contests/:id/join` - Join contest
- `GET /contests/:id/leaderboard` - Contest leaderboard

**Users:**

- `GET /users/:id` - Get user profile
- `GET /users/me` - Get current user
- `PUT /users/me` - Update profile

## 🎨 Customization

### Theming

Colors defined in `tailwind.config.js`:

```javascript
colors: {
  primary: "#06B6D4",    // Cyan
  secondary: "#2563EB",  // Blue
  success: "#10B981",    // Green
  error: "#EF4444",      // Red
  warning: "#F59E0B",    // Amber
}
```

### Supported Languages

In `app/problems/[id].js`:

```javascript
const LANGUAGES = ["javascript", "python", "java", "cpp", "c"];
```

## 🔐 Security Features

- JWT-based authentication
- Secure storage with Expo Secure Store
- HTTPS ready
- Automatic token refresh on 401
- Password never stored locally

## 📊 State Management

Using Zustand for global state:

```javascript
// Auth store
useAuthStore() -> { user, isAuthenticated, login, logout, etc }

// Problem store
useProblemStore() -> { problems, currentProblem, getProblems, etc }

// Submission store
useSubmissionStore() -> { submissions, getSubmissionStatus, etc }
```

## 🐛 Debugging

Enable React Native debugger:

```bash
npm start -- --localhost
```

View logs:

```bash
expo logs
```

## 📦 Building for Production

### Build APK (Android)

```bash
eas build --platform android
```

### Build IPA (iOS)

```bash
eas build --platform ios
```

First time setup:

```bash
eas build:configure
```

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/NewFeature`
2. Commit changes: `git commit -m 'Add NewFeature'`
3. Push to branch: `git push origin feature/NewFeature`
4. Open Pull Request

## 📝 Notes

- Images/assets can be added to `assets/` folder
- Modify class options in `Register` screen for your institution
- Customize colors in `tailwind.config.js`
- Update API URL in `.env` for different environments

## 🆘 Troubleshooting

### Connection Issues

- Check backend is running
- Verify API URL in `.env`
- Check network connectivity

### Authentication Issues

- Clear Secure Store: `expo-secure-store` will auto-clear on logout
- Check token expiration
- Verify JWT secret matches backend

### Build Issues

- Clear cache: `rm -rf node_modules && npm install`
- Clear Expo cache: `expo start -c`
- Check Node version: `node --version`

## 📄 License

This project is part of the Coding Platform system.

## 👥 Support

For issues and questions, contact the development team.

---

Happy Coding! 🚀
