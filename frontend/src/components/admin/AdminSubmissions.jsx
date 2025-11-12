import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Eye, Filter, Code, User, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AdminSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching all submissions...');
      const response = await api.get('/submissions/admin/all?limit=100');
      console.log('📨 Submissions response:', response.data);
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error('❌ Error fetching submissions:', error);
      alert('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      accepted: 'bg-green-100 text-green-800 border border-green-200',
      wrong_answer: 'bg-red-100 text-red-800 border border-red-200',
      time_limit: 'bg-orange-100 text-orange-800 border border-orange-200',
      runtime_error: 'bg-purple-100 text-purple-800 border border-purple-200',
      compile_error: 'bg-pink-100 text-pink-800 border border-pink-200',
      pending: 'bg-gray-100 text-gray-800 border border-gray-200',
      judging: 'bg-blue-100 text-blue-800 border border-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'wrong_answer':
      case 'time_limit':
      case 'runtime_error':
      case 'compile_error':
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <Clock className="text-yellow-500" size={16} />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      accepted: 'ĐẠT',
      wrong_answer: 'SAI ĐÁP ÁN',
      time_limit: 'QUÁ THỜI GIAN',
      runtime_error: 'LỖI THỰC THI',
      compile_error: 'LỖI BIÊN DỊCH',
      pending: 'ĐANG CHỜ',
      judging: 'ĐANG CHẤM'
    };
    return statusMap[status] || status.toUpperCase();
  };

  const viewSubmission = async (submissionId) => {
    try {
      console.log('👀 Viewing submission:', submissionId);
      const response = await api.get(`/submissions/${submissionId}`);
      setSelectedSubmission(response.data.submission);
      setShowModal(true);
    } catch (error) {
      console.error('❌ Error fetching submission details:', error);
      alert('Failed to load submission details');
    }
  };

  const filteredSubmissions = filter === 'all' 
    ? submissions 
    : submissions.filter(s => s.status === filter);

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Quản lý Bài Nộp</h1>
            <p className="text-gray-600">{submissions.length} bài nộp</p>
          </div>
          <button
            onClick={fetchSubmissions}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={18} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="text-gray-400" size={20} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="accepted">Đạt</option>
              <option value="wrong_answer">Sai đáp án</option>
              <option value="time_limit">Quá thời gian</option>
              <option value="runtime_error">Lỗi thực thi</option>
              <option value="compile_error">Lỗi biên dịch</option>
            </select>
            <span className="text-sm text-gray-500">
              Đang hiển thị: {filteredSubmissions.length} bài
            </span>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <Send size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 text-lg">Không có bài nộp nào</p>
              <button
                onClick={fetchSubmissions}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Người dùng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Bài tập</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Ngôn ngữ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Thời gian</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Thời gian nộp</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {submission.userId?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {submission.userId?.username || 'Unknown'}
                          </div>
                          {submission.userId?.email && (
                            <div className="text-xs text-gray-500">{submission.userId.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/problems/${submission.problemId?.slug}`}
                        className="text-purple-600 hover:text-purple-800 font-medium"
                      >
                        {submission.problemId?.title || 'Unknown Problem'}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold border">
                        {submission.language?.toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(submission.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(submission.status)}`}>
                          {getStatusText(submission.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {submission.executionTime ? `${submission.executionTime}ms` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => viewSubmission(submission._id)}
                        className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <Eye size={14} />
                        <span>Xem</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Submission Detail Modal */}
        {showModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Chi tiết bài nộp</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Submission Info */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Thông tin bài nộp</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Người nộp:</span>
                        <span className="font-semibold">{selectedSubmission.userId?.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bài tập:</span>
                        <span className="font-semibold">{selectedSubmission.problemId?.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngôn ngữ:</span>
                        <span className="font-semibold">{selectedSubmission.language?.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trạng thái:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedSubmission.status)}`}>
                          {getStatusText(selectedSubmission.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Thông tin chấm điểm</h3>
                    <div className="space-y-2 text-sm">
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
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời gian nộp:</span>
                        <span className="font-semibold">
                          {new Date(selectedSubmission.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {selectedSubmission.errorMessage && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Thông báo lỗi</h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <pre className="text-red-700 text-sm whitespace-pre-wrap">
                        {selectedSubmission.errorMessage}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Code */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <Code className="mr-2" size={18} />
                    Code
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

export default AdminSubmissions;