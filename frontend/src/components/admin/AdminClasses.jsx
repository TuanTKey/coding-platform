import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, BookOpen, CheckCircle, TrendingUp, Search, School } from 'lucide-react';

const AdminClasses = () => {
  const [classes, setClasses] = useState([]);
  const [classStats, setClassStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const [classesRes, statsRes] = await Promise.all([
        api.get('/users/classes/all'),
        api.get('/submissions/admin/all?limit=1000') // Lấy tất cả submissions để tính stats
      ]);

      const classesList = classesRes.data.classes || [];
      const submissions = statsRes.data.submissions || [];

      // Tính toán thống kê cho từng lớp
      const stats = {};
      classesList.forEach(className => {
        const classSubmissions = submissions.filter(sub => sub.userId?.class === className);
        const acceptedSubmissions = classSubmissions.filter(sub => sub.status === 'accepted');
        const uniqueStudents = new Set(classSubmissions.map(sub => sub.userId?._id)).size;
        
        stats[className] = {
          totalSubmissions: classSubmissions.length,
          acceptedSubmissions: acceptedSubmissions.length,
          uniqueStudents,
          acceptanceRate: classSubmissions.length > 0 ? 
            ((acceptedSubmissions.length / classSubmissions.length) * 100).toFixed(1) : 0,
          solvedProblems: new Set(acceptedSubmissions.map(sub => sub.problemId?._id)).size
        };
      });

      setClasses(classesList);
      setClassStats(stats);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(className =>
    className.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Quản lý Lớp học</h1>
          <p className="text-gray-600">{classes.length} lớp học trong hệ thống</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm lớp học..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map(className => {
            const stats = classStats[className] || {
              totalSubmissions: 0,
              acceptedSubmissions: 0,
              uniqueStudents: 0,
              acceptanceRate: 0,
              solvedProblems: 0
            };

            return (
              <Link
                key={className}
                to={`/admin/class/${className}`}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <School className="text-white" size={24} />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{className}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Users size={16} className="mr-1" />
                      Học sinh:
                    </span>
                    <span className="font-semibold text-gray-800">{stats.uniqueStudents}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <BookOpen size={16} className="mr-1" />
                      Bài nộp:
                    </span>
                    <span className="font-semibold text-gray-800">{stats.totalSubmissions}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <CheckCircle size={16} className="mr-1" />
                      Bài đạt:
                    </span>
                    <span className="font-semibold text-green-600">{stats.acceptedSubmissions}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <TrendingUp size={16} className="mr-1" />
                      Tỉ lệ đạt:
                    </span>
                    <span className="font-semibold text-purple-600">{stats.acceptanceRate}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bài tập đã giải:</span>
                    <span className="font-semibold text-orange-600">{stats.solvedProblems}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-center text-sm text-blue-600 font-semibold">
                    Xem chi tiết →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <School size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-lg">Không tìm thấy lớp học nào</p>
            <p className="text-sm text-gray-400 mt-2">Thử thay đổi từ khóa tìm kiếm</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClasses;