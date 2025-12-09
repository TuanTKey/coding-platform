import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../components/admin/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Save, X, AlertCircle } from "lucide-react";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { isDark } = useTheme();
  const [form, setForm] = useState({ fullName: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await api.get("/users/me");
        const me = resp.data.user || resp.data;
        setForm({
          fullName: me.fullName || "",
          email: me.email || "",
          studentId: me.studentId || "",
        });
      } catch (err) {
        console.error("Load profile", err);
        alert("Không thể tải thông tin để chỉnh sửa");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const updateField = (k) => (e) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const resp = await api.put("/users/me", form);
      const updated = resp.data.user || resp.data;
      // update auth context if available
      if (setUser) setUser((prev) => ({ ...prev, ...updated }));
      alert("Cập nhật thành công");
      navigate("/profile");
    } catch (err) {
      console.error("Save profile", err);
      alert("Lưu không thành công");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDark
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
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
      className={`min-h-screen transition-colors duration-300 py-12 px-4 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-50"
      }`}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <h1
          className={`text-4xl font-bold mb-8 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Chỉnh sửa hồ sơ
        </h1>

        {/* Form Card */}
        <div
          className={`rounded-2xl p-8 backdrop-blur shadow-2xl transition-all duration-300 border ${
            isDark
              ? "bg-gradient-to-br from-slate-800 to-slate-700/50 border-slate-600/50"
              : "bg-gradient-to-br from-white to-slate-50 border-slate-200/50"
          }`}
        >
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div>
              <label
                className={`block text-sm font-semibold mb-3 ${
                  isDark ? "text-gray-200" : "text-gray-900"
                }`}
              >
                Họ và tên
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={updateField("fullName")}
                className={`w-full rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-200 ${
                  isDark
                    ? "bg-slate-700/50 border border-slate-600/50 text-white placeholder-gray-500 hover:border-slate-600"
                    : "bg-slate-100/50 border border-slate-300/50 text-gray-900 placeholder-gray-600 hover:border-slate-300"
                }`}
                placeholder="Nhập họ và tên của bạn"
              />
            </div>

            {/* Email Field */}
            <div>
              <label
                className={`block text-sm font-semibold mb-3 ${
                  isDark ? "text-gray-200" : "text-gray-900"
                }`}
              >
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={updateField("email")}
                className={`w-full rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-200 ${
                  isDark
                    ? "bg-slate-700/50 border border-slate-600/50 text-white placeholder-gray-500 hover:border-slate-600"
                    : "bg-slate-100/50 border border-slate-300/50 text-gray-900 placeholder-gray-600 hover:border-slate-300"
                }`}
                placeholder="Nhập email của bạn"
              />
            </div>

            {/* Student ID Field (Read-only for users) */}
            {user?.role === "user" && (
              <div>
                <label
                  className={`block text-sm font-semibold mb-3 ${
                    isDark ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  Mã số sinh viên
                </label>
                <input
                  type="text"
                  value={form.studentId}
                  readOnly
                  className={`w-full rounded-lg px-4 py-3 text-sm font-medium focus:outline-none transition-all duration-200 cursor-not-allowed ${
                    isDark
                      ? "bg-slate-700/30 border border-slate-600/30 text-gray-400"
                      : "bg-slate-100/30 border border-slate-300/30 text-gray-500"
                  }`}
                />
                <div
                  className={`flex items-start gap-2 mt-3 p-3 rounded-lg ${
                    isDark
                      ? "bg-blue-500/10 border border-blue-400/30"
                      : "bg-blue-100/30 border border-blue-300/30"
                  }`}
                >
                  <AlertCircle
                    size={16}
                    className={`flex-shrink-0 mt-0.5 ${
                      isDark ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                  <p
                    className={`text-xs ${
                      isDark ? "text-blue-300" : "text-blue-700"
                    }`}
                  >
                    Mã số sinh viên được hệ thống cấp tự động và không thể chỉnh
                    sửa
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  isDark
                    ? "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
                    : "bg-slate-200 hover:bg-slate-300 text-gray-900 border border-slate-300"
                }`}
              >
                <X size={18} />
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark
                    ? "bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-500/50"
                    : "bg-gradient-to-r from-cyan-500/80 to-blue-500/80 hover:from-cyan-400 hover:to-blue-400 text-white border border-cyan-400/50"
                }`}
              >
                <Save size={18} />
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
