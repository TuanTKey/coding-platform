# 📚 CodeJudge Mobile App - Complete Documentation

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Architecture](#architecture)
6. [API Integration](#api-integration)
7. [State Management](#state-management)
8. [Navigation](#navigation)
9. [Key Features](#key-features)
10. [Development Guidelines](#development-guidelines)

---

## Overview

CodeJudge Mobile is a React Native mobile application that provides a complete coding practice and competition platform. It connects to the same backend API as the web version, allowing users to:

- Solve programming problems
- Submit code solutions
- Participate in contests
- Track their progress on a leaderboard
- Manage their profile

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | React Native (0.73) |
| **Expo** | v50.0 (for easier development) |
| **Navigation** | React Navigation v6 (Stack + Bottom Tabs) |
| **State Management** | Redux Toolkit |
| **HTTP Client** | Axios with Interceptors |
| **Form Handling** | React Hook Form |
| **Date Handling** | date-fns |
| **Storage** | Expo Secure Store (for auth tokens) |
| **Language** | JavaScript |

---

## Project Structure

```
mobile/
├── App.js                           # Main entry point
├── app.json                         # Expo configuration
├── package.json                     # Dependencies
├── babel.config.js                  # Babel configuration
├── .env.example                     # Environment variables template
│
└── src/
    ├── screens/                     # Screen components (9 screens)
    │   ├── LoginScreen.js
    │   ├── RegisterScreen.js
    │   ├── SplashScreen.js
    │   ├── ProblemsScreen.js
    │   ├── ProblemDetailScreen.js
    │   ├── ContestsScreen.js
    │   ├── ContestDetailScreen.js
    │   ├── ProfileScreen.js
    │   ├── MySubmissionsScreen.js
    │   ├── SubmissionDetailScreen.js
    │   └── LeaderboardScreen.js
    │
    ├── components/                  # Reusable UI components
    │   ├── LoadingSpinner.js
    │   ├── Button.js
    │   ├── Input.js
    │   ├── ProblemCard.js
    │   ├── SubmissionCard.js
    │   ├── ContestCard.js
    │   ├── LanguageSelector.js
    │   ├── TestCaseViewer.js
    │   ├── Alerts.js
    │   ├── Container.js
    │   └── SectionHeader.js
    │
    ├── services/                    # API service layer
    │   ├── apiClient.js             # Axios instance with interceptors
    │   ├── authService.js
    │   ├── problemService.js
    │   ├── submissionService.js
    │   ├── contestService.js
    │   └── userService.js
    │
    ├── store/                       # Redux store
    │   ├── store.js                 # Store configuration
    │   └── slices/
    │       ├── authSlice.js
    │       ├── problemSlice.js
    │       ├── submissionSlice.js
    │       ├── contestSlice.js
    │       └── userSlice.js
    │
    ├── navigation/                  # Navigation configuration
    │   ├── RootNavigator.js         # Main navigation dispatcher
    │   ├── AuthNavigator.js         # Auth flow (Login, Register)
    │   └── AppNavigator.js          # App flow (Bottom tabs)
    │
    ├── hooks/                       # Custom React hooks
    │   └── useAsync.js
    │
    └── utils/                       # Utility functions
        ├── constants.js             # App constants
        ├── dateUtils.js             # Date formatting
        └── validation.js            # Form validation
```

---

## Getting Started

### Quick Start

```bash
# 1. Navigate to mobile directory
cd mobile

# 2. Install dependencies
npm install

# 3. Create .env.local file
cp .env.example .env.local

# 4. Update API URL in .env.local
# EXPO_PUBLIC_API_URL=http://localhost:5000/api

# 5. Start development server
npm start

# 6. Choose platform:
# - Press 'a' for Android
# - Press 'i' for iOS
# - Press 'w' for Web
```

### Prerequisites

- Node.js v16+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Android SDK (for Android) or Xcode (for iOS)

---

## Architecture

### 1. **API Service Layer** (`src/services/`)

All HTTP requests go through the API service layer:

```javascript
// Example: Fetching problems
import { problemService } from '@services/problemService';

const data = await problemService.getAllProblems(page, limit, filters);
```

**Key Features:**
- ✅ Centralized axios instance with interceptors
- ✅ JWT token management
- ✅ Automatic token refresh on 401
- ✅ Secure token storage with Expo Secure Store
- ✅ Consistent error handling

### 2. **Redux State Management** (`src/store/`)

Redux Toolkit manages global state:

```javascript
// Each slice handles a domain (auth, problems, submissions, etc.)
- authSlice: Login, Register, User session
- problemSlice: Problems list, Problem details
- submissionSlice: Submissions, Code execution
- contestSlice: Contests, Leaderboard
- userSlice: User profile, Statistics
```

**Example: Dispatching an action**
```javascript
import { loginUser } from '@store/slices/authSlice';

const result = await dispatch(loginUser({
  username: 'john',
  password: 'pass123'
})).unwrap();
```

### 3. **Navigation** (`src/navigation/`)

Two-tier navigation:

**Auth Navigation** (When not logged in)
```
SplashScreen (checks if user is logged in)
├── LoginScreen
└── RegisterScreen
```

**App Navigation** (When logged in)
```
BottomTabNavigator
├── Problems Stack
│   ├── ProblemsScreen (list)
│   ├── ProblemDetailScreen
│   └── SubmissionDetailScreen
├── Contests Stack
│   ├── ContestsScreen
│   └── ContestDetailScreen
├── Leaderboard Stack
│   └── LeaderboardScreen
└── Profile Stack
    ├── ProfileScreen
    ├── MySubmissionsScreen
    └── SubmissionDetailScreen
```

### 4. **Components** (`src/components/`)

Reusable UI components with consistent styling:

- **Layout**: `Container`, `SectionHeader`
- **Forms**: `Input`, `Button`, `LanguageSelector`
- **Lists**: `ProblemCard`, `SubmissionCard`, `ContestCard`
- **Display**: `LoadingSpinner`, `TestCaseViewer`, `Alerts`

---

## API Integration

### Axios Interceptors

```javascript
// Request Interceptor: Adds JWT token
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handles 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token and logout
      await SecureStore.deleteItemAsync('authToken');
    }
    return Promise.reject(error);
  }
);
```

### Service Pattern

Each domain has its own service file:

```javascript
// problemService.js
export const problemService = {
  async getAllProblems(page, limit, filters) { },
  async getProblemById(id) { },
  async getProblemBySlug(slug) { },
  // ...
};
```

### API Endpoints

| Method | Endpoint | Service |
|--------|----------|---------|
| POST | `/auth/login` | authService.login() |
| POST | `/auth/register` | authService.register() |
| GET | `/problems` | problemService.getAllProblems() |
| GET | `/problems/:id` | problemService.getProblemById() |
| POST | `/submissions` | submissionService.submitSolution() |
| GET | `/submissions/:id` | submissionService.getSubmissionStatus() |
| GET | `/contests` | contestService.getAllContests() |
| GET | `/users/leaderboard` | userService.getLeaderboard() |

---

## State Management

### Redux Slices

Each slice follows Redux Toolkit pattern:

```javascript
// Example: authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      return await authService.login(username, password);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});
```

### Using Redux in Components

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '@store/slices/authSlice';

export const LoginScreen = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = async () => {
    try {
      await dispatch(loginUser({
        username: 'john',
        password: 'pass123'
      })).unwrap();
    } catch (err) {
      console.error('Login failed:', err);
    }
  };
};
```

---

## Navigation

### RootNavigator

The main navigator that switches between Auth and App navigation based on authentication state:

```javascript
export const RootNavigator = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
```

### Screen Params

Navigate with params:

```javascript
// Navigate to ProblemDetail
navigation.navigate('ProblemDetail', {
  problemId: problem._id,
  slug: problem.slug
});

// Access params in screen
const { problemId } = route.params;
```

---

## Key Features

### 1. Authentication

- Register new account with class selection
- Login with username/password
- Secure token storage
- Auto logout on token expiration

**Files**: `LoginScreen.js`, `RegisterScreen.js`, `authService.js`

### 2. Problem Solving

- Browse problems with filters
- View problem details and sample test cases
- Submit code in multiple languages (Python, JavaScript, C++, Java)
- View submission results and AI analysis

**Files**: `ProblemsScreen.js`, `ProblemDetailScreen.js`, `SubmissionDetailScreen.js`

### 3. Code Execution

- Support for 4 programming languages
- Real-time test case results
- Error messages and explanations
- AI-powered code analysis

**Files**: `submissionService.js`, `TestCaseViewer.js`

### 4. Contests

- Browse upcoming, running, and past contests
- Join contests and solve contest problems
- View contest leaderboard
- Track your performance

**Files**: `ContestsScreen.js`, `ContestDetailScreen.js`

### 5. Leaderboard

- Global ranking system
- Filter by rating or solved problems
- Pagination support

**Files**: `LeaderboardScreen.js`

### 6. User Profile

- View profile information
- Track statistics (problems solved, submissions, rating)
- View submission history
- Edit profile settings

**Files**: `ProfileScreen.js`, `MySubmissionsScreen.js`

---

## Development Guidelines

### Code Style

- Use functional components with hooks
- Keep components small and focused
- Use Redux for global state
- Use local state (useState) for UI state

### Naming Conventions

```javascript
// Screens: PascalCase + "Screen" suffix
export const LoginScreen = () => { }

// Components: PascalCase
export const ProblemCard = () => { }

// Services: camelCase + "Service" suffix
export const problemService = { }

// Functions: camelCase
const fetchProblems = async () => { }

// Constants: UPPER_SNAKE_CASE
const LANGUAGES = ['python', 'javascript'];
```

### Error Handling

```javascript
try {
  const result = await dispatch(action).unwrap();
} catch (error) {
  // Handle error
  console.error('Error:', error);
}
```

### Form Validation

```javascript
import { validateEmail, validatePassword } from '@utils/validation';

const errors = {};
if (!validateEmail(email)) errors.email = 'Invalid email';
if (!validatePassword(password)) errors.password = 'Min 6 chars';

if (Object.keys(errors).length > 0) {
  setValidationErrors(errors);
  return;
}
```

### Styling

- Use React Native StyleSheet for performance
- Use consistent color scheme (#0891b2 for primary)
- Responsive design with flexible layouts
- Dark mode support (future)

### Adding New Features

1. **Create API service** (`src/services/`)
2. **Create Redux slice** (`src/store/slices/`)
3. **Create screen component** (`src/screens/`)
4. **Add navigation** (`src/navigation/`)
5. **Add reusable components** (`src/components/`)

---

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
lsof -ti:8081 | xargs kill -9
```

**Cache issues:**
```bash
npm start -- --reset-cache
```

**Cannot connect to backend:**
- Check backend is running on port 5000
- Update API URL in `.env.local`
- Use computer IP instead of localhost for device

**Redux DevTools:**
```bash
# Install Redux DevTools extension for debugging
npm install redux-devtools
```

---

## Performance Optimization

- ✅ Lazy loading of screens
- ✅ Pagination for lists
- ✅ Memoized components with React.memo
- ✅ Efficient Redux selectors
- ✅ Image optimization
- ✅ Network request caching

---

## Future Enhancements

- [ ] Offline mode support
- [ ] Dark theme support
- [ ] Push notifications
- [ ] Direct messaging between users
- [ ] Video tutorials
- [ ] Code syntax highlighting in editor
- [ ] Real-time collaboration

---

## Support

For issues or questions:
1. Check the [SETUP.md](./SETUP.md) guide
2. Review code comments
3. Check Redux state in Redux DevTools
4. Check network requests in Expo debugger

---

**Happy Coding! 🚀**
