import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import {
  BarChart3, TrendingUp, Users, FileCode, CheckCircle, AlertCircle,
  Clock, Calendar, Filter, Download, ChevronLeft, Activity, Award, Zap
} from 'lucide-react';

const StatisticsDetail = () => {
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState(searchParams.get('class') || 'all');
  const [dateRange, setDateRange] = useState('7days'); // 7days, 30days, all
  const [sortBy, setSortBy] = useState('accepted'); // accepted, submissions, rating

  useEffect(() => {
    fetchDetailedStats();
  }, [dateRange]);

  const fetchDetailedStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/submissions/teacher/stats');
      setStats(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.response?.data?.error || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortStudents = () => {
    if (!stats || !stats.studentStats) return [];
    
    let filtered = [...stats.studentStats];
    
    // Sort
    if (sortBy === 'accepted') {
      filtered.sort((a, b) => b.acceptedCount - a.acceptedCount);
    } else if (sortBy === 'submissions') {
      filtered.sort((a, b) => b.totalSubmissions - a.totalSubmissions);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }
    
    return filtered;
  };

  const filterAndSortProblems = () => {
    if (!stats || !stats.problemStats) return [];
    
    let filtered = [...stats.problemStats];
    filtered.sort((a, b) => b.totalSubmissions - a.totalSubmissions);
    
    return filtered;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Activity className={`animate-spin mx-auto mb-4 ${isDark ? 'text-cyan-400' : 'text-blue-500'}`} size={40} />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Đang tải dữ liệu chi tiết...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className={`max-w-7xl mx-auto rounded-lg p-6 border ${isDark ? 'bg-red-900/20 border-red-700/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
          <p className="font-semibold">⚠️ {error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const sortedStudents = filterAndSortStudents();
  const sortedProblems = filterAndSortProblems();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-slate-50'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 border-b ${isDark ? 'bg-slate-800/95 border-slate-700/50' : 'bg-white/95 border-slate-200/50'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/teacher" className={`p-2 rounded-lg hover:bg-opacity-20 transition ${isDark ? 'hover:bg-white' : 'hover:bg-black'}`}>
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className={`text-3xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <BarChart3 className="text-indigo-600" size={32} />
                Thống Kê Chi Tiết
              </h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Phân tích chi tiết hiệu suất học sinh và bài tập</p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Filter size={16} className="inline mr-2" />
                Lớp
              </label>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border transition ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="all">Tất cả các lớp</option>
                {stats.classes?.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Calendar size={16} className="inline mr-2" />
                Khoảng Thời Gian
              </label>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border transition ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="7days">7 ngày gần nhất</option>
                <option value="30days">30 ngày gần nhất</option>
                <option value="all">Tất cả thời gian</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Download size={16} className="inline mr-2" />
                Sắp Xếp Theo
              </label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border transition ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="accepted">Accepted Count</option>
                <option value="submissions">Total Submissions</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className={`rounded-lg p-6 border ${isDark ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Học sinh</p>
                <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.summary.totalStudents}</p>
              </div>
              <Users className="text-blue-500" size={28} />
            </div>
          </div>

          <div className={`rounded-lg p-6 border ${isDark ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tổng nộp</p>
                <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.summary.totalSubmissions}</p>
              </div>
              <FileCode className="text-purple-500" size={28} />
            </div>
          </div>

          <div className={`rounded-lg p-6 border ${isDark ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>AC Rate</p>
                <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.summary.acRate}%</p>
              </div>
              <CheckCircle className="text-green-500" size={28} />
            </div>
          </div>

          <div className={`rounded-lg p-6 border ${isDark ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Accepted</p>
                <p className={`text-2xl font-bold mt-1 text-green-500`}>{stats.summary.acceptedCount}</p>
              </div>
              <Zap className="text-yellow-500" size={28} />
            </div>
          </div>

          <div className={`rounded-lg p-6 border ${isDark ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Lỗi</p>
                <p className={`text-2xl font-bold mt-1 text-red-500`}>{stats.summary.rejectedCount}</p>
              </div>
              <AlertCircle className="text-red-500" size={28} />
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Student Rankings */}
          <div className={`rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200'} overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700/50 bg-slate-700/50' : 'border-slate-200 bg-slate-50'}`}>
              <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Award className="text-amber-500" size={20} />
                Xếp Hạng Học Sinh
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={isDark ? 'bg-slate-700/30' : 'bg-gray-50'}>
                  <tr className={`border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                    <th className={`text-left px-4 py-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>STT</th>
                    <th className={`text-left px-4 py-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Học sinh</th>
                    <th className={`text-center px-4 py-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>AC</th>
                    <th className={`text-center px-4 py-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Nộp</th>
                    <th className={`text-right px-4 py-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map((student, idx) => (
                    <tr key={student.studentId} className={`border-b transition ${isDark ? 'border-slate-700/30 hover:bg-slate-700/20' : 'border-slate-100 hover:bg-gray-50'}`}>
                      <td className={`px-4 py-3 font-bold ${idx < 3 ? 'text-amber-500' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </td>
                      <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                        <div className="font-medium">{student.username}</div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{student.studentId || 'N/A'}</div>
                      </td>
                      <td className={`text-center px-4 py-3 font-semibold text-green-500`}>{student.acceptedCount}</td>
                      <td className={`text-center px-4 py-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{student.totalSubmissions}</td>
                      <td className={`text-right px-4 py-3 font-bold ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>{student.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Problem Statistics */}
          <div className={`rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200'} overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700/50 bg-slate-700/50' : 'border-slate-200 bg-slate-50'}`}>
              <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <TrendingUp className="text-indigo-600" size={20} />
                Thống Kê Bài Tập
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={isDark ? 'bg-slate-700/30' : 'bg-gray-50'}>
                  <tr className={`border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                    <th className={`text-left px-4 py-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Bài tập</th>
                    <th className={`text-center px-4 py-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Tổng</th>
                    <th className={`text-center px-4 py-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>AC</th>
                    <th className={`text-center px-4 py-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>WA</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProblems.map((problem) => {
                    const acRate = problem.totalSubmissions > 0 
                      ? Math.round((problem.accepted / problem.totalSubmissions) * 100)
                      : 0;
                    return (
                      <tr key={problem.problemId} className={`border-b transition ${isDark ? 'border-slate-700/30 hover:bg-slate-700/20' : 'border-slate-100 hover:bg-gray-50'}`}>
                        <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-800'} font-medium`}>
                          {problem.problemTitle}
                        </td>
                        <td className={`text-center px-4 py-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{problem.totalSubmissions}</td>
                        <td className={`text-center px-4 py-3 font-semibold text-green-500`}>{problem.accepted}</td>
                        <td className={`text-center px-4 py-3 font-semibold text-red-500`}>{problem.rejected}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Daily Trend Chart */}
        <div className={`mt-8 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200'} p-6`}>
          <h2 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Activity className="text-cyan-500" size={20} />
            Xu Hướng Nộp Bài (7 Ngày)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={isDark ? 'bg-slate-700/30' : 'bg-gray-50'}>
                <tr className={`border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                  <th className={`text-left px-4 py-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Ngày</th>
                  <th className={`text-center px-4 py-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Tổng Nộp</th>
                  <th className={`text-center px-4 py-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Accepted</th>
                  <th className={`text-center px-4 py-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>AC Rate</th>
                </tr>
              </thead>
              <tbody>
                {stats.dailyTrend?.map((day) => {
                  const acRate = day.count > 0 ? Math.round((day.accepted / day.count) * 100) : 0;
                  return (
                    <tr key={day.date} className={`border-b transition ${isDark ? 'border-slate-700/30 hover:bg-slate-700/20' : 'border-slate-100 hover:bg-gray-50'}`}>
                      <td className={`px-4 py-3 font-medium ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>{day.date}</td>
                      <td className={`text-center px-4 py-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{day.count}</td>
                      <td className={`text-center px-4 py-3 font-semibold text-green-500`}>{day.accepted}</td>
                      <td className={`text-center px-4 py-3 font-bold text-blue-600`}>{acRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDetail;
