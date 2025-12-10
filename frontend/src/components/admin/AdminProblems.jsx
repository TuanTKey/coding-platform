import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { authService } from "../../services/auth";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  FileCode,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";

const AdminProblems = () => {
  const { isDark } = useTheme();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, [search]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params = search ? `?search=${search}` : "";
      const response = await api.get(`/problems${params}`);
      setProblems(response.data.problems);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài tập này?")) {
      return;
    }

    try {
      setDeleting(id);
      await api.delete(`/problems/${id}`);
      setProblems(problems.filter((p) => p._id !== id));
      alert("Xóa bài tập thành công");
    } catch (error) {
      console.error("Error deleting problem:", error);
      alert("Lỗi khi xóa bài tập");
    } finally {
      setDeleting(null);
    }
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === "easy" || difficulty === "Easy")
      return isDark
        ? "bg-green-500/20 text-green-300 border border-green-400/50"
        : "bg-green-100 text-green-700 border border-green-300";
    if (difficulty === "medium" || difficulty === "Medium")
      return isDark
        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-400/50"
        : "bg-yellow-100 text-yellow-700 border border-yellow-300";
    return isDark
      ? "bg-red-500/20 text-red-300 border border-red-400/50"
      : "bg-red-100 text-red-700 border border-red-300";
  };

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center h-screen ${
          isDark ? "bg-slate-900" : "bg-gray-50"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader
            className={`animate-spin ${
              isDark ? "text-cyan-400" : "text-blue-500"
            }`}
            size={40}
          />
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            Đang tải bài tập...
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
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1
              className={`text-5xl font-black mb-2 bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent`}
            >
              Quản lý Bài tập
            </h1>
            <p
              className={`text-lg ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {problems.length} bài tập
            </p>
          </div>
          <Link
            to="/admin/problems/create"
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
              isDark
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-purple-500/30"
                : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg hover:shadow-purple-500/30"
            }`}
          >
            <Plus size={20} />
            <span>Tạo bài tập</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div
          className={`rounded-2xl p-6 mb-8 border transition-all ${
            isDark
              ? "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-700/50"
              : "bg-gradient-to-br from-white to-slate-50 border-gray-200"
          }`}
        >
          <div className="relative">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`}
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm bài tập..."
              className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all border ${
                isDark
                  ? "bg-slate-700/50 border-slate-600 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              } focus:outline-none`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Problems Grid / Table */}
        {problems.length > 0 ? (
          <div
            className={`rounded-2xl overflow-hidden border ${
              isDark
                ? "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-700/50"
                : "bg-gradient-to-br from-white to-slate-50 border-gray-200"
            } shadow-lg`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead
                  className={`border-b ${
                    isDark
                      ? "border-slate-700/50 bg-slate-800/50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <tr>
                    <th
                      className={`px-6 py-4 text-left text-sm font-bold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileCode size={16} />
                        Tên bài tập
                      </div>
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-sm font-bold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">Độ khó</div>
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-sm font-bold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        Lần nộp
                      </div>
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-sm font-bold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} />
                        Tỷ lệ AC
                      </div>
                    </th>
                    <th
                      className={`px-6 py-4 text-right text-sm font-bold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDark ? "divide-slate-700/50" : "divide-gray-200"
                  }`}
                >
                  {problems.map((problem) => (
                    <tr
                      key={problem._id}
                      className={`transition-all ${
                        isDark
                          ? "hover:bg-slate-700/30"
                          : "hover:bg-gray-100/50"
                      } group`}
                    >
                      <td
                        className={`px-6 py-4 ${
                          isDark ? "text-gray-300" : "text-gray-900"
                        }`}
                      >
                        <Link
                          to={`/problems/${problem.slug}`}
                          className={`font-semibold transition-colors group-hover:text-cyan-400 ${
                            isDark
                              ? "hover:text-cyan-400"
                              : "hover:text-blue-600 text-gray-800"
                          }`}
                        >
                          {problem.title}
                        </Link>
                      </td>
                      <td className={`px-6 py-4`}>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getDifficultyColor(
                            problem.difficulty
                          )}`}
                        >
                          {problem.difficulty.toUpperCase()}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <TrendingUp
                            size={14}
                            className={
                              isDark ? "text-cyan-400" : "text-blue-500"
                            }
                          />
                          <span className="font-semibold">
                            {problem.submissionCount || 0}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4`}>
                        <div className="flex items-center gap-2">
                          {problem.submissionCount > 0 ? (
                            <>
                              <CheckCircle
                                size={14}
                                className="text-green-500"
                              />
                              <span
                                className={`font-bold ${
                                  isDark ? "text-green-400" : "text-green-600"
                                }`}
                              >
                                {(
                                  (problem.acceptedCount /
                                    problem.submissionCount) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </>
                          ) : (
                            <span
                              className={
                                isDark ? "text-gray-500" : "text-gray-400"
                              }
                            >
                              -
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-right`}>
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            to={`/admin/problems/edit/${problem._id}`}
                            className={`p-2 rounded-lg transition-all ${
                              isDark
                                ? "hover:bg-blue-500/20 text-blue-400"
                                : "hover:bg-blue-100 text-blue-600"
                            }`}
                            title="Chỉnh sửa"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(problem._id)}
                            disabled={deleting === problem._id}
                            className={`p-2 rounded-lg transition-all ${
                              deleting === problem._id
                                ? "opacity-50 cursor-not-allowed"
                                : isDark
                                ? "hover:bg-red-500/20 text-red-400"
                                : "hover:bg-red-100 text-red-600"
                            }`}
                            title="Xóa"
                          >
                            {deleting === problem._id ? (
                              <Loader size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-2xl p-12 border text-center ${
              isDark
                ? "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-700/50"
                : "bg-gradient-to-br from-white to-slate-50 border-gray-200"
            }`}
          >
            <FileCode
              className={`mx-auto mb-4 ${
                isDark ? "text-gray-600" : "text-gray-300"
              }`}
              size={48}
            />
            <p
              className={`text-lg font-semibold mb-2 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Chưa có bài tập nào
            </p>
            <p className={`mb-6 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
              Bắt đầu bằng cách tạo bài tập mới
            </p>
            <Link
              to="/admin/problems/create"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                isDark
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500"
                  : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
              }`}
            >
              <Plus size={20} />
              Tạo bài tập mới
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProblems;
