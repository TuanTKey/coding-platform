import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Trophy, Medal, Award, Zap } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const Leaderboard = () => {
  const { isDark } = useTheme();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get("/users/leaderboard");
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return (
          <Trophy
            className={isDark ? "text-amber-400" : "text-amber-500"}
            size={32}
          />
        );
      case 2:
        return (
          <Medal
            className={isDark ? "text-gray-300" : "text-gray-400"}
            size={28}
          />
        );
      case 3:
        return (
          <Award
            className={isDark ? "text-orange-400" : "text-orange-600"}
            size={28}
          />
        );
      default:
        return (
          <span
            className={`text-2xl font-bold ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            #{rank}
          </span>
        );
    }
  };

  const getRankBg = (rank) => {
    if (rank === 1) {
      return isDark
        ? "bg-gradient-to-r from-amber-900/50 to-amber-800/30 border-amber-700/50"
        : "bg-gradient-to-r from-amber-50 to-amber-100/50 border-amber-200/50";
    } else if (rank === 2) {
      return isDark
        ? "bg-gradient-to-r from-gray-800/50 to-gray-700/30 border-gray-600/50"
        : "bg-gradient-to-r from-gray-50 to-slate-100/50 border-gray-200/50";
    } else if (rank === 3) {
      return isDark
        ? "bg-gradient-to-r from-orange-900/50 to-orange-800/30 border-orange-700/50"
        : "bg-gradient-to-r from-orange-50 to-orange-100/50 border-orange-200/50";
    } else {
      return isDark
        ? "bg-slate-800/30 border-slate-600/50"
        : "bg-white/50 border-slate-200/50";
    }
  };

  if (loading) {
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
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 py-12 px-4 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-50"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className={`p-3 rounded-2xl ${
                isDark
                  ? "bg-gradient-to-br from-amber-500/40 to-orange-600/40"
                  : "bg-gradient-to-br from-amber-400/40 to-orange-500/40"
              }`}
            >
              <Trophy
                className={`w-8 h-8 ${
                  isDark ? "text-amber-300" : "text-amber-600"
                }`}
              />
            </div>
            <h1
              className={`text-5xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Bảng Xếp Hạng
            </h1>
          </div>
          <p
            className={`text-lg ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            Những lập trình viên xuất sắc nhất được xếp hạng theo điểm và bài
            tập
          </p>
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          {leaderboard.map((user, index) => (
            <div
              key={user._id}
              className={`rounded-2xl p-6 backdrop-blur shadow-lg hover:shadow-2xl transition-all duration-300 border ${getRankBg(
                user.rank
              )}`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                {/* Left Section */}
                <div className="flex items-center space-x-6 flex-1">
                  {/* Rank Icon */}
                  <div className="flex items-center justify-center w-16 flex-shrink-0">
                    {getRankIcon(user.rank)}
                  </div>

                  {/* User Info */}
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-14 h-14 rounded-xl text-lg font-bold flex items-center justify-center text-white flex-shrink-0 shadow-lg transition-all duration-300 ${
                        user.rank === 1
                          ? isDark
                            ? "bg-gradient-to-br from-amber-500 to-amber-600"
                            : "bg-gradient-to-br from-amber-400 to-amber-500"
                          : user.rank === 2
                          ? isDark
                            ? "bg-gradient-to-br from-gray-400 to-gray-500"
                            : "bg-gradient-to-br from-gray-400 to-gray-500"
                          : user.rank === 3
                          ? isDark
                            ? "bg-gradient-to-br from-orange-500 to-orange-600"
                            : "bg-gradient-to-br from-orange-400 to-orange-500"
                          : isDark
                          ? "bg-gradient-to-br from-cyan-600 to-blue-600"
                          : "bg-gradient-to-br from-cyan-500 to-blue-500"
                      }`}
                    >
                      {user.username[0].toUpperCase()}
                    </div>

                    <div>
                      <Link
                        to={`/users/${user._id}`}
                        className={`text-lg font-bold transition-colors duration-300 hover:text-cyan-500 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {user.username}
                      </Link>
                      {user.fullName && (
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {user.fullName}
                        </p>
                      )}
                      {user.studentId && (
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          Mã SV: {user.studentId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Section - Stats */}
                <div className="flex items-center space-x-8 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Rating */}
                  <div className="text-center">
                    <div
                      className={`text-3xl font-black ${
                        user.rank === 1
                          ? isDark
                            ? "text-amber-300"
                            : "text-amber-600"
                          : user.rank === 2
                          ? isDark
                            ? "text-gray-300"
                            : "text-gray-600"
                          : user.rank === 3
                          ? isDark
                            ? "text-orange-300"
                            : "text-orange-600"
                          : isDark
                          ? "text-cyan-400"
                          : "text-cyan-600"
                      }`}
                    >
                      {user.rating || 0}
                    </div>
                    <div
                      className={`text-xs font-semibold flex items-center gap-1 justify-center mt-1 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <Zap size={14} />
                      Rating
                    </div>
                  </div>

                  {/* Solved */}
                  <div className="text-center">
                    <div
                      className={`text-3xl font-black ${
                        isDark ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      {user.solvedProblems || 0}
                    </div>
                    <div
                      className={`text-xs font-semibold ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Bài giải
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
