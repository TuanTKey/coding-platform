import { useState, useEffect } from "react";
import api from "../../services/api";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Trophy,
  Award,
  BookOpen,
  BarChart3,
  Loader,
  AlertCircle,
} from "lucide-react";

const ScoresBoard = ({ userId }) => {
  const { isDark } = useTheme();
  const [scores, setScores] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest"); // latest, highest, lowest

  useEffect(() => {
    fetchScores();
  }, [userId]);

  const fetchScores = async () => {
    try {
      setLoading(true);
      const response = await api.get("/submissions/my/scores");
      setScores(response.data.scores || []);
      setStats(response.data.statistics);
    } catch (error) {
      console.error("Error fetching scores:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSortedScores = () => {
    const sorted = [...scores];
    switch (sortBy) {
      case "highest":
        return sorted.sort((a, b) => b.score - a.score);
      case "lowest":
        return sorted.sort((a, b) => a.score - b.score);
      case "latest":
      default:
        return sorted.sort((a, b) => new Date(b.scoredAt) - new Date(a.scoredAt));
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "hard":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getDifficultyBg = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return isDark ? "bg-green-900/20" : "bg-green-100";
      case "medium":
        return isDark ? "bg-yellow-900/20" : "bg-yellow-100";
      case "hard":
        return isDark ? "bg-red-900/20" : "bg-red-100";
      default:
        return isDark ? "bg-gray-700" : "bg-gray-100";
    }
  };

  const getScoreColor = (score) => {
    if (score === 100) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const sortedScores = getSortedScores();

  return (
    <div className={`min-h-screen p-4 md:p-8 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            🏆 Bảng Điểm Của Tôi
          </h1>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Xem các bài tập đã được chấm điểm
          </p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className={`rounded-lg p-6 ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Tổng Bài Tập
                  </p>
                  <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {stats.totalSubmissions}
                  </p>
                </div>
                <BookOpen className="text-blue-500" size={32} />
              </div>
            </div>

            <div className={`rounded-lg p-6 ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Tổng Điểm
                  </p>
                  <p className={`text-2xl font-bold text-purple-600`}>
                    {stats.totalScore}
                  </p>
                </div>
                <BarChart3 className="text-purple-500" size={32} />
              </div>
            </div>

            <div className={`rounded-lg p-6 ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Điểm Trung Bình
                  </p>
                  <p className={`text-2xl font-bold text-orange-600`}>
                    {stats.averageScore}
                  </p>
                </div>
                <Award className="text-orange-500" size={32} />
              </div>
            </div>

            <div className={`rounded-lg p-6 ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Điểm Tuyệt Đối
                  </p>
                  <p className={`text-2xl font-bold text-green-600`}>
                    {stats.perfectScores}
                  </p>
                </div>
                <Trophy className="text-green-500" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div className="mb-6">
          <label className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            Sắp xếp theo:
          </label>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setSortBy("latest")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                sortBy === "latest"
                  ? "bg-blue-500 text-white"
                  : isDark
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Mới Nhất
            </button>
            <button
              onClick={() => setSortBy("highest")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                sortBy === "highest"
                  ? "bg-blue-500 text-white"
                  : isDark
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Cao Nhất
            </button>
            <button
              onClick={() => setSortBy("lowest")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                sortBy === "lowest"
                  ? "bg-blue-500 text-white"
                  : isDark
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Thấp Nhất
            </button>
          </div>
        </div>

        {/* Scores Table */}
        <div className={`rounded-lg overflow-hidden shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
          {loading ? (
            <div className={`p-8 text-center ${isDark ? "bg-gray-800" : "bg-white"}`}>
              <Loader className="inline animate-spin mb-2" size={32} />
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>Đang tải điểm...</p>
            </div>
          ) : sortedScores.length === 0 ? (
            <div className={`p-8 text-center ${isDark ? "bg-gray-800" : "bg-white"}`}>
              <AlertCircle className={`inline mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`} size={32} />
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>Chưa có bài tập nào được chấm điểm</p>
            </div>
          ) : (
            <div className={`overflow-x-auto ${isDark ? "bg-gray-800" : "bg-white"}`}>
              <table className="w-full">
                <thead className={`border-b ${isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Bài Tập
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Độ Khó
                    </th>
                    <th className={`px-6 py-3 text-center text-xs font-medium uppercase ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Điểm
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Ghi Chú
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Ngày Chấm
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedScores.map((submission) => (
                    <tr key={submission._id} className={`border-b ${isDark ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"}`}>
                      <td className={`px-6 py-4 text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                        <div>
                          <p className="font-medium">{submission.problemId?.title || "Unknown"}</p>
                          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            {submission.problemId?.slug || "-"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getDifficultyBg(submission.problemId?.difficulty)} ${getDifficultyColor(submission.problemId?.difficulty)}`}>
                          {submission.problemId?.difficulty || "unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`text-lg font-bold ${getScoreColor(submission.score)}`}>
                          {submission.score}/100
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {submission.scoreNote || "-"}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {new Date(submission.scoredAt).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoresBoard;
