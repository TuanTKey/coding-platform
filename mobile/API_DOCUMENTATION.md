# Mobile App API Documentation

## Base URL

Development:

```
http://10.0.2.2:5000/api       # Android Emulator
http://localhost:5000/api       # iOS Simulator
http://<YOUR_IP>:5000/api      # Physical Device
```

Production:

```
https://your-production-url/api
```

## Authentication

All authenticated requests require:

```
Authorization: Bearer <token>
Content-Type: application/json
```

## API Endpoints

### Authentication

#### Register

```
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123",
  "fullName": "John Doe",
  "class": "10A1"
}

Response:
{
  "message": "User created successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "user",
    "studentId": "STU001"
  }
}
```

#### Login

```
POST /auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepass123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "user"
  }
}
```

### Problems

#### Get All Problems

```
GET /problems?difficulty=easy&search=array&page=1&limit=20

Response:
{
  "problems": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Two Sum",
      "slug": "two-sum",
      "description": "Given an array of integers...",
      "difficulty": "easy",
      "timeLimit": 2000,
      "memoryLimit": 256,
      "submissionCount": 1250,
      "acceptedCount": 950,
      "tags": ["array", "hash-table"],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 100
}
```

#### Get Problem by ID

```
GET /problems/:id

Response:
{
  "problem": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Two Sum",
    "description": "Given an array of integers nums and an integer target...",
    "difficulty": "easy",
    "inputFormat": "First line contains n, then n integers",
    "outputFormat": "Two indices that sum to target",
    "constraints": "1 <= nums.length <= 10^4",
    "tags": ["array", "hash-table"]
  },
  "sampleTestCases": [
    {
      "_id": "507f...",
      "input": "2\n2 7 11 15\n9",
      "expectedOutput": "0 1"
    }
  ]
}
```

#### Get Problem by Slug

```
GET /problems/slug/:slug

Response: Same as Get Problem by ID
```

### Submissions

#### Submit Solution

```
POST /submissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "problemId": "507f1f77bcf86cd799439011",
  "code": "function twoSum(nums, target) { ... }",
  "language": "javascript",
  "contestId": "507f1f77bcf86cd799439012" (optional)
}

Response:
{
  "message": "Submission received",
  "submissionId": "507f1f77bcf86cd799439013",
  "status": "pending",
  "testCasesResult": []
}
```

#### Get Submission Status

```
GET /submissions/:submissionId
Authorization: Bearer <token>

Response:
{
  "submission": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "problemId": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Two Sum",
      "slug": "two-sum"
    },
    "language": "javascript",
    "code": "function twoSum(nums, target) { ... }",
    "status": "accepted",
    "executionTime": 1250,
    "memory": 45,
    "testCasesPassed": 50,
    "totalTestCases": 50,
    "testCasesResult": [
      {
        "input": "2\n2 7 11 15\n9",
        "expected": "0 1",
        "output": "0 1",
        "status": "passed",
        "time": 25,
        "error": null
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Get User Submissions

```
GET /submissions?page=1&limit=20&problemId=...&status=accepted
Authorization: Bearer <token>

Response:
{
  "submissions": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "problemId": {
        "_id": "507f...",
        "title": "Two Sum"
      },
      "language": "javascript",
      "status": "accepted",
      "testCasesPassed": 50,
      "totalTestCases": 50,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "totalPages": 3,
  "currentPage": 1,
  "total": 50
}
```

### Contests

#### Get All Contests

```
GET /contests?page=1&limit=20

Response:
{
  "contests": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "title": "Weekly Contest 150",
      "description": "This week's programming contest",
      "startTime": "2024-01-20T10:00:00Z",
      "endTime": "2024-01-20T12:00:00Z",
      "duration": 120,
      "problems": ["507f...", "507f..."],
      "participants": ["507f...", "507f..."],
      "isPublic": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "totalPages": 2,
  "currentPage": 1,
  "total": 25
}
```

#### Get Contest by ID

```
GET /contests/:contestId

Response:
{
  "contest": {
    "_id": "507f1f77bcf86cd799439014",
    "title": "Weekly Contest 150",
    "description": "Programming contest",
    "startTime": "2024-01-20T10:00:00Z",
    "endTime": "2024-01-20T12:00:00Z",
    "duration": 120,
    "problems": [
      {
        "_id": "507f...",
        "title": "Problem 1",
        "difficulty": "easy"
      }
    ],
    "rules": "Standard ACM rules apply",
    "createdBy": {
      "_id": "507f...",
      "username": "admin"
    }
  }
}
```

#### Join Contest

```
POST /contests/:contestId/join
Authorization: Bearer <token>

Response:
{
  "message": "Successfully joined contest",
  "contest": { ... }
}
```

#### Get Contest Leaderboard

```
GET /contests/:contestId/leaderboard

Response:
{
  "leaderboard": [
    {
      "rank": 1,
      "user": {
        "_id": "507f...",
        "username": "john_doe",
        "fullName": "John Doe"
      },
      "solvedProblems": 4,
      "totalTime": 245,
      "penalties": 0
    }
  ]
}
```

### Users

#### Get Current User

```
GET /users/me
Authorization: Bearer <token>

Response:
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "user",
    "studentId": "STU001",
    "class": "10A1",
    "solvedProblems": 25,
    "rating": 1450
  }
}
```

#### Get User Profile

```
GET /users/:userId
Authorization: Bearer <token>

Response:
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "fullName": "John Doe",
    "solvedProblems": 25,
    "rating": 1450,
    "studentId": "STU001"
  },
  "statistics": {
    "totalSubmissions": 150,
    "acceptedSubmissions": 50,
    "solvedProblems": 25,
    "difficultyBreakdown": {
      "easy": 15,
      "medium": 8,
      "hard": 2
    },
    "acceptanceRate": "33.33"
  },
  "recentSubmissions": [
    {
      "_id": "507f...",
      "problemId": { "_id": "507f...", "title": "Two Sum" },
      "status": "accepted",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Update User Profile

```
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Doe Updated",
  "bio": "Competitive programmer",
  "avatar": "https://example.com/avatar.jpg"
}

Response:
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "fullName": "John Doe Updated",
    "bio": "Competitive programmer",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

#### Get Leaderboard

```
GET /users/leaderboard?page=1&limit=20&sortBy=rating

Response:
{
  "users": [
    {
      "rank": 1,
      "user": {
        "_id": "507f...",
        "username": "top_programmer",
        "fullName": "Top Programmer"
      },
      "solvedProblems": 250,
      "rating": 2500
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 100
}
```

## Error Handling

All errors return appropriate HTTP status codes:

```
400 - Bad Request (invalid data)
401 - Unauthorized (missing/invalid token)
403 - Forbidden (no permission)
404 - Not Found
500 - Server Error
```

Error Response Format:

```json
{
  "error": "Error message",
  "details": "Additional details (if available)"
}
```

## Rate Limiting

- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Header**: `X-RateLimit-Remaining`

## Token Expiration

- **Expiry**: 7 days
- **On Expiry**: 401 response triggers re-login
- **Refresh**: Login again to get new token

## Supported Languages

When submitting code, use:

- `javascript`
- `python`
- `java`
- `cpp`
- `c`

## Difficulty Levels

- `easy`
- `medium`
- `hard`

## Submission Statuses

- `pending` - Waiting to be judged
- `judging` - Currently being judged
- `accepted` - All test cases passed
- `wrong_answer` - Output doesn't match
- `time_limit` - Exceeded time limit
- `memory_limit` - Exceeded memory limit
- `runtime_error` - Code crashed
- `compile_error` - Compilation failed

---

For more details, contact the backend team or check the backend documentation.
