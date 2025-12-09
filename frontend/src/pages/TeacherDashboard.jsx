import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../components/admin/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Link } from "react-router-dom";

const StatCard = ({ title, value, subtitle, children, isDark }) => (
  <div
    className={`rounded-lg shadow-sm p-4 flex flex-col justify-between transition-colors duration-300 ${
      isDark
        ? "bg-gradient-to-br from-slate-800 to-slate-700/80 border border-slate-600/50"
        : "bg-gradient-to-br from-white to-slate-50 border border-slate-200/50"
    }`}
  >
    <div>
      <div
        className={`text-sm font-medium ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}
      >
        {title}
      </div>
      <div
        className={`text-2xl font-semibold mt-2 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
      </div>
      {subtitle && (
        <div
          className={`text-xs mt-1 ${
            isDark ? "text-gray-500" : "text-gray-500"
          }`}
        >
          {subtitle}
        </div>
      )}
    </div>
    {children && <div className="mt-4">{children}</div>}
  </div>
);

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [problemsTotal, setProblemsTotal] = useState(0);
  const [contestsTotal, setContestsTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await api.get("/users/teacher/me");
        setStudents(resp.data.students || []);
        setClasses(resp.data.classes || []);
        try {
          const [problemsResp, contestsResp] = await Promise.all([
            api.get("/problems"),
            api.get("/contests"),
          ]);
          setProblemsTotal(problemsResp.data?.total || 0);
          setContestsTotal(contestsResp.data?.total || 0);
        } catch (err) {
          console.warn("Could not load problems/contests totals", err);
        }
      } catch (err) {
        console.error("Load teacher data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-50"
      }`}
    >
      <div className="p-6 max-w-7xl mx-auto">
        <header
          className={`flex items-center justify-between mb-8 pb-6 border-b ${
            isDark ? "border-slate-700/50" : "border-slate-200/50"
          }`}
        >
          <div className="flex items-center space-x-4">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold shadow-lg ${
                isDark
                  ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white"
                  : "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"
              }`}
            >
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1
                className={`text-4xl font-extrabold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Bảng điều khiển Giáo viên
              </h1>
              <div
                className={`text-sm font-medium mt-1 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Xin chào,{" "}
                <span className="font-semibold">
                  {user?.fullName || user?.username}
                </span>
              </div>
              <div
                className={`mt-2 text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Vai trò:{" "}
                <span
                  className={`font-semibold ${
                    isDark ? "text-indigo-400" : "text-indigo-600"
                  }`}
                >
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => (window.location.href = "/teacher/classes")}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                isDark
                  ? "bg-slate-800 text-white border border-slate-600/50 hover:bg-slate-700"
                  : "bg-white text-gray-900 border border-slate-200/50 hover:bg-slate-50"
              }`}
            >
              Lớp
            </button>
            <button
              onClick={() => (window.location.href = "/teacher/admin")}
              className={`px-4 py-2 rounded-lg transition-colors font-medium text-white ${
                isDark
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              }`}
            >
              Quản lý bài tập & cuộc thi
            </button>
          </div>
        </header>

        <main>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Lớp được phân công"
              value={classes.length}
              subtitle={
                loading
                  ? "Đang tải..."
                  : classes.map((c) => c.name).join(", ") || "Chưa có lớp"
              }
              isDark={isDark}
            >
              <Link
                to="/teacher/classes"
                className={`text-sm font-medium transition-colors ${
                  isDark
                    ? "text-indigo-400 hover:text-indigo-300"
                    : "text-indigo-600 hover:text-indigo-700"
                }`}
              >
                Xem chi tiết →
              </Link>
            </StatCard>

            <StatCard
              title="Bài tập"
              value={problemsTotal}
              subtitle={loading ? "Đang tải..." : "Tổng số bài tập"}
              isDark={isDark}
            >
              <Link
                to="/teacher/admin"
                className={`text-sm font-medium transition-colors ${
                  isDark
                    ? "text-indigo-400 hover:text-indigo-300"
                    : "text-indigo-600 hover:text-indigo-700"
                }`}
              >
                Quản lý bài tập →
              </Link>
            </StatCard>

            <StatCard
              title="Cuộc thi"
              value={contestsTotal}
              subtitle={loading ? "Đang tải..." : "Tổng số cuộc thi"}
              isDark={isDark}
            >
              <Link
                to="/teacher/admin"
                className={`text-sm font-medium transition-colors ${
                  isDark
                    ? "text-indigo-400 hover:text-indigo-300"
                    : "text-indigo-600 hover:text-indigo-700"
                }`}
              >
                Quản lý cuộc thi →
              </Link>
            </StatCard>
          </div>

          <section
            className={`rounded-lg shadow p-6 transition-colors duration-300 ${
              isDark
                ? "bg-gradient-to-br from-slate-800 to-slate-700/80 border border-slate-600/50"
                : "bg-gradient-to-br from-white to-slate-50 border border-slate-200/50"
            }`}
          >
            <h2
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Thông tin nhanh
            </h2>
            <div
              className={`space-y-2 text-sm ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <p>
                <strong>Lớp được phân công:</strong>{" "}
                {classes.length
                  ? classes.map((c) => c.name).join(", ")
                  : "Không có lớp nào"}
              </p>
              <p>
                <strong>Học sinh:</strong> {students.length} người
              </p>
              <p>
                <strong>Bài tập & cuộc thi:</strong>{" "}
                {problemsTotal + contestsTotal} mục
              </p>
              <p
                className={`mt-3 text-xs ${
                  isDark ? "text-gray-500" : "text-gray-600"
                }`}
              >
                Giao diện quản lý chi tiết có thể mở rộng: danh sách bài tập,
                cuộc thi, và giao diện chấm điểm trong phạm vi lớp.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
