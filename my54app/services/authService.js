export async function register(data) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Đăng ký thất bại');
  return res.json();
}
const API_BASE = 'http://10.125.204.93:5000/api';

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error('Sai tài khoản hoặc mật khẩu');
  return res.json(); // { token, user }
}
