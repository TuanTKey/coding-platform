import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../components/admin/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  Mail,
  Users,
  Calendar,
  ArrowLeft,
  Edit,
  User as UserIcon,
} from "lucide-react";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const path = id ? `/users/${id}` : "/users/me";
        const resp = await api.get(path);
        setProfile(resp.data.user || resp.data);
      } catch (err) {
        console.error("Load profile", err);
        const status = err.response?.status;
        const serverMsg =
          err.response?.data?.error || err.response?.data?.message;
        const message =
          serverMsg || err.message || "Không thể tải thông tin người dùng";
        alert(`${message}${status ? " (status: " + status + ")" : ""}`);
        if (status === 401) {
          // not authenticated
          navigate("/login");
        } else if (!id) {
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

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
  if (!profile)
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDark
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            : "bg-gradient-to-br from-slate-50 via-white to-slate-50"
        }`}
      >
        <p
          className={`text-lg font-semibold ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Không tìm thấy người dùng
        </p>
      </div>
    );

  const isMe =
    user &&
    (user.id === profile.id || user._id === profile.id || (!id && true));

  return (
    <div
      className={`min-h-screen transition-colors duration-300 py-12 px-4 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-50"
      }`}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1
            className={`text-4xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Hồ sơ cá nhân
          </h1>
          <button
            onClick={() => navigate(-1)}
            className={`p-3 rounded-2xl transition-all duration-300 ${
              isDark
                ? "bg-slate-800/50 hover:bg-slate-700/50 text-gray-400 hover:text-gray-200"
                : "bg-slate-100/50 hover:bg-slate-200/50 text-gray-600 hover:text-gray-900"
            }`}
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Main Profile Card */}
        <div
          className={`rounded-2xl p-8 backdrop-blur shadow-2xl transition-all duration-300 border mb-6 ${
            isDark
              ? "bg-gradient-to-br from-slate-800 to-slate-700/50 border-slate-600/50"
              : "bg-gradient-to-br from-white to-slate-50 border-slate-200/50"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div
                className={`w-32 h-32 rounded-2xl text-4xl font-bold flex items-center justify-center transition-all duration-300 shadow-lg ${
                  isDark
                    ? "bg-gradient-to-br from-cyan-500/40 to-blue-600/40 text-cyan-300 border border-cyan-400/50"
                    : "bg-gradient-to-br from-cyan-400/40 to-blue-500/40 text-cyan-600 border border-cyan-300/50"
                }`}
              >
                {(profile.username ||
                  profile.username ||
                  "U")[0]?.toUpperCase()}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2
                className={`text-3xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {profile.fullName || profile.username}
              </h2>
              <p
                className={`text-lg mb-6 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                @{profile.username}
              </p>

              {/* Quick Info */}
              <div className="space-y-3">
                {profile.email && (
                  <div className="flex items-center gap-3">
                    <Mail
                      size={18}
                      className={isDark ? "text-gray-500" : "text-gray-500"}
                    />
                    <span
                      className={isDark ? "text-gray-300" : "text-gray-700"}
                    >
                      {profile.email}
                    </span>
                  </div>
                )}
                {profile.class && (
                  <div className="flex items-center gap-3">
                    <Users
                      size={18}
                      className={isDark ? "text-gray-500" : "text-gray-500"}
                    />
                    <span
                      className={isDark ? "text-gray-300" : "text-gray-700"}
                    >
                      Lớp: {profile.class}
                    </span>
                  </div>
                )}
                {profile.studentId && (
                  <div className="flex items-center gap-3">
                    <UserIcon
                      size={18}
                      className={isDark ? "text-gray-500" : "text-gray-500"}
                    />
                    <span
                      className={isDark ? "text-gray-300" : "text-gray-700"}
                    >
                      Mã số SV: {profile.studentId}
                    </span>
                  </div>
                )}
                {profile.createdAt && (
                  <div className="flex items-center gap-3">
                    <Calendar
                      size={18}
                      className={isDark ? "text-gray-500" : "text-gray-500"}
                    />
                    <span
                      className={isDark ? "text-gray-300" : "text-gray-700"}
                    >
                      Tham gia:{" "}
                      {new Date(profile.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div
          className={`rounded-2xl p-6 backdrop-blur shadow-xl transition-all duration-300 border mb-6 ${
            isDark
              ? "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-600/50"
              : "bg-gradient-to-br from-white/50 to-slate-50/30 border-slate-200/50"
          }`}
        >
          <h3
            className={`text-xl font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Thông tin bổ sung
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                Vai trò:
              </span>
              <span
                className={`font-semibold px-3 py-1 rounded-full text-sm ${
                  isDark
                    ? "bg-purple-500/20 text-purple-300 border border-purple-400/50"
                    : "bg-purple-100/50 text-purple-700 border border-purple-200/50"
                }`}
              >
                {profile.role?.charAt(0).toUpperCase() +
                  profile.role?.slice(1) || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              isDark
                ? "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
                : "bg-slate-200 hover:bg-slate-300 text-gray-900 border border-slate-300"
            }`}
          >
            <ArrowLeft size={18} />
            Quay lại
          </button>
          {isMe && (
            <button
              onClick={() => navigate("/profile/edit")}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                isDark
                  ? "bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-500/50"
                  : "bg-gradient-to-r from-cyan-500/80 to-blue-500/80 hover:from-cyan-400 hover:to-blue-400 text-white border border-cyan-400/50"
              }`}
            >
              <Edit size={18} />
              Chỉnh sửa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
