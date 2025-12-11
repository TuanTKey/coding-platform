# CodeJudge Platform - AI Agent Instructions

## Overview
CodeJudge is a full-stack online coding platform with AI-powered code judging. It supports 3 clients (web, mobile, backend API) and uses MongoDB for persistence. The architecture separates concerns into controllers, services, models, and middleware layers.

## Project Structure

```
backend/           # Express.js API server (port 5000)
  ├── server.js                 # Entry point, route mounting
  ├── src/config/              # Database, CORS, auth config
  ├── src/controllers/          # Request handlers (auth, problems, submissions, contests)
  ├── src/models/              # Mongoose schemas (User, Problem, Submission, Contest, TestCase)
  ├── src/services/            # Business logic (aiJudgeService, judgeService)
  ├── src/routes/              # Express route definitions
  ├── src/middleware/          # Auth middleware (authenticate, isAdmin, isTeacher, isStudent)
  └── src/scripts/             # Database seeding and utilities

frontend/          # React 18 + Vite SPA (port 5173)
  ├── src/services/            # axios API client (api.js, auth.js)
  ├── src/components/          # React components
  ├── src/pages/               # Route pages (Login, Problems, ProblemSolve, Profile, etc.)
  ├── src/contexts/            # React Context (ThemeContext)
  └── src/App.jsx              # Main app router

mobile/            # React Native + Expo (BETA)
  ├── app/                     # Expo Router navigation
  ├── src/services/            # API layer (matches backend structure)
  ├── src/stores/              # Zustand state management
  └── src/components/          # Reusable React Native components
```

## Core Architecture Patterns

### 1. **Authentication & Authorization**
- JWT-based auth in `backend/src/middleware/auth.js`
- Roles: `admin`, `teacher`, `user` (student)
- All protected routes require `authenticate` middleware; role checks use `isAdmin`, `isTeacher`, `isStudent`
- Token stored in localStorage (frontend) and sent as `Authorization: Bearer <token>` header
- **Key files**: [authController.js](backend/src/controllers/authController.js), [auth.js](backend/src/middleware/auth.js), [auth.js](frontend/src/services/auth.js)

### 2. **Code Judging (Dual Engine)**
- **AI Judge (Gemini 2.0 Flash)**: Uses `USE_AI_JUDGE=true` env var; enabled by default if `GEMINI_API_KEY` is set
- **Traditional Judge**: Executes code with test cases; fallback if AI fails
- **Language support**: Python (hardcoded path), JavaScript (Node), C++ (g++), Java (javac)
- **Flow**: Submission → judgeService → (AI OR Traditional) → Submission record updated
- **Language config** in [judgeService.js](backend/src/services/judgeService.js#L13-L35) defines compile/run commands
- **Windows-specific**: C++ compiled to `.exe`, Python path hardcoded to Dell user's Python312 (⚠️ **needs generalization**)
- **Key files**: [aiJudgeService.js](backend/src/services/aiJudgeService.js), [judgeService.js](backend/src/services/judgeService.js), [submissionController.js](backend/src/controllers/submissionController.js)

### 3. **Data Models & Relationships**
- **User**: role-based access, studentId (auto-generated if not provided), class affiliation, rating system
- **Problem**: difficulty, description, testCases (embedded array of {input, expectedOutput})
- **Submission**: links user→problem, stores code, status, AI analysis, testCasesPassed
- **Contest**: time-window based (startTime, endTime), has registered users and problems
- **TestCase**: embedded in Problem model (no separate collection)
- All timestamps are MongoDB default (createdAt, updatedAt)
- **Key files**: [User.js](backend/src/models/User.js), [Problem.js](backend/src/models/Problem.js), [Submission.js](backend/src/models/Submission.js), [Contest.js](backend/src/models/Contest.js)

### 4. **API Response Pattern**
- **Success**: Direct object/array return (e.g., `res.json(submission)`)
- **Error**: `{ error: "message" }` with appropriate HTTP status
- **Auth errors**: 401 Unauthorized, 403 Forbidden
- **Validation errors**: 400 Bad Request
- **Frontend handles 401** by clearing token and redirecting to `/login` (see [api.js](frontend/src/services/api.js#L20-L25))

### 5. **Environment Configuration**
Required backend `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/coding-platform
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_key (optional, disables AI Judge if missing)
USE_AI_JUDGE=true (only works if GEMINI_API_KEY set)
NODE_ENV=development
RATE_LIMIT_WINDOW=15 (minutes)
RATE_LIMIT_MAX_REQUESTS=100
```
Frontend uses `VITE_API_URL` (defaults to `http://localhost:5000/api`)

## Critical Workflows

### Starting the Project
```bash
# Terminal 1: Backend
cd backend && npm install && npm run dev    # Runs on http://localhost:5000

# Terminal 2: Frontend
cd frontend && npm install && npm run dev   # Runs on http://localhost:5173 (Vite)

# Terminal 3: Database (if needed)
mongod   # Ensure MongoDB is running

# Or use the convenience script:
start.bat  # Windows: runs all three in parallel
```

### Seeding Data
```bash
cd backend && npm run seed   # Seeds problems, users, test cases
```
Check [seedData.js](backend/src/scripts/seedData.js) for what's created.

### Testing Code Submission Flow
1. User registers/logs in → JWT token returned
2. User submits code → submissionController.submitSolution
3. judgeService.judgeSubmission triggered (async, updates submission)
4. AI or Traditional judge evaluates code
5. Submission status + results persisted to MongoDB
6. Frontend polls GET `/api/submissions/:id` to fetch results

## Project-Specific Patterns

### Convention: Async Error Handling
Controllers wrap logic in try-catch; errors logged to console, response sent to client. **No centralized error handler** — each controller is responsible. Example pattern:
```javascript
try {
  // logic
  res.json(result);
} catch (error) {
  console.error('❌ Error:', error);
  res.status(500).json({ error: error.message });
}
```

### Convention: Middleware Composition
Routes use middleware stacking: `router.post(path, authenticate, isTeacher, handler)`. Middleware chains must be ordered (e.g., authenticate before role checks).

### Convention: Model Validation
Mongoose schemas define validation rules (required, min/max, enums, regex). Frontend **also validates before submission**. Database is the source of truth.

### Convention: AI Analysis in Submissions
When AI Judge runs, results stored in `submission.aiAnalysis` (string), `submission.suggestions` (array). Frontend displays these alongside test case results.

### Convention: Contest Time Windows
Contests have `startTime` and `endTime`. Submissions only accepted during window. Leaderboard computed from submissions within contest time.

## Integration Points & External Dependencies

| Service | Purpose | Config | Fallback |
|---------|---------|--------|----------|
| Google Gemini API | AI code judging | `GEMINI_API_KEY` env | Traditional judge |
| MongoDB | Data persistence | `MONGODB_URI` env | N/A (required) |
| Google Fonts/Icons | UI (lucide-react icons, Tailwind) | CDN | — |

## Common Tasks & Patterns

### Adding a New API Endpoint
1. Create/update controller in [src/controllers/](backend/src/controllers/)
2. Add route to [src/routes/](backend/src/routes/) with appropriate middleware
3. Mount route in [server.js](backend/src/server.js)
4. Create/update frontend service call in [frontend/src/services/](frontend/src/services/)
5. Update frontend component to call service

### Modifying Data Schema
1. Edit model in [backend/src/models/](backend/src/models/)
2. If adding required fields: create migration script in [backend/src/scripts/](backend/src/scripts/)
3. Restart backend; MongoDB auto-creates collection on first insert

### Fixing Platform-Specific Issues (C++/Java Execution)
- **C++ Windows**: Hardcoded g++ path (MinGW); adjust compile cmd if MinGW location differs
- **Python Windows**: Path hardcoded in [judgeService.js](backend/src/services/judgeService.js#L10) — generalize with `where python` or use process.env.PYTHON_PATH
- **Test locally** with [backend/src/scripts/testLeaderboard.js](backend/src/scripts/testLeaderboard.js) or [createTestSubmission.js](backend/src/scripts/createTestSubmission.js)

### Debugging Submissions
Use [findSubmissionWithUser.js](backend/src/scripts/findSubmissionWithUser.js) to inspect submission details. Check `submission.aiAnalysis` and `submission.errorMessage` fields.

## Known Limitations & TODOs
- ⚠️ Hardcoded Python path (Windows-specific) — needs env variable or cross-platform detection
- ⚠️ No centralized error handling — each controller independently manages errors
- ⚠️ No unit/integration tests — validation is manual or script-based
- ⚠️ Mobile app (Expo) is BETA — API layer mirrors backend but some features incomplete
- ⚠️ Rate limiting not per-user, per-IP only — contests could see throttling during rush

## File Reference for Common Tasks
- **User/Auth issues**: [User.js](backend/src/models/User.js), [authController.js](backend/src/controllers/authController.js)
- **Problem/Submission issues**: [Problem.js](backend/src/models/Problem.js), [Submission.js](backend/src/models/Submission.js), [submissionController.js](backend/src/controllers/submissionController.js)
- **AI Judge issues**: [aiJudgeService.js](backend/src/services/aiJudgeService.js)
- **Contest issues**: [Contest.js](backend/src/models/Contest.js), [contestController.js](backend/src/controllers/contestController.js)
- **Frontend state/API**: [frontend/src/services/api.js](frontend/src/services/api.js), [frontend/src/pages/ProblemSolve.jsx](frontend/src/pages/ProblemSolve.jsx)
