import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../components/admin/AuthContext';

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../components/admin/AuthContext';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const path = id ? `/users/${id}` : '/users/me';
        const resp = await api.get(path);
        setProfile(resp.data.user || resp.data);
      } catch (err) {
        console.error('Load profile', err);
        alert('Không thể tải thông tin người dùng');
        if (!id) navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (<div className="p-6">Đang tải...</div>);
  if (!profile) return (<div className="p-6">Không tìm thấy người dùng.</div>);

  const isMe = user && (user.id === profile.id || user._id === profile.id || (!id && true));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded shadow p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">{(profile.username||profile.username||'U')[0]?.toUpperCase()}</div>
          <div>
            <h2 className="text-2xl font-bold">{profile.fullName || profile.username}</h2>
            <div className="text-sm text-gray-600">Username: {profile.username}</div>
            <div className="text-sm text-gray-600">Email: {profile.email || '-'}</div>
            <div className="text-sm text-gray-600">Lớp: {profile.class || '-'}</div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold">Thông tin khác</h3>
          <div className="text-sm text-gray-700 mt-2">
            <p>Vai trò: {profile.role || '-'}</p>
            <p>Đăng ký: {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : '-'}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button className="px-3 py-1.5 bg-gray-100 rounded" onClick={() => navigate(-1)}>Quay lại</button>
          {isMe && <button className="px-3 py-1.5 bg-indigo-600 text-white rounded" onClick={() => navigate('/profile/edit')}>Chỉnh sửa</button>}
        </div>
      </div>
    </div>
  );
};

export default Profile;
