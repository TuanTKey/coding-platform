import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import AdminRoute from './components/admin/AdminRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Leaderboard from './pages/Leaderboard';

// User Pages
import Problems from './pages/Problems';
import ProblemSolve from './pages/ProblemSolve';

// Admin Pages
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProblems from './components/admin/AdminProblems';
import CreateProblem from './components/admin/CreateProblem';
import AdminUsers from './components/admin/AdminUsers';
import AdminSubmissions from './components/admin/AdminSubmissions';
import EditProblem from './components/admin/EditProblem';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        
        {/* User Routes */}
        <Route path="/problems" element={<ProtectedRoute><Problems /></ProtectedRoute>} />
        <Route path="/problems/:slug" element={<ProtectedRoute><ProblemSolve /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        // Thêm các route admin
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/problems" element={<AdminRoute><AdminProblems /></AdminRoute>} />
        <Route path="/admin/problems/create" element={<AdminRoute><CreateProblem /></AdminRoute>} />
        <Route path="/admin/submissions" element={<AdminRoute><AdminSubmissions /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/problems/edit/:id" element={<AdminRoute><EditProblem /></AdminRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;