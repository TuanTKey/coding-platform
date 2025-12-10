import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { authService } from "../../services/auth";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Clock,
  Play,
  Trophy,
  Search,
  Filter,
  Eye,
  Loader,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const AdminContests = () => {
  const { isDark } = useTheme();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchContests();
  }, [filter]);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("status", filter);
      }
      const response = await api.get(`/contests?${params}`);
      setContests(response.data.contests);
    } catch (error) {
      console.error("Error fetching contests:", error);
      alert("Lỗi khi tải cuộc thi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa cuộc thi này?")) {
      return;
    }

    try {
      setDeleting(id);
      await api.delete(`/contests/${id}`);
      setContests(contests.filter((c) => c._id !== id));
      alert("Xóa cuộc thi thành công");
    } catch (error) {
      console.error("Error deleting contest:", error);
      alert("Lỗi khi xóa cuộc thi");
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (contest) => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    if (now < start) {
      return isDark
        ? "bg-blue-500/20 text-blue-300 border border-blue-400/50"
        : "bg-blue-100 text-blue-800 border border-blue-200";
    } else if (now >= start && now <= end) {
      return isDark
        ? "bg-green-500/20 text-green-300 border border-green-400/50"
        : "bg-green-100 text-green-800 border border-green-200";
    } else {
      return isDark
        ? "bg-slate-700/30 text-slate-400 border border-slate-600/50"
        : "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusText = (contest) => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    if (now < start) {
      return "Sắp diễn ra";
    } else if (now >= start && now <= end) {
      return "Đang diễn ra";
    } else {
      return "Đã kết thúc";
    }
  };

  const getStatusIcon = (contest) => {
    const now = new Date();
    const start = new Date(contest.startTime);

    if (now < start) {
      return (
        <Clock
          className={isDark ? "text-blue-400" : "text-blue-500"}
          size={16}
        />
      );
    } else if (now >= start && now <= new Date(contest.endTime)) {
      return (
        <Play
          className={isDark ? "text-green-400" : "text-green-500"}
          size={16}
        />
      );
    } else {
      return (
        <Trophy
          className={isDark ? "text-slate-500" : "text-gray-500"}
          size={16}
        />
      );
    }
  };

  const filteredContests = contests.filter(
    (contest) =>
      contest.title.toLowerCase().includes(search.toLowerCase()) ||
      contest.description.toLowerCase().includes(search.toLowerCase())
  );

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
            Đang tải cuộc thi...
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
              className={`text-5xl font-black mb-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent`}
            >
              Quản lý Cuộc thi
            </h1>
            <p
              className={`text-lg ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {contests.length} cuộc thi
            </p>
          </div>
          <Link
            to="/admin/contests/create"
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
              isDark
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-purple-500/30"
                : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg hover:shadow-purple-500/30"
            }`}
          >
            <Plus size={20} />
            <span>Cuộc thi mới</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div
          className={`rounded-2xl p-6 mb-8 border ${
            isDark
              ? "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-700/50"
              : "bg-gradient-to-br from-white to-slate-50 border-gray-200"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm cuộc thi..."
                className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all border ${
                  isDark
                    ? "bg-slate-700/50 border-slate-600 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                } focus:outline-none`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter
                className={isDark ? "text-gray-400" : "text-gray-500"}
                size={20}
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`px-4 py-3 rounded-xl transition-all border ${
                  isDark
                    ? "bg-slate-700/50 border-slate-600 text-white focus:border-cyan-500"
                    : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                } focus:outline-none focus:ring-2`}
              >
                <option value="all">Tất cả</option>
                <option value="upcoming">Sắp diễn ra</option>
                <option value="running">Đang diễn ra</option>
                <option value="past">Đã kết thúc</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contests Table */}
        <div
          className={`rounded-2xl overflow-hidden border shadow-lg ${
            isDark
              ? "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-700/50"
              : "bg-gradient-to-br from-white to-slate-50 border-gray-200"
          }`}
        >
          {filteredContests.length === 0 ? (
            <div className="text-center py-12">
              <Trophy
                size={48}
                className={`mx-auto mb-4 ${
                  isDark ? "text-gray-600" : "text-gray-300"
                }`}
              />
              <p
                className={`text-lg font-semibold mb-2 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Không có cuộc thi nào
              </p>
              <p
                className={`mb-6 ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                Bắt đầu bằng cách tạo cuộc thi mới
              </p>
              <Link
                to="/admin/contests/create"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  isDark
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500"
                    : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
                }`}
              >
                <Plus size={20} />
                Tạo cuộc thi đầu tiên
              </Link>
            </div>
          ) : (
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
                      Tên cuộc thi
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-sm font-bold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Trạng thái
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-sm font-bold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Thời gian
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-sm font-bold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Bài tập
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-sm font-bold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Tham gia
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
                  {filteredContests.map((contest) => (
                    <tr
                      key={contest._id}
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
                        <div>
                          <div className="font-bold text-lg mb-1 group-hover:text-orange-400 transition">
                            {contest.title}
                          </div>
                          <p
                            className={`text-sm line-clamp-2 ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {contest.description}
                          </p>
                        </div>
                      </td>
                      <td className={`px-6 py-4`}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(contest)}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusColor(
                              contest
                            )}`}
                          >
                            {getStatusText(contest)}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        <div>
                          <div>
                            Bắt đầu:{" "}
                            {format(
                              new Date(contest.startTime),
                              "dd/MM/yyyy HH:mm"
                            )}
                          </div>
                          <div>
                            Kết thúc:{" "}
                            {format(
                              new Date(contest.endTime),
                              "dd/MM/yyyy HH:mm"
                            )}
                          </div>
                          <div
                            className={`text-xs mt-1 ${
                              isDark ? "text-gray-500" : "text-gray-500"
                            }`}
                          >
                            {getStatusText(contest) === "Sắp diễn ra"
                              ? `Bắt đầu ${formatDistanceToNow(
                                  new Date(contest.startTime),
                                  { addSuffix: true }
                                )}`
                              : getStatusText(contest) === "Đang diễn ra"
                              ? `Kết thúc ${formatDistanceToNow(
                                  new Date(contest.endTime),
                                  { addSuffix: true }
                                )}`
                              : "Đã kết thúc"}
                          </div>
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        <span className="font-semibold">
                          {contest.problems?.length || 0}
                        </span>{" "}
                        bài tập
                      </td>
                      <td className={`px-6 py-4`}>
                        <div className="flex items-center gap-1 text-sm">
                          <Users
                            size={16}
                            className={
                              isDark ? "text-gray-500" : "text-gray-500"
                            }
                          />
                          <span
                            className={
                              isDark ? "text-gray-400" : "text-gray-600"
                            }
                          >
                            {contest.participants?.length || 0}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-right`}>
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/contests/${contest._id}`}
                            className={`p-2 rounded-lg transition-all ${
                              isDark
                                ? "hover:bg-blue-500/20 text-blue-400"
                                : "hover:bg-blue-100 text-blue-600"
                            }`}
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            to={`/admin/contests/edit/${contest._id}`}
                            className={`p-2 rounded-lg transition-all ${
                              isDark
                                ? "hover:bg-green-500/20 text-green-400"
                                : "hover:bg-green-100 text-green-600"
                            }`}
                            title="Chỉnh sửa"
                          >
                            <Edit size={18} />
                          </Link>
                          <Link
                            to={`/admin/contests/${contest._id}/leaderboard`}
                            className={`p-2 rounded-lg transition-all ${
                              isDark
                                ? "hover:bg-purple-500/20 text-purple-400"
                                : "hover:bg-purple-100 text-purple-600"
                            }`}
                            title="Bảng xếp hạng"
                          >
                            <Trophy size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(contest._id)}
                            disabled={deleting === contest._id}
                            className={`p-2 rounded-lg transition-all ${
                              deleting === contest._id
                                ? "opacity-50 cursor-not-allowed"
                                : isDark
                                ? "hover:bg-red-500/20 text-red-400"
                                : "hover:bg-red-100 text-red-600"
                            }`}
                            title="Xóa"
                          >
                            {deleting === contest._id ? (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContests;
