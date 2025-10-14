import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Eye, Code, Users, Trophy, CheckCircle, Search, RefreshCw, Award, Clock, FileText, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AdminContestSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [groupedData, setGroupedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedContest, setSelectedContest] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [contests, setContests] = useState([]);

  useEffect(() => {
    fetchSubmissions();
    fetchClasses();
    fetchContests();
  }, []);

  useEffect(() => {
    groupSubmissions();
  }, [submissions]);

  useEffect(() => {
    filterData();
  }, [groupedData, selectedClass, selectedContest, searchTerm]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/submissions/admin/all?limit=500');
      // Chỉ lấy bài nộp thuộc CONTEST (bài thi)
      const contestSubmissions = (response.data.submissions || [])
        .filter(sub => sub.status === 'accepted' && sub.contestId);
      setSubmissions(contestSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      alert('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/users/classes/all');
      setClasses([{ id: 'all', name: 'Tất cả lớp' }, ...response.data.classes.map(cls => ({
        id: cls,
        name: cls
      }))]);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([
        { id: 'all', name: 'Tất cả lớp' },
        { id: '10A1', name: '10A1' },
        { id: '10A2', name: '10A2' },
        { id: '11A1', name: '11A1' },
        { id: '11A2', name: '11A2' },
        { id: '12A1', name: '12A1' }
      ]);
    }
  };

  const fetchContests = async () => {
    try {
      const response = await api.get('/contests');
      setContests([{ _id: 'all', title: 'Tất cả cuộc thi' }, ...(response.data.contests || response.data || [])]);
    } catch (error) {
      console.error('Error fetching contests:', error);
    }
  };

  // Group submissions by user + contest
  const groupSubmissions = () => {
    const grouped = {};
    
    submissions.forEach(sub => {
      const key = `${sub.userId?._id}_${sub.contestId?._id || sub.contestId}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          key,
          user: sub.userId,
          contest: sub.contestId,
          contestId: sub.contestId?._id || sub.contestId,
          problems: [],
          submissions: [],
          totalScore: 0,
          lastSubmitTime: sub.createdAt
        };
      }
      
      // Chỉ thêm problem nếu chưa có (tránh duplicate)
      const problemId = sub.problemId?._id || sub.problemId;
      if (!grouped[key].problems.find(p => (p._id || p) === problemId)) {
        grouped[key].problems.push(sub.problemId);
        grouped[key].totalScore += 100; // 100 điểm mỗi bài
      }
      
      grouped[key].submissions.push(sub);
      
      // Cập nhật thời gian nộp cuối
      if (new Date(sub.createdAt) > new Date(grouped[key].lastSubmitTime)) {
        grouped[key].lastSubmitTime = sub.createdAt;
      }
    });
    
    // Convert to array và sort theo điểm cao nhất
    const result = Object.values(grouped).sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return new Date(a.lastSubmitTime) - new Date(b.lastSubmitTime);
    });
    
    setGroupedData(result);
  };

  const filterData = () => {
    let filtered = groupedData;

    if (selectedClass !== 'all') {
      filtered = filtered.filter(item => item.user?.class === selectedClass);
    }

    if (selectedContest !== 'all') {
      filtered = filtered.filter(item => item.contestId === selectedContest);
    }

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  const toggleRow = (key) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  const viewSubmission = async (submissionId) => {
    try {
      const response = await api.get(`/submissions/${submissionId}`);
      setSelectedSubmission(response.data.submission);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching submission details:', error);
      alert('Failed to load submission details');
    }
  };

  const exportToExcel = () => {
    const data = filteredData.map(item => ({
      'Học sinh': item.user?.username,
      'Họ tên': item.user?.fullName || '',
      'Lớp': item.user?.class,
      'Cuộc thi': item.contest?.title || 'N/A',
      'Số bài giải': item.problems.length,
      'Điểm': item.totalScore,
      'Bài đã giải': item.problems.map(p => p?.title).join(', '),
      'Thời gian nộp': new Date(item.lastSubmitTime).toLocaleString('vi-VN')
    }));

    const headers = ['Học sinh', 'Họ tên', 'Lớp', 'Cuộc thi', 'Số bài giải', 'Điểm', 'Bài đã giải', 'Thời gian nộp'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bai_thi_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Trophy className="text-purple-600" size={32} />
              <h1 className="text-3xl font-bold text-gray-800">Quản lý Nộp Bài Thi</h1>
            </div>
            <p className="text-gray-600">
              {filteredData.length} bài nộp • {new Set(filteredData.map(s => s.user?._id)).size} học sinh
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportToExcel}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <span>Xuất Excel</span>
            </button>
            <button
              onClick={fetchSubmissions}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md p-2 mb-6 flex space-x-2">
          <Link
            to="/admin/submissions"
            className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-3 rounded-lg font-semibold transition"
          >
            <CheckCircle size={20} />
            <span>Tất cả</span>
          </Link>
          <Link
            to="/admin/submissions/problems"
            className="flex-1 flex items-center justify-center space-x-2 bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-3 rounded-lg font-semibold transition"
          >
            <FileText size={20} />
            <span>Bài Tập</span>
          </Link>
          <Link
            to="/admin/submissions/contests"
            className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg font-semibold"
          >
            <Trophy size={20} />
            <span>Bài Thi</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline w-4 h-4 mr-1" />
                Lớp học
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Trophy className="inline w-4 h-4 mr-1" />
                Cuộc thi
              </label>
              <select
                value={selectedContest}
                onChange={(e) => setSelectedContest(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {contests.map(contest => (
                  <option key={contest._id} value={contest._id}>
                    {contest.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline w-4 h-4 mr-1" />
                Tìm học sinh
              </label>
              <input
                type="text"
                placeholder="Nhập tên học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-purple-500">
            <div className="text-2xl font-bold text-purple-600">{filteredData.length}</div>
            <div className="text-sm text-gray-600">Bài nộp</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">
              {new Set(filteredData.map(s => s.user?._id)).size}
            </div>
            <div className="text-sm text-gray-600">Học sinh</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-yellow-500">
            <div className="text-2xl font-bold text-yellow-600">
              {new Set(filteredData.map(s => s.contestId)).size}
            </div>
            <div className="text-sm text-gray-600">Cuộc thi</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-orange-500">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(filteredData.map(s => s.user?.class)).size}
            </div>
            <div className="text-sm text-gray-600">Lớp học</div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <Trophy size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 text-lg">Không có bài nộp nào</p>
              <p className="text-sm text-gray-400 mt-2">Thử thay đổi bộ lọc để xem kết quả khác</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Học sinh</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Lớp</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Cuộc thi</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Số bài giải</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Điểm</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Thời gian nộp</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((item, index) => (
                    <>
                      <tr key={item.key} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {item.user?.username?.[0]?.toUpperCase() || 'H'}
                              </div>
                              {index < 3 && (
                                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                  index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                  index === 1 ? 'bg-gray-300 text-gray-700' :
                                  'bg-orange-400 text-orange-900'
                                }`}>
                                  {index + 1}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">
                                {item.user?.username || 'Unknown'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.user?.fullName || ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold border border-purple-200">
                            {item.user?.class || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Award className="text-yellow-500" size={16} />
                            <span className="font-medium text-gray-800">
                              {item.contest?.title || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-lg font-bold text-blue-600">
                            {item.problems.length}
                          </span>
                          <span className="text-gray-500 text-sm"> bài</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-xl font-bold text-green-600">
                            {item.totalScore}
                          </span>
                          <span className="text-gray-500 text-sm"> điểm</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="text-green-500" size={16} />
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold border border-green-200">
                              ĐÃ NỘP
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{formatDistanceToNow(new Date(item.lastSubmitTime), { addSuffix: true })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleRow(item.key)}
                            className="flex items-center space-x-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 text-sm"
                          >
                            {expandedRows.has(item.key) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            <span>Xem bài</span>
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Row - Show problems */}
                      {expandedRows.has(item.key) && (
                        <tr className="bg-purple-50">
                          <td colSpan={8} className="px-6 py-4">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                                <Star className="text-yellow-500" size={16} />
                                Các bài đã giải ({item.problems.length} bài)
                              </h4>
                              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {item.submissions.map((sub) => (
                                  <div key={sub._id} className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <div className="font-semibold text-purple-700">{sub.problemId?.title || 'Bài tập'}</div>
                                        <div className="text-xs text-gray-500">
                                          {sub.language?.toUpperCase()} • {sub.executionTime || 0}ms
                                        </div>
                                      </div>
                                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                                        +100 điểm
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => viewSubmission(sub._id)}
                                      className="w-full mt-2 flex items-center justify-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 text-sm"
                                    >
                                      <Eye size={14} />
                                      <span>Xem code</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Chi tiết bài giải</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Thông tin học sinh</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Học sinh:</span>
                        <span className="font-semibold">{selectedSubmission.userId?.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lớp:</span>
                        <span className="font-semibold">{selectedSubmission.userId?.class}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cuộc thi:</span>
                        <span className="font-semibold">{selectedSubmission.contestId?.title || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bài tập:</span>
                        <span className="font-semibold">{selectedSubmission.problemId?.title}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Thông tin chấm điểm</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngôn ngữ:</span>
                        <span className="font-semibold">{selectedSubmission.language?.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời gian:</span>
                        <span className="font-semibold">{selectedSubmission.executionTime || 0}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Test cases:</span>
                        <span className="font-semibold">
                          {selectedSubmission.testCasesPassed || 0}/{selectedSubmission.totalTestCases || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <Code className="mr-2" size={18} />
                    Code giải bài
                  </h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                    {selectedSubmission.code}
                  </pre>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContestSubmissions;
