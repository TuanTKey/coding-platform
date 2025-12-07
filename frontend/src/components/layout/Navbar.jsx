import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../admin/AuthContext';
import { Code2, Search, Shield, BarChart3 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <nav className="bg-white shadow sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md">
                <Code2 size={20} />
              </div>
              <div>
                <div className="text-base font-semibold text-gray-800">CodeJudge</div>
                <div className="text-[10px] text-gray-400">Luyện tập & Thi đấu</div>
              </div>
            </Link>
          </div>
          <div className="hidden md:flex items-center flex-1 mx-3">
            <div className="w-full max-w-lg relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={16} />
              </div>
              <input
                type="search"
                placeholder="Tìm bài tập, học sinh, lớp..."
                className="w-full border rounded-md px-2 pl-8 text-sm compact-input focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2">
                  {(() => {
                    const isAdmin = user?.role === 'admin';
                    const isTeacher = user?.role === 'teacher';
                    const isStudent = user?.role === 'user';

                    if (isStudent) {
                      return (
                        <>
                          <Link to="/problems" className="text-gray-600 hover:text-indigo-600 text-sm">Bài tập</Link>
                          <Link to="/contests" className="text-gray-600 hover:text-indigo-600 text-sm">Cuộc thi</Link>
                          <Link to="/leaderboard" className="text-gray-600 hover:text-indigo-600 text-sm">Xếp hạng</Link>
                        </>
                      );
                    }

                    if (isAdmin || isTeacher) {
                      return (
                        <>
                          <Link to={isTeacher ? '/teacher/admin' : '/admin'} className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1.5 rounded-md shadow">Quản lý</Link>
                        </>
                      );
                    }

                    // Fallback: treat unknown roles as student view
                    return (
                      <>
                        <Link to="/problems" className="text-gray-600 hover:text-indigo-600 text-sm">Bài tập</Link>
                        <Link to="/contests" className="text-gray-600 hover:text-indigo-600 text-sm">Cuộc thi</Link>
                        <Link to="/leaderboard" className="text-gray-600 hover:text-indigo-600 text-sm">Xếp hạng</Link>
                      </>
                    );
                  })()}
                </div>

                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 bg-white border rounded-lg px-2 py-1 shadow-sm hover:shadow-md">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center text-white font-semibold">{user.username?.[0]?.toUpperCase()}</div>
                    <div className="hidden sm:flex flex-col text-left">
                          <span className="text-sm font-medium text-gray-800">{user.fullName || user.username}</span>
                          <span className="text-[11px] text-gray-500">{user.role}</span>
                        </div>
                  </button>

                    {open && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg py-2">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Hồ sơ</Link>
                      <Link to="/profile/edit" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Chỉnh sửa</Link>
                      <div className="border-t my-1"></div>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Đăng xuất</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-indigo-600">Đăng nhập</Link>
                <Link to="/register" className="text-sm font-semibold bg-indigo-600 text-white px-3 py-1.5 rounded">Đăng ký</Link>
              </div>
            )}

            <button onClick={() => setMobileOpen(v => !v)} className="md:hidden text-gray-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-2">
            <div className="px-4 flex flex-col gap-2">
                  {user ? (
                <>
                  {/* show student links for students and fallback users */}
                  {(user.role === 'user' || !user.role) && (
                    <>
                      <Link to="/problems" className="py-2">Bài tập</Link>
                      <Link to="/contests" className="py-2">Cuộc thi</Link>
                      <Link to="/leaderboard" className="py-2">Xếp hạng</Link>
                    </>
                  )}

                  {(user.role === 'admin' || user.role === 'teacher') && (
                    <>
                      <Link to="/admin" className="py-2">Quản lý</Link>
                    </>
                  )}
                  <Link to="/profile" className="py-2">Hồ sơ</Link>
                  <button onClick={handleLogout} className="py-2 text-red-600 text-left">Đăng xuất</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="py-2">Đăng nhập</Link>
                  <Link to="/register" className="py-2">Đăng ký</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;