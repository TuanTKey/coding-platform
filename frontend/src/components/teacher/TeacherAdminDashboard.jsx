import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { authService } from '../../services/auth';
import { Users, FileCode, Send, Trophy, TrendingUp, BookOpen, School } from 'lucide-react';

const TeacherAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProblems: 0,
    totalSubmissions: 0,
    totalContests: 0,
    totalClasses: 0,
    recentSubmissions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      // Fetch all problems and contests (no filter)
      const [problemsRes, contestsRes, submissionsRes, classesRes] = await Promise.all([
        api.get('/problems?limit=1&page=1'),
        api.get('/contests?limit=1&page=1'),
        api.get('/submissions/admin/all?limit=10'),
        api.get('/admin/classes')
      ]);

      setStats(prev => ({
        ...prev,
        totalProblems: problemsRes.data.total || 0,
        totalContests: contestsRes.data.total || 0,
        totalSubmissions: submissionsRes.data.total || 0,
        totalClasses: (classesRes.data.classes || []).length || classesRes.data.total || 0,
        recentSubmissions: submissionsRes.data.submissions || []
      }));
    } catch (err) {
      console.error('Load teacher admin stats', err);
      setStats(prev => ({ ...prev, recentSubmissions: [] }));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Trang Quản lý (Giáo viên)</h1>
          <p className="text-gray-600">Giao diện quản lý dành cho giáo viên</p>
          <div className="mt-2 text-sm text-gray-500">Bạn có thể quản lý bài tập, cuộc thi và theo dõi nộp bài trong phạm vi được phân công.</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/admin/problems" className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-8 border border-gray-200 flex flex-col items-start justify-center">
            <div className={`w-14 h-14 mb-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center`}>
              <FileCode className="text-white" size={28} />
            </div>
            <h3 className="text-gray-700 text-lg font-semibold mb-2">Quản lý bài tập</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalProblems || 0}</p>
            <p className="text-xs text-gray-500 mt-3">Nhấp để vào phần quản lý bài tập</p>
          </Link>

          <Link to="/admin/contests" className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-8 border border-gray-200 flex flex-col items-start justify-center">
            <div className={`w-14 h-14 mb-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center`}>
              <Trophy className="text-white" size={28} />
            </div>
            <h3 className="text-gray-700 text-lg font-semibold mb-2">Quản lý cuộc thi</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalContests || 0}</p>
            <p className="text-xs text-gray-500 mt-3">Nhấp để vào phần quản lý cuộc thi</p>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/admin/problems/create" className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold text-center">+ Tạo Problem Mới</Link>
              <Link to="/admin/contests/create" className="block w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg font-semibold text-center">+ Tạo Cuộc thi Mới</Link>
              <Link to="/admin/submissions/problems" className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold text-center">📝 Quản lý Submit Bài Tập</Link>
              <Link to="/admin/classes" className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold text-center">Quản lý Lớp học</Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Bài nộp gần đây</h2>
              <span className="text-sm text-gray-500">{stats.recentSubmissions.length} bài</span>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.recentSubmissions.length > 0 ? (
                stats.recentSubmissions.map((submission, index) => (
                  <div key={submission._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-800">{submission.userId?.username || 'Unknown'}</p>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{submission.userId?.class || 'N/A'}</span>
                      </div>
                      <p className="text-sm text-gray-600">{submission.problemId?.title || 'Unknown Problem'}</p>
                      <p className="text-xs text-gray-500">{new Date(submission.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${submission.status === 'accepted' ? 'bg-green-100 text-green-800' : submission.status === 'wrong_answer' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{submission.status === 'accepted' ? 'ĐẠT' : submission.status === 'wrong_answer' ? 'SAI' : submission.status}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Send size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Chưa có bài nộp nào</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAdminDashboard;
