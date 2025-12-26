const API_BASE = 'http://10.125.204.93:5000/api';

export async function getProblems(token) {
  const res = await fetch(`${API_BASE}/problems`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lấy danh sách problem thất bại');
  return res.json();
}

export async function getProblemById(id, token) {
  const res = await fetch(`${API_BASE}/problems/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lấy thông tin problem thất bại');
  return res.json();
}

export async function createProblem(data, token) {
  const res = await fetch(`${API_BASE}/problems`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Tạo problem thất bại');
  return res.json();
}

export async function updateProblem(id, data, token) {
  const res = await fetch(`${API_BASE}/problems/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Cập nhật problem thất bại');
  return res.json();
}

export async function deleteProblem(id, token) {
  const res = await fetch(`${API_BASE}/problems/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Xóa problem thất bại');
  return res.json();
}
