import { useState, useEffect } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../admin/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import api from "../../services/api";
import {
  Clock,
  Users,
  Trophy,
  Send,
  ArrowLeft,
  CheckCircle,
  XCircle,
  BookOpen,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const ContestDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [solvedProblems, setSolvedProblems] = useState(new Set());

  useEffect(() => {
    fetchContest();
  }, [id]);

  useEffect(() => {
    if (user && contest) {
      fetchUserSubmissions();
    }
  }, [user, contest]);

  const fetchContest = async () => {
    try {
      const response = await api.get(`/contests/${id}`);
      setContest(response.data.contest);

      // Check if user is registered
      if (user && response.data.contest.participants) {
        const registered = response.data.contest.participants.includes(user.id);
        setIsRegistered(registered);
      }
    } catch (error) {
      console.error("Error fetching contest:", error);
      alert("Failed to load contest");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubmissions = async () => {
    try {
      const response = await api.get(`/submissions/contest/${id}/user`);
      const submissions = response.data.submissions || response.data || [];

      // Lấy danh sách problem đã Accepted (check cả lowercase và uppercase)
      const solved = new Set();
      submissions.forEach((sub) => {
        const status = sub.status?.toLowerCase();
        if (status === "accepted" && sub.problemId) {
          solved.add(sub.problemId._id || sub.problemId);
        }
      });
      setSolvedProblems(solved);
    } catch (error) {
      console.error("Error fetching user submissions:", error);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để đăng ký tham gia");
      return;
    }

    setRegistering(true);
    try {
      await api.post(`/contests/${id}/register`);
      setIsRegistered(true);
      alert("Đăng ký tham gia thành công!");
      fetchContest(); // Refresh contest data
    } catch (error) {
      console.error("Error registering:", error);
      alert(error.response?.data?.error || "Không thể đăng ký");
    } finally {
      setRegistering(false);
    }
  };

  const handleSubmitContest = () => {
    const totalProblems = contest.problems?.length || 0;
    const solvedCount = solvedProblems.size;

    if (solvedCount === 0) {
      alert("Bạn chưa hoàn thành bài tập nào!");
      return;
    }

    const confirmMsg =
      solvedCount < totalProblems
        ? `Bạn mới hoàn thành ${solvedCount}/${totalProblems} bài. Bạn có chắc muốn nộp bài thi?`
        : `Bạn đã hoàn thành ${solvedCount}/${totalProblems} bài. Xác nhận nộp bài thi?`;

    if (confirm(confirmMsg)) {
      alert("🎉 Nộp bài thi thành công! Cảm ơn bạn đã tham gia.");
      navigate(`/contests/${id}/leaderboard`);
    }
  };

  const getContestStatus = () => {
    if (!contest) return "loading";
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "running";
    return "finished";
  };

  const canJoin = () => {
    // Cho phép đăng ký khi cuộc thi sắp diễn ra HOẶC đang diễn ra
    const status = getContestStatus();
    return (status === "upcoming" || status === "running") && !isRegistered;
  };

  const canParticipate = () => {
    // Cho phép làm bài khi cuộc thi đang diễn ra (kể cả chưa đăng ký - sẽ tự động đăng ký)
    const status = getContestStatus();
    return status === "running";
  };

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center h-screen transition-colors duration-300 ${
          isDark
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950"
            : "bg-gradient-to-br from-slate-50 via-white to-slate-50"
        }`}
      >
        <div
          className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDark ? "border-purple-500" : "border-purple-600"
          }`}
        ></div>
      </div>
    );
  }

  if (!contest) {
    return <Navigate to="/contests" replace />;
  }

  const status = getContestStatus();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-50"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/contests"
            className={`inline-flex items-center space-x-2 font-semibold mb-4 transition-colors ${
              isDark
                ? "text-purple-400 hover:text-purple-300"
                : "text-purple-600 hover:text-purple-800"
            }`}
          >
            <ArrowLeft size={20} />
            <span>Quay lại danh sách cuộc thi</span>
          </Link>
        </div>

        {/* Contest Header */}
        <div
          className={`rounded-xl shadow-md p-8 mb-8 transition-colors duration-300 border ${
            isDark
              ? "bg-gradient-to-br from-slate-800 to-slate-700/80 border-slate-600/50"
              : "bg-white border-slate-200/50"
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    status === "upcoming"
                      ? isDark
                        ? "bg-blue-900/30 text-blue-300"
                        : "bg-blue-100 text-blue-800"
                      : status === "running"
                      ? isDark
                        ? "bg-green-900/30 text-green-300"
                        : "bg-green-100 text-green-800"
                      : isDark
                      ? "bg-gray-800/30 text-gray-300"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {status === "upcoming"
                    ? "SẮP DIỄN RA"
                    : status === "running"
                    ? "ĐANG DIỄN RA"
                    : "ĐÃ KẾT THÚC"}
                </span>
                <div
                  className={`flex items-center space-x-1 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <Users size={18} />
                  <span>
                    {contest.participants?.length || 0} người tham gia
                  </span>
                </div>
              </div>

              <h1
                className={`text-4xl font-bold mb-4 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                {contest.title}
              </h1>
              <p
                className={`text-lg mb-6 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {contest.description}
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-600"}
                    >
                      Thời gian bắt đầu:
                    </span>
                    <span
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {format(new Date(contest.startTime), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-600"}
                    >
                      Thời gian kết thúc:
                    </span>
                    <span
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {format(new Date(contest.endTime), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-600"}
                    >
                      Thời lượng:
                    </span>
                    <span
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {contest.duration} phút
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-600"}
                    >
                      Số bài tập:
                    </span>
                    <span
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {contest.problems?.length || 0} bài
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-600"}
                    >
                      Người tạo:
                    </span>
                    <span
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {contest.createdBy?.username}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-600"}
                    >
                      Trạng thái:
                    </span>
                    <span
                      className={`font-semibold ${
                        status === "upcoming"
                          ? isDark
                            ? "text-blue-400"
                            : "text-blue-600"
                          : status === "running"
                          ? isDark
                            ? "text-green-400"
                            : "text-green-600"
                          : isDark
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      {status === "upcoming"
                        ? `Bắt đầu ${formatDistanceToNow(
                            new Date(contest.startTime),
                            { addSuffix: true }
                          )}`
                        : status === "running"
                        ? `Kết thúc ${formatDistanceToNow(
                            new Date(contest.endTime),
                            { addSuffix: true }
                          )}`
                        : "Đã kết thúc"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="lg:ml-8 lg:mt-0 mt-6">
              <div className="space-y-3">
                {canJoin() && (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 transition-colors"
                  >
                    {registering ? "Đang đăng ký..." : "Đăng ký tham gia"}
                  </button>
                )}

                {isRegistered && (
                  <div
                    className={`border rounded-lg p-3 text-center transition-colors ${
                      isDark
                        ? "bg-green-900/30 border-green-500/50"
                        : "bg-green-50 border-green-200"
                    }`}
                  >
                    <CheckCircle
                      className={`inline mr-2 ${
                        isDark ? "text-green-400" : "text-green-500"
                      }`}
                      size={20}
                    />
                    <span
                      className={`font-semibold ${
                        isDark ? "text-green-300" : "text-green-800"
                      }`}
                    >
                      Đã đăng ký tham gia
                    </span>
                  </div>
                )}

                {status === "running" && (
                  <button
                    onClick={handleSubmitContest}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold text-center transition-colors"
                  >
                    <Send className="inline mr-2" size={20} />
                    Nộp bài thi
                  </button>
                )}

                <Link
                  to={`/contests/${contest._id}/leaderboard`}
                  className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold text-center transition-colors"
                >
                  <Trophy className="inline mr-2" size={20} />
                  Bảng xếp hạng
                </Link>

                {status === "finished" && (
                  <Link
                    to={`/contests/${contest._id}/leaderboard`}
                    className="block w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 font-semibold text-center transition-colors"
                  >
                    <Trophy className="inline mr-2" size={20} />
                    Xem kết quả
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div
          id="problems-section"
          className={`rounded-xl shadow-md p-6 transition-colors duration-300 border ${
            isDark
              ? "bg-gradient-to-br from-slate-800 to-slate-700/80 border-slate-600/50"
              : "bg-white border-slate-200/50"
          }`}
        >
          <h2
            className={`text-2xl font-bold mb-6 ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            Danh sách Bài tập
          </h2>

          {contest.problems && contest.problems.length > 0 ? (
            <div className="space-y-4">
              {contest.problems.map((problem, index) => (
                <div
                  key={problem._id}
                  className={`flex items-center justify-between p-4 rounded-lg transition-colors border ${
                    isDark
                      ? "border-slate-600/50 hover:bg-slate-700/50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                        isDark
                          ? "bg-purple-900/30 text-purple-400"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <Link
                        to={`/problems/${problem.slug}`}
                        className={`font-semibold text-lg transition-colors ${
                          isDark
                            ? "text-white hover:text-purple-400"
                            : "text-gray-800 hover:text-purple-600"
                        }`}
                      >
                        {problem.title}
                      </Link>
                      <div className="flex items-center space-x-3 mt-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            problem.difficulty === "easy"
                              ? isDark
                                ? "bg-green-900/30 text-green-300"
                                : "bg-green-100 text-green-800"
                              : problem.difficulty === "medium"
                              ? isDark
                                ? "bg-yellow-900/30 text-yellow-300"
                                : "bg-yellow-100 text-yellow-800"
                              : isDark
                              ? "bg-red-900/30 text-red-300"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {problem.difficulty === "easy"
                            ? "DỄ"
                            : problem.difficulty === "medium"
                            ? "TRUNG BÌNH"
                            : "KHÓ"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {canParticipate() &&
                    (solvedProblems.has(problem._id) ? (
                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                          isDark
                            ? "bg-green-900/30 text-green-300"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        <CheckCircle size={18} />
                        Hoàn thành
                      </div>
                    ) : (
                      <Link
                        to={`/problems/${problem.slug}?contest=${contest._id}`}
                        onClick={async (e) => {
                          // Tự động đăng ký nếu chưa đăng ký
                          if (!isRegistered && user) {
                            e.preventDefault();
                            try {
                              await api.post(`/contests/${id}/register`);
                              setIsRegistered(true);
                              // Redirect sau khi đăng ký
                              window.location.href = `/problems/${problem.slug}?contest=${contest._id}`;
                            } catch (error) {
                              if (
                                error.response?.data?.error !==
                                "Already registered"
                              ) {
                                alert(
                                  "Không thể đăng ký: " +
                                    (error.response?.data?.error || "Lỗi")
                                );
                                return;
                              }
                              // Đã đăng ký rồi thì vẫn cho vào
                              window.location.href = `/problems/${problem.slug}?contest=${contest._id}`;
                            }
                          }
                        }}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold transition-colors"
                      >
                        Giải bài
                      </Link>
                    ))}
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`text-center py-8 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <p>Chưa có bài tập nào trong cuộc thi này.</p>
            </div>
          )}
        </div>

        {/* Rules Section */}
        {contest.rules && (
          <div
            className={`rounded-xl shadow-md p-6 mt-6 transition-colors duration-300 border ${
              isDark
                ? "bg-gradient-to-br from-slate-800 to-slate-700/80 border-slate-600/50"
                : "bg-white border-slate-200/50"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-4 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Quy định Cuộc thi
            </h2>
            <div className="prose prose-gray max-w-none">
              <p
                className={`whitespace-pre-wrap ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {contest.rules}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestDetail;
