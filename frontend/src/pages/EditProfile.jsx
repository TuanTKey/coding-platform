import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../components/admin/AuthContext';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await api.get('/users/me');
        const me = resp.data.user || resp.data;
        setForm({ fullName: me.fullName || '', email: me.email || '' });
      } catch (err) {
        console.error('Load profile', err);
        alert('Không thể tải thông tin để chỉnh sửa');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const updateField = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const resp = await api.put('/users/me', form);
      const updated = resp.data.user || resp.data;
      // update auth context if available
      if (setUser) setUser(prev => ({ ...prev, ...updated }));
      alert('Cập nhật thành công');
      navigate('/profile');
    } catch (err) {
      console.error('Save profile', err);
      alert('Lưu không thành công');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4">Chỉnh sửa hồ sơ</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
            <input value={form.fullName} onChange={updateField('fullName')} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input value={form.email} onChange={updateField('email')} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => navigate(-1)} className="px-3 py-2 border rounded">Hủy</button>
            <button type="submit" disabled={saving} className="px-3 py-2 bg-indigo-600 text-white rounded">{saving ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
