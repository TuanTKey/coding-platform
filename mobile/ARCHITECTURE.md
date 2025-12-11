# 🏗️ Architecture & Technical Design

## Overview

CodeJudge Mobile follows a layered architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│           Presentation Layer (Screens)              │
│   LoginScreen, ProblemsScreen, ContestScreen, etc.  │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│      State Management Layer (Redux Toolkit)         │
│  Auth, Problems, Submissions, Contests, Users       │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│    Service Layer (API Integration)                  │
│  authService, problemService, submissionService    │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│       Network Layer (Axios + Interceptors)          │
│         JWT Token Management & Error Handling       │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│    Backend API (Node.js/Express/MongoDB)            │
│         http://localhost:5000/api                   │
└─────────────────────────────────────────────────────┘
```

---

## 1. Presentation Layer

### Components

**Screens** (Full-page components)
- `LoginScreen` - Authentication
- `RegisterScreen` - Account creation
- `SplashScreen` - Initial loading
- `ProblemsScreen` - List problems
- `ProblemDetailScreen` - Problem details + editor
- `ContestsScreen` - List contests
- `ContestDetailScreen` - Contest details
- `ProfileScreen` - User profile
- `MySubmissionsScreen` - Submission history
- `SubmissionDetailScreen` - Submission results
- `LeaderboardScreen` - Global rankings

**Reusable Components**
- `Button` - Styled button component
- `Input` - Form input field
- `LoadingSpinner` - Loading indicator
- `ProblemCard` - Problem list item
- `SubmissionCard` - Submission list item
- `ContestCard` - Contest list item
- `LanguageSelector` - Code language picker
- `TestCaseViewer` - Test case display
- `Alerts` - Error/Success messages
- `Container` - Layout wrapper

### Component Patterns

```javascript
// Functional component with Redux
import { useDispatch, useSelector } from 'react-redux';

export const MyScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.domain);
  
  useEffect(() => {
    dispatch(fetchData());
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Content */}
    </SafeAreaView>
  );
};
```

---

## 2. State Management Layer (Redux Toolkit)

### Redux Slices

Each slice manages a domain:

**authSlice** - Authentication state
```javascript
{
  user: { id, username, email, role },
  token: "jwt_token",
  loading: boolean,
  error: string,
  isAuthenticated: boolean
}
```

**problemSlice** - Problems state
```javascript
{
  problems: [],
  currentProblem: {},
  sampleTestCases: [],
  loading: boolean,
  error: string,
  totalPages: number,
  currentPage: number,
  total: number
}
```

**submissionSlice** - Submissions state
```javascript
{
  submissions: [],
  currentSubmission: {},
  loading: boolean,
  submitting: boolean,
  error: string
}
```

**contestSlice** - Contests state
```javascript
{
  contests: [],
  currentContest: {},
  leaderboard: [],
  loading: boolean,
  error: string
}
```

**userSlice** - User profile state
```javascript
{
  currentUser: {},
  leaderboard: [],
  userStats: {},
  loading: boolean,
  error: string
}
```

### Async Thunks Pattern

```javascript
// Create async thunk
export const fetchProblems = createAsyncThunk(
  'problems/fetchProblems',
  async ({ page, limit, filters }, { rejectWithValue }) => {
    try {
      const response = await problemService.getAllProblems(page, limit, filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Handle in extraReducers
extraReducers: (builder) => {
  builder
    .addCase(fetchProblems.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchProblems.fulfilled, (state, action) => {
      state.loading = false;
      state.problems = action.payload.problems;
    })
    .addCase(fetchProblems.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
}
```

---

## 3. Service Layer (API Integration)

### Service Architecture

Each domain has a service file:

```javascript
// src/services/problemService.js
export const problemService = {
  async getAllProblems(page, limit, filters) { },
  async getProblemById(id) { },
  async getProblemBySlug(slug) { },
  async searchProblems(query) { },
  async getProblemsByDifficulty(difficulty) { }
};
```

### Service Usage Flow

```
Component → Redux Thunk → Service → API Client → Backend
                ↑                        ↓
                └────── Update State ───┘
```

Example:
```javascript
// Component
const handleSubmit = async () => {
  dispatch(submitSolution({
    problemId,
    code,
    language
  }));
};

// Redux Thunk
export const submitSolution = createAsyncThunk(
  'submissions/submitSolution',
  async ({ problemId, code, language }) => {
    return submissionService.submitSolution(problemId, code, language);
  }
);

// Service
async submitSolution(problemId, code, language) {
  const response = await apiClient.post('/submissions', {
    problemId, code, language
  });
  return response.data;
}

// API Client (Axios instance)
apiClient.interceptors.request.use(config => {
  // Add JWT token
  return config;
});
```

---

## 4. Network Layer (Axios)

### API Client Setup

```javascript
// src/services/apiClient.js
const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});
```

### Request Interceptor

```javascript
apiClient.interceptors.request.use(
  async (config) => {
    // Add JWT token from secure storage
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### Response Interceptor

```javascript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('authToken');
      // App will auto-navigate to login
    }
    
    // Consistent error messages
    const errorMessage = 
      error.response?.data?.error || 
      error.message || 
      'An error occurred';
    
    return Promise.reject({
      ...error,
      message: errorMessage,
      status: error.response?.status
    });
  }
);
```

---

## 5. Navigation Architecture

### Navigation Tree

```
RootNavigator
├─ isAuthenticated: false
│  └─ AuthNavigator
│     ├─ SplashScreen (loading)
│     ├─ LoginScreen
│     └─ RegisterScreen
│
└─ isAuthenticated: true
   └─ AppNavigator (Bottom Tabs)
      ├─ ProblemsStack
      │  ├─ ProblemsScreen
      │  ├─ ProblemDetailScreen
      │  └─ SubmissionDetailScreen
      │
      ├─ ContestsStack
      │  ├─ ContestsScreen
      │  └─ ContestDetailScreen
      │
      ├─ LeaderboardStack
      │  └─ LeaderboardScreen
      │
      └─ ProfileStack
         ├─ ProfileScreen
         ├─ MySubmissionsScreen
         └─ SubmissionDetailScreen
```

### Navigation Implementation

```javascript
// src/navigation/RootNavigator.js
export const RootNavigator = () => {
  const { isAuthenticated } = useSelector(state => state.auth);
  
  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
```

### Screen Navigation

```javascript
// Navigate to screen with params
navigation.navigate('ProblemDetail', {
  problemId: problem._id,
  slug: problem.slug
});

// Access params
export const ProblemDetailScreen = ({ route }) => {
  const { problemId, slug } = route.params;
};
```

---

## 6. Data Flow Examples

### Example 1: Login Flow

```
User Input (username, password)
        ↓
LoginScreen validates input
        ↓
Dispatch loginUser() thunk
        ↓
loginUser thunk calls authService.login()
        ↓
authService calls apiClient.post('/auth/login')
        ↓
Request Interceptor adds JWT token
        ↓
Backend processes request
        ↓
Response received with token
        ↓
Response Interceptor extracts token
        ↓
authService stores token in SecureStore
        ↓
Redux state updated: isAuthenticated = true
        ↓
RootNavigator detects auth change
        ↓
Navigate to AppNavigator (main app)
```

### Example 2: Submit Code Flow

```
User writes code + selects language
        ↓
ProblemDetailScreen validates code
        ↓
Dispatch submitSolution() thunk
        ↓
submissionService.submitSolution() called
        ↓
apiClient.post('/submissions', { problemId, code, language })
        ↓
Request Interceptor adds token
        ↓
Backend receives submission
        ↓
Backend starts judging (async)
        ↓
Response returns submissionId
        ↓
Redux state updated with submissionId
        ↓
Navigate to SubmissionDetailScreen
        ↓
SubmissionDetailScreen polls getSubmissionStatus() every 2s
        ↓
Status updates: pending → judging → accepted/failed
        ↓
Display results and AI feedback
```

---

## 7. State Management Patterns

### Using Redux in Components

```javascript
// Dispatch action
const handleLogin = async () => {
  try {
    await dispatch(loginUser({
      username,
      password
    })).unwrap();
  } catch (error) {
    // Handle error
  }
};

// Subscribe to state
const { user, loading, error } = useSelector(state => state.auth);
```

### Creating New Features

1. **Create Service** (`src/services/`)
2. **Create Slice** (`src/store/slices/`)
3. **Create Screen** (`src/screens/`)
4. **Add Navigation** (`src/navigation/`)
5. **Use in Component**

---

## 8. Error Handling

### Consistent Error Flow

```
Backend Error
    ↓
Axios Response Interceptor catches error
    ↓
Error normalized with message
    ↓
Redux thunk catches and rejects
    ↓
State.error updated
    ↓
Component displays ErrorAlert
    ↓
User sees error message
```

### Types of Errors

```javascript
// Network error
No internet connection → "Network error"

// Server error (5xx)
Backend crashes → "Server error"

// Validation error (400)
Invalid input → "Invalid email address"

// Authentication error (401)
Token expired → Auto logout

// Not found (404)
Resource deleted → "Problem not found"
```

---

## 9. Performance Optimization

### Code Splitting
- Lazy load screens via React Navigation
- Only load Redux slice data when needed

### Memoization
- Use React.memo() for expensive components
- useSelector() only subscribes to needed state

### Network
- Pagination for lists
- Request caching with Axios
- Debounce search input

### Local State vs Redux
- Redux: Global state (auth, user preferences)
- useState: Component state (form input, UI visibility)

---

## 10. Security

### Token Storage
```javascript
// Store in Expo Secure Store (encrypted)
await SecureStore.setItemAsync('authToken', token);

// Retrieve securely
const token = await SecureStore.getItemAsync('authToken');

// Not in localStorage or AsyncStorage
```

### API Security
```javascript
// JWT sent in Authorization header
config.headers.Authorization = `Bearer ${token}`;

// Never store sensitive data in state
// Clear on logout
SecureStore.deleteItemAsync('authToken');
```

---

## 11. Testing Strategy

### Unit Tests
```javascript
// Test Redux slices
describe('authSlice', () => {
  test('should handle login success', () => { });
});

// Test services
describe('problemService', () => {
  test('should fetch problems', () => { });
});
```

### Integration Tests
```javascript
// Test Redux + Component
describe('LoginScreen', () => {
  test('should login user and navigate to app', () => { });
});
```

### E2E Tests
```javascript
// Test full user flows
describe('User Journey', () => {
  test('user can register, solve problem, submit code', () => { });
});
```

---

## Summary

**Architecture Benefits:**
- ✅ Clear separation of concerns
- ✅ Easy to test
- ✅ Scalable
- ✅ Maintainable
- ✅ Type-safe (with TypeScript)
- ✅ Redux DevTools for debugging

**Data Flow:**
- Component → Redux → Service → API → Backend
- Response: Backend → API → Service → Redux → Component

**State Levels:**
- Global: Redux (auth, user, data)
- Component: useState (form, UI)
- Navigation: React Navigation (routing)

---

This architecture ensures the app is scalable, maintainable, and easy to extend with new features.
