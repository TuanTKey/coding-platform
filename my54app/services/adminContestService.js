const API_BASE = 'http://10.125.204.93:5000/api';

export async function getContests(token) {
  const res = await fetch(`${API_BASE}/contests`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lấy danh sách contest thất bại');
  return res.json();
}

export async function getContestById(id, token) {
  const res = await fetch(`${API_BASE}/contests/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lấy thông tin contest thất bại');
  return res.json();
}

export async function createContest(data, token) {
  const res = await fetch(`${API_BASE}/contests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Tạo contest thất bại');
  return res.json();
}

export async function updateContest(id, data, token) {
  const res = await fetch(`${API_BASE}/contests/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Cập nhật contest thất bại');
  return res.json();
}

export async function deleteContest(id, token) {
  const res = await fetch(`${API_BASE}/contests/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Xóa contest thất bại');
  return res.json();
}
