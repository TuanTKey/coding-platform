import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  Users,
  BookOpen,
  CheckCircle,
  TrendingUp,
  Search,
  School,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  AlertCircle,
  Loader,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const AdminClasses = () => {
  const { isDark } = useTheme();
  const [classes, setClasses] = useState([]);
  const [classStats, setClassStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    teacherId: "",
  });
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError("");
      const classesRes = await api.get("/admin/classes");
      const classesList = (classesRes.data.classes || [])
        .map((c) => c.name)
        .filter(Boolean)
        .sort();
      const statsFromApi = classesRes.data.stats || {};

      const stats = {};
      classesList.forEach((className) => {
        const s = statsFromApi[className] || {};
        const acceptanceRate =
          s.totalSubmissions && s.totalSubmissions > 0
            ? (
                ((s.acceptedSubmissions || 0) / s.totalSubmissions) *
                100
              ).toFixed(1)
            : 0;
        stats[className] = {
          totalSubmissions: s.totalSubmissions || 0,
          acceptedSubmissions: s.acceptedSubmissions || 0,
          uniqueStudents: s.uniqueStudents || 0,
          acceptanceRate: acceptanceRate,
          solvedProblems: s.solvedProblems || 0,
        };
      });

      setClasses(classesRes.data.classes || []);
      setClassStats(stats);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setError("Không thể tải danh sách lớp học");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get("/users/admin/teachers");
      setTeachers(response.data.teachers || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setTeachers([]);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError("");
      const payload = { ...formData, name: (formData.name || "").trim() };
      const response = await api.post("/admin/classes", payload);
      setShowCreateModal(false);
      setFormData({ name: "", description: "", teacherId: "" });
      fetchClasses();
    } catch (error) {
      console.error("Error creating class:", error);
      const msg =
        error.response?.data?.error || error.message || "Không thể tạo lớp";
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError("");
      const payload = { ...formData, name: (formData.name || "").trim() };
      await api.post("/admin/classes", payload);
      setShowEditModal(false);
      setFormData({ name: "", description: "", teacherId: "" });
      fetchClasses();
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.message ||
        "Không thể cập nhật lớp";
      setError(msg);
      alert(error.response?.data?.error || "Không thể cập nhật lớp");
      setCreating(false);
    }
  };

  const handleDeleteClass = async (className) => {
    if (!window.confirm(`Bạn có chắc muốn xóa lớp ${className}?`)) {
      return;
    }

    try {
      await api.delete(`/admin/classes/${className}`);
      alert("Xóa lớp thành công!");
      fetchClasses();
    } catch (error) {
      console.error("Error deleting class:", error);
      alert(error.response?.data?.error || "Không thể xóa lớp");
    }
  };

  const openEditModal = (className) => {
    setSelectedClass(className);
    const cls = classes.find((c) => c.name === className) || {};
    setFormData({
      name: className,
      description: cls.description || "",
      teacherId: cls.teacherId || "",
    });
    setShowEditModal(true);
  };

  const filteredClasses = classes.filter((c) => {
    const className = c?.name;
    if (!className || typeof className !== "string") return false;
    return className.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
            <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Quản lý Lớp học
            </h1>
            <p
              className={`text-lg font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {classes.length} lớp học trong hệ thống
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              isDark
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-purple-500/30"
                : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg hover:shadow-purple-500/30"
            }`}
          >
            <Plus size={20} />
            <span>Thêm Lớp</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className={`rounded-2xl p-4 mb-6 border flex items-center gap-2 ${
              isDark
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Search Bar */}
        <div
          className={`rounded-2xl p-4 mb-6 border ${
            isDark
              ? "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-700/50"
              : "bg-gradient-to-br from-white to-slate-50 border-gray-200"
          }`}
        >
          <div className="relative">
            <Search
              className={`absolute left-4 top-3.5 ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`}
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm lớp học..."
              className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-500 focus:ring-cyan-500"
                  : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-blue-500"
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredClasses.map((cl) => {
            const className = cl.name;
            const stats = classStats[className] || {
              totalSubmissions: 0,
              acceptedSubmissions: 0,
              uniqueStudents: 0,
              acceptanceRate: 0,
              solvedProblems: 0,
            };

            return (
              <div
                key={className}
                className={`rounded-2xl p-6 border transition-all duration-300 hover:scale-105 ${
                  isDark
                    ? "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-700/50 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20"
                    : "bg-gradient-to-br from-white to-slate-50 border-gray-200 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-400/20"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <School className="text-white" size={24} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(className)}
                      className={`p-2 rounded-lg transition-all ${
                        isDark
                          ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/40"
                          : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                      }`}
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(className)}
                      className={`p-2 rounded-lg transition-all ${
                        isDark
                          ? "bg-red-600/20 text-red-400 hover:bg-red-600/40"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                      }`}
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <h3
                    className={`text-2xl font-bold mb-1 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {className}
                  </h3>
                  {cl.description && (
                    <p
                      className={`text-sm mb-2 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {cl.description}
                    </p>
                  )}
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-500" : "text-gray-600"
                    }`}
                  >
                    Giáo viên:{" "}
                    {cl.teacherId
                      ? teachers.find((t) => t._id === cl.teacherId)
                          ?.fullName ||
                        teachers.find((t) => t._id === cl.teacherId)
                          ?.username ||
                        "Chưa có"
                      : "Chưa có"}
                  </p>
                </div>

                <div
                  className={`space-y-3 py-4 border-t border-b ${
                    isDark ? "border-slate-700/30" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium flex items-center gap-2 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <Users
                        size={16}
                        className={isDark ? "text-blue-400" : "text-blue-600"}
                      />
                      Học sinh:
                    </span>
                    <span
                      className={`font-bold text-lg ${
                        isDark ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      {stats.uniqueStudents}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium flex items-center gap-2 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <BookOpen
                        size={16}
                        className={
                          isDark ? "text-orange-400" : "text-orange-600"
                        }
                      />
                      Bài nộp:
                    </span>
                    <span
                      className={`font-bold text-lg ${
                        isDark ? "text-orange-400" : "text-orange-600"
                      }`}
                    >
                      {stats.totalSubmissions}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium flex items-center gap-2 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <CheckCircle
                        size={16}
                        className={isDark ? "text-green-400" : "text-green-600"}
                      />
                      Bài đạt:
                    </span>
                    <span
                      className={`font-bold text-lg ${
                        isDark ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      {stats.acceptedSubmissions}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium flex items-center gap-2 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <TrendingUp
                        size={16}
                        className={
                          isDark ? "text-purple-400" : "text-purple-600"
                        }
                      />
                      Tỉ lệ đạt:
                    </span>
                    <span
                      className={`font-bold text-lg ${
                        isDark ? "text-purple-400" : "text-purple-600"
                      }`}
                    >
                      {stats.acceptanceRate}%
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4">
                  <Link
                    to={`/admin/class/${className}`}
                    className={`block w-full py-2.5 rounded-xl text-center font-semibold transition-all ${
                      isDark
                        ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/40"
                        : "bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200"
                    }`}
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filteredClasses.length === 0 && (
          <div
            className={`text-center py-16 rounded-2xl border ${
              isDark
                ? "bg-slate-800/30 border-slate-700/50"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <School
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
              {classes.length === 0
                ? "Không có lớp học nào trong hệ thống"
                : "Không tìm thấy lớp học nào"}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className={`mt-4 px-6 py-3 rounded-xl font-semibold transition-all ${
                isDark
                  ? "bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 border border-indigo-500/30"
                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-300"
              }`}
            >
              Tạo lớp đầu tiên
            </button>
          </div>
        )}

        {/* Create Class Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div
              className={`rounded-2xl shadow-2xl max-w-md w-full border ${
                isDark
                  ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700"
                  : "bg-gradient-to-br from-white to-slate-50 border-gray-200"
              }`}
            >
              <div className="p-6">
                <h2
                  className={`text-2xl font-bold mb-4 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Thêm Lớp Mới
                </h2>

                <form onSubmit={handleCreateClass} className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Tên lớp *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      placeholder="Ví dụ: 10A1"
                      className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                        isDark
                          ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-500 focus:ring-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-purple-500"
                      }`}
                    />
                    <p
                      className={`text-xs mt-1 ${
                        isDark ? "text-gray-500" : "text-gray-600"
                      }`}
                    >
                      Tên lớp sẽ được chuẩn hóa (VIẾT HOA) trên server.
                    </p>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Mô tả
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                        isDark
                          ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-500 focus:ring-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-purple-500"
                      }`}
                      placeholder="Mô tả về lớp học..."
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Giáo viên chủ nhiệm
                    </label>
                    <select
                      value={formData.teacherId}
                      onChange={(e) =>
                        setFormData({ ...formData, teacherId: e.target.value })
                      }
                      className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                        isDark
                          ? "bg-slate-700/50 border-slate-600/50 text-white focus:ring-purple-500"
                          : "bg-white border-gray-300 text-gray-900 focus:ring-purple-500"
                      }`}
                    >
                      <option value="">Chọn giáo viên</option>
                      {teachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.fullName || teacher.username} (
                          {teacher.username})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                        isDark
                          ? "border border-slate-600 text-gray-300 hover:bg-slate-700/50"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className={`px-6 py-2 rounded-lg font-semibold text-white transition-all ${
                        creating
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                      }`}
                    >
                      {creating ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          <span>Đang tạo...</span>
                        </span>
                      ) : (
                        "Tạo Lớp"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Class Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div
              className={`rounded-2xl shadow-2xl max-w-md w-full border ${
                isDark
                  ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700"
                  : "bg-gradient-to-br from-white to-slate-50 border-gray-200"
              }`}
            >
              <div className="p-6">
                <h2
                  className={`text-2xl font-bold mb-4 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Chỉnh sửa Lớp {selectedClass}
                </h2>

                <form onSubmit={handleEditClass} className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Tên lớp
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      disabled
                      className={`w-full px-4 py-3 rounded-lg ${
                        isDark
                          ? "bg-slate-600 text-gray-400"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    />
                    <p
                      className={`text-xs mt-1 ${
                        isDark ? "text-gray-500" : "text-gray-600"
                      }`}
                    >
                      Không thể thay đổi tên lớp
                    </p>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Mô tả
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                        isDark
                          ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-500 focus:ring-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-purple-500"
                      }`}
                      placeholder="Mô tả về lớp học..."
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Giáo viên chủ nhiệm
                    </label>
                    <select
                      value={formData.teacherId}
                      onChange={(e) =>
                        setFormData({ ...formData, teacherId: e.target.value })
                      }
                      className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                        isDark
                          ? "bg-slate-700/50 border-slate-600/50 text-white focus:ring-purple-500"
                          : "bg-white border-gray-300 text-gray-900 focus:ring-purple-500"
                      }`}
                    >
                      <option value="">Chọn giáo viên</option>
                      {teachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.fullName || teacher.username} (
                          {teacher.username})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div
                    className={`rounded-lg p-4 border ${
                      isDark
                        ? "bg-yellow-500 bg-opacity-10 border-yellow-500 border-opacity-30"
                        : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 ${
                        isDark ? "text-yellow-400" : "text-yellow-800"
                      }`}
                    >
                      <AlertCircle size={16} />
                      <span className="text-sm font-semibold">Cảnh báo</span>
                    </div>
                    <p
                      className={`text-sm mt-1 ${
                        isDark ? "text-yellow-300" : "text-yellow-700"
                      }`}
                    >
                      Xóa lớp sẽ không xóa học sinh, chỉ xóa thông tin lớp.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                        isDark
                          ? "border border-slate-600 text-gray-300 hover:bg-slate-700 hover:bg-opacity-50"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-lg font-semibold text-white transition-all bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                    >
                      Cập nhật
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClasses;
