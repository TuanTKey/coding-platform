import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/admin/AuthContext';
import { Trophy, Users, Zap, ChevronRight, Code, Terminal, Clock, BookOpen } from 'lucide-react';
import api from '../services/api';

const Home = () => {
  const { user } = useAuth();
  const [contests, setContests] = useState([]);
  const [stats, setStats] = useState({
    totalContests: 0,
    totalProblems: 0
  });
  const [recentProblems, setRecentProblems] = useState([]);
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    fetchContests();
    fetchStats();
    fetchRecentProblems();
    fetchTopUsers();
  }, []);

  const fetchContests = async () => {
    try {
      const response = await api.get('/contests');
      const contestsData = response.data.contests || response.data;
      setContests(Array.isArray(contestsData) ? contestsData.slice(0, 3) : []);
    } catch (error) {
      console.error('Error fetching contests:', error);
    }
  };

  const fetchRecentProblems = async () => {
    try {
      const res = await api.get('/problems?limit=6');
      const problems = res.data.problems || res.data;
      setRecentProblems(Array.isArray(problems) ? problems.slice(0, 6) : []);
    } catch (error) {
      console.error('Error fetching recent problems:', error);
    }
  };

  const fetchTopUsers = async () => {
    try {
      const res = await api.get('/users/leaderboard?limit=5');
      setTopUsers(res.data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [contestsRes, problemsRes] = await Promise.all([
        api.get('/contests'),
        api.get('/problems')
      ]);
      setStats({
        totalContests: contestsRes.data.total || contestsRes.data.contests?.length || 0,
        totalProblems: problemsRes.data.total || problemsRes.data.problems?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getContestStatus = (contest) => {
    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);
    if (now < startTime) return 'Sắp diễn ra';
    if (now >= startTime && now <= endTime) return 'Đang diễn ra';
    return 'Đã kết thúc';
  };

  const getContestDuration = (contest) => {
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    const hours = Math.round((end - start) / (1000 * 60 * 60));
    return `${hours} giờ`;
  };

  const statusBadge = (status) => {
    const colors = {
      'Đang diễn ra': 'bg-green-500 text-white',
      'Sắp diễn ra': 'bg-blue-500 text-white',
      'Đã kết thúc': 'bg-gray-500 text-white'
    };
    return colors[status] || 'bg-gray-500 text-white';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section - Full width */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative w-full mx-auto px-8 py-16">
          <div className="text-center">
            {/* Logo */}
            <div className="inline-flex items-center gap-4 mb-8">
              <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <Code className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-6xl font-bold text-white">
                Code<span className="text-cyan-300">Judge</span>
              </h1>
            </div>
            
            <p className="text-2xl text-blue-100 max-w-4xl mx-auto mb-12">
              Nền tảng luyện tập lập trình và thi đấu trực tuyến với AI Judge
            </p>
            
            {/* CTA Buttons */}
            <div className="flex justify-center gap-6 mb-16">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-3 px-10 py-5 text-xl rounded-lg bg-white text-indigo-600 font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    Bắt đầu ngay
                    <ChevronRight className="w-6 h-6" />
                  </Link>
                  <Link
                    to="/problems"
                    className="inline-flex items-center gap-3 px-8 py-4 text-lg rounded-lg border-2 border-white/40 text-white bg-white/10 hover:bg-white/20 transition-all duration-300"
                  >
                    Xem bài tập
                  </Link>
                </>
              ) : (
                <Link
                  to="/problems"
                  className="inline-flex items-center gap-3 px-10 py-5 text-xl rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Làm bài tập
                  <ChevronRight className="w-6 h-6" />
                </Link>
              )}
            </div>

            {/* Stats Cards */}
            <div className="flex justify-center gap-8 max-w-5xl mx-auto">
              {[
                { icon: Trophy, value: stats.totalContests, label: 'Cuộc thi' },
                { icon: BookOpen, value: stats.totalProblems, label: 'Bài tập' },
                { icon: Terminal, value: '4+', label: 'Ngôn ngữ' },
                { icon: Zap, value: '<1s', label: 'Chấm bài' }
              ].map((item, i) => (
                <div key={i} className="bg-white/10 backdrop-blur border border-white/30 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 min-w-[180px]">
                  <item.icon className="w-8 h-8 text-cyan-300 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white">{item.value}</div>
                  <div className="text-sm text-blue-200 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Full width grid */}
      <div className="w-full px-8 py-12">
        <div className="flex gap-8 max-w-[1920px] mx-auto">
          {/* Left Column - Contests (70% width) */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <Trophy className="w-7 h-7 text-amber-500" />
                  Cuộc thi sắp diễn ra
                </h2>
                <Link to="/contests" className="inline-flex items-center px-5 py-2.5 rounded-lg border border-gray-300 text-base text-gray-700 hover:bg-gray-50 hover:border-indigo-400 transition-all">
                  Xem tất cả →
                </Link>
              </div>

              {contests.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
                  <Trophy className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Chưa có cuộc thi nào</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {contests.map((contest) => {
                    const status = getContestStatus(contest);
                    return (
                      <Link
                        key={contest._id}
                        to={`/contests/${contest._id}`}
                        className="group bg-white border border-gray-200 hover:border-indigo-400 rounded-xl p-6 transition-all hover:shadow-lg flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className="font-bold text-xl text-gray-800 group-hover:text-indigo-600 transition-colors">
                              {contest.title}
                            </h3>
                            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${statusBadge(status)}`}>
                              {status}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4">{contest.description}</p>
                          <div className="flex items-center gap-8 text-sm text-gray-500">
                            <span className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              {contest.problems?.length || 0} bài tập
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {getContestDuration(contest)}
                            </span>
                            <span className="text-gray-400">
                              Bắt đầu: {new Date(contest.startTime).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Recent Problems & Leaderboard (30% width) */}
          <div className="w-[400px] space-y-8">
            {/* Recent Problems */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Bài tập mới</h3>
                <Link to="/problems" className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-100">
                  Xem tất cả
                </Link>
              </div>
              {recentProblems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Không có bài tập mới.</p>
              ) : (
                <ul className="space-y-4">
                  {recentProblems.map(p => (
                    <li key={p._id} className="hover:bg-gray-50 rounded-lg p-3 transition-colors">
                      <Link to={`/problems/${p._id}`} className="block">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-gray-800 hover:text-indigo-600 line-clamp-1">{p.title}</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            p.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                            p.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            p.difficulty === 'Hard' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {p.difficulty || 'N/A'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Bảng xếp hạng</h3>
                <Link to="/leaderboard" className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-100">
                  Chi tiết
                </Link>
              </div>
              {topUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Không có dữ liệu xếp hạng.</p>
              ) : (
                <ol className="space-y-4">
                  {topUsers.map((u, index) => (
                    <li key={u._id} className="flex items-center justify-between hover:bg-gray-50 rounded-lg p-3 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                          index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                          index === 2 ? 'bg-gradient-to-r from-amber-700 to-amber-800' :
                          'bg-gradient-to-r from-indigo-500 to-purple-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{u.username}</div>
                          {u.studentId && (
                            <div className="text-xs text-gray-500">SV: {u.studentId}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-600">{u.rating}</div>
                        <div className="text-xs text-gray-500">{u.solvedProblems || 0} bài</div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Full width */}
      <div className="w-full bg-gradient-to-b from-slate-50 to-white py-16 px-8">
        <div className="max-w-[1920px] mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-10 flex items-center gap-3">
            <Zap className="w-7 h-7 text-yellow-500" />
            Tính năng nổi bật
          </h2>
          
          <div className="grid grid-cols-4 gap-8">
            {[
              { icon: Terminal, title: 'Code Editor', desc: 'Monaco Editor với syntax highlighting, autocomplete và gợi ý thông minh', color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: Zap, title: 'AI Judge', desc: 'Chấm bài tự động bằng Gemini AI với độ chính xác cao và phản hồi tức thì', color: 'text-green-500', bg: 'bg-green-50' },
              { icon: Trophy, title: 'Cuộc thi', desc: 'Thi đấu và xếp hạng realtime với giao diện trực quan và cạnh tranh', color: 'text-amber-500', bg: 'bg-amber-50' },
              { icon: Users, title: 'Lớp học', desc: 'Quản lý bài tập, cuộc thi và theo dõi tiến độ học tập của sinh viên', color: 'text-purple-500', bg: 'bg-purple-50' }
            ].map((f, i) => (
              <div key={i} className={`${f.bg} border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-lg ${f.color.replace('text-', 'bg-')} bg-opacity-20`}>
                    <f.icon className={`w-8 h-8 ${f.color}`} />
                  </div>
                  <h3 className="font-bold text-xl text-gray-800">{f.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA - Full width */}
      <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="text-center px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Sẵn sàng bắt đầu hành trình lập trình?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Tham gia cộng đồng lập trình viên, nâng cao kỹ năng và trải nghiệm hệ thống chấm bài AI thông minh
          </p>
          {!user ? (
            <Link 
              to="/register" 
              className="inline-flex items-center gap-3 bg-white hover:bg-gray-100 px-12 py-5 rounded-xl font-bold text-indigo-600 transition-all shadow-xl hover:scale-105 text-lg"
            >
              Đăng ký miễn phí ngay
              <ChevronRight className="w-6 h-6" />
            </Link>
          ) : (
            <Link 
              to="/problems" 
              className="inline-flex items-center gap-3 bg-white hover:bg-gray-100 px-12 py-5 rounded-xl font-bold text-indigo-600 transition-all shadow-xl hover:scale-105 text-lg"
            >
              Khám phá bài tập mới
              <ChevronRight className="w-6 h-6" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;