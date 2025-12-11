# 🎨 Mobile App - Visual Setup & Usage Guide

## 🚀 QUICK START (Copy & Paste)

### Step 1: Navigate to Mobile

```bash
cd d:\Code-Training\coding-platform\mobile
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create .env File

```bash
# Windows
echo EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api > .env

# Or manually create .env file with:
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
```

### Step 4: Start Development Server

```bash
npm start
```

### Step 5: Choose Your Platform

```
Press 'a' for Android Emulator
Press 'i' for iOS Simulator
Press 'w' for Web Browser
Or scan QR code with Expo Go app on your phone
```

---

## 📱 APP WALKTHROUGH

### 1️⃣ **Authentication Flow**

```
┌─────────────────────────────────────┐
│      Open App (First Time)          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│    Redirect to Login Screen         │
│  app/auth/login.js                  │
│                                     │
│  📧 Username/Email field            │
│  🔐 Password field                  │
│  🔘 Login Button                    │
│                                     │
│  "Don't have account?" → Register   │
└────────────┬────────────────────────┘
             │
             ▼ (Success)
┌─────────────────────────────────────┐
│  Redirect to Main Tabs Screen       │
│  app/(tabs)/_layout.js              │
└─────────────────────────────────────┘
```

**Files Involved:**

- `app/auth/login.js` - Login UI
- `services/auth.js` - API call
- `stores/authStore.js` - State management
- `services/api.js` - Token storage

### 2️⃣ **Browse & Solve Problems**

```
┌──────────────────────────────────────┐
│    Problems Tab                      │
│  app/(tabs)/problems.js              │
│                                      │
│  🔍 Search Bar (filter by text)     │
│  🎯 Difficulty Filter (Easy/Med/Hard)│
│  📋 Problem List (scrollable)       │
│    • Title                           │
│    • Submissions count              │
│    • Difficulty badge               │
└────────────┬─────────────────────────┘
             │
             ▼ (Click Problem)
┌──────────────────────────────────────┐
│  Problem Detail Screen               │
│  app/problems/[id].js                │
│                                      │
│  📖 Problem Description              │
│  📋 Constraints                      │
│  💻 Code Editor                      │
│    • Language selector               │
│    • Code input area                 │
│  🚀 Submit button                   │
└────────────┬─────────────────────────┘
             │
             ▼ (Submit Code)
┌──────────────────────────────────────┐
│  Submission Processing               │
│  Status: "Pending" → "Judging"      │
│  services/submission.js              │
│                                      │
│  Wait for backend to judge...        │
└────────────┬─────────────────────────┘
             │
             ▼ (Done)
┌──────────────────────────────────────┐
│  View Submission Result              │
│  app/submissions/[id].js             │
│                                      │
│  ✅ Accepted / ❌ Wrong Answer       │
│  📊 Test Cases Passed: 50/50         │
│  ⏱️ Execution Time: 1250ms           │
│  💾 Memory Used: 45MB                │
└──────────────────────────────────────┘
```

**Files Involved:**

- `app/(tabs)/problems.js` - Problem list
- `services/problem.js` - Fetch problems
- `app/problems/[id].js` - Problem detail & editor
- `services/submission.js` - Submit code
- `app/submissions/[id].js` - View results
- `stores/problemStore.js` - Problem state
- `stores/submissionStore.js` - Submission state

### 3️⃣ **Track Submissions**

```
┌──────────────────────────────────────┐
│  Submissions Tab                     │
│  app/(tabs)/submissions.js           │
│                                      │
│  📋 Your Submissions List            │
│  • Problem Title                     │
│  • Language                          │
│  • Status (Accepted/Wrong/etc)      │
│  • Test Cases Passed                 │
│  • Submitted Date/Time               │
└────────────┬─────────────────────────┘
             │
             ▼ (Click Submission)
┌──────────────────────────────────────┐
│  Submission Detail                   │
│  app/submissions/[id].js             │
│                                      │
│  Status Badge                        │
│  Code (read-only)                   │
│  Test Results                        │
│  Error Messages (if any)            │
└──────────────────────────────────────┘
```

**Files Involved:**

- `app/(tabs)/submissions.js` - List submissions
- `services/submission.js` - Fetch submissions
- `app/submissions/[id].js` - Show details
- `utils/helpers.js` - Format status & date

### 4️⃣ **Join Contests**

```
┌──────────────────────────────────────┐
│  Contests Tab                        │
│  app/(tabs)/contests.js              │
│                                      │
│  🏆 Contest List                     │
│  • Title                             │
│  • Status (Upcoming/Ongoing/Ended)  │
│  • Number of Problems                │
│  • Duration                          │
└────────────┬─────────────────────────┘
             │
             ▼ (Click Contest)
┌──────────────────────────────────────┐
│  Contest Detail                      │
│  app/contests/[id].js                │
│                                      │
│  📝 Title & Description              │
│  📅 Start & End Time                 │
│  ⏱️ Duration                          │
│  📊 Problems Count                   │
│  📖 Rules                            │
│  🔘 Join Button (if available)       │
└──────────────────────────────────────┘
```

**Files Involved:**

- `app/(tabs)/contests.js` - Contest list
- `services/contest.js` - Fetch contests
- `app/contests/[id].js` - Contest details
- `stores/submissionStore.js` - Track results

### 5️⃣ **View Profile & Statistics**

```
┌──────────────────────────────────────┐
│  Profile Tab                         │
│  app/(tabs)/profile.js               │
│                                      │
│  👤 User Avatar & Name               │
│  📊 Statistics                       │
│    • Problems Solved: 25             │
│    • Total Submissions: 150          │
│    • Acceptance Rate: 33%            │
│  📧 Email                            │
│  🎓 Student ID                       │
│  🔌 Edit Profile Button              │
│  🚪 Logout Button                    │
└────────────┬─────────────────────────┘
             │
             ▼ (Edit Profile)
┌──────────────────────────────────────┐
│  Edit Profile Screen                 │
│  app/profile/edit.js                 │
│                                      │
│  👤 Full Name (edit)                 │
│  💬 Bio (edit)                       │
│  📷 Avatar URL (edit)                │
│  💾 Save Button                      │
└──────────────────────────────────────┘
```

**Files Involved:**

- `app/(tabs)/profile.js` - Profile view
- `services/user.js` - Fetch user profile
- `app/profile/edit.js` - Edit profile
- `stores/authStore.js` - User state

---

## 🎨 DARK MODE

The app automatically detects system theme and supports manual toggle.

```javascript
// In any screen:
import { useTheme } from "../../contexts/ThemeContext";

export default function MyScreen() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <View className={isDark ? "bg-dark" : "bg-light"}>
      <Button onPress={toggleTheme}>Toggle Theme</Button>
    </View>
  );
}
```

**Dark Mode Colors:**

- Background: `#0F172A` (bg-dark)
- Cards: `#1F2937` (bg-gray-800)
- Text: `#F3F4F6` (text-gray-100)

**Light Mode Colors:**

- Background: `#F8FAFC` (bg-light)
- Cards: `#FFFFFF` (bg-white)
- Text: `#0F172A` (text-dark)

---

## 🔧 COMMON CUSTOMIZATIONS

### Change Primary Color

Edit `mobile/tailwind.config.js`:

```javascript
colors: {
  primary: "#06B6D4",    // Change this to your color
  secondary: "#2563EB",
  success: "#10B981",
  error: "#EF4444",
}
```

### Add More Supported Languages

Edit `mobile/app/problems/[id].js`:

```javascript
const LANGUAGES = [
  "javascript",
  "python",
  "java",
  "cpp",
  "c",
  "rust", // Add this
  "golang", // Add this
];
```

### Change Class Options

Edit `mobile/app/auth/register.js`:

```javascript
const CLASS_OPTIONS = [
  "10A1",
  "10A2",
  "10A3", // Your classes
  "11A1",
  "11A2",
  "11A3",
  // Add/remove as needed
];
```

### Update Backend URL

Edit `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://your-new-url:5000/api
```

Then restart: `npm start -c`

---

## 🐛 TROUBLESHOOTING

### Issue: "Can't connect to backend"

```bash
# Check if backend is running on localhost:5000
# Check .env file has correct EXPO_PUBLIC_API_URL

# For Android emulator use:
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api

# For iOS simulator use:
EXPO_PUBLIC_API_URL=http://localhost:5000/api

# For physical device, find your IP:
# Windows: ipconfig
# Mac/Linux: ifconfig
# Then use: EXPO_PUBLIC_API_URL=http://<YOUR_IP>:5000/api
```

### Issue: "White screen or crash"

```bash
# Clear all caches and reinstall
npm install
npm start -c
```

### Issue: "Module not found"

```bash
# Reinstall specific package
npm install package-name
```

### Issue: "Authentication failed"

```bash
# Clear app data and log in again
# Make sure backend JWT secret matches frontend expectations
# Check token expiration (default 7 days)
```

---

## 📊 API REQUEST FLOW

```
┌─────────────────────────────────────┐
│  Component (e.g., problems.js)     │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Service Layer (e.g., problem.js)  │
│  Prepares request data              │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  services/api.js                    │
│  1. Add Authorization header        │
│  2. Set content type                │
│  3. Make HTTP request               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Backend API                        │
│  Process request                    │
│  Return response                    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  services/api.js (Response Handler) │
│  1. Check status code               │
│  2. If 401: Clear token, redirect   │
│  3. Return data                     │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Store/State Management             │
│  (Zustand store)                    │
│  Update app state                   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Component Re-renders               │
│  Display new data                   │
└─────────────────────────────────────┘
```

---

## 📚 LEARNING PATH

```
1. QUICK_START.md
   ↓
2. Run the app locally
   ↓
3. Test login/register
   ↓
4. Browse problems
   ↓
5. Submit code
   ↓
6. Check submissions
   ↓
7. Read README.md for details
   ↓
8. Read API_DOCUMENTATION.md
   ↓
9. Explore source code
   ↓
10. Customize & deploy
```

---

## ✅ FEATURE CHECKLIST

Before deploying, verify:

- [ ] Backend is running at `EXPO_PUBLIC_API_URL`
- [ ] User can register with all fields
- [ ] User can login with valid credentials
- [ ] Problems list loads and displays correctly
- [ ] Can view problem details
- [ ] Can submit code in multiple languages
- [ ] Submission status updates in real-time
- [ ] Can view own submissions list
- [ ] Can join contests
- [ ] Can view profile and statistics
- [ ] Can edit profile
- [ ] Dark mode works correctly
- [ ] No console errors
- [ ] Token refresh works (after 7 days)
- [ ] Logout clears all data

---

## 🚀 DEPLOYMENT

### Build for Android

```bash
eas build --platform android
# Outputs APK file for Google Play Store
```

### Build for iOS

```bash
eas build --platform ios
# Outputs IPA file for Apple App Store
```

### Publish to Stores

1. Create developer accounts
2. Build signed APK/IPA
3. Upload to respective stores
4. Submit for review

---

**You're all set! Enjoy building! 🎉**
