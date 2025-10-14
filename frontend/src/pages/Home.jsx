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

  useEffect(() => {
    fetchContests();
    fetchStats();
  }, []);

  const fetchContests = async () => {
    try {
      const response = await api.get('/contests');
      // API trả về { contests: [...], totalPages, ... }
      const contestsData = response.data.contests || response.data;
      setContests(Array.isArray(contestsData) ? contestsData.slice(0, 3) : []);
    } catch (error) {
      console.error('Error fetching contests:', error);
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
    if (now < startTime) return 'Upcoming';
    if (now >= startTime && now <= endTime) return 'Ongoing';
    return 'Completed';
  };

  const getContestDuration = (contest) => {
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    const hours = Math.round((end - start) / (1000 * 60 * 60));
    return `${hours}h`;
  };

  const statusBadge = (status) => {
    const colors = {
      'Ongoing': 'bg-green-500 text-white',
      'Upcoming': 'bg-blue-500 text-white',
      'Completed': 'bg-gray-500 text-white'
    };
    return colors[status] || 'bg-gray-500 text-white';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 lg:py-20">
          <div className="text-center">
            {/* Logo */}
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Code className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Code<span className="text-cyan-300">Judge</span>
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Nền tảng luyện tập lập trình và thi đấu trực tuyến với AI Judge
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {!user ? (
                <>
                  <Link 
                    to="/register" 
                    className="group bg-white hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold text-indigo-600 transition-all flex items-center gap-2 shadow-lg"
                  >
                    Bắt đầu ngay
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/problems" 
                    className="border-2 border-white/50 hover:border-white text-white px-6 py-3 rounded-lg font-semibold transition-all hover:bg-white/10"
                  >
                    Xem bài tập
                  </Link>
                </>
              ) : (
                <Link 
                  to="/problems" 
                  className="group bg-white hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold text-indigo-600 transition-all flex items-center gap-2 shadow-lg"
                >
                  Làm bài tập
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { icon: Trophy, value: stats.totalContests, label: 'Cuộc thi' },
                { icon: BookOpen, value: stats.totalProblems, label: 'Bài tập' },
                { icon: Terminal, value: '4+', label: 'Ngôn ngữ' },
                { icon: Zap, value: '<1s', label: 'Chấm bài' }
              ].map((item, i) => (
                <div key={i} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4">
                  <item.icon className="w-5 h-5 text-cyan-300 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{item.value}</div>
                  <div className="text-xs text-blue-200">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contests Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Cuộc thi
          </h2>
          <Link to="/contests" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            Xem tất cả →
          </Link>
        </div>
        
        {contests.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
            <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Chưa có cuộc thi nào</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {contests.map((contest) => {
              const status = getContestStatus(contest);
              return (
                <Link 
                  key={contest._id}
                  to={`/contests/${contest._id}`}
                  className="group bg-white border border-gray-200 hover:border-indigo-300 rounded-xl p-5 transition-all hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {contest.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge(status)}`}>
                      {status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {contest.problems?.length || 0} bài
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {getContestDuration(contest)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Tính năng
        </h2>
        
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { icon: Terminal, title: 'Code Editor', desc: 'Monaco Editor với syntax highlighting', color: 'text-blue-500', bg: 'bg-blue-50' },
            { icon: Zap, title: 'AI Judge', desc: 'Chấm bài tự động bằng Gemini AI', color: 'text-green-500', bg: 'bg-green-50' },
            { icon: Trophy, title: 'Cuộc thi', desc: 'Thi đấu và xếp hạng realtime', color: 'text-amber-500', bg: 'bg-amber-50' },
            { icon: Users, title: 'Lớp học', desc: 'Quản lý học sinh và bài tập', color: 'text-purple-500', bg: 'bg-purple-50' }
          ].map((f, i) => (
            <div key={i} className={`${f.bg} border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all`}>
              <f.icon className={`w-8 h-8 ${f.color} mb-3`} />
              <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-indigo-100 mb-6">
            Đăng ký ngay để luyện tập và nâng cao kỹ năng lập trình
          </p>
          {!user ? (
            <Link 
              to="/register" 
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-indigo-600 transition-all shadow-lg"
            >
              Tạo tài khoản miễn phí
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link 
              to="/problems" 
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-indigo-600 transition-all shadow-lg"
            >
              Làm bài ngay
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;