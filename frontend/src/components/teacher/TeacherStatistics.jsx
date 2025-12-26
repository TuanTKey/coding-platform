import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  TrendingUp, Users, FileCode, CheckCircle, AlertCircle, 
  Clock, BarChart3, LineChart, Activity, Award 
} from 'lucide-react';

// Simple stats card component
const StatCard = ({ title, value, subtitle, icon: Icon, color, isDark }) => (
  <div className={`rounded-lg p-6 flex flex-col justify-between transition-all hover:shadow-lg ${
    isDark 
      ? 'bg-gradient-to-br from-slate-800 to-slate-700/80 border border-slate-600/50' 
      : 'bg-gradient-to-br from-white to-slate-50 border border-slate-200/50'
  }`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      {subtitle && <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
        isDark ? 'bg-slate-700/50 text-cyan-300' : 'bg-blue-100 text-blue-700'
      }`}>{subtitle}</span>}
    </div>
    <div>
      <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {title}
      </p>
      <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  </div>
);

// Simple line chart using SVG
const SimpleLineChart = ({ data, isDark }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.count));
  const width = 600;
  const height = 300;
  const padding = 40;
  const plotWidth = width - 2 * padding;
  const plotHeight = height - 2 * padding;

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1)) * plotWidth,
    y: height - padding - (d.count / maxValue) * plotHeight,
    value: d.count
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className={`mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {/* Grid */}
        {[0, 1, 2, 3, 4].map(i => (
          <line 
            key={i}
            x1={padding} 
            y1={padding + (i * plotHeight) / 4} 
            x2={width - padding} 
            y2={padding + (i * plotHeight) / 4}
            stroke={isDark ? '#374151' : '#e5e7eb'}
            strokeWidth="1"
          />
        ))}

        {/* Y-axis labels */}
        {[0, 1, 2, 3, 4].map(i => (
          <text
            key={`y${i}`}
            x={padding - 10}
            y={height - padding - (i * plotHeight) / 4 + 5}
            textAnchor="end"
            className={`text-xs ${isDark ? 'fill-gray-400' : 'fill-gray-600'}`}
          >
            {Math.round((i * maxValue) / 4)}
          </text>
        ))}

        {/* X-axis */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} 
              stroke={isDark ? '#4b5563' : '#d1d5db'} strokeWidth="2" />

        {/* Y-axis */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} 
              stroke={isDark ? '#4b5563' : '#d1d5db'} strokeWidth="2" />

        {/* Line path */}
        <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="3" />

        {/* Points */}
        {points.map((p, i) => (
          <circle key={`point${i}`} cx={p.x} cy={p.y} r="4" fill="#3b82f6" />
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={`x${i}`}
            x={points[i].x}
            y={height - padding + 20}
            textAnchor="middle"
            className={`text-xs ${isDark ? 'fill-gray-400' : 'fill-gray-600'}`}
          >
            {d.date.slice(5)}
          </text>
        ))}
      </svg>
    </div>
  );
};

const TeacherStatistics = () => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/submissions/teacher/stats');
      setStats(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching teacher stats:', err);
      setError(err.response?.data?.error || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-96 ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Activity className={`animate-spin mx-auto mb-4 ${isDark ? 'text-cyan-400' : 'text-blue-500'}`} size={40} />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-700/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
        <p className="font-semibold">⚠️ {error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`p-6 rounded-lg text-center ${isDark ? 'bg-slate-800 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
        Không có dữ liệu
      </div>
    );
  }

  const { summary, problemStats, studentStats, dailyTrend } = stats;

  return (
    <div className={`space-y-8 ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 to-white'} p-6 rounded-lg`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Học sinh"
          value={summary.totalStudents}
          icon={Users}
          color="text-blue-500"
          isDark={isDark}
        />
        <StatCard 
          title="Tổng nộp bài"
          value={summary.totalSubmissions}
          icon={FileCode}
          color="text-purple-500"
          isDark={isDark}
        />
        <StatCard 
          title="Accepted"
          value={summary.acceptedCount}
          subtitle={`${summary.acRate}%`}
          icon={CheckCircle}
          color="text-green-500"
          isDark={isDark}
        />
        <StatCard 
          title="Pending"
          value={summary.pendingCount}
          icon={Clock}
          color="text-yellow-500"
          isDark={isDark}
        />
        <StatCard 
          title="Lỗi"
          value={summary.rejectedCount}
          icon={AlertCircle}
          color="text-red-500"
          isDark={isDark}
        />
      </div>

      {/* Daily Trend Chart */}
      <div className={`rounded-lg p-6 ${isDark ? 'bg-slate-800 border border-slate-700/50' : 'bg-white border border-slate-200/50 shadow-sm'}`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <LineChart className="text-blue-500" size={20} />
          Xu Hướng Nộp Bài (7 Ngày Gần Nhất)
        </h3>
        <SimpleLineChart data={dailyTrend} isDark={isDark} />
      </div>

      {/* Top Students */}
      <div className={`rounded-lg p-6 ${isDark ? 'bg-slate-800 border border-slate-700/50' : 'bg-white border border-slate-200/50 shadow-sm'}`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <Award className="text-amber-500" size={20} />
          Top Học Sinh
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200/50'}`}>
                <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Học sinh</th>
                <th className={`text-right py-3 px-4 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Accepted</th>
                <th className={`text-right py-3 px-4 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tổng nộp</th>
                <th className={`text-right py-3 px-4 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {studentStats.slice(0, 10).map((student, idx) => (
                <tr key={student.studentId} className={`border-b ${isDark ? 'border-slate-700/30 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-gray-50'} transition-colors`}>
                  <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="font-medium">{student.username}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{student.studentId || 'N/A'}</div>
                  </td>
                  <td className={`text-right py-3 px-4 font-semibold text-green-500`}>{student.acceptedCount}</td>
                  <td className={`text-right py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{student.totalSubmissions}</td>
                  <td className={`text-right py-3 px-4 font-semibold ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>{student.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Problem Statistics */}
      <div className={`rounded-lg p-6 ${isDark ? 'bg-slate-800 border border-slate-700/50' : 'bg-white border border-slate-200/50 shadow-sm'}`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <BarChart3 className="text-purple-500" size={20} />
          Thống Kê Theo Bài Tập
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {problemStats.slice(0, 10).map((problem) => (
            <div key={problem.problemId} className={`p-4 rounded-lg border ${isDark ? 'bg-slate-700/50 border-slate-600/50' : 'bg-gray-50 border-slate-200'}`}>
              <p className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {problem.problemTitle}
              </p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className={`p-2 rounded ${isDark ? 'bg-slate-600/50' : 'bg-white border border-slate-200'}`}>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tổng</p>
                  <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{problem.totalSubmissions}</p>
                </div>
                <div className={`p-2 rounded ${isDark ? 'bg-green-900/30' : 'bg-green-50 border border-green-200'}`}>
                  <p className={`text-xs text-green-600`}>AC</p>
                  <p className={`font-bold text-green-600`}>{problem.accepted}</p>
                </div>
                <div className={`p-2 rounded ${isDark ? 'bg-red-900/30' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`text-xs text-red-600`}>WA</p>
                  <p className={`font-bold text-red-600`}>{problem.rejected}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherStatistics;
