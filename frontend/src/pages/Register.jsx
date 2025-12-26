import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/admin/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

const CLASS_OPTIONS = [
  "10A1",
  "10A2",
  "10A3",
  "10A4",
  "10A5",
  "11A1",
  "11A2",
  "11A3",
  "11A4",
  "11A5",
  "12A1",
  "12A2",
  "12A3",
  "12A4",
  "12A5",
];

const Register = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    class: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(formData);
      navigate("/problems");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950"
          : "bg-gradient-to-br from-white via-slate-50 to-slate-100"
      }`}
    >
      {/* Animated Blobs - Light Mode */}
      {!isDark && (
        <>
          <div className="absolute top-0 -left-40 w-80 h-80 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div
            className="absolute bottom-0 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-300 to-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
            style={{ animationDelay: "2s" }}
          ></div>
        </>
      )}

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center mb-12">
            <h1
              className={`text-4xl font-black ${
                isDark
                  ? "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              }`}
            >
              CodeJudge
            </h1>
          </Link>

          {/* Card */}
          <div
            className={`rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 max-h-[85vh] overflow-y-auto ${
              isDark
                ? "bg-gradient-to-br from-slate-800 to-slate-700/80 border border-slate-700/50"
                : "bg-gradient-to-br from-white to-slate-50 border border-slate-200/50"
            }`}
          >
            {/* Header */}
            <div
              className={`p-8 sm:p-10 border-b ${
                isDark
                  ? "border-slate-700/50 bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                  : "border-slate-200/50 bg-gradient-to-r from-purple-50 to-pink-50"
              }`}
            >
              <h2
                className={`text-3xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Đăng Ký
              </h2>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Tạo tài khoản để bắt đầu luyện tập lập trình
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="p-8 sm:p-10 space-y-5">
              {/* Error Message */}
              {error && (
                <div
                  className={`p-4 rounded-lg border ${
                    isDark
                      ? "bg-red-500/10 border-red-500/30 text-red-300"
                      : "bg-red-100 border-red-300 text-red-700"
                  }`}
                >
                  {error}
                </div>
              )}

              {/* Full Name Field */}
              <div>
                <label
                  className={`block text-sm font-bold mb-2 ${
                    isDark ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Họ và Tên
                </label>
                <div
                  className={`relative transition-all ${
                    isDark
                      ? "bg-slate-700/50 border border-slate-600/50 focus-within:border-purple-500/50"
                      : "bg-white border border-slate-200/50 focus-within:border-purple-400/50"
                  } rounded-xl`}
                >
                  <User
                    className={`absolute left-3 top-3.5 ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                    size={20}
                  />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl transition-colors outline-none ${
                      isDark
                        ? "bg-transparent text-white placeholder-gray-500"
                        : "bg-transparent text-black placeholder-black"
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Username Field */}
              <div>
                <label
                  className={`block text-sm font-bold mb-2 ${
                    isDark ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Username
                </label>
                <div
                  className={`relative transition-all ${
                    isDark
                      ? "bg-slate-700/50 border border-slate-600/50 focus-within:border-purple-500/50"
                      : "bg-white border border-slate-200/50 focus-within:border-purple-400/50"
                  } rounded-xl`}
                >
                  <User
                    className={`absolute left-3 top-3.5 ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                    size={20}
                  />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="username"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl transition-colors outline-none ${
                      isDark
                        ? "bg-transparent text-white placeholder-gray-500"
                        : "bg-transparent text-black placeholder-black"
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label
                  className={`block text-sm font-bold mb-2 ${
                    isDark ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Email
                </label>
                <div
                  className={`relative transition-all ${
                    isDark
                      ? "bg-slate-700/50 border border-slate-600/50 focus-within:border-purple-500/50"
                      : "bg-white border border-slate-200/50 focus-within:border-purple-400/50"
                  } rounded-xl`}
                >
                  <Mail
                    className={`absolute left-3 top-3.5 ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                    size={20}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl transition-colors outline-none ${
                      isDark
                        ? "bg-transparent text-white placeholder-gray-500"
                        : "bg-transparent text-black placeholder-black"
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Class Field */}
              <div>
                <label
                  className={`block text-sm font-bold mb-2 ${
                    isDark ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Lớp
                </label>
                <div
                  className={`relative transition-all ${
                    isDark
                      ? "bg-slate-700/50 border border-slate-600/50 focus-within:border-purple-500/50"
                      : "bg-white border border-slate-200/50 focus-within:border-purple-400/50"
                  } rounded-xl`}
                >
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className={`w-full pl-4 pr-4 py-3 rounded-xl transition-colors outline-none appearance-none cursor-pointer ${
                      isDark
                        ? "bg-slate-700/50 text-white placeholder-gray-500"
                        : "bg-white text-black placeholder-black"
                    }`}
                    required
                  >
                    <option value="">Chọn lớp</option>
                    {CLASS_OPTIONS.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  className={`block text-sm font-bold mb-2 ${
                    isDark ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Mật Khẩu
                </label>
                <div
                  className={`relative transition-all ${
                    isDark
                      ? "bg-slate-700/50 border border-slate-600/50 focus-within:border-purple-500/50"
                      : "bg-white border border-slate-200/50 focus-within:border-purple-400/50"
                  } rounded-xl`}
                >
                  <Lock
                    className={`absolute left-3 top-3.5 ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-3 rounded-xl transition-colors outline-none ${
                      isDark
                        ? "bg-transparent text-white placeholder-gray-500"
                        : "bg-transparent text-black placeholder-black"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-3.5 ${
                      isDark
                        ? "text-gray-500 hover:text-gray-300"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ${
                  isDark
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                {loading ? "Đang đăng ký..." : "Tạo Tài Khoản"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            {/* Divider */}
            <div
              className={`px-8 sm:px-10 py-6 border-t ${
                isDark ? "border-slate-700/50" : "border-slate-200/50"
              }`}
            >
              <p
                className={`text-center text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className={`font-bold transition-colors ${
                    isDark
                      ? "text-purple-400 hover:text-purple-300"
                      : "text-purple-600 hover:text-purple-700"
                  }`}
                >
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>

          {/* Footer Link */}
          <p
            className={`text-center text-sm mt-8 ${
              isDark ? "text-gray-500" : "text-gray-600"
            }`}
          >
            Quay lại{" "}
            <Link
              to="/"
              className={`font-semibold transition-colors ${
                isDark
                  ? "text-purple-400 hover:text-purple-300"
                  : "text-purple-600 hover:text-purple-700"
              }`}
            >
              trang chủ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
