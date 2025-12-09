import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../components/admin/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  Trophy,
  Users,
  Code,
  Rocket,
  ArrowRight,
  BookOpen,
  BarChart3,
  Brain,
  Flame,
  Clock,
  Zap,
  TrendingUp,
} from "lucide-react";
import api from "../services/api";
import DateTimeWidget from "../components/common/DateTimeWidget";
import MessengerContact from "../components/common/MessengerContact";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchContests(),
        fetchStats(),
        fetchRecentProblems(),
        fetchTopUsers(),
      ]);
      setLoading(false);
    };
    loadData();
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

  const getStatusColor = (status) => {
    if (status === "Đang diễn ra")
      return isDark
        ? "bg-green-500/20 text-green-300 border border-green-400/50"
        : "bg-green-100 text-green-700 border border-green-300";
    if (status === "Sắp diễn ra")
      return isDark
        ? "bg-blue-500/20 text-blue-300 border border-blue-400/50"
        : "bg-blue-100 text-blue-700 border border-blue-300";
    return isDark
      ? "bg-slate-700/50 text-slate-300 border border-slate-600/50"
      : "bg-slate-200 text-slate-700 border border-slate-300";
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === "Easy")
      return isDark
        ? "bg-green-500/20 text-green-300 border border-green-400/50"
        : "bg-green-100 text-green-700 border border-green-300";
    if (difficulty === "Medium")
      return isDark
        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-400/50"
        : "bg-yellow-100 text-yellow-700 border border-yellow-300";
    return isDark
      ? "bg-red-500/20 text-red-300 border border-red-400/50"
      : "bg-red-100 text-red-700 border border-red-300";
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950"
          : "bg-gradient-to-br from-white via-slate-50 to-slate-100"
      }`}
    >
      {/* ============ HERO SECTION ============ */}
      <section
        className={`relative w-full min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 ${
          isDark
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950"
            : "bg-gradient-to-br from-white via-cyan-50 to-blue-50"
        }`}
      >
        {/* Animated Grid Background - Dark Mode */}
        {isDark && (
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                linear-gradient(0deg, transparent 24%, rgba(79, 172, 254, 0.05) 25%, rgba(79, 172, 254, 0.05) 26%, transparent 27%, transparent 74%, rgba(79, 172, 254, 0.05) 75%, rgba(79, 172, 254, 0.05) 76%, transparent 77%, transparent),
                linear-gradient(90deg, transparent 24%, rgba(79, 172, 254, 0.05) 25%, rgba(79, 172, 254, 0.05) 26%, transparent 27%, transparent 74%, rgba(79, 172, 254, 0.05) 75%, rgba(79, 172, 254, 0.05) 76%, transparent 77%, transparent)
              `,
                backgroundSize: "50px 50px",
              }}
            ></div>
          </div>
        )}
        {/* Animated Gradient Blobs - Light Mode */}
        {!isDark && (
          <>
            <div className="absolute top-0 rounded-full -left-40 w-80 h-80 bg-gradient-to-br from-cyan-300 to-blue-300 mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div
              className="absolute rounded-full -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-300 to-pink-300 mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute bottom-0 rounded-full left-1/3 w-80 h-80 bg-gradient-to-br from-blue-300 to-cyan-300 mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
              style={{ animationDelay: "4s" }}
            ></div>
          </>
        )}

        {/* Dark Mode Floating Elements */}
        {isDark && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute rounded-full top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-900/10 to-blue-900/10 blur-3xl animate-pulse"></div>
            <div
              className="absolute rounded-full bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-900/10 to-pink-900/10 blur-3xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>
        )}

        <div className="relative z-10 max-w-5xl py-20 mx-auto text-center sm:py-24">
          {/* Badge */}
          <div className="inline-flex mb-6">
            <div
              className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                isDark
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50"
                  : "bg-cyan-100 text-cyan-700 border border-cyan-300/50"
              }`}
            >
              <Zap size={14} />
              Cộng đồng 10,000+ lập trình viên
            </div>
          </div>

          {/* Main Title */}
          <h1
            className={`text-6xl sm:text-7xl lg:text-8xl font-black mb-6 leading-tight ${
              isDark
                ? "bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent"
            }`}
          >
            CodeJudge
          </h1>
          <p
            className={`text-2xl sm:text-3xl font-bold mb-4 ${
              isDark ? "text-gray-100" : "text-gray-800"
            }`}
          >
            Nền Tảng Lập Trình Hàng Đầu
          </p>
          <p
            className={`text-lg sm:text-xl max-w-2xl mx-auto mb-12 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Giải bài tập, tham gia cuộc thi, và trở thành lập trình viên xuất
            sắc cùng{" "}
            <span
              className={
                isDark ? "text-cyan-400 font-bold" : "text-cyan-600 font-bold"
              }
            >
              {stats.totalProblems}+
            </span>{" "}
            bài tập đa dạng
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col justify-center gap-4 mb-16 sm:flex-row">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transform hover:scale-105 ${
                    isDark
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500"
                      : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
                  }`}
                >
                  <Rocket size={20} />
                  Bắt Đầu Ngay
                </Link>
                <Link
                  to="/login"
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 border-2 backdrop-blur-sm ${
                    isDark
                      ? "border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                      : "border-cyan-500 text-cyan-600 hover:bg-cyan-100"
                  }`}
                >
                  Đăng Nhập
                  <ArrowRight size={20} />
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/problems"
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transform hover:scale-105 ${
                    isDark
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500"
                      : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
                  }`}
                >
                  <Code size={20} />
                  Giải Bài Tập
                </Link>
                <Link
                  to="/contests"
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 border-2 backdrop-blur-sm ${
                    isDark
                      ? "border-purple-500 text-purple-400 hover:bg-purple-500/10"
                      : "border-purple-500 text-purple-600 hover:bg-purple-100"
                  }`}
                >
                  <Trophy size={20} />
                  Cuộc Thi
                </Link>
              </>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid max-w-3xl grid-cols-2 gap-4 mx-auto md:grid-cols-4">
            {[
              {
                icon: BookOpen,
                label: "Bài Tập",
                value: stats.totalProblems || "500+",
              },
              {
                icon: Trophy,
                label: "Cuộc Thi",
                value: stats.totalContests || "20+",
              },
              { icon: Users, label: "Cộng Đồng", value: "10K+" },
              { icon: Code, label: "Ngôn Ngữ", value: "4+" },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl transition-all duration-300 backdrop-blur-sm group hover:scale-105 ${
                    isDark
                      ? "bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-cyan-500/50"
                      : "bg-white/70 border border-cyan-200/50 hover:bg-white hover:border-cyan-400/50"
                  }`}
                >
                  <Icon
                    className={`mx-auto mb-2 transition-all group-hover:scale-110 ${
                      isDark ? "text-cyan-400" : "text-cyan-600"
                    }`}
                    size={24}
                  />
                  <p
                    className={`text-xs font-semibold mb-1 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {stat.label}
                  </p>
                  <p
                    className={`text-2xl font-black ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute flex flex-col items-center gap-2 transform -translate-x-1/2 bottom-8 left-1/2 animate-bounce">
          <span
            className={`text-sm font-semibold ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Cuộn xuống
          </span>
          <div
            className={`w-6 h-10 border-2 rounded-full flex items-start justify-center p-2 ${
              isDark ? "border-gray-400" : "border-gray-600"
            }`}
          >
            <div
              className={`w-1 h-2 rounded-full ${
                isDark ? "bg-gray-400" : "bg-gray-600"
              } animate-bounce`}
            ></div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section
        className={`py-24 px-4 sm:px-6 lg:px-8 ${
          isDark ? "bg-slate-800/50" : "bg-white/50"
        }`}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2
              className={`text-4xl font-bold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Tính Năng Nổi Bật
            </h2>
            <p
              className={`text-lg ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Mọi thứ bạn cần để trở thành lập trình viên xuất sắc
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Code,
                title: "Editor Mạnh Mẽ",
                desc: "Code editor tích hợp với syntax highlighting và khả năng chạy code trực tiếp",
              },
              {
                icon: Brain,
                title: "AI Judge",
                desc: "Chấm bài tự động với AI, nhận phản hồi chi tiết và lời khuyên cải thiện",
              },
              {
                icon: Trophy,
                title: "Cuộc Thi Trực Tuyến",
                desc: "Tham gia các cuộc thi hàng tuần, leo bảng xếp hạng và giành giải thưởng",
              },
              {
                icon: TrendingUp,
                title: "Thống Kê Chi Tiết",
                desc: "Theo dõi tiến độ học tập với các biểu đồ và thống kê toàn diện",
              },
              {
                icon: BookOpen,
                title: "1000+ Bài Tập",
                desc: "Từ cơ bản đến nâng cao, bao gồm tất cả các chủ đề lập trình",
              },
              {
                icon: Users,
                title: "Cộng Đồng",
                desc: "Học hỏi từ các lập trình viên khác, chia sẻ kinh nghiệm và tìm nguồn cảm hứng",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className={`p-8 rounded-2xl transition-all duration-300 group hover:shadow-xl hover:scale-105 ${
                    isDark
                      ? "bg-gradient-to-br from-slate-800 to-slate-700/50 border border-slate-700/50 hover:border-cyan-500/30"
                      : "bg-gradient-to-br from-white to-slate-50 border border-slate-200/50 hover:border-cyan-300/50"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all group-hover:scale-125 ${
                      isDark
                        ? "bg-cyan-500/20 group-hover:bg-cyan-500/40"
                        : "bg-cyan-100/50 group-hover:bg-cyan-200/50"
                    }`}
                  >
                    <Icon
                      className={`${
                        isDark ? "text-cyan-400" : "text-cyan-600"
                      }`}
                      size={24}
                    />
                  </div>
                  <h3
                    className={`text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {feature.title}
                  </h3>
                  <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT SECTION ============ */}
      <section
        className={`py-24 px-4 sm:px-6 lg:px-8 ${
          isDark ? "bg-slate-900" : "bg-slate-50"
        }`}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* ===== Recent Problems ===== */}
            <div
              className={`rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${
                isDark
                  ? "bg-gradient-to-br from-slate-800 via-slate-700/80 to-slate-800 border border-cyan-500/20"
                  : "bg-gradient-to-br from-white via-cyan-50/50 to-white border border-cyan-300/50"
              }`}
            >
              <div
                className={`p-8 border-b ${
                  isDark
                    ? "border-slate-700/50 bg-slate-800/50"
                    : "border-cyan-200/50 bg-white"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`p-2 rounded-lg ${
                      isDark ? "bg-cyan-500/20" : "bg-cyan-100"
                    }`}
                  >
                    <Flame
                      className={isDark ? "text-cyan-400" : "text-cyan-600"}
                      size={20}
                    />
                  </div>
                  <h3
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Bài Tập Mới Nhất
                  </h3>
                </div>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Những bài tập được thêm gần đây nhất
                </p>
              </div>

              <div className="p-8 space-y-3 overflow-y-auto max-h-96">
                {recentProblems.length > 0 ? (
                  recentProblems.map((problem) => (
                    <Link
                      key={problem._id}
                      to={`/problems/${problem.slug}`}
                      className={`block p-4 rounded-lg transition-all duration-300 group hover:scale-105 ${
                        isDark
                          ? "bg-slate-700/50 hover:bg-slate-700/80 hover:border-cyan-400/50 border border-slate-600/50"
                          : "bg-cyan-50/50 hover:bg-white hover:border-cyan-400/50 border border-cyan-200/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-bold truncate mb-1 group-hover:text-cyan-500 transition-colors ${
                              isDark
                                ? "text-cyan-300 hover:text-cyan-200"
                                : "text-cyan-700 hover:text-cyan-800"
                            }`}
                          >
                            {problem.title}
                          </h4>
                          <p
                            className={`text-xs line-clamp-1 ${
                              isDark ? "text-gray-500" : "text-gray-600"
                            }`}
                          >
                            {problem.description?.substring(0, 60)}...
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getDifficultyColor(
                            problem.difficulty
                          )}`}
                        >
                          {problem.difficulty}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div
                    className={`text-center py-8 ${
                      isDark ? "text-gray-500" : "text-gray-600"
                    }`}
                  >
                    <div className="animate-pulse">Đang tải bài tập...</div>
                  </div>
                )}
              </div>

              <div
                className={`p-6 border-t ${
                  isDark
                    ? "border-slate-700/50 bg-slate-800/30"
                    : "border-cyan-200/50 bg-cyan-50/30"
                }`}
              >
                <Link
                  to="/problems"
                  className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg font-bold transition-all duration-300 hover:scale-105 ${
                    isDark
                      ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                      : "bg-cyan-500 hover:bg-cyan-600 text-white"
                  }`}
                >
                  Xem Tất Cả Bài Tập
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            {/* ===== Top Users / Leaderboard ===== */}
            <div
              className={`rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${
                isDark
                  ? "bg-gradient-to-br from-slate-800 via-slate-700/80 to-slate-800 border border-purple-500/20"
                  : "bg-gradient-to-br from-white via-purple-50/50 to-white border border-purple-300/50"
              }`}
            >
              <div
                className={`p-8 border-b ${
                  isDark
                    ? "border-slate-700/50 bg-slate-800/50"
                    : "border-purple-200/50 bg-white"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`p-2 rounded-lg ${
                      isDark ? "bg-purple-500/20" : "bg-purple-100"
                    }`}
                  >
                    <Trophy
                      className={isDark ? "text-purple-400" : "text-purple-600"}
                      size={20}
                    />
                  </div>
                  <h3
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Top Lập Trình Viên
                  </h3>
                </div>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Những tài năng hàng đầu trên nền tảng
                </p>
              </div>

              <div className="p-8 space-y-3 overflow-y-auto max-h-96">
                {topUsers.length > 0 ? (
                  topUsers.map((user, idx) => (
                    <Link
                      key={user._id}
                      to={`/users/${user._id}`}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 group hover:scale-105 ${
                        isDark
                          ? "bg-slate-700/50 hover:bg-slate-700/80 hover:border-purple-400/50 border border-slate-600/50"
                          : "bg-purple-50/50 hover:bg-white hover:border-purple-400/50 border border-purple-200/50"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          idx === 0
                            ? isDark
                              ? "bg-yellow-600 text-yellow-100"
                              : "bg-yellow-400 text-yellow-900"
                            : idx === 1
                            ? isDark
                              ? "bg-gray-600 text-gray-100"
                              : "bg-gray-400 text-gray-900"
                            : idx === 2
                            ? isDark
                              ? "bg-orange-600 text-orange-100"
                              : "bg-orange-400 text-orange-900"
                            : isDark
                            ? "bg-slate-600 text-slate-100"
                            : "bg-slate-400 text-slate-900"
                        }`}
                      >
                        #{idx + 1}
                      </div>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          isDark
                            ? "bg-purple-500/50 text-purple-200"
                            : "bg-purple-300/50 text-purple-800"
                        }`}
                      >
                        {user.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-bold truncate group-hover:text-purple-500 transition-colors ${
                            isDark ? "text-purple-300" : "text-purple-700"
                          }`}
                        >
                          {user.username}
                        </p>
                        <p
                          className={`text-xs truncate ${
                            isDark ? "text-gray-500" : "text-gray-600"
                          }`}
                        >
                          {user.fullName || "Lập trình viên"}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div
                          className={`text-lg font-black ${
                            isDark ? "text-purple-400" : "text-purple-600"
                          }`}
                        >
                          {user.rating || 0}
                        </div>
                        <p
                          className={`text-xs font-semibold ${
                            isDark ? "text-gray-500" : "text-gray-600"
                          }`}
                        >
                          Rating
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div
                    className={`text-center py-8 ${
                      isDark ? "text-gray-500" : "text-gray-600"
                    }`}
                  >
                    <div className="animate-pulse">Đang tải xếp hạng...</div>
                  </div>
                )}
              </div>

              <div
                className={`p-6 border-t ${
                  isDark
                    ? "border-slate-700/50 bg-slate-800/30"
                    : "border-purple-200/50 bg-purple-50/30"
                }`}
              >
                <Link
                  to="/leaderboard"
                  className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg font-bold transition-all duration-300 hover:scale-105 ${
                    isDark
                      ? "bg-purple-600 hover:bg-purple-500 text-white"
                      : "bg-purple-500 hover:bg-purple-600 text-white"
                  }`}
                >
                  Xem Bảng Xếp Hạng
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTESTS SECTION ============ */}
      {contests.length > 0 && (
        <section
          className={`py-24 px-4 sm:px-6 lg:px-8 ${
            isDark ? "bg-slate-800/50" : "bg-white/50"
          }`}
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-3 rounded-lg ${
                    isDark ? "bg-orange-500/20" : "bg-orange-100"
                  }`}
                >
                  <Flame
                    className={isDark ? "text-orange-400" : "text-orange-600"}
                    size={24}
                  />
                </div>
                <h2
                  className={`text-4xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Cuộc Thi Sắp Tới
                </h2>
              </div>
              <p
                className={`text-lg ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Tham gia cuộc thi hàng tuần và chứng minh kỹ năng của bạn
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {contests.map((contest) => {
                const status = getContestStatus(contest);
                return (
                  <Link
                    key={contest._id}
                    to={`/contests/${contest._id}`}
                    className={`group rounded-2xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 ${
                      isDark
                        ? "bg-gradient-to-br from-slate-800 to-slate-700/50 hover:border-orange-500/50"
                        : "bg-gradient-to-br from-white to-slate-50 hover:border-orange-300/50"
                    } border ${
                      isDark ? "border-slate-700/50" : "border-orange-200/50"
                    }`}
                  >
                    <div
                      className={`p-8 ${
                        isDark
                          ? "bg-gradient-to-br from-orange-900/30 to-red-900/20"
                          : "bg-gradient-to-br from-orange-100/50 to-red-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3
                          className={`text-xl font-bold group-hover:text-orange-400 transition-colors ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {contest.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusColor(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </div>

                      <p
                        className={`line-clamp-2 mb-6 ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {contest.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm">
                        <span
                          className={`flex items-center gap-1.5 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <Clock size={16} />
                          {new Date(contest.startTime).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                        <span
                          className={`flex items-center gap-1.5 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <Users size={16} />
                          {contest.participants?.length || 0} tham gia
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/contests"
                className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                  isDark
                    ? "bg-orange-600 hover:bg-orange-500 text-white"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
              >
                Xem Tất Cả Cuộc Thi
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ============ CTA SECTION ============ */}
      <section
        className={`py-24 px-4 sm:px-6 lg:px-8 ${
          isDark
            ? "bg-gradient-to-br from-purple-900/50 via-slate-900 to-slate-950"
            : "bg-gradient-to-br from-purple-100/30 via-white to-slate-50"
        }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className={`text-4xl font-bold mb-6 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Sẵn Sàng Bắt Đầu Hành Trình Lập Trình?
          </h2>
          <p
            className={`text-xl mb-8 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Hơn 1000 bài tập đang chờ bạn. Tham gia cộng đồng lập trình viên
            tráng lệ ngay hôm nay!
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                    isDark
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500"
                      : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
                  }`}
                >
                  Đăng Ký Miễn Phí
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/problems"
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                    isDark
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500"
                      : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
                  }`}
                >
                  Bắt Đầu Giải Bài Tập
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer
        className={`border-t ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        } py-12 px-4 sm:px-6 lg:px-8`}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 mb-8 md:grid-cols-4">
            <div>
              <h3
                className={`text-lg font-bold mb-4 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                CodeJudge
              </h3>
              <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Nền tảng luyện tập lập trình trực tuyến hàng đầu
              </p>
            </div>
            {[
              {
                title: "Nền Tảng",
                links: ["Bài Tập", "Cuộc Thi", "Bảng Xếp Hạng"],
              },
              {
                title: "Hỗ Trợ",
                links: ["Tài Liệu", "Cộng Đồng", "Liên Hệ"],
              },
              { title: "Pháp Lý", links: ["Điều Khoản", "Quyền Riêng Tư"] },
            ].map((section, idx) => (
              <div key={idx}>
                <h3
                  className={`text-lg font-bold mb-4 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a
                        href="#"
                        className={`transition-colors ${
                          isDark
                            ? "text-gray-400 hover:text-cyan-400"
                            : "text-gray-600 hover:text-cyan-600"
                        }`}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className={`border-t pt-8 text-center ${
              isDark ? "border-slate-800" : "border-slate-200"
            }`}
          >
            <p className={isDark ? "text-gray-500" : "text-gray-600"}>
              ©Nguyễn Anh Tuấn và Y Phai Niê - 2025. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Date Time Widget */}
      <DateTimeWidget />

      {/* Messenger Contact */}
      <MessengerContact />
    </div>
  );
};

export default Home;
