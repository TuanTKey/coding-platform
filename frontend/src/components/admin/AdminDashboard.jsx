import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Users,
  FileCode,
  Send,
  Trophy,
  TrendingUp,
  BookOpen,
  School,
  BarChart3,
  Activity,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  GraduationCap,
} from "lucide-react";

const AdminDashboard = () => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProblems: 0,
    totalSubmissions: 0,
    totalContests: 0,
    totalClasses: 0,
    recentSubmissions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log("🔄 Fetching admin stats...");

      // Fetch từ các endpoints
      const [usersRes, problemsRes, submissionsRes, contestsRes, classesRes] =
        await Promise.all([
          api.get("/users/admin/stats"),
          api.get("/problems?limit=1&page=1"),
          api.get("/submissions/admin/all?limit=10"),
          api.get("/contests?limit=1&page=1"),
          // Use canonical Class documents endpoint so counts match Admin Classes view
          api.get("/admin/classes"),
        ]);

      console.log("📊 API Responses:", {
        users: usersRes.data,
        classes: classesRes.data,
      });

      setStats({
        totalUsers: usersRes.data.totalUsers || 0,
        totalStudents: usersRes.data.totalStudents || 0,
        totalTeachers: usersRes.data.totalTeachers || 0,
        totalProblems: problemsRes.data.total || 0,
        totalSubmissions: submissionsRes.data.total || 0,
        totalContests: contestsRes.data.total || 0,
        // admin/classes returns `classes` array (server-side). Use its length as canonical total.
        totalClasses:
          (classesRes.data.classes || []).length || classesRes.data.total || 0,
        recentSubmissions: submissionsRes.data.submissions || [],
      });
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      // Fallback data
      setStats((prev) => ({
        ...prev,
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        recentSubmissions: [],
      }));
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Tổng Users",
      value: stats.totalUsers,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      link: "/admin/users?role=admin",
      description: `${stats.totalStudents} học sinh, ${stats.totalTeachers} giáo viên`,
    },
    {
      title: "Tổng Problems",
      value: stats.totalProblems,
      icon: FileCode,
      color: "from-green-500 to-green-600",
      link: "/admin/problems",
    },
    {
      title: "Tổng Submissions",
      value: stats.totalSubmissions,
      icon: Send,
      color: "from-purple-500 to-purple-600",
      link: "/admin/submissions",
    },
    {
      title: "Tổng Contests",
      value: stats.totalContests,
      icon: Trophy,
      color: "from-orange-500 to-orange-600",
      link: "/admin/contests",
    },
    {
      title: "Lớp học",
      value: stats.totalClasses,
      icon: School,
      color: "from-red-500 to-red-600",
      link: "/admin/classes",
      description: "Tổng số lớp",
    },
  ];

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center h-screen ${
          isDark ? "bg-slate-900" : "bg-gray-50"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className={`animate-spin rounded-full h-16 w-16 border-4 border-t-4 ${
              isDark
                ? "border-slate-700 border-t-cyan-500"
                : "border-gray-300 border-t-blue-500"
            }`}
          ></div>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1
                className={`text-5xl font-black mb-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent`}
              >
                Admin Dashboard
              </h1>
              <p
                className={`text-lg font-medium ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Quản lý hệ thống học tập toàn diện
              </p>
            </div>
            <div
              className={`p-4 rounded-2xl ${
                isDark ? "bg-slate-800/50" : "bg-white"
              } border ${isDark ? "border-slate-700" : "border-gray-200"}`}
            >
              <Activity
                className={`${
                  isDark ? "text-cyan-400" : "text-cyan-600"
                } animate-pulse`}
                size={32}
              />
            </div>
          </div>
          <div
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Tổng quát, quản lý và theo dõi tất cả hoạt động trên nền tảng
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link
                key={index}
                to={stat.link}
                className={`group rounded-2xl p-6 transition-all duration-300 cursor-pointer border ${
                  isDark
                    ? "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-700/50 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20"
                    : "bg-gradient-to-br from-white to-slate-50 border-gray-200 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-400/20"
                } hover:scale-105`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 bg-gradient-to-br ${stat.color}`}
                  >
                    <Icon className="text-white" size={24} />
                  </div>
                  <ArrowUpRight
                    className={`transition-all group-hover:translate-x-1 group-hover:-translate-y-1 ${
                      isDark ? "text-green-500/50" : "text-green-500/40"
                    }`}
                    size={20}
                  />
                </div>
                <p
                  className={`text-sm font-medium mb-1 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {stat.title}
                </p>
                <p
                  className={`text-3xl font-bold mb-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stat.value}
                </p>
                {stat.description && (
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-500" : "text-gray-600"
                    }`}
                  >
                    {stat.description}
                  </p>
                )}
              </Link>
            );
          })}
        </div>

        {/* Action & Recent Submissions Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions - Takes 1 column */}
          <div
            className={`lg:col-span-1 rounded-2xl p-8 border ${
              isDark
                ? "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-700/50"
                : "bg-gradient-to-br from-white to-slate-50 border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500`}
              >
                <Zap className="text-white" size={20} />
              </div>
              <h2
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Thao tác nhanh
              </h2>
            </div>
            <div className="space-y-3">
              <Link
                to="/admin/problems/create"
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isDark
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-purple-500/30"
                    : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg hover:shadow-purple-500/30"
                } group`}
              >
                <Plus size={18} className="group-hover:rotate-90 transition" />
                <span>Bài tập mới</span>
              </Link>
              <Link
                to="/admin/contests/create"
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isDark
                    ? "bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500 hover:shadow-lg hover:shadow-red-500/30"
                    : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:shadow-lg hover:shadow-red-500/30"
                } group`}
              >
                <Trophy
                  size={18}
                  className="group-hover:scale-110 transition"
                />
                <span>Cuộc thi mới</span>
              </Link>
              <Link
                to="/admin/users"
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isDark
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 hover:shadow-lg hover:shadow-cyan-500/30"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 hover:shadow-lg hover:shadow-cyan-500/30"
                } group`}
              >
                <Users size={18} className="group-hover:scale-110 transition" />
                <span>Quản lý users</span>
              </Link>
              <Link
                to="/admin/submissions/problems"
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isDark
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 hover:shadow-lg hover:shadow-green-500/30"
                    : "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:shadow-lg hover:shadow-green-500/30"
                } group`}
              >
                <FileCode
                  size={18}
                  className="group-hover:scale-110 transition"
                />
                <span>Submit bài tập</span>
              </Link>
              <Link
                to="/admin/submissions/contests"
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isDark
                    ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:from-pink-500 hover:to-rose-500 hover:shadow-lg hover:shadow-rose-500/30"
                    : "bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 hover:shadow-lg hover:shadow-rose-500/30"
                } group`}
              >
                <Send size={18} className="group-hover:scale-110 transition" />
                <span>Submit thi đấu</span>
              </Link>
              <Link
                to="/admin/classes"
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isDark
                    ? "bg-gradient-to-r from-yellow-600 to-amber-600 text-white hover:from-yellow-500 hover:to-amber-500 hover:shadow-lg hover:shadow-amber-500/30"
                    : "bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-500/30"
                } group`}
              >
                <GraduationCap
                  size={18}
                  className="group-hover:scale-110 transition"
                />
                <span>Lớp học</span>
              </Link>
            </div>
          </div>

          {/* Recent Submissions - Takes 2 columns */}
          <div
            className={`lg:col-span-2 rounded-2xl p-8 border ${
              isDark
                ? "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-700/50"
                : "bg-gradient-to-br from-white to-slate-50 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500`}
                >
                  <Send className="text-white" size={20} />
                </div>
                <div>
                  <h2
                    className={`text-xl font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Bài nộp gần đây
                  </h2>
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-500" : "text-gray-600"
                    }`}
                  >
                    {stats.recentSubmissions.length} bài nộp
                  </p>
                </div>
              </div>
              <Link
                to="/admin/submissions"
                className={`text-sm font-semibold px-4 py-2 rounded-lg transition ${
                  isDark
                    ? "text-cyan-400 hover:bg-slate-700/50"
                    : "text-cyan-600 hover:bg-gray-100"
                }`}
              >
                Xem tất cả →
              </Link>
            </div>

            <div
              className={`space-y-2 max-h-96 overflow-y-auto custom-scrollbar ${
                isDark ? "scrollbar-dark" : "scrollbar-light"
              }`}
            >
              {stats.recentSubmissions.length > 0 ? (
                stats.recentSubmissions.map((submission, index) => (
                  <div
                    key={submission._id || index}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                      isDark
                        ? "bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30"
                        : "bg-gray-100/50 hover:bg-gray-100 border border-gray-200"
                    } group`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 text-white`}
                      >
                        {submission.userId?.username?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`font-semibold truncate ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {submission.userId?.username || "Unknown"}
                          </p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              isDark
                                ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                                : "bg-blue-100 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {submission.userId?.class || "N/A"}
                          </span>
                        </div>
                        <p
                          className={`text-sm truncate ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {submission.problemId?.title || "Unknown Problem"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p
                          className={`text-xs font-medium ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {new Date(submission.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                      {submission.status === "accepted" ? (
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50">
                          <CheckCircle className="text-green-500" size={14} />
                          <span className="text-xs font-semibold text-green-500">
                            ĐẠT
                          </span>
                        </div>
                      ) : submission.status === "wrong_answer" ? (
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50">
                          <AlertCircle className="text-red-500" size={14} />
                          <span className="text-xs font-semibold text-red-500">
                            SAI
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/50">
                          <Clock className="text-yellow-500" size={14} />
                          <span className="text-xs font-semibold text-yellow-500">
                            {submission.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className={`flex flex-col items-center justify-center py-12 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <Send size={40} className="mb-3 opacity-30" />
                  <p className="font-medium">Chưa có bài nộp nào</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.5);
        }
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.4);
        }
        .scrollbar-light::-webkit-scrollbar-thumb {
          background: rgba(203, 213, 225, 0.5);
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
