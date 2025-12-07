import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

const TeacherStudents = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialClassParam = searchParams.get('classId') || 'all';

  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [classId, setClassId] = useState(initialClassParam === 'all' ? '' : initialClassParam);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState(initialClassParam);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/users/teacher/students');
      setClasses(resp.data.classes || []);
      setStudents(resp.data.students || []);
      if ((resp.data.classes || []).length > 0 && selectedClass === 'all') setSelectedClass(resp.data.classes[0]._id);
    } catch (err) {
      console.error('Load teacher students', err);
      if (err.response?.status === 403) navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // keep add-form classId in sync with currently selected class
  useEffect(() => {
    if (selectedClass && selectedClass !== 'all') {
      setClassId(selectedClass);
    }
  }, [selectedClass]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!studentId || !classId) return alert('studentId và classId là bắt buộc');
    try {
      await api.post('/users/teacher/students', { studentId, classId });
      setStudentId('');
      await load();
      alert('Thêm học sinh thành công');
    } catch (err) {
      console.error('Add student', err);
      alert(err.response?.data?.error || 'Lỗi khi thêm học sinh');
    }
  };

  const handleRemove = async (sid, cid) => {
    if (!confirm('Bạn có chắc muốn xóa học sinh khỏi lớp?')) return;
    try {
      await api.delete(`/users/teacher/students/${sid}`, { data: { classId: cid } });
      await load();
      alert('Xóa thành công');
    } catch (err) {
      console.error('Remove student', err);
      alert(err.response?.data?.error || 'Lỗi khi xóa học sinh');
    }
  };

  if (loading) return (<div className="p-8">Đang tải...</div>);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Quản lý Học sinh</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-medium mb-3">Thêm học sinh vào lớp</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="Student ID" className="p-2 border rounded" />
          <select value={classId} onChange={e => setClassId(e.target.value)} className="p-2 border rounded">
            {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.description}</option>)}
          </select>
          <div>
            <button className="bg-purple-600 text-white px-4 py-2 rounded">Thêm</button>
          </div>
        </form>
        <p className="text-sm text-gray-500 mt-2">Bạn có thể dùng ID người dùng để thêm nhanh. (Có thể mở rộng để search username/email)</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-medium mb-3">Học sinh trong các lớp của bạn</h3>
        {classes.length === 0 ? (
          <p className="text-sm text-gray-500">Bạn chưa được phân công lớp nào.</p>
        ) : (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <label className="text-sm font-medium">Lọc theo lớp:</label>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="p-2 border rounded">
                <option value="all">Tất cả lớp</option>
                {classes.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {(() => {
              const classesToShow = selectedClass === 'all' ? classes : classes.filter(c => c._id.toString() === selectedClass.toString());
              return classesToShow.map(c => (
                <div key={c._id} className="mb-4">
                  <div className="font-semibold">{c.name} - {c.description}</div>
                  <div className="mt-2">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-sm text-gray-600">
                          <th className="py-2">Username</th>
                          <th className="py-2">Email</th>
                          <th className="py-2">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.filter(s => s.class === c.name).map(s => (
                          <tr key={s._id} className="border-t">
                            <td className="py-2">{s.username}</td>
                            <td className="py-2">{s.email}</td>
                            <td className="py-2">
                              <div className="flex items-center gap-3">
                                <button onClick={() => navigate(`/users/${s._id}`)} className="text-indigo-600 text-sm">Xem</button>
                                <button onClick={() => handleRemove(s._id, c._id)} className="text-red-600 text-sm">Xóa</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherStudents;
