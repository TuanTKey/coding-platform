import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "./AuthContext";
import {
  Eye,
  Filter,
  Code,
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  Search,
  RefreshCw,
  FileText,
  Trophy,
  Loader,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "../../contexts/ThemeContext";

const AdminSubmissions = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedProblem, setSelectedProblem] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    fetchSubmissions();
    fetchClasses();
    fetchProblems();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, selectedClass, selectedProblem, searchTerm]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      let response;
      
      // If user is teacher, use /my endpoint instead of admin
      if (user?.role === 'teacher') {
        response = await api.get("/submissions/my?limit=200");
      } else {
        response = await api.get("/submissions/admin/all?limit=200");
      }
      
      // Lấy tất cả bài nộp (không filter theo status)
      const allSubmissions = response.data.submissions || [];
      setSubmissions(allSubmissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      alert("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get("/users/classes/all");
      setClasses([
        { id: "all", name: "Tất cả lớp" },
        ...response.data.classes.map((cls) => ({
          id: cls,
          name: cls,
        })),
      ]);
    } catch (error) {
      console.error("Error fetching classes:", error);
      // Fallback classes
      setClasses([
        { id: "all", name: "Tất cả lớp" },
        { id: "10A1", name: "10A1" },
        { id: "10A2", name: "10A2" },
        { id: "11A1", name: "11A1" },
        { id: "11A2", name: "11A2" },
        { id: "12A1", name: "12A1" },
      ]);
    }
  };

  const fetchProblems = async () => {
    try {
      const response = await api.get("/problems?limit=100");
      setProblems([
        { id: "all", title: "Tất cả bài tập" },
        ...(response.data.problems || []),
      ]);
    } catch (error) {
      console.error("Error fetching problems:", error);
    }
  };

  const filterSubmissions = () => {
    let filtered = submissions;

    // Lọc theo lớp
    if (selectedClass !== "all") {
      filtered = filtered.filter((sub) => {
        return sub.userId?.class === selectedClass;
      });
    }

    // Lọc theo bài tập
    if (selectedProblem !== "all") {
      filtered = filtered.filter(
        (sub) => sub.problemId?._id === selectedProblem
      );
    }

    // Lọc theo tên người dùng
    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.userId?.username
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          sub.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSubmissions(filtered);
  };

  const getStatusColor = (status) => {
    return "bg-green-100 text-green-800 border border-green-200";
  };

  const getStatusIcon = (status) => {
    return <CheckCircle className="text-green-500" size={16} />;
  };

  const getStatusText = (status) => {
    return "HOÀN THÀNH";
  };

  const viewSubmission = async (submissionId) => {
    try {
      const response = await api.get(`/submissions/${submissionId}`);
      setSelectedSubmission(response.data.submission);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching submission details:", error);
      alert("Failed to load submission details");
    }
  };

  const exportToExcel = () => {
    // Tạo dữ liệu Excel
    const data = filteredSubmissions.map((sub) => ({
      "Học sinh": sub.userId?.username,
      Lớp: sub.userId?.class,
      "Bài tập": sub.problemId?.title,
      "Ngôn ngữ": sub.language,
      "Thời gian": `${sub.executionTime}ms`,
      "Thời gian nộp": new Date(sub.createdAt).toLocaleString("vi-VN"),
    }));

    // Tạo CSV
    const headers = [
      "Học sinh",
      "Lớp",
      "Bài tập",
      "Ngôn ngữ",
      "Thời gian",
      "Thời gian nộp",
    ];
    const csvContent = [
      headers.join(","),
      ...data.map((row) => Object.values(row).join(",")),
    ].join("\n");

    // Tạo file download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `bai_nop_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1
              className={`text-5xl font-black mb-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent`}
            >
              Quản lý Bài Nộp
            </h1>
            <p
              className={`text-lg font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {filteredSubmissions.length} bài nộp thành công •{" "}
              {new Set(filteredSubmissions.map((s) => s.userId?._id)).size} học
              sinh
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToExcel}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                isDark
                  ? "bg-green-600/20 text-green-400 hover:bg-green-600/40 border border-green-500/30"
                  : "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
              }`}
            >
              <span>Xuất Excel</span>
            </button>
            <button
              onClick={fetchSubmissions}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                isDark
                  ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 border border-blue-500/30"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300"
              }`}
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className={`rounded-2xl p-2 mb-6 flex gap-2 border ${
            isDark
              ? "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-700/50"
              : "bg-gradient-to-br from-white to-slate-50 border-gray-200"
          }`}
        >
          <Link
            to="/admin/submissions"
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
              isDark
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
            }`}
          >
            <CheckCircle size={20} />
            <span>Tất cả</span>
          </Link>
          <Link
            to="/admin/submissions/problems"
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
              isDark
                ? "bg-slate-700/50 text-gray-300 hover:bg-slate-600/50 border border-slate-600/50"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <FileText size={20} />
            <span>Bài Tập</span>
          </Link>
          <Link
            to="/admin/submissions/contests"
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
              isDark
                ? "bg-slate-700/50 text-gray-300 hover:bg-slate-600/50 border border-slate-600/50"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <Trophy size={20} />
            <span>Bài Thi</span>
          </Link>
        </div>

        {/* Filters */}
        <div
          className={`rounded-2xl p-6 mb-6 border ${
            isDark
              ? "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-700/50"
              : "bg-gradient-to-br from-white to-slate-50 border-gray-200"
          }`}
        >
          <div className="grid md:grid-cols-4 gap-4">
            {/* Lọc theo lớp */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Users
                  size={16}
                  className={isDark ? "text-blue-400" : "text-blue-600"}
                />
                Lớp học
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg font-medium transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? "bg-slate-700/50 border-slate-600/50 text-white focus:ring-blue-500"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                }`}
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Lọc theo bài tập */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <BookOpen
                  size={16}
                  className={isDark ? "text-purple-400" : "text-purple-600"}
                />
                Bài tập
              </label>
              <select
                value={selectedProblem}
                onChange={(e) => setSelectedProblem(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg font-medium transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? "bg-slate-700/50 border-slate-600/50 text-white focus:ring-purple-500"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-purple-500"
                }`}
              >
                {problems.map((problem) => (
                  <option key={problem.id} value={problem._id || problem.id}>
                    {problem.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Tìm kiếm học sinh */}
            <div className="md:col-span-2">
              <label
                className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Search
                  size={16}
                  className={isDark ? "text-cyan-400" : "text-cyan-600"}
                />
                Tìm học sinh
              </label>
              <input
                type="text"
                placeholder="Nhập tên học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg font-medium transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-500 focus:ring-cyan-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-cyan-500"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div
            className={`rounded-2xl p-6 border text-center transition-all ${
              isDark
                ? "bg-gradient-to-br from-blue-600/20 to-blue-500/10 border-blue-500/30"
                : "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
            }`}
          >
            <div
              className={`text-3xl font-bold mb-2 ${
                isDark ? "text-blue-400" : "text-blue-600"
              }`}
            >
              {filteredSubmissions.length}
            </div>
            <div
              className={`text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Bài nộp
            </div>
          </div>
          <div
            className={`rounded-2xl p-6 border text-center transition-all ${
              isDark
                ? "bg-gradient-to-br from-green-600/20 to-green-500/10 border-green-500/30"
                : "bg-gradient-to-br from-green-50 to-green-100 border-green-200"
            }`}
          >
            <div
              className={`text-3xl font-bold mb-2 ${
                isDark ? "text-green-400" : "text-green-600"
              }`}
            >
              {new Set(filteredSubmissions.map((s) => s.userId?._id)).size}
            </div>
            <div
              className={`text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Học sinh
            </div>
          </div>
          <div
            className={`rounded-2xl p-6 border text-center transition-all ${
              isDark
                ? "bg-gradient-to-br from-purple-600/20 to-purple-500/10 border-purple-500/30"
                : "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
            }`}
          >
            <div
              className={`text-3xl font-bold mb-2 ${
                isDark ? "text-purple-400" : "text-purple-600"
              }`}
            >
              {new Set(filteredSubmissions.map((s) => s.problemId?._id)).size}
            </div>
            <div
              className={`text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Bài tập
            </div>
          </div>
          <div
            className={`rounded-2xl p-6 border text-center transition-all ${
              isDark
                ? "bg-gradient-to-br from-orange-600/20 to-orange-500/10 border-orange-500/30"
                : "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
            }`}
          >
            <div
              className={`text-3xl font-bold mb-2 ${
                isDark ? "text-orange-400" : "text-orange-600"
              }`}
            >
              {new Set(filteredSubmissions.map((s) => s.userId?.class)).size}
            </div>
            <div
              className={`text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Lớp học
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div
          className={`rounded-2xl border overflow-hidden ${
            isDark
              ? "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-700/50"
              : "bg-gradient-to-br from-white to-slate-50 border-gray-200"
          }`}
        >
          {filteredSubmissions.length === 0 ? (
            <div
              className={`text-center py-16 ${
                isDark ? "bg-slate-800/50" : "bg-white"
              }`}
            >
              <CheckCircle
                size={48}
                className={`mx-auto mb-4 ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <p
                className={`text-lg font-medium ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Không có bài nộp thành công nào
              </p>
              <p
                className={`text-sm mt-2 ${
                  isDark ? "text-gray-500" : "text-gray-500"
                }`}
              >
                Thử thay đổi bộ lọc để xem kết quả khác
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead
                  className={`border-b ${
                    isDark
                      ? "bg-slate-700/30 border-slate-700/50"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <tr>
                    <th
                      className={`px-6 py-4 text-left text-sm font-semibold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Học sinh
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-sm font-semibold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Lớp
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-sm font-semibold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Bài tập
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-sm font-semibold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Ngôn ngữ
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-sm font-semibold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Trạng thái
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-sm font-semibold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Thời gian
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-sm font-semibold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Thời gian nộp
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-sm font-semibold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDark ? "divide-slate-700/30" : "divide-gray-200"
                  }`}
                >
                  {filteredSubmissions.map((submission) => (
                    <tr
                      key={submission._id}
                      className={`transition-colors ${
                        isDark ? "hover:bg-slate-700/20" : "hover:bg-gray-50"
                      }`}
                    >
                      <td
                        className={`px-6 py-4 ${
                          isDark ? "text-gray-300" : "text-gray-900"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {submission.userId?.username?.[0]?.toUpperCase() ||
                              "H"}
                          </div>
                          <div>
                            <div
                              className={`font-semibold ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {submission.userId?.username || "Unknown"}
                            </div>
                            <div
                              className={`text-xs ${
                                isDark ? "text-gray-500" : "text-gray-500"
                              }`}
                            >
                              {submission.userId?.fullName || ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4`}>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            isDark
                              ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                              : "bg-blue-100 text-blue-800 border-blue-200"
                          }`}
                        >
                          {submission.userId?.class || "N/A"}
                        </span>
                      </td>
                      <td className={`px-6 py-4`}>
                        <Link
                          to={`/problems/${submission.problemId?.slug}`}
                          className={`font-medium block ${
                            isDark
                              ? "text-purple-400 hover:text-purple-300"
                              : "text-purple-600 hover:text-purple-800"
                          }`}
                        >
                          {submission.problemId?.title || "Unknown Problem"}
                        </Link>
                        <div
                          className={`text-xs mt-1 ${
                            isDark ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          Độ khó:{" "}
                          <span
                            className={`font-semibold ${
                              submission.problemId?.difficulty === "easy"
                                ? isDark
                                  ? "text-green-400"
                                  : "text-green-600"
                                : submission.problemId?.difficulty === "medium"
                                ? isDark
                                  ? "text-yellow-400"
                                  : "text-yellow-600"
                                : isDark
                                ? "text-red-400"
                                : "text-red-600"
                            }`}
                          >
                            {submission.problemId?.difficulty?.toUpperCase() ||
                              "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4`}>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            isDark
                              ? "bg-gray-700/50 text-gray-300 border-gray-600/50"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          {submission.language?.toUpperCase() || "N/A"}
                        </span>
                      </td>
                      <td className={`px-6 py-4`}>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(submission.status)}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              isDark
                                ? "bg-green-600/20 text-green-400 border border-green-500/30"
                                : "bg-green-100 text-green-800 border border-green-200"
                            }`}
                          >
                            {getStatusText(submission.status)}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 font-semibold ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {submission.executionTime
                          ? `${submission.executionTime}ms`
                          : "N/A"}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {formatDistanceToNow(new Date(submission.createdAt), {
                          addSuffix: true,
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => viewSubmission(submission._id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                            isDark
                              ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 border border-blue-500/30"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300"
                          }`}
                        >
                          <Eye size={14} />
                          <span>Xem code</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Submission Detail Modal */}
        {showModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div
              className={`rounded-2xl shadow-2xl max-w-4xl w-full max-h-96 overflow-y-auto border ${
                isDark
                  ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700"
                  : "bg-gradient-to-br from-white to-slate-50 border-gray-200"
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Chi tiết bài nộp
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className={`text-2xl font-bold transition-colors ${
                      isDark
                        ? "text-gray-500 hover:text-gray-400"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    ✕
                  </button>
                </div>

                {/* Submission Info */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div
                    className={`p-4 rounded-lg border ${
                      isDark
                        ? "bg-slate-700/30 border-slate-600/50"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <h3
                      className={`font-semibold mb-3 ${
                        isDark ? "text-gray-300" : "text-gray-800"
                      }`}
                    >
                      Thông tin học sinh
                    </h3>
                    <div
                      className={`space-y-2 text-sm ${
                        isDark ? "text-gray-400" : "text-gray-700"
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>Học sinh:</span>
                        <span className="font-semibold">
                          {selectedSubmission.userId?.username}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lớp:</span>
                        <span className="font-semibold">
                          {selectedSubmission.userId?.class}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bài tập:</span>
                        <span className="font-semibold">
                          {selectedSubmission.problemId?.title}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg border ${
                      isDark
                        ? "bg-slate-700/30 border-slate-600/50"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <h3
                      className={`font-semibold mb-3 ${
                        isDark ? "text-gray-300" : "text-gray-800"
                      }`}
                    >
                      Thông tin chấm điểm
                    </h3>
                    <div
                      className={`space-y-2 text-sm ${
                        isDark ? "text-gray-400" : "text-gray-700"
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>Ngôn ngữ:</span>
                        <span className="font-semibold">
                          {selectedSubmission.language?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Thời gian:</span>
                        <span className="font-semibold">
                          {selectedSubmission.executionTime || 0}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Test cases:</span>
                        <span className="font-semibold">
                          {selectedSubmission.testCasesPassed || 0}/
                          {selectedSubmission.totalTestCases || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Code Section */}
                <div
                  className={`rounded-lg border p-4 ${
                    isDark
                      ? "bg-slate-700/30 border-slate-600/50"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <h3
                    className={`font-semibold mb-3 flex items-center gap-2 ${
                      isDark ? "text-gray-300" : "text-gray-800"
                    }`}
                  >
                    <Code
                      size={18}
                      className={isDark ? "text-cyan-400" : "text-cyan-600"}
                    />
                    Code
                  </h3>
                  <pre
                    className={`p-4 rounded-lg overflow-auto text-sm font-mono ${
                      isDark
                        ? "bg-slate-900 text-gray-300 border border-slate-700"
                        : "bg-white text-gray-800 border border-gray-300"
                    }`}
                  >
                    {selectedSubmission.code}
                  </pre>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                      isDark
                        ? "bg-slate-700 text-gray-300 hover:bg-slate-600 border border-slate-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300"
                    }`}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubmissions;
