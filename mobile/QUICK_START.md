# Mobile App - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd mobile
npm install
```

### Step 2: Configure Backend URL

```bash
# Copy the example file
cp .env.example .env

# Edit .env and set your backend URL
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api  # For Android emulator
```

### Step 3: Start Development Server

```bash
npm start
```

### Step 4: Run on Your Device

- **Android**: Press `a` in terminal (requires Android Studio emulator)
- **iOS**: Press `i` in terminal (requires Xcode, macOS only)
- **Physical Device**: Scan QR code with Expo Go app

## 📱 Main Screens

### 1. **Auth Screens**

- `Login` - Sign in with username/password
- `Register` - Create account and select class

### 2. **Main Tabs**

- **Problems** - Browse all coding problems with filters
- **Contests** - View and join programming contests
- **Submissions** - Track your code submissions
- **Profile** - View stats and manage account

### 3. **Detail Screens**

- Problem detail with code editor
- Contest detail with rules
- Submission detail with test case results
- Profile editing

## 🎯 Key Features

✅ Full authentication with secure token storage
✅ Browse problems by difficulty
✅ Write and submit code
✅ Track submissions in real-time
✅ Join contests
✅ View user statistics
✅ Dark mode support
✅ Responsive design

## 📚 Core Services

```javascript
// Authentication
import { authService } from "./services/auth";
authService.login(credentials);
authService.register(userData);
authService.logout();

// Problems
import { problemService } from "./services/problem";
problemService.getAllProblems(filters);
problemService.getProblemById(id);

// Submissions
import { submissionService } from "./services/submission";
submissionService.submitSolution(problemId, code, language);
submissionService.getSubmissionStatus(submissionId);

// Contests
import { contestService } from "./services/contest";
contestService.getAllContests();
contestService.joinContest(contestId);

// Users
import { userService } from "./services/user";
userService.getUserProfile(userId);
userService.updateProfile(userData);
```

## 🎨 Styling with NativeWind

The app uses NativeWind for Tailwind CSS support in React Native:

```jsx
<View className="flex-1 bg-white p-4">
  <Text className="text-lg font-bold text-gray-900">Hello</Text>
</View>
```

Dark mode classes:

```jsx
<View className={isDark ? "bg-dark" : "bg-light"}>
  <Text className={isDark ? "text-white" : "text-dark"}>Text</Text>
</View>
```

## 🔄 State Management with Zustand

```javascript
import { useAuthStore } from "./stores/authStore";

function MyComponent() {
  const { user, isAuthenticated, login } = useAuthStore();
  // Use state...
}
```

## 🛑 Common Issues & Solutions

### Issue: Can't connect to backend

**Solution**: Check your `.env` file and verify backend is running

### Issue: White screen / App crashes

**Solution**: Clear cache and reinstall

```bash
npm start -c
```

### Issue: Token/Authentication errors

**Solution**: Log out and log back in to refresh tokens

### Issue: Slow simulator

**Solution**:

- Close other apps
- Restart emulator
- Use a physical device

## 📖 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/routing/introduction/)
- [React Native Docs](https://reactnative.dev/)
- [Zustand](https://github.com/pmndrs/zustand)
- [NativeWind](https://www.nativewind.dev/)

## 💡 Tips

1. **Hot Reload**: Changes auto-reload in dev mode
2. **Performance**: Use React DevTools for debugging
3. **Testing**: Test API calls in Postman first
4. **Icons**: Import from `lucide-react` package
5. **Colors**: Keep theme-aware with `useTheme()` hook

## 🤖 Next Steps

1. ✅ Install and run the app
2. ✅ Test login/register flow
3. ✅ Browse problems and submit code
4. ✅ Check submissions and stats
5. ✅ Customize colors and branding
6. ✅ Build for production

---

**Need Help?** Check README.md for detailed documentation.

Happy coding! 🎉
