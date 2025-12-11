import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../admin/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Search, Menu, X, Sun, Moon, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import CodeJudgeLogo from "./CodeJudgeLogo";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <nav
      className={`backdrop-blur-xl sticky top-0 z-50 transition-all duration-300 ${
        isDark
          ? "bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 border-b border-slate-700/50"
          : "bg-gradient-to-r from-white/95 via-slate-50/95 to-white/95 border-b border-slate-200/50"
      }`}
    >
      <div className="px-6 mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Satellites */}
          <Link
            to="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <CodeJudgeLogo />
          </Link>

          {/* Search Bar - Hidden on Mobile */}
          <div className="items-center flex-1 hidden mx-12 lg:flex">
            <div className="relative w-full max-w-xs group">
              <div
                className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                <Search size={18} strokeWidth={2} />
              </div>
              <input
                type="search"
                placeholder="Tìm bài tập, cuộc thi..."
                className={`w-full rounded-lg px-4 pl-12 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-200 ${
                  isDark
                    ? "bg-slate-800/50 border border-slate-700/50 text-white placeholder-gray-500 hover:bg-slate-800/70"
                    : "bg-slate-100/50 border border-slate-300/50 text-gray-900 placeholder-gray-600 hover:bg-slate-100/70"
                }`}
              />
            </div>
          </div>

          {/* Navigation Links & Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg transition-all duration-300 hover:scale-110 btn-hover ${
                isDark
                  ? "bg-slate-700/40 hover:bg-slate-700/60 text-yellow-400 border border-slate-600/50"
                  : "bg-slate-200/40 hover:bg-slate-200/60 text-orange-500 border border-slate-300/50"
              }`}
              title={isDark ? "Chế độ sáng" : "Chế độ tối"}
            >
              {isDark ? (
                <Sun size={20} strokeWidth={2} />
              ) : (
                <Moon size={20} strokeWidth={2} />
              )}
            </button>

            {user ? (
              <>
                {/* Desktop Navigation */}
                <div className="items-center hidden gap-2 md:flex">
                  {(() => {
                    const isAdmin = user?.role === "admin";
                    const isTeacher = user?.role === "teacher";
                    const isStudent = user?.role === "user";

                    if (isStudent) {
                      return (
                        <>
                          <Link
                            to="/problems"
                            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${
                              isDark
                                ? "text-gray-300 hover:text-cyan-400 hover:bg-slate-700/40"
                                : "text-gray-700 hover:text-cyan-600 hover:bg-slate-200/40"
                            }`}
                          >
                            Bài tập
                          </Link>
                          <Link
                            to="/contests"
                            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${
                              isDark
                                ? "text-gray-300 hover:text-cyan-400 hover:bg-slate-700/40"
                                : "text-gray-700 hover:text-cyan-600 hover:bg-slate-200/40"
                            }`}
                          >
                            Cuộc thi
                          </Link>
                          <Link
                            to="/leaderboard"
                            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${
                              isDark
                                ? "text-gray-300 hover:text-cyan-400 hover:bg-slate-700/40"
                                : "text-gray-700 hover:text-cyan-600 hover:bg-slate-200/40"
                            }`}
                          >
                            Xếp hạng
                          </Link>
                        </>
                      );
                    }

                    if (isAdmin || isTeacher) {
                      return (
                        <Link
                          to={isAdmin ? "/admin" : "/teacher"}
                          className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${
                            isDark
                              ? "text-gray-300 hover:text-cyan-400 hover:bg-slate-700/40"
                              : "text-gray-700 hover:text-cyan-600 hover:bg-slate-200/40"
                          }`}
                        >
                          {isAdmin ? "Admin" : "Dashboard"}
                        </Link>
                      );
                    }
                  })()}
                </div>

                {/* User Dropdown */}
                <div className="relative ml-4" ref={dropdownRef}>
                  <button
                    onClick={() => setOpen(!open)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 group ${
                      isDark
                        ? "hover:bg-slate-700/40 border border-slate-700/50"
                        : "hover:bg-slate-200/40 border border-slate-300/50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm group-hover:shadow-md transition-shadow ${
                        isDark
                          ? "group-hover:shadow-cyan-500/30"
                          : "group-hover:shadow-cyan-400/30"
                      }`}
                    >
                      {user.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {user.username}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {open && (
                    <div
                      className={`absolute right-0 mt-2 w-56 rounded-lg shadow-xl z-50 animate-fade-in-down ${
                        isDark
                          ? "bg-slate-900/95 border border-slate-700/50"
                          : "bg-white/95 border border-slate-200/50"
                      } backdrop-blur`}
                    >
                      <div className="p-3 space-y-1">
                        <Link
                          to="/profile"
                          className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isDark
                              ? "text-gray-300 hover:bg-slate-700/40 hover:text-cyan-400"
                              : "text-gray-700 hover:bg-slate-100/50 hover:text-cyan-600"
                          }`}
                        >
                          Hồ sơ cá nhân
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isDark
                              ? "text-red-400 hover:bg-red-500/20"
                              : "text-red-600 hover:bg-red-100/50"
                          }`}
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 hidden sm:block ${
                    isDark
                      ? "text-gray-300 hover:text-cyan-400 hover:bg-slate-700/40"
                      : "text-gray-700 hover:text-cyan-600 hover:bg-slate-200/40"
                  }`}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105"
                >
                  Đăng ký
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2.5 rounded-lg transition-all duration-200 ${
                isDark
                  ? "hover:bg-slate-700/40 text-gray-300"
                  : "hover:bg-slate-200/40 text-gray-700"
              }`}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && user && (
          <div
            className={`md:hidden pb-4 space-y-2 border-t transition-all duration-200 ${
              isDark ? "border-slate-700/50" : "border-slate-200/50"
            }`}
          >
            {user?.role === "user" && (
              <>
                <Link
                  to="/problems"
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isDark
                      ? "text-gray-300 hover:bg-slate-700/40 hover:text-cyan-400"
                      : "text-gray-700 hover:bg-slate-200/40 hover:text-cyan-600"
                  }`}
                >
                  Bài tập
                </Link>
                <Link
                  to="/contests"
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isDark
                      ? "text-gray-300 hover:bg-slate-700/40 hover:text-cyan-400"
                      : "text-gray-700 hover:bg-slate-200/40 hover:text-cyan-600"
                  }`}
                >
                  Cuộc thi
                </Link>
                <Link
                  to="/leaderboard"
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isDark
                      ? "text-gray-300 hover:bg-slate-700/40 hover:text-cyan-400"
                      : "text-gray-700 hover:bg-slate-200/40 hover:text-cyan-600"
                  }`}
                >
                  Xếp hạng
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
