import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../components/admin/AuthContext';

const StatCard = ({ title, value, subtitle, children }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col justify-between">
    <div>
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
    {children && <div className="mt-4">{children}</div>}
  </div>
);

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await api.get('/users/teacher/me');
        setStudents(resp.data.students || []);
        setClasses(resp.data.classes || []);
      } catch (err) {
        console.error('Load teacher data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow">{user?.username?.[0]?.toUpperCase()}</div>
          <div>
            <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
            <div className="text-sm text-gray-500 mt-1">Xin chào, <span className="font-medium">{user?.fullName || user?.username}</span></div>
          </div>
        </div>
        <div className="text-sm text-gray-600">Role: <span className="font-semibold text-indigo-600">{user?.role}</span></div>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard title="Lớp được phân công" value={classes.length} subtitle={loading ? 'Đang tải...' : classes.map(c => c.name).join(', ') || 'Chưa có lớp'}>
            <a href="/teacher/students" className="text-xs text-indigo-600 hover:underline">Xem chi tiết &rarr;</a>
          </StatCard>

          <StatCard title="Học sinh" value={students.length} subtitle={loading ? 'Đang tải...' : 'Tổng số học sinh trong lớp'}>
            <a href="/teacher/students" className="text-xs text-indigo-600 hover:underline">Quản lý học sinh</a>
          </StatCard>

          <StatCard title="Chức năng" value="Quản lý" subtitle="Quyền: quản lý sinh viên, điểm (phạm vi lớp)">
            <div className="flex space-x-2">
              <button onClick={() => window.location.href = '/teacher/students'} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm">Quản lý Học sinh</button>
              <button onClick={() => alert('Giao diện chấm/override sẽ được triển khai')} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm">Chấm & Override</button>
            </div>
          </StatCard>
        </div>

        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Thông tin nhanh</h2>
          <div className="text-sm text-gray-700">
            <p><strong>Lớp được phân công:</strong> {classes.length ? classes.map(c => c.name).join(', ') : 'Không có lớp nào'}</p>
            <p className="mt-2"><strong>Học sinh:</strong> {students.length} người</p>
            <p className="mt-2 text-gray-500">Giao diện quản lý chi tiết có thể mở rộng: danh sách bài tập, cuộc thi, và giao diện chấm điểm trong phạm vi lớp.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TeacherDashboard;
