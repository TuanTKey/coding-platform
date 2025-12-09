import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useTheme } from "../contexts/ThemeContext";
import { Search, Filter, Code2, BookOpen } from "lucide-react";

const Problems = () => {
  const { isDark } = useTheme();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: "",
    search: "",
    tags: "",
  });

  useEffect(() => {
    fetchProblems();
  }, [filters]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.difficulty) params.append("difficulty", filters.difficulty);
      if (filters.search) params.append("search", filters.search);
      if (filters.tags) params.append("tags", filters.tags);

      const response = await api.get(`/problems?${params.toString()}`);
      setProblems(response.data.problems);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return isDark
          ? "text-green-300 bg-green-500/20 border border-green-400/50"
          : "text-green-700 bg-green-50 border border-green-200";
      case "medium":
        return isDark
          ? "text-yellow-300 bg-yellow-500/20 border border-yellow-400/50"
          : "text-yellow-700 bg-yellow-50 border border-yellow-200";
      case "hard":
        return isDark
          ? "text-red-300 bg-red-500/20 border border-red-400/50"
          : "text-red-700 bg-red-50 border border-red-200";
      default:
        return isDark
          ? "text-gray-300 bg-gray-500/20 border border-gray-400/50"
          : "text-gray-700 bg-gray-50 border border-gray-200";
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`p-3 rounded-2xl ${
                isDark
                  ? "bg-gradient-to-br from-cyan-500/40 to-blue-600/40"
                  : "bg-gradient-to-br from-cyan-400/40 to-blue-500/40"
              }`}
            >
              <BookOpen
                className={`w-8 h-8 ${
                  isDark ? "text-cyan-300" : "text-cyan-600"
                }`}
              />
            </div>
            <div>
              <h1
                className={`text-5xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Bài tập Lập trình
              </h1>
              <p
                className={`mt-2 text-lg ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Rèn luyện kỹ năng lập trình với hàng ngàn bài tập đa dạng
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          className={`rounded-2xl p-8 backdrop-blur shadow-2xl transition-all duration-300 border mb-8 ${
            isDark
              ? "bg-gradient-to-br from-slate-800 to-slate-700/50 border-slate-600/50"
              : "bg-gradient-to-br from-white to-slate-50 border-slate-200/50"
          }`}
        >
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search
                className={`absolute left-3 top-3.5 ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm bài tập..."
                className={`w-full rounded-lg px-4 pl-12 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-200 ${
                  isDark
                    ? "bg-slate-700/50 border border-slate-600/50 text-white placeholder-gray-500 hover:border-slate-600"
                    : "bg-slate-100/50 border border-slate-300/50 text-gray-900 placeholder-gray-600 hover:border-slate-300"
                }`}
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>

            <select
              className={`rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-200 ${
                isDark
                  ? "bg-slate-700/50 border border-slate-600/50 text-white hover:border-slate-600"
                  : "bg-slate-100/50 border border-slate-300/50 text-gray-900 hover:border-slate-300"
              }`}
              value={filters.difficulty}
              onChange={(e) =>
                setFilters({ ...filters, difficulty: e.target.value })
              }
            >
              <option value="">Tất cả độ khó</option>
              <option value="Easy">Dễ</option>
              <option value="Medium">Trung bình</option>
              <option value="Hard">Khó</option>
            </select>

            <input
              type="text"
              placeholder="Lọc theo tag (cách nhau bởi dấu phẩy)"
              className={`rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-200 ${
                isDark
                  ? "bg-slate-700/50 border border-slate-600/50 text-white placeholder-gray-500 hover:border-slate-600"
                  : "bg-slate-100/50 border border-slate-300/50 text-gray-900 placeholder-gray-600 hover:border-slate-300"
              }`}
              value={filters.tags}
              onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
            />
          </div>
        </div>

        {/* Problems List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div
              className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
                isDark ? "border-cyan-500" : "border-cyan-600"
              }`}
            ></div>
          </div>
        ) : (
          <div className="space-y-4">
            {problems.length === 0 ? (
              <div
                className={`rounded-2xl text-center py-16 backdrop-blur transition-colors duration-300 border ${
                  isDark
                    ? "bg-slate-800/30 border-slate-600/50"
                    : "bg-slate-50/50 border-slate-200/50"
                }`}
              >
                <Code2
                  className={`mx-auto mb-4 ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                  size={48}
                />
                <p
                  className={`text-lg ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Không tìm thấy bài tập phù hợp
                </p>
              </div>
            ) : (
              problems.map((problem) => (
                <Link
                  key={problem._id}
                  to={`/problems/${problem.slug}`}
                  className={`rounded-2xl p-6 backdrop-blur shadow-lg hover:shadow-2xl transition-all duration-300 block border group ${
                    isDark
                      ? "bg-gradient-to-br from-slate-800 to-slate-800/50 hover:from-slate-800/80 hover:to-slate-700/50 border-slate-600/50 hover:border-slate-500/50"
                      : "bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-white border-slate-200/50 hover:border-slate-300/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                          isDark
                            ? "text-white group-hover:text-cyan-300"
                            : "text-gray-900 group-hover:text-cyan-600"
                        }`}
                      >
                        {problem.title}
                      </h3>
                      <p
                        className={`line-clamp-2 mb-4 ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {problem.description?.substring(0, 150)}...
                      </p>
                      <div className="flex items-center space-x-3 flex-wrap gap-2">
                        <span
                          className={`px-4 py-1 rounded-full text-xs font-bold ${getDifficultyColor(
                            problem.difficulty
                          )}`}
                        >
                          {problem.difficulty.toUpperCase()}
                        </span>
                        {problem.tags?.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                              isDark
                                ? "bg-blue-500/20 text-blue-300 border border-blue-400/50"
                                : "bg-blue-100/50 text-blue-700 border border-blue-200/50"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div
                      className={`text-right ml-6 whitespace-nowrap ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <div className="text-sm font-semibold">
                        {problem.submissionCount > 0
                          ? (
                              (problem.acceptedCount /
                                problem.submissionCount) *
                              100
                            ).toFixed(1)
                          : 0}
                        % AC
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          isDark ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        {problem.submissionCount} bài nộp
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Problems;
