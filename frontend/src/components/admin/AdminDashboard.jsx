import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, FileCode, Send, Trophy, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProblems: 0,
    totalSubmissions: 0,
    totalContests: 0,
    recentSubmissions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('🔄 Fetching admin stats...');
      
      // Fetch từ các endpoints
      const [usersRes, problemsRes, submissionsRes, contestsRes] = await Promise.all([
        api.get('/users?limit=1&page=1'),
        api.get('/problems?limit=1&page=1'),
        api.get('/submissions/admin/all?limit=10'),
        api.get('/contests?limit=1&page=1')
      ]);

      console.log('📊 API Responses:', {
        users: usersRes.data,
        problems: problemsRes.data,
        submissions: submissionsRes.data
      });

      setStats({
        totalUsers: usersRes.data.total || 0,
        totalProblems: problemsRes.data.total || 0,
        totalSubmissions: submissionsRes.data.total || 0,
        totalContests: contestsRes.data.total || 0,
        recentSubmissions: submissionsRes.data.submissions || []
      });

    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      
      // Fallback: thử lấy từng cái một
      try {
        const usersRes = await api.get('/users?limit=1&page=1');
        const usersTotal = usersRes.data.total || usersRes.data.users?.length || 0;
        console.log('👥 Users total:', usersTotal);
        setStats(prev => ({ ...prev, totalUsers: usersTotal }));
      } catch (e) {
        console.error('❌ Failed to fetch users:', e);
      }

      try {
        const problemsRes = await api.get('/problems?limit=1&page=1');
        const problemsTotal = problemsRes.data.total || problemsRes.data.problems?.length || 0;
        console.log('📝 Problems total:', problemsTotal);
        setStats(prev => ({ ...prev, totalProblems: problemsTotal }));
      } catch (e) {
        console.error('❌ Failed to fetch problems:', e);
      }

      try {
        const submissionsRes = await api.get('/submissions/admin/all?limit=10');
        const submissionsTotal = submissionsRes.data.total || submissionsRes.data.submissions?.length || 0;
        console.log('📨 Submissions total:', submissionsTotal);
        setStats(prev => ({ 
          ...prev, 
          totalSubmissions: submissionsTotal,
          recentSubmissions: submissionsRes.data.submissions || []
        }));
      } catch (e) {
        console.error('❌ Failed to fetch submissions:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Tổng Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      link: '/admin/users'
    },
    {
      title: 'Tổng Problems',
      value: stats.totalProblems,
      icon: FileCode,
      color: 'from-green-500 to-green-600',
      link: '/admin/problems'
    },
    {
      title: 'Tổng Submissions',
      value: stats.totalSubmissions,
      icon: Send,
      color: 'from-purple-500 to-purple-600',
      link: '/admin/submissions'
    },
    {
      title: 'Tổng Contests',
      value: stats.totalContests,
      icon: Trophy,
      color: 'from-orange-500 to-orange-600',
      link: '/admin/contests'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Quản lý coding platform</p>
          <div className="mt-2 text-sm text-gray-500">
            Debug: Users: {stats.totalUsers} | Problems: {stats.totalProblems} | Submissions: {stats.totalSubmissions}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link
                key={index}
                to={stat.link}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <TrendingUp className="text-green-500" size={20} />
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">Click để xem chi tiết</p>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions & Recent Submissions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/admin/problems/create"
                className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition text-center"
              >
                + Tạo Problem Mới
              </Link>
              <Link
                to="/admin/contests/create"
                className="block w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition text-center"
              >
                + Tạo Cuộc thi Mới
              </Link>
              <Link
                to="/admin/users"
                className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition text-center"
              >
                Quản lý Users
              </Link>
              <Link
                to="/admin/submissions"
                className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition text-center"
              >
                Xem tất cả Submissions
              </Link>
            </div>
          </div>

          {/* Recent Submissions */}
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
                      <p className="font-semibold text-gray-800">
                        {submission.userId?.username || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {submission.problemId?.title || 'Unknown Problem'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(submission.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      submission.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      submission.status === 'wrong_answer' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {submission.status === 'accepted' ? 'ĐẠT' :
                       submission.status === 'wrong_answer' ? 'SAI' :
                       submission.status}
                    </span>
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

export default AdminDashboard;