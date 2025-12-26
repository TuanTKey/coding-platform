import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../components/admin/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Users,
  BookOpen,
  Trophy,
  TrendingUp,
  Zap,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle,
  Award,
  AlertCircle,
  FileCode,
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color, isDark, onClick }) => (
  <button
    onClick={onClick}
    className={`rounded-2xl p-6 transition-all duration-300 group hover:scale-105 hover:shadow-xl border text-left w-full ${
      isDark
        ? "bg-gradient-to-br from-slate-800 to-slate-700/50 border-slate-700/50 hover:border-cyan-500/30"
        : "bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:border-cyan-300/50"
    }`}
  >
    <div className="flex items-start justify-between mb-4">
      <div
        className={`p-3 rounded-xl transition-all group-hover:scale-110 bg-gradient-to-br ${color}`}
      >
        <Icon className="text-white" size={24} />
      </div>
    </div>
    <p
      className={`text-sm font-medium mb-2 ${
        isDark ? "text-gray-400" : "text-gray-600"
      }`}
    >
      {title}
    </p>
    <p
      className={`text-3xl font-bold transition-colors group-hover:text-cyan-400 ${
        isDark ? "text-white" : "text-gray-900"
      }`}
    >
      {value}
    </p>
  </button>
);

const ActionButton = ({ to, icon: Icon, label, gradient, isDark }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 group hover:shadow-lg ${
      isDark
        ? `bg-gradient-to-r ${gradient} text-white hover:shadow-lg`
        : `bg-gradient-to-r ${gradient} text-white hover:shadow-lg`
    }`}
  >
    <Icon size={20} className="group-hover:scale-110 transition" />
    <span>{label}</span>
    <ArrowRight size={18} className="ml-auto group-hover:translate-x-1 transition" />
  </Link>
);

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [problemsTotal, setProblemsTotal] = useState(0);
  const [contestsTotal, setContestsTotal] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await api.get("/users/teacher/me");
        setStudents(resp.data.students || []);
        setClasses(resp.data.classes || []);
        
        const [problemsResp, contestsResp, submissionsResp, statsResp] = await Promise.all([
          api.get("/problems"),
          api.get("/contests"),
          api.get("/submissions/my?limit=5"),
          api.get("/submissions/teacher/stats"),
        ]);
        
        setProblemsTotal(problemsResp.data?.total || 0);
        setContestsTotal(contestsResp.data?.total || 0);
        setSubmissions(submissionsResp.data.submissions || []);
        setStats(statsResp.data);
      } catch (err) {
        console.error("Load teacher data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const acceptedSubmissions = submissions.filter(s => s.status === 'accepted').length;
  const aceRate = submissions.length > 0 ? ((acceptedSubmissions / submissions.length) * 100).toFixed(1) : 0;

  const sortedStudents = stats?.studentStats 
    ? [...stats.studentStats].sort((a, b) => b.acceptedCount - a.acceptedCount).slice(0, 5)
    : [];

  const sortedProblems = stats?.problemStats 
    ? [...stats.problemStats].sort((a, b) => b.totalSubmissions - a.totalSubmissions).slice(0, 5)
    : [];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-50"
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <div
          className={`rounded-2xl p-8 mb-8 border transition-all duration-300 ${
            isDark
              ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-indigo-500/30"
              : "bg-gradient-to-r from-indigo-100/50 to-purple-100/50 border-indigo-300/50"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-extrabold shadow-lg ${
                  isDark
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white"
                    : "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"
                }`}
              >
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1
                  className={`text-5xl font-black mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}
                >
                  Bảng điều khiển Giáo viên
                </h1>
                <p
                  className={`text-lg font-medium ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Xin chào, <span className="font-bold">{user?.fullName || user?.username}</span>
                </p>
                <p
                  className={`text-sm mt-1 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Vai trò: <span className="font-semibold">Giáo viên</span>
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-col sm:flex-row">
              <Link
                to="/teacher/classes"
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  isDark
                    ? "bg-slate-800 text-white border border-slate-600/50 hover:bg-slate-700"
                    : "bg-white text-gray-900 border border-slate-200/50 hover:bg-slate-50"
                }`}
              >
                Lớp
              </Link>
              <Link
                to="/teacher/submissions"
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  isDark
                    ? "bg-slate-800 text-white border border-slate-600/50 hover:bg-slate-700"
                    : "bg-white text-gray-900 border border-slate-200/50 hover:bg-slate-50"
                }`}
              >
                Bài Nộp
              </Link>
              <Link
                to="/teacher/grades"
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  isDark
                    ? "bg-slate-800 text-white border border-slate-600/50 hover:bg-slate-700"
                    : "bg-white text-gray-900 border border-slate-200/50 hover:bg-slate-50"
                }`}
              >
                Bảng Điểm
              </Link>
            </div>
          </div>
        </div>

        {/* QUICK STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Bài tập"
            value={problemsTotal}
            icon={BookOpen}
            color="from-cyan-500 to-blue-600"
            isDark={isDark}
            onClick={() => navigate("/problems")}
          />
          <StatCard
            title="Cuộc thi"
            value={contestsTotal}
            icon={Trophy}
            color="from-orange-500 to-red-600"
            isDark={isDark}
            onClick={() => navigate("/contests")}
          />
          <StatCard
            title="Học sinh"
            value={students.length}
            icon={Users}
            color="from-green-500 to-emerald-600"
            isDark={isDark}
            onClick={() => navigate("/teacher/students")}
          />
          <StatCard
            title="AC Rate"
            value={`${aceRate}%`}
            icon={CheckCircle}
            color="from-purple-500 to-pink-600"
            isDark={isDark}
            onClick={() => window.scrollTo({ top: document.querySelector('[class*="Thống Kê"]')?.offsetTop || 0, behavior: 'smooth' })}
          />
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <ActionButton
            to="/admin/problems/create"
            icon={Plus}
            label="Bài tập mới"
            gradient="from-indigo-600 to-purple-600"
            isDark={isDark}
          />
          <ActionButton
            to="/admin/contests/create"
            icon={Trophy}
            label="Cuộc thi mới"
            gradient="from-orange-600 to-red-600"
            isDark={isDark}
          />
        </div>

        {/* CLASSES & INFO */}
        <div
          className={`rounded-2xl p-8 border transition-all duration-300 mb-8 ${
            isDark
              ? "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-700/50"
              : "bg-gradient-to-br from-white to-slate-50 border-slate-200"
          }`}
        >
          <h2
            className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            📋 Lớp được phân công
          </h2>
          
          {classes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {classes.map((cls, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    isDark
                      ? "bg-slate-700/50 border-slate-600/50 hover:border-cyan-500/30"
                      : "bg-slate-100 border-slate-200 hover:border-cyan-300/50"
                  }`}
                >
                  <p className={`font-semibold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                    {cls.name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-4 rounded-xl text-center ${isDark ? "bg-slate-700/30" : "bg-slate-100"}`}>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                Chưa có lớp nào được phân công
              </p>
            </div>
          )}
        </div>

        {/* STATISTICS SECTION */}
        {stats && (
          <div className={`rounded-2xl p-8 border mb-8 transition-all duration-300 ${
            isDark
              ? "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-700/50"
              : "bg-gradient-to-br from-white to-slate-50 border-slate-200"
          }`}>
            <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isDark ? "text-white" : "text-gray-900"}`}>
              <BarChart3 className="text-indigo-600" size={28} />
              Thống Kê Chi Tiết
            </h2>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className={`rounded-lg p-4 border ${isDark ? 'bg-slate-700/30 border-slate-600/30' : 'bg-slate-100 border-slate-200'}`}>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Học sinh</p>
                <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.summary?.totalStudents || 0}</p>
              </div>
              <div className={`rounded-lg p-4 border ${isDark ? 'bg-slate-700/30 border-slate-600/30' : 'bg-slate-100 border-slate-200'}`}>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tổng nộp</p>
                <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.summary?.totalSubmissions || 0}</p>
              </div>
              <div className={`rounded-lg p-4 border ${isDark ? 'bg-slate-700/30 border-slate-600/30' : 'bg-slate-100 border-slate-200'}`}>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>AC Rate</p>
                <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.summary?.acRate || 0}%</p>
              </div>
              <div className={`rounded-lg p-4 border ${isDark ? 'bg-slate-700/30 border-slate-600/30' : 'bg-slate-100 border-slate-200'}`}>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Accepted</p>
                <p className={`text-2xl font-bold mt-1 text-green-500`}>{stats.summary?.acceptedCount || 0}</p>
              </div>
              <div className={`rounded-lg p-4 border ${isDark ? 'bg-slate-700/30 border-slate-600/30' : 'bg-slate-100 border-slate-200'}`}>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Lỗi</p>
                <p className={`text-2xl font-bold mt-1 text-red-500`}>{stats.summary?.rejectedCount || 0}</p>
              </div>
            </div>

            {/* Two Column Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Student Rankings */}
              <div className={`rounded-lg border overflow-hidden ${isDark ? 'bg-slate-700/30 border-slate-600/30' : 'bg-slate-100 border-slate-200'}`}>
                <div className={`px-6 py-3 border-b ${isDark ? 'border-slate-600/30 bg-slate-700/50' : 'border-slate-200 bg-slate-50'}`}>
                  <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Award className="text-amber-500" size={18} />
                    Top 5 Học Sinh
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={isDark ? 'bg-slate-700/20' : 'bg-slate-50'}>
                      <tr className={`border-b ${isDark ? 'border-slate-600/30' : 'border-slate-200'}`}>
                        <th className={`text-left px-4 py-2 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>STT</th>
                        <th className={`text-left px-4 py-2 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Học sinh</th>
                        <th className={`text-center px-4 py-2 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>AC</th>
                        <th className={`text-right px-4 py-2 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedStudents.map((student, idx) => (
                        <tr key={student.studentId} className={`border-b transition ${isDark ? 'border-slate-600/20 hover:bg-slate-700/20' : 'border-slate-200 hover:bg-slate-50'}`}>
                          <td className={`px-4 py-2 font-bold ${idx < 3 ? 'text-amber-500' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                          </td>
                          <td className={`px-4 py-2 ${isDark ? 'text-gray-300' : 'text-gray-800'} font-medium`}>
                            {student.username}
                          </td>
                          <td className={`text-center px-4 py-2 font-semibold text-green-500`}>{student.acceptedCount}</td>
                          <td className={`text-right px-4 py-2 font-bold ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>{student.rating}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Problem Statistics */}
              <div className={`rounded-lg border overflow-hidden ${isDark ? 'bg-slate-700/30 border-slate-600/30' : 'bg-slate-100 border-slate-200'}`}>
                <div className={`px-6 py-3 border-b ${isDark ? 'border-slate-600/30 bg-slate-700/50' : 'border-slate-200 bg-slate-50'}`}>
                  <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <TrendingUp className="text-indigo-600" size={18} />
                    Top 5 Bài Tập
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={isDark ? 'bg-slate-700/20' : 'bg-slate-50'}>
                      <tr className={`border-b ${isDark ? 'border-slate-600/30' : 'border-slate-200'}`}>
                        <th className={`text-left px-4 py-2 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Bài tập</th>
                        <th className={`text-center px-4 py-2 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Tổng</th>
                        <th className={`text-center px-4 py-2 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>AC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedProblems.map((problem) => (
                        <tr key={problem.problemId} className={`border-b transition ${isDark ? 'border-slate-600/20 hover:bg-slate-700/20' : 'border-slate-200 hover:bg-slate-50'}`}>
                          <td className={`px-4 py-2 ${isDark ? 'text-gray-300' : 'text-gray-800'} font-medium`}>
                            {problem.problemTitle}
                          </td>
                          <td className={`text-center px-4 py-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{problem.totalSubmissions}</td>
                          <td className={`text-center px-4 py-2 font-semibold text-green-500`}>{problem.accepted}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;

