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
          ? "bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50"
      }`}
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob-rotate ${isDark ? "bg-cyan-500" : "bg-cyan-300"}`}></div>
        <div className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob-rotate animation-delay-2000 ${isDark ? "bg-blue-500" : "bg-blue-300"}`}></div>
        <div className={`absolute top-1/3 left-1/3 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob-rotate animation-delay-4000 ${isDark ? "bg-purple-500" : "bg-purple-300"}`}></div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative z-10">
        {/* Left side - Info Section */}
        <div className="hidden md:flex flex-col justify-center items-start space-y-8 animate-fade-in-left">
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl glow-cyan ${isDark ? "shadow-cyan-500/30" : "shadow-cyan-400/30"}`}>
                <Code2 size={40} className="text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Code<span className="text-cyan-400">Judge</span>
                </h1>
                <p className={`text-sm font-medium ${isDark ? "text-cyan-300/70" : "text-cyan-600/70"}`}>
                  Online Programming Platform
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className={`text-5xl font-bold mb-6 leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>
              Đăng nhập để bắt đầu
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400"> luyện tập</span>
            </h2>
            <p className={`text-lg mb-8 font-light ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Truy cập ngay bây giờ và giải quyết hàng nghìn bài tập lập trình
            </p>

            <div className="space-y-5">
              {[
                { icon: Zap, text: "Chấm bài tự động với AI" },
                { icon: CheckCircle, text: "Tham gia cuộc thi trực tuyến" },
                { icon: CheckCircle, text: "Theo dõi tiến độ và xếp hạng" },
                { icon: CheckCircle, text: "Nhận feedback chi tiết từ hệ thống" },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 group ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${
                    i === 0 ? "bg-yellow-500/20 text-yellow-400" : "bg-cyan-500/20 text-cyan-400"
                  }`}>
                    <item.icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex items-center justify-center animate-fade-in-right">
          <div
            className={`w-full max-w-md rounded-3xl shadow-2xl border backdrop-blur transition-all duration-300 card-hover-dark ${
              isDark
                ? "bg-gradient-to-br from-slate-800/80 to-slate-700/50 border-slate-700/50 hover:border-cyan-500/50"
                : "bg-gradient-to-br from-white/90 to-slate-50/90 border-slate-300/50 hover:border-cyan-500/50"
            }`}
          >
            <div className="p-10">
              <div className="text-center mb-10">
                <h2 className={`text-4xl font-black mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent`}>
                  Đăng nhập
                </h2>
                <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Chào mừng bạn quay trở lại
                </p>
              </div>

              {error && (
                <div className={`rounded-xl px-4 py-3 mb-6 flex items-center gap-3 animate-slide-up border ${isDark ? "bg-red-500/20 border-red-500/50 text-red-300" : "bg-red-100/50 border-red-300 text-red-700"}`}>
                  <span className="text-xl">⚠️</span>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                    Username
                  </label>
                  <div className="relative group">
                    <Mail className={`absolute left-4 top-4 w-5 h-5 transition-colors ${isDark ? "text-gray-500 group-focus-within:text-cyan-400" : "text-gray-600 group-focus-within:text-cyan-600"}`} strokeWidth={2} />
                    <input
                      type="text"
                      name="username"
                      autoComplete="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      placeholder="Nhập username của bạn"
                      className={`w-full rounded-xl px-4 py-3 pl-12 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-200 ${
                        isDark
                          ? "bg-slate-700/50 border border-slate-600/50 text-white hover:border-slate-600 focus:bg-slate-700/80"
                          : "bg-slate-100/50 border border-slate-300/50 text-gray-900 hover:border-slate-300 focus:bg-white"
                      }`}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className={`absolute left-4 top-4 w-5 h-5 transition-colors ${isDark ? "text-gray-500 group-focus-within:text-cyan-400" : "text-gray-600 group-focus-within:text-cyan-600"}`} strokeWidth={2} />
                    <input
                      type="password"
                      name="password"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Nhập mật khẩu của bạn"
                      className={`w-full rounded-xl px-4 py-3 pl-12 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-200 ${
                        isDark
                          ? "bg-slate-700/50 border border-slate-600/50 text-white hover:border-slate-600 focus:bg-slate-700/80"
                          : "bg-slate-100/50 border border-slate-300/50 text-gray-900 hover:border-slate-300 focus:bg-white"
                      }`}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transform hover:scale-105 ${loading ? "cursor-not-allowed" : "btn-hover"}`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang đăng nhập...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className={`my-8 flex items-center gap-4 ${isDark ? "border-slate-600" : "border-slate-300"}`}>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-slate-400/50"></div>
                <span className={`text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-500"}`}>hoặc</span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-slate-400/50"></div>
              </div>

              {/* Register Link */}
              <p className={`text-center font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold"
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
