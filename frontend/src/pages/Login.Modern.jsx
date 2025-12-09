import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/admin/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Code2, Mail, Lock, ArrowRight, Zap, CheckCircle } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(formData);
      const role =
        data?.user?.role || data?.role || (data && data.user && data.user.role);
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "teacher") {
        navigate("/teacher");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${
        isDark
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-br from-slate-50 via-white to-blue-50"
      }`}
    >
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute top-20 left-20 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float ${
            isDark ? "bg-cyan-500" : "bg-cyan-300"
          }`}
        ></div>
        <div
          className={`absolute bottom-20 right-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse ${
            isDark ? "bg-blue-500" : "bg-blue-300"
          }`}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${
            isDark ? "bg-purple-500" : "bg-purple-300"
          }`}
        ></div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
        {/* Left side - Info */}
        <div className="hidden md:flex flex-col justify-center items-start animate-slide-up">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
                <Code2 size={36} strokeWidth={1.5} />
              </div>
              <div>
                <h1
                  className={`text-5xl font-black tracking-tight ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Code<span className="text-cyan-400">Judge</span>
                </h1>
                <p
                  className={`text-sm font-semibold ${
                    isDark ? "text-cyan-400/70" : "text-cyan-600/70"
                  }`}
                >
                  Nền tảng lập trình trực tuyến
                </p>
              </div>
            </div>
          </div>

          <h2
            className={`text-6xl font-black mb-6 leading-tight ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Đăng nhập để bắt đầu{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              luyện tập
            </span>
          </h2>

          <p
            className={`text-lg mb-10 leading-relaxed ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Truy cập nền tảng học lập trình hàng đầu với AI Judge thông minh
          </p>

          <div className="space-y-4">
            {[
              { icon: Zap, text: "Chấm bài tự động với AI Gemini" },
              { icon: CheckCircle, text: "Tham gia cuộc thi trực tuyến" },
              { icon: CheckCircle, text: "Theo dõi tiến độ & xếp hạng" },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <item.icon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex items-center justify-center">
          <div
            className={`rounded-3xl shadow-2xl border p-8 w-full max-w-md transition-all duration-300 ${
              isDark
                ? "bg-slate-800/40 border-slate-700/50 backdrop-blur-xl"
                : "bg-white/40 border-white/50 backdrop-blur-xl"
            }`}
          >
            <div className="text-center mb-10">
              <h2
                className={`text-4xl font-black mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Đăng nhập
              </h2>
              <p
                className={`text-sm font-medium ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Chào mừng bạn quay trở lại
              </p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  className={`block text-sm font-bold mb-2 ${
                    isDark ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Username
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Nhập username"
                    className={`w-full rounded-xl px-4 py-3 pl-12 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition duration-300 ${
                      isDark
                        ? "bg-slate-700/50 border border-slate-600/50 text-white"
                        : "bg-slate-100/50 border border-slate-300/50 text-gray-900"
                    }`}
                  />
                  <Mail
                    className={`absolute left-4 top-3.5 w-5 h-5 ${
                      isDark ? "text-gray-500" : "text-gray-600"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-bold mb-2 ${
                    isDark ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Password
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Nhập mật khẩu"
                    className={`w-full rounded-xl px-4 py-3 pl-12 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition duration-300 ${
                      isDark
                        ? "bg-slate-700/50 border border-slate-600/50 text-white"
                        : "bg-slate-100/50 border border-slate-300/50 text-gray-900"
                    }`}
                  />
                  <Lock
                    className={`absolute left-4 top-3.5 w-5 h-5 ${
                      isDark ? "text-gray-500" : "text-gray-600"
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group btn-hover"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>

            <div
              className={`mt-8 pt-8 border-t ${
                isDark ? "border-slate-700/50" : "border-slate-300/50"
              } text-center`}
            >
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
