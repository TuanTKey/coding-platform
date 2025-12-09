import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { ChevronRight } from "lucide-react";

const TeacherClasses = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await api.get("/users/teacher/me");
        setClasses(resp.data.classes || []);
      } catch (err) {
        console.error("Load classes", err);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1
            className={`text-4xl font-bold mb-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Lớp được phân công
          </h1>
          <p
            className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Quản lý các lớp học của bạn
          </p>
        </div>

        {classes.length === 0 ? (
          <div
            className={`rounded-2xl p-8 backdrop-blur shadow-lg transition-all duration-300 border ${
              isDark
                ? "bg-gradient-to-br from-slate-800 to-slate-700/50 border-slate-600/50"
                : "bg-gradient-to-br from-white to-slate-50 border-slate-200/50"
            }`}
          >
            <p
              className={`text-lg font-semibold mb-3 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Bạn chưa được phân công lớp nào
            </p>
            <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Nếu bạn là giáo viên, hãy yêu cầu quản trị viên phân công lớp cho
              bạn.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={`mailto:admin@codejudge.local?subject=Yêu%20cầu%20phân%20công%20lớp`}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                Yêu cầu phân công lớp
              </a>
              <button
                onClick={() => window.location.reload()}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark
                    ? "bg-slate-700 text-white border border-slate-600 hover:bg-slate-600"
                    : "bg-white text-gray-900 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Tải lại
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {classes.map((c) => (
              <div
                key={c._id}
                className={`rounded-2xl p-6 backdrop-blur shadow-lg transition-all duration-300 border hover:shadow-xl hover:scale-105 cursor-pointer ${
                  isDark
                    ? "bg-gradient-to-br from-slate-800 to-slate-700/50 border-slate-600/50 hover:border-indigo-500/50"
                    : "bg-gradient-to-br from-white to-slate-50 border-slate-200/50 hover:border-indigo-300/50"
                }`}
                onClick={() => navigate(`/teacher/students?classId=${c._id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3
                      className={`text-xl font-bold mb-2 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {c.name}
                    </h3>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {c.description || "Không có mô tả"}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-xl ${
                      isDark
                        ? "bg-indigo-500/20 text-indigo-400"
                        : "bg-indigo-100/50 text-indigo-600"
                    }`}
                  >
                    <ChevronRight size={24} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherClasses;
