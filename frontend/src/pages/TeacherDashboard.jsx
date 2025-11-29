import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../components/admin/AuthContext';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await api.get('/teacher/me');
        setStudents(resp.data.students || []);
        setClasses(resp.data.classes || []);
      } catch (err) {
        console.error('Load teacher data', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Teacher Dashboard</h1>
      <div className="mb-6">
        <h2 className="text-lg font-medium">Xin chào, {user?.fullName || user?.username}</h2>
        <p className="text-sm text-gray-600">Role: {user?.role}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium">Lớp được phân công</h3>
          {classes.length === 0 ? (
            <p className="text-sm text-gray-500">Không có lớp nào được phân công.</p>
          ) : (
            <ul className="mt-2">
              {classes.map((c) => (
                <li key={c._id} className="py-1">{c.name} - {c.description}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium">Học sinh</h3>
          {students.length === 0 ? (
            <p className="text-sm text-gray-500">Không có học sinh.</p>
          ) : (
            <ul className="mt-2">
              {students.map(s => (
                <li key={s._id} className="py-1">{s.fullName || s.username} &lt;{s.email}&gt;</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-medium">Quyền</h3>
        <p className="text-sm text-gray-600">Bạn có thể quản lý sinh viên, bài tập, cuộc thi và điểm trong phạm vi lớp được phân công. (Giao diện chi tiết có thể được thêm tiếp theo.)</p>
      </div>
      <div className="mt-6">
        <h3 className="font-medium">Hành động nhanh</h3>
        <div className="mt-2">
          <button onClick={() => window.location.href = '/teacher/students'} className="bg-indigo-600 text-white px-4 py-2 rounded mr-2">Quản lý Học sinh</button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
