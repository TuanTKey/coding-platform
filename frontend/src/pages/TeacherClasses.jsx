import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const TeacherClasses = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await api.get('/users/teacher/me');
        setClasses(resp.data.classes || []);
      } catch (err) {
        console.error('Load classes', err);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Đang tải lớp...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Lớp được phân công</h1>
      {classes.length === 0 ? (
        <div className="bg-white p-4 rounded shadow text-sm text-gray-600">Bạn chưa được phân công lớp nào.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {classes.map(c => (
            <div key={c._id} className="bg-white p-4 rounded shadow flex items-center justify-between">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-gray-500">{c.description || 'Không có mô tả'}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => navigate(`/teacher/students?classId=${c._id}`)} className="px-3 py-1.5 bg-indigo-600 text-white rounded">Quản lý học sinh</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherClasses;
