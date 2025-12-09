import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { UserPlus, Trash2, Eye } from "lucide-react";

const TeacherStudents = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const initialClassParam = searchParams.get("classId") || "all";

  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [classId, setClassId] = useState(
    initialClassParam === "all" ? "" : initialClassParam
  );
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState(initialClassParam);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await api.get("/users/teacher/students");
      setClasses(resp.data.classes || []);
      setStudents(resp.data.students || []);
      if ((resp.data.classes || []).length > 0 && selectedClass === "all")
        setSelectedClass(resp.data.classes[0]._id);
    } catch (err) {
      console.error("Load teacher students", err);
      if (err.response?.status === 403) navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedClass !== "all") {
      setClassId(selectedClass);
    }
  }, [selectedClass]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!studentId || !classId)
      return alert("studentId và classId là bắt buộc");
    try {
      await api.post("/users/teacher/students", { studentId, classId });
      setStudentId("");
      await load();
      alert("Thêm học sinh thành công");
    } catch (err) {
      console.error("Add student", err);
      alert(err.response?.data?.error || "Lỗi khi thêm học sinh");
    }
  };

  const handleRemove = async (sid, cid) => {
    if (!confirm("Bạn có chắc muốn xóa học sinh khỏi lớp?")) return;
    try {
      await api.delete(`/users/teacher/students/${sid}`, {
        data: { classId: cid },
      });
      await load();
      alert("Xóa thành công");
    } catch (err) {
      console.error("Remove student", err);
      alert(err.response?.data?.error || "Lỗi khi xóa học sinh");
    }
  };

  if (loading)
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDark
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950"
            : "bg-gradient-to-br from-slate-50 via-white to-slate-50"
        }`}
      >
        <div
          className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDark ? "border-cyan-500" : "border-cyan-600"
          }`}
        ></div>
      </div>
    );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-50"
      }`}
    >
      <div className="p-6 max-w-6xl mx-auto">
        <h1
          className={`text-3xl font-bold mb-8 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Quản lý Học sinh
        </h1>

        {/* Add Student Form */}
        <div
          className={`rounded-2xl p-6 backdrop-blur shadow-lg transition-all duration-300 border mb-8 ${
            isDark
              ? "bg-gradient-to-br from-slate-800 to-slate-700/50 border-slate-600/50"
              : "bg-gradient-to-br from-white to-slate-50 border-slate-200/50"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`p-2 rounded-lg ${
                isDark
                  ? "bg-purple-500/20 text-purple-400"
                  : "bg-purple-100/50 text-purple-600"
              }`}
            >
              <UserPlus size={20} />
            </div>
            <h3
              className={`text-lg font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Thêm học sinh vào lớp
            </h3>
          </div>
          <form
            onSubmit={handleAdd}
            className="grid grid-cols-1 md:grid-cols-4 gap-3"
          >
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Student ID"
              className={`p-3 rounded-lg border transition-all outline-none ${
                isDark
                  ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-500 focus:border-purple-500/50"
                  : "bg-white border-slate-200/50 text-gray-900 placeholder-gray-400 focus:border-purple-400/50"
              }`}
            />
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className={`p-3 rounded-lg border transition-all outline-none cursor-pointer ${
                isDark
                  ? "bg-slate-700/50 border-slate-600/50 text-white focus:border-purple-500/50"
                  : "bg-white border-slate-200/50 text-gray-900 focus:border-purple-400/50"
              }`}
            >
              <option value="">-- Chọn lớp --</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} - {c.description}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className={`px-4 py-3 rounded-lg font-medium transition-colors text-white ${
                isDark
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              Thêm
            </button>
          </form>
          <p
            className={`text-xs mt-3 ${
              isDark ? "text-gray-500" : "text-gray-600"
            }`}
          >
            Bạn có thể dùng ID người dùng để thêm nhanh. (Có thể mở rộng để
            search username/email)
          </p>
        </div>

        {/* Students List */}
        <div
          className={`rounded-2xl p-6 backdrop-blur shadow-lg transition-all duration-300 border ${
            isDark
              ? "bg-gradient-to-br from-slate-800 to-slate-700/50 border-slate-600/50"
              : "bg-gradient-to-br from-white to-slate-50 border-slate-200/50"
          }`}
        >
          <h3
            className={`text-lg font-bold mb-6 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Học sinh trong các lớp của bạn
          </h3>

          {classes.length === 0 ? (
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Bạn chưa được phân công lớp nào.
            </p>
          ) : (
            <div>
              {/* Class Filter */}
              <div className="mb-6 flex items-center gap-3">
                <label
                  className={`text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Lọc theo lớp:
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className={`p-2 rounded-lg border transition-all outline-none cursor-pointer ${
                    isDark
                      ? "bg-slate-700/50 border-slate-600/50 text-white focus:border-cyan-500/50"
                      : "bg-white border-slate-200/50 text-gray-900 focus:border-cyan-400/50"
                  }`}
                >
                  <option value="all">Tất cả lớp</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Classes and Students */}
              {(() => {
                const classesToShow =
                  selectedClass === "all"
                    ? classes
                    : classes.filter(
                        (c) => c._id.toString() === selectedClass.toString()
                      );
                return classesToShow.map((c) => (
                  <div key={c._id} className="mb-8">
                    <div
                      className={`text-lg font-bold mb-4 pb-3 border-b ${
                        isDark
                          ? "text-white border-slate-600/50"
                          : "text-gray-900 border-slate-200/50"
                      }`}
                    >
                      {c.name} - {c.description}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr
                            className={`text-sm font-semibold border-b ${
                              isDark
                                ? "text-gray-300 border-slate-600/50"
                                : "text-gray-700 border-slate-200/50"
                            }`}
                          >
                            <th className="py-3 px-4">Username</th>
                            <th className="py-3 px-4">Mã SV</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4 text-right">Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students
                            .filter((s) => s.class === c.name)
                            .map((s) => (
                              <tr
                                key={s._id}
                                className={`border-b transition-colors ${
                                  isDark
                                    ? "border-slate-700/30 hover:bg-slate-700/30 text-gray-300"
                                    : "border-slate-200/50 hover:bg-slate-100/50 text-gray-900"
                                }`}
                              >
                                <td className="py-3 px-4 font-medium">
                                  {s.username}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                  {s.studentId || "-"}
                                </td>
                                <td className="py-3 px-4 text-sm">{s.email}</td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center justify-end gap-3">
                                    <button
                                      onClick={() =>
                                        navigate(`/users/${s._id}`)
                                      }
                                      className={`p-2 rounded-lg transition-colors ${
                                        isDark
                                          ? "text-indigo-400 hover:bg-indigo-500/20"
                                          : "text-indigo-600 hover:bg-indigo-100/50"
                                      }`}
                                      title="Xem"
                                    >
                                      <Eye size={18} />
                                    </button>
                                    <button
                                      onClick={() => handleRemove(s._id, c._id)}
                                      className={`p-2 rounded-lg transition-colors ${
                                        isDark
                                          ? "text-red-400 hover:bg-red-500/20"
                                          : "text-red-600 hover:bg-red-100/50"
                                      }`}
                                      title="Xóa"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherStudents;
