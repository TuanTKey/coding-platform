const API_BASE = 'http://10.125.204.93:5000/api';

export async function getUsers(token) {
  const res = await fetch(`${API_BASE}/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lấy danh sách user thất bại');
  return res.json();
}

export async function getUserById(id, token) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lấy thông tin user thất bại');
  return res.json();
}

export async function createUser(data, token) {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Tạo user thất bại');
  return res.json();
}

export async function updateUser(id, data, token) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Cập nhật user thất bại');
  return res.json();
}

export async function deleteUser(id, token) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Xóa user thất bại');
  return res.json();
}
