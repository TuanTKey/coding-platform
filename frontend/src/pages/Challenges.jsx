import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Filter, Code2, Trophy, Clock, Zap, Star, Users, BookOpen } from 'lucide-react';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, problems, contests
  const [filters, setFilters] = useState({
    difficulty: '',
    search: '',
    tags: ''
  });

  useEffect(() => {
    fetchChallenges();
  }, [filters, activeTab]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.search) params.append('search', filters.search);
      if (filters.tags) params.append('tags', filters.tags);

      // Fetch both problems and contests
      const [problemsRes, contestsRes] = await Promise.all([
        api.get(`/problems?${params.toString()}`),
        api.get(`/contests?${params.toString()}`)
      ]);

      // Combine and tag challenges
      const problems = (problemsRes.data.problems || []).map(p => ({
        ...p,
        type: 'problem',
        typeLabel: 'Bài tập'
      }));

      const contests = (contestsRes.data.contests || []).map(c => ({
        ...c,
        type: 'contest',
        typeLabel: 'Cuộc thi'
      }));

      // Filter based on active tab
      let combined = [...problems, ...contests];
      if (activeTab === 'problems') combined = problems;
      if (activeTab === 'contests') combined = contests;

      setChallenges(combined);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          badge: 'bg-green-100 text-green-800'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          badge: 'bg-yellow-100 text-yellow-800'
        };
      case 'hard':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          badge: 'bg-red-100 text-red-800'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          badge: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const getContestStatus = (contest) => {
    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);
    if (now < startTime) return { status: 'upcoming', label: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-800' };
    if (now >= startTime && now <= endTime) return { status: 'running', label: 'Đang diễn ra', color: 'bg-green-100 text-green-800' };
    return { status: 'ended', label: 'Đã kết thúc', color: 'bg-gray-100 text-gray-800' };
  };

  const getContestDuration = (contest) => {
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    const hours = Math.round((end - start) / (1000 * 60 * 60));
    return `${hours}h`;
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'Dễ';
      case 'medium':
        return 'Trung bình';
      case 'hard':
        return 'Khó';
      default:
        return 'N/A';
    }
  };

  const renderProblemCard = (problem) => {
    const colors = getDifficultyColor(problem.difficulty);
    return (
      <Link
        key={problem._id}
        to={`/problems/${problem.slug}`}
        className={`group block ${colors.bg} border ${colors.border} rounded-xl p-6 transition-all hover:shadow-lg hover:border-indigo-400`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <h3 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600 transition-colors">
                {problem.title}
              </h3>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {problem.description}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ml-2 ${colors.badge}`}>
            {getDifficultyLabel(problem.difficulty)}
          </span>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Users size={14} />
            <span>{problem.submissionCount || 0} nộp</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Star size={14} className={problem.acceptedCount ? 'text-yellow-500 fill-yellow-500' : ''} />
            <span>{problem.acceptedCount || 0} AC</span>
          </div>
          {problem.tags && (
            <div className="flex gap-1 flex-wrap">
              {problem.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs bg-white px-2 py-0.5 rounded border border-gray-300">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    );
  };

  const renderContestCard = (contest) => {
    const contestStatus = getContestStatus(contest);
    const duration = getContestDuration(contest);

    return (
      <Link
        key={contest._id}
        to={`/contests/${contest._id}`}
        className="group block bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 transition-all hover:shadow-lg hover:border-indigo-400"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <h3 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600 transition-colors">
                {contest.title}
              </h3>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {contest.description}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ml-2 ${contestStatus.color}`}>
            {contestStatus.label}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-purple-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Clock size={14} />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Users size={14} />
              <span>{contest.participantCount || 0} người</span>
            </div>
          </div>
          {contest.problemIds && (
            <span className="text-xs font-semibold text-indigo-600 bg-white px-2 py-1 rounded-lg">
              {contest.problemIds.length} bài
            </span>
          )}
        </div>
      </Link>
    );
  };

  const tabClasses = (tab) => `
    px-6 py-3 font-medium text-sm rounded-lg transition-all
    ${activeTab === tab
      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
      : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300'
    }
  `;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Thử thách lập trình</h1>
              <p className="text-gray-600 mt-1">Luyện tập bài tập và tham gia các cuộc thi</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm thử thách..."
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <select
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            >
              <option value="">Tất cả độ khó</option>
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </select>

            <input
              type="text"
              placeholder="Lọc theo tags (cách nhau bằng dấu phẩy)"
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={filters.tags}
              onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-3">
            <button onClick={() => setActiveTab('all')} className={tabClasses('all')}>
              Tất cả
            </button>
            <button onClick={() => setActiveTab('problems')} className={tabClasses('problems')}>
              Bài tập
            </button>
            <button onClick={() => setActiveTab('contests')} className={tabClasses('contests')}>
              Cuộc thi
            </button>
          </div>
        </div>

        {/* Challenges List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : challenges.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Zap className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg font-medium">Không tìm thấy thử thách nào</p>
            <p className="text-gray-500 mt-2">Hãy thử điều chỉnh bộ lọc của bạn</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) =>
              challenge.type === 'problem'
                ? renderProblemCard(challenge)
                : renderContestCard(challenge)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Challenges;
