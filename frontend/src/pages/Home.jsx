import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../components/admin/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  Trophy,
  Users,
  Zap,
  ChevronRight,
  Code,
  Terminal,
  Clock,
  BookOpen,
  Rocket,
  GitBranch,
  Settings,
  Award,
  Target,
  Lightbulb,
  Star,
  CheckCircle,
} from "lucide-react";
import api from "../services/api";

const Home = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [contests, setContests] = useState([]);
  const [stats, setStats] = useState({
    totalContests: 0,
    totalProblems: 0,
  });
  const [recentProblems, setRecentProblems] = useState([]);
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    fetchContests();
    fetchStats();
    fetchRecentProblems();
    fetchTopUsers();
  }, []);

  const fetchContests = async () => {
    try {
      const response = await api.get("/contests");
      const contestsData = response.data.contests || response.data;
      setContests(Array.isArray(contestsData) ? contestsData.slice(0, 3) : []);
    } catch (error) {
      console.error("Error fetching contests:", error);
    }
  };

  const fetchRecentProblems = async () => {
    try {
      const res = await api.get("/problems?limit=6");
      const problems = res.data.problems || res.data;
      setRecentProblems(Array.isArray(problems) ? problems.slice(0, 6) : []);
    } catch (error) {
      console.error("Error fetching recent problems:", error);
    }
  };

  const fetchTopUsers = async () => {
    try {
      const res = await api.get("/users/leaderboard?limit=5");
      setTopUsers(res.data.leaderboard || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const [contestsRes, problemsRes] = await Promise.all([
        api.get("/contests"),
        api.get("/problems"),
      ]);
      setStats({
        totalContests:
          contestsRes.data.total || contestsRes.data.contests?.length || 0,
        totalProblems:
          problemsRes.data.total || problemsRes.data.problems?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const getContestStatus = (contest) => {
    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);
    if (now < startTime) return "Sắp diễn ra";
    if (now >= startTime && now <= endTime) return "Đang diễn ra";
    return "Đã kết thúc";
  };

  const getContestDuration = (contest) => {
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    const hours = Math.round((end - start) / (1000 * 60 * 60));
    return `${hours} giờ`;
  };

  const statusBadge = (status) => {
    const colors = {
      "Đang diễn ra":
        "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
      "Sắp diễn ra": "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
      "Đã kết thúc": "bg-gradient-to-r from-gray-500 to-slate-600 text-white",
    };
    return colors[status] || "bg-gray-500 text-white";
  };

  const difficultyBadge = (difficulty) => {
    const colors = {
      Easy: "bg-green-500/20 text-green-400 border border-green-400/30",
      Medium: "bg-yellow-500/20 text-yellow-400 border border-yellow-400/30",
      Hard: "bg-red-500/20 text-red-400 border border-red-400/30",
    };
    return colors[difficulty] || "bg-gray-500/20 text-gray-400";
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
          : "bg-gradient-to-b from-slate-50 via-white to-slate-50 text-gray-900"
      }`}
    >
      {/* ============ HERO SECTION ============ */}
      <div
        className={`relative overflow-hidden min-h-screen flex items-center justify-center px-6 py-20 ${
          isDark
            ? "bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900"
            : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50"
        }`}
      >
        {/* Animated Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`absolute -top-40 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob-rotate ${
              isDark ? "bg-cyan-500" : "bg-cyan-300"
            }`}
          ></div>
          <div
            className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob-rotate animation-delay-2000 ${
              isDark ? "bg-blue-500" : "bg-blue-300"
            }`}
          ></div>
          <div
            className={`absolute top-1/2 left-1/3 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob-rotate animation-delay-4000 ${
              isDark ? "bg-purple-500" : "bg-purple-300"
            }`}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-6xl text-center animate-fade-in-down">
          {/* Logo & Branding */}
          <div className="inline-flex items-center gap-4 mb-12">
            <div className="flex items-center justify-center w-24 h-24 transition-transform duration-300 shadow-2xl bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl glow-cyan hover:scale-110">
              <Code className="text-white w-14 h-14" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <h1 className="font-black text-transparent text-7xl bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                CodeJudge
              </h1>
              <p
                className={`text-xl font-semibold ${
                  isDark ? "text-cyan-300" : "text-cyan-600"
                }`}
              >
                Online Programming Platform
              </p>
            </div>
          </div>

          {/* Main Heading */}
          <p
            className={`text-4xl font-bold mb-6 leading-tight ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Luyện tập lập trình, tham gia cuộc thi
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              và trở thành lập trình viên xuất sắc
            </span>
          </p>
          <p
            className={`text-xl mb-16 max-w-3xl mx-auto leading-relaxed font-light ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Với AI Judge thông minh, hàng nghìn bài tập đa dạng và cộng đồng lập
            trình viên sôi động
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-6 mb-24">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-3 px-12 py-5 text-xl font-bold text-white transition-all duration-300 transform shadow-2xl bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl glow-cyan hover:glow-cyan-lg hover:scale-110 btn-hover"
                >
                  <Rocket className="w-6 h-6" />
                  Bắt đầu ngay
                </Link>
                <Link
                  to="/problems"
                  className={`inline-flex items-center gap-3 px-10 py-5 text-xl font-bold rounded-xl border-2 transition-all duration-300 btn-hover transform hover:scale-105 ${
                    isDark
                      ? "border-cyan-400/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400"
                      : "border-cyan-600/50 text-cyan-600 hover:bg-cyan-600/10 hover:border-cyan-600"
                  }`}
                >
                  Khám phá bài tập
                  <ChevronRight className="w-6 h-6" />
                </Link>
              </>
            ) : (
              <Link
                to="/problems"
                className="inline-flex items-center gap-3 px-12 py-5 text-xl font-bold text-white transition-all duration-300 transform shadow-2xl bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl glow-cyan hover:glow-cyan-lg hover:scale-110 btn-hover"
              >
                <Target className="w-6 h-6" />
                Làm bài tập ngay
              </Link>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid max-w-4xl grid-cols-2 gap-6 mx-auto md:grid-cols-4">
            {[
              { icon: Trophy, value: stats.totalContests, label: "Cuộc thi" },
              { icon: BookOpen, value: stats.totalProblems, label: "Bài tập" },
              { icon: Terminal, value: "4+", label: "Ngôn ngữ" },
              { icon: Zap, value: "<1s", label: "Chấm bài" },
            ].map((item, i) => (
              <div
                key={i}
                className={`group card-hover ${
                  isDark
                    ? "bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/80 hover:border-cyan-500/50"
                    : "bg-white/50 border border-slate-200/50 hover:bg-white/80 hover:border-cyan-500/50"
                } backdrop-blur rounded-2xl p-8 transition-all duration-300`}
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-125 transition-transform ${
                    isDark ? "glow-cyan" : "shadow-lg"
                  }`}
                >
                  <item.icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div className="mb-2 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  {item.value}
                </div>
                <div
                  className={`text-sm font-medium ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ FEATURES SECTION ============ */}
      <section
        className={`py-24 px-6 ${
          isDark
            ? "bg-gradient-to-b from-slate-800 to-slate-900"
            : "bg-gradient-to-b from-slate-100 to-slate-200"
        }`}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center animate-fade-in-up">
            <h2
              className={`text-5xl font-bold mb-6 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Tính năng{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                nổi bật
              </span>
            </h2>
            <p
              className={`text-xl max-w-2xl mx-auto ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Mọi thứ bạn cần để trở thành lập trình viên chuyên nghiệp
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Terminal,
                title: "Code Editor Mạnh",
                desc: "Monaco Editor với syntax highlighting, autocomplete, debug tools",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Zap,
                title: "AI Judge",
                desc: "Chấm bài tự động với Gemini AI, feedback chi tiết tức thì",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: Trophy,
                title: "Cuộc thi Realtime",
                desc: "Thi đấu trực tiếp, xếp hạng động, giải thưởng hấp dẫn",
                color: "from-amber-500 to-orange-500",
              },
              {
                icon: Users,
                title: "Quản lý Lớp học",
                desc: "Giao bài tập, theo dõi tiến độ, quản lý sinh viên dễ dàng",
                color: "from-purple-500 to-pink-500",
              },
            ].map((f, i) => (
              <div
                key={i}
                className={`group card-hover-dark relative ${
                  isDark
                    ? "bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 hover:border-cyan-500/50"
                    : "bg-gradient-to-br from-white to-slate-50 border border-slate-300/50 hover:border-cyan-500/50"
                } rounded-2xl p-8 transition-all duration-300 backdrop-blur`}
              >
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${
                    f.color
                  } p-3 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-2xl ${
                    f.color.includes("blue")
                      ? "glow-blue"
                      : f.color.includes("green")
                      ? "glow-cyan"
                      : "shadow-glow"
                  }`}
                >
                  <f.icon
                    className="w-full h-full text-white"
                    strokeWidth={1.5}
                  />
                </div>
                <h3
                  className={`text-xl font-bold mb-3 group-hover:text-cyan-400 transition-colors ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {f.title}
                </h3>
                <p className={isDark ? "text-gray-400" : "text-gray-700"}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT SECTION ============ */}
      <section
        className={`py-12 px-6 ${isDark ? "bg-slate-900" : "bg-slate-50"}`}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left: Contests (70%) */}
            <div className="lg:col-span-2">
              <div
                className={`${
                  isDark
                    ? "bg-gradient-to-br from-slate-800 to-slate-700/50 border-slate-600/50"
                    : "bg-gradient-to-br from-white to-slate-50 border-slate-300/50"
                } border rounded-2xl p-10 backdrop-blur shadow-2xl transition-all duration-300 card-hover-dark`}
              >
                <div className="flex items-center justify-between mb-10">
                  <h2
                    className={`text-3xl font-bold flex items-center gap-4 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 glow-orange">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    Cuộc thi sắp diễn ra
                  </h2>
                  <Link
                    to="/contests"
                    className="inline-flex items-center px-6 py-3 font-semibold transition-all transform border-2 rounded-lg border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 hover:scale-105"
                  >
                    Xem tất cả
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>

                {contests.length === 0 ? (
                  <div
                    className={`${
                      isDark
                        ? "bg-slate-700/30 border-slate-600/50"
                        : "bg-slate-100/50 border-slate-300/50"
                    } border-2 border-dashed rounded-xl p-16 text-center`}
                  >
                    <Trophy
                      className={`w-16 h-16 mx-auto mb-4 ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    />
                    <p
                      className={`text-lg font-medium ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Chưa có cuộc thi nào
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {contests.map((contest) => {
                      const status = getContestStatus(contest);
                      return (
                        <Link
                          key={contest._id}
                          to={`/contests/${contest._id}`}
                          className={`group card-hover-dark ${
                            isDark
                              ? "bg-slate-700/50 hover:bg-slate-700/80 border-slate-600/50 hover:border-cyan-500/50"
                              : "bg-slate-50 hover:bg-white border-slate-300/50 hover:border-cyan-500/50"
                          } border rounded-xl p-8 transition-all duration-300 block`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-4 mb-4">
                                <h3
                                  className={`font-bold text-2xl group-hover:text-cyan-300 transition-colors ${
                                    isDark ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  {contest.title}
                                </h3>
                                <span
                                  className={`px-4 py-2 rounded-lg text-sm font-bold ${statusBadge(
                                    status
                                  )}`}
                                >
                                  {status}
                                </span>
                              </div>
                              <p
                                className={`mb-5 line-clamp-2 ${
                                  isDark ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                {contest.description}
                              </p>
                              <div
                                className={`flex items-center gap-8 text-sm flex-wrap ${
                                  isDark ? "text-gray-400" : "text-gray-600"
                                }`}
                              >
                                <span className="flex items-center gap-2 transition-colors hover:text-cyan-400">
                                  <BookOpen className="w-4 h-4" />
                                  {contest.problems?.length || 0} bài tập
                                </span>
                                <span className="flex items-center gap-2 transition-colors hover:text-cyan-400">
                                  <Clock className="w-4 h-4" />
                                  {getContestDuration(contest)}
                                </span>
                                <span className="text-xs">
                                  {new Date(contest.startTime).toLocaleString(
                                    "vi-VN"
                                  )}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="flex-shrink-0 w-6 h-6 ml-4 transition-transform text-cyan-400 group-hover:translate-x-2" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Recent Problems & Leaderboard (30%) */}
            <div className="space-y-8">
              {/* Recent Problems */}
              <div
                className={`${
                  isDark
                    ? "bg-gradient-to-br from-slate-800 to-slate-700/50 border-slate-600/50"
                    : "bg-gradient-to-br from-white to-slate-50 border-slate-300/50"
                } border rounded-2xl p-8 backdrop-blur shadow-2xl transition-all duration-300 card-hover-dark`}
              >
                <h3
                  className={`text-2xl font-bold flex items-center gap-3 mb-8 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  Bài tập mới
                </h3>
                {recentProblems.length === 0 ? (
                  <p
                    className={`text-center py-6 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Không có bài tập mới.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {recentProblems.map((p) => (
                      <li key={p._id}>
                        <Link
                          to={`/problems/${p._id}`}
                          className={`block rounded-lg p-4 transition-all border ${
                            isDark
                              ? "hover:bg-slate-700/50 border-transparent hover:border-cyan-400/30"
                              : "hover:bg-slate-100 border-transparent hover:border-cyan-400/30"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <span
                              className={`font-semibold line-clamp-1 flex-1 group-hover:text-cyan-300 ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {p.title}
                            </span>
                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${difficultyBadge(
                                p.difficulty
                              )}`}
                            >
                              {p.difficulty || "N/A"}
                            </span>
                          </div>
                          <p
                            className={`text-sm line-clamp-2 ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {p.description}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Leaderboard */}
              <div
                className={`${
                  isDark
                    ? "bg-gradient-to-br from-slate-800 to-slate-700/50 border-slate-600/50"
                    : "bg-gradient-to-br from-white to-slate-50 border-slate-300/50"
                } border rounded-2xl p-8 backdrop-blur shadow-2xl transition-all duration-300 card-hover-dark`}
              >
                <h3
                  className={`text-2xl font-bold flex items-center gap-3 mb-8 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  Top Players
                </h3>
                {topUsers.length === 0 ? (
                  <p
                    className={`text-center py-6 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Không có dữ liệu xếp hạng.
                  </p>
                ) : (
                  <ol className="space-y-3">
                    {topUsers.map((u, index) => (
                      <li
                        key={u._id}
                        className={`flex items-center justify-between rounded-lg p-4 transition-all border ${
                          isDark
                            ? "hover:bg-slate-700/50 border-transparent hover:border-cyan-400/30"
                            : "hover:bg-slate-100 border-transparent hover:border-cyan-400/30"
                        }`}
                      >
                        <div className="flex items-center flex-1 gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                              index === 0
                                ? "bg-gradient-to-br from-yellow-400 to-amber-500"
                                : index === 1
                                ? "bg-gradient-to-br from-gray-300 to-gray-400"
                                : index === 2
                                ? "bg-gradient-to-br from-amber-600 to-amber-700"
                                : "bg-gradient-to-br from-indigo-500 to-purple-500"
                            }`}
                          >
                            {["🥇", "🥈", "🥉"][index] || index + 1}
                          </div>
                          <div className="min-w-0">
                            <div
                              className={`font-semibold truncate ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {u.username}
                            </div>
                            {u.studentId && (
                              <div
                                className={`text-xs ${
                                  isDark ? "text-gray-500" : "text-gray-500"
                                }`}
                              >
                                ID: {u.studentId}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-2 text-right">
                          <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                            {u.rating}
                          </div>
                          <div
                            className={`text-xs ${
                              isDark ? "text-gray-500" : "text-gray-500"
                            }`}
                          >
                            {u.solvedProblems || 0} giải
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BENEFITS SECTION ============ */}
      <section
        className={`py-24 px-6 ${
          isDark
            ? "bg-gradient-to-b from-slate-900 to-slate-800"
            : "bg-gradient-to-b from-slate-200 to-slate-300"
        }`}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center animate-fade-in-up">
            <h2
              className={`text-5xl font-bold mb-6 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Tại sao chọn{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                CodeJudge
              </span>
              ?
            </h2>
            <p
              className={`text-xl max-w-2xl mx-auto ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Nền tảng được tin tưởng bởi hàng nghìn lập trình viên
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {[
              {
                icon: Lightbulb,
                title: "Bài tập Đa dạng",
                desc: "Từ cơ bản đến nâng cao, mọi chủ đề lập trình",
                items: [
                  "Thuật toán cơ bản",
                  "Cấu trúc dữ liệu",
                  "Dynamic Programming",
                ],
              },
              {
                icon: Zap,
                title: "Chấm bài Nhanh",
                desc: "Kết quả trong 1 giây với độ chính xác 100%",
                items: [
                  "Chấm tự động",
                  "Multiple test cases",
                  "Chi tiết feedback",
                ],
              },
              {
                icon: Star,
                title: "Cộng đồng Mạnh",
                desc: "Học hỏi từ các lập trình viên khác",
                items: ["Diễn đàn thảo luận", "Cuộc thi định kỳ", "Mentoring"],
              },
            ].map((b, i) => (
              <div key={i} className="relative group">
                <div className="absolute transition-opacity duration-300 opacity-0 -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur group-hover:opacity-100"></div>
                <div
                  className={`relative ${
                    isDark ? "bg-slate-800" : "bg-white"
                  } rounded-2xl p-10 h-full`}
                >
                  <div className="p-3 mb-6 transition-transform duration-300 w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 group-hover:scale-110 glow-cyan">
                    <b.icon
                      className="w-full h-full text-white"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3
                    className={`text-2xl font-bold mb-3 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {b.title}
                  </h3>
                  <p
                    className={`mb-6 leading-relaxed ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {b.desc}
                  </p>
                  <ul className="space-y-3">
                    {b.items.map((item, j) => (
                      <li
                        key={j}
                        className={`flex items-center gap-3 ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        <CheckCircle className="flex-shrink-0 w-5 h-5 text-cyan-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative px-6 py-24 overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute bg-white rounded-full top-10 left-10 w-96 h-96 mix-blend-multiply filter blur-3xl opacity-20 animate-blob-rotate"></div>
          <div className="absolute bg-white rounded-full bottom-10 right-10 w-96 h-96 mix-blend-multiply filter blur-3xl opacity-20 animate-blob-rotate animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="mb-8 text-5xl font-bold text-white">
            Bắt đầu hành trình{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-200">
              lập trình
            </span>{" "}
            của bạn
          </h2>
          <p className="mb-12 text-2xl leading-relaxed text-blue-50">
            Tham gia ngay và trở thành lập trình viên xuất sắc. Hàng ngàn bài
            tập, cuộc thi hấp dẫn và cộng đồng hỗ trợ đang chờ đón bạn.
          </p>
          {!user ? (
            <Link
              to="/register"
              className="inline-flex items-center gap-3 px-16 py-6 text-xl font-bold text-indigo-600 transition-all transform bg-white shadow-2xl hover:bg-gray-100 rounded-xl hover:scale-110"
            >
              <Rocket className="w-7 h-7" />
              Tạo tài khoản miễn phí
            </Link>
          ) : (
            <Link
              to="/problems"
              className="inline-flex items-center gap-3 px-16 py-6 text-xl font-bold text-indigo-600 transition-all transform bg-white shadow-2xl hover:bg-gray-100 rounded-xl hover:scale-110"
            >
              <Target className="w-7 h-7" />
              Khám phá bài tập
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
