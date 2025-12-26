import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../admin/AuthContext";
import {
  Eye,
  Filter,
  Code,
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  Search,
  RefreshCw,
  FileText,
  Loader,
  Download,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "../../contexts/ThemeContext";

const TeacherSubmissions = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedProblem, setSelectedProblem] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [problems, setProblems] = useState([]);
  const [judging, setJudging] = useState(false);
  const [scoreInput, setScoreInput] = useState("");
  const [scoreNote, setScoreNote] = useState("");

  useEffect(() => {
    fetchSubmissions();
    fetchClasses();
    fetchProblems();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, selectedClass, selectedProblem, searchTerm]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // Lấy tất cả bài nộp của học sinh từ các lớp của giáo viên
      const response = await api.get("/submissions/teacher/class-submissions?limit=500");
      const allSubmissions = response.data.submissions || [];
      setSubmissions(allSubmissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      alert("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      // Lấy các lớp mà giáo viên quản lý
      const response = await api.get("/users/classes/teacher");
      setClasses([
        { id: "all", name: "Tất cả lớp" },
        ...response.data.classes.map((cls) => ({
          id: cls,
          name: cls,
        })),
      ]);
    } catch (error) {
      console.error("Error fetching classes:", error);
      // Fallback
      setClasses([
        { id: "all", name: "Tất cả lớp" },
      ]);
    }
  };

  const fetchProblems = async () => {
    try {
      const response = await api.get("/problems?limit=100");
      setProblems([
        { id: "all", title: "Tất cả bài tập" },
        ...(response.data.problems || []),
      ]);
    } catch (error) {
      console.error("Error fetching problems:", error);
    }
  };

  const filterSubmissions = () => {
    let filtered = submissions;

    if (selectedClass !== "all") {
      filtered = filtered.filter((sub) => {
        return sub.userId?.class === selectedClass;
      });
    }

    if (selectedProblem !== "all") {
      filtered = filtered.filter(
        (sub) => sub.problemId?._id === selectedProblem
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.userId?.username
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          sub.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSubmissions(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      accepted: "bg-green-100 text-green-800 border border-green-200",
      wrong_answer: "bg-red-100 text-red-800 border border-red-200",
      time_limit: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      compile_error: "bg-red-100 text-red-800 border border-red-200",
      runtime_error: "bg-red-100 text-red-800 border border-red-200",
      memory_limit: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      pending: "bg-blue-100 text-blue-800 border border-blue-200",
      judging: "bg-purple-100 text-purple-800 border border-purple-200",
      submitted: "bg-indigo-100 text-indigo-800 border border-indigo-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      accepted: <CheckCircle className="text-green-500" size={16} />,
      wrong_answer: <FileText className="text-red-500" size={16} />,
      time_limit: <Clock className="text-yellow-500" size={16} />,
      compile_error: <Code className="text-red-500" size={16} />,
      runtime_error: <Code className="text-red-500" size={16} />,
      memory_limit: <Clock className="text-yellow-500" size={16} />,
      pending: <Loader className="text-blue-500 animate-spin" size={16} />,
      judging: <Loader className="text-purple-500 animate-spin" size={16} />,
      submitted: <Clock className="text-indigo-500" size={16} />,
    };
    return icons[status] || <FileText size={16} />;
  };

  const getStatusText = (status) => {
    const texts = {
      accepted: "Chính xác ✓",
      wrong_answer: "Sai kết quả",
      time_limit: "Vượt quá thời gian",
      compile_error: "Lỗi biên dịch",
      runtime_error: "Lỗi khi chạy",
      memory_limit: "Vượt quá bộ nhớ",
      pending: "Chờ chấm",
      judging: "Đang chấm...",
      submitted: "Vừa nộp",
    };
    return texts[status] || status;
  };

  const viewSubmission = async (submissionId) => {
    try {
      const response = await api.get(`/submissions/${submissionId}`);
      setSelectedSubmission(response.data.submission);
      setScoreInput("");
      setScoreNote("");
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching submission details:", error);
      alert("Failed to load submission details");
    }
  };

  const downloadCode = (submission) => {
    if (!submission?.code) return;
    
    const element = document.createElement("a");
    const file = new Blob([submission.code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${submission.userId?.username}_${submission.problemId?.slug || "code"}.${
      submission.language === "javascript" ? "js" : submission.language
    }`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const judgeSubmissionNow = async (submissionId, score, scoreNote) => {
    try {
      setJudging(true);
      const response = await api.post(`/submissions/${submissionId}/judge`, {
        score: parseInt(score),
        scoreNote: scoreNote || null
      });
      
      // Update selected submission with new status
      if (response.data.submission) {
        setSelectedSubmission(response.data.submission);
      }
      
      // Refresh submissions list
      await fetchSubmissions();
      
      alert('✅ Chấm bài thành công! Điểm: ' + score);
    } catch (error) {
      console.error('Judge error:', error);
      alert('❌ Lỗi chấm bài: ' + (error.response?.data?.error || error.message));
    } finally {
      setJudging(false);
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            📝 Bài Nộp Học Sinh
          </h1>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Xem và chấm điểm bài nộp của học sinh
          </p>
        </div>

        {/* Filters */}
        <div className={`rounded-lg p-6 mb-6 ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Tìm kiếm học sinh
              </label>
              <div className="relative">
                <Search size={18} className={`absolute left-3 top-3 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                <input
                  type="text"
                  placeholder="Tên hoặc username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
            </div>

            {/* Class Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Lớp
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Problem Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Bài tập
              </label>
              <select
                value={selectedProblem}
                onChange={(e) => setSelectedProblem(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                {problems.map((prob) => (
                  <option key={prob.id} value={prob.id}>
                    {prob.title || "Tất cả bài tập"}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh */}
            <div className="flex items-end">
              <button
                onClick={fetchSubmissions}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={18} />
                Tải lại
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`rounded-lg p-4 ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm`}>
            <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Tất cả bài nộp</div>
            <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              {filteredSubmissions.length}
            </div>
          </div>
          <div className={`rounded-lg p-4 ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm`}>
            <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Chính xác</div>
            <div className="text-2xl font-bold text-green-600">
              {filteredSubmissions.filter((s) => s.status === "accepted").length}
            </div>
          </div>
          <div className={`rounded-lg p-4 ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm`}>
            <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Chờ chấm</div>
            <div className="text-2xl font-bold text-blue-600">
              {filteredSubmissions.filter((s) => s.status === "submitted" || s.status === "pending").length}
            </div>
          </div>
          <div className={`rounded-lg p-4 ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm`}>
            <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Sai kết quả</div>
            <div className="text-2xl font-bold text-red-600">
              {filteredSubmissions.filter((s) => s.status === "wrong_answer" || s.status === "compile_error").length}
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className={`rounded-lg overflow-hidden shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
          {loading ? (
            <div className={`p-8 text-center ${isDark ? "bg-gray-800" : "bg-white"}`}>
              <Loader className="inline animate-spin mb-2" />
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>Đang tải bài nộp...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className={`p-8 text-center ${isDark ? "bg-gray-800" : "bg-white"}`}>
              <FileText className={`inline mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`} size={32} />
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>Không có bài nộp</p>
            </div>
          ) : (
            <div className={`overflow-x-auto ${isDark ? "bg-gray-800" : "bg-white"}`}>
              <table className="w-full">
                <thead className={`border-b ${isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Học sinh
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Lớp
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Bài tập
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Trạng thái
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Ngôn ngữ
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Thời gian
                    </th>
                    <th className={`px-6 py-3 text-center text-xs font-medium uppercase ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission, idx) => (
                    <tr key={submission._id} className={`border-b ${isDark ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"}`}>
                      <td className={`px-6 py-4 text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                        <div>
                          <p className="font-medium">{submission.userId?.fullName || "Unknown"}</p>
                          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            @{submission.userId?.username || "unknown"}
                          </p>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                        {submission.userId?.class || "-"}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                        <p className="font-medium">{submission.problemId?.title || "Unknown"}</p>
                        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          {submission.problemId?.slug || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                          {getStatusIcon(submission.status)}
                          {getStatusText(submission.status)}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                        }`}>
                          {submission.language || "unknown"}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        <button
                          onClick={() => viewSubmission(submission._id)}
                          className="text-blue-500 hover:text-blue-700 font-medium"
                        >
                          <Eye size={18} className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Submission Details */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <div className={`p-6 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {selectedSubmission.problemId?.title}
                  </h2>
                  <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Nộp bởi {selectedSubmission.userId?.fullName} (@{selectedSubmission.userId?.username})
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}
                >
                  Đóng
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Trạng thái
                  </h3>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedSubmission.status)}`}>
                    {getStatusIcon(selectedSubmission.status)}
                    {getStatusText(selectedSubmission.status)}
                  </span>
                </div>
                
                {/* Score Form - only show for pending/submitted submissions */}
                {(selectedSubmission.status === 'submitted' || selectedSubmission.status === 'pending') && !selectedSubmission.score && (
                  <div className={`p-4 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-blue-50 border-blue-200"}`}>
                    <h3 className={`text-sm font-semibold mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Nhập Điểm
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          Điểm (0-100)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={scoreInput}
                          onChange={(e) => setScoreInput(e.target.value)}
                          placeholder="Nhập điểm..."
                          className={`w-full px-3 py-2 rounded-lg border ${
                            isDark
                              ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          Ghi chú (tùy chọn)
                        </label>
                        <textarea
                          value={scoreNote}
                          onChange={(e) => setScoreNote(e.target.value)}
                          placeholder="Lý do chấm điểm..."
                          rows="2"
                          className={`w-full px-3 py-2 rounded-lg border resize-none ${
                            isDark
                              ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                          }`}
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (scoreInput === "" || scoreInput < 0 || scoreInput > 100) {
                            alert("Điểm phải từ 0-100");
                            return;
                          }
                          judgeSubmissionNow(selectedSubmission._id, scoreInput, scoreNote);
                        }}
                        disabled={judging || scoreInput === ""}
                        className={`w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
                          judging || scoreInput === ""
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {judging ? (
                          <>
                            <Loader className="animate-spin" size={16} />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            Lưu Điểm
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Show score if already graded */}
                {selectedSubmission.score !== undefined && selectedSubmission.score !== null && (
                  <div className={`p-4 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-green-50 border-green-200"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          Điểm
                        </p>
                        <p className={`text-2xl font-bold ${
                          selectedSubmission.score === 0 ? "text-red-600" : "text-green-600"
                        }`}>
                          {selectedSubmission.score}/100
                        </p>
                      </div>
                      <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        <p>Chấm bởi: {selectedSubmission.scoredBy?.username}</p>
                        <p>{new Date(selectedSubmission.scoredAt).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>
                    {selectedSubmission.scoreNote && (
                      <p className={`mt-2 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        Ghi chú: {selectedSubmission.scoreNote}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Code */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Code
                  </h3>
                  <button
                    onClick={() => downloadCode(selectedSubmission)}
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-700 text-sm"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
                <pre className={`p-4 rounded-lg overflow-x-auto text-sm ${isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
                  <code>{selectedSubmission.code}</code>
                </pre>
              </div>

              {/* Test Results */}
              {selectedSubmission.status !== "submitted" && (
                <div>
                  <h3 className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Kết quả
                  </h3>
                  <div className={`p-4 rounded-lg ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                    {selectedSubmission.errorMessage ? (
                      <p className="text-red-600">{selectedSubmission.errorMessage}</p>
                    ) : (
                      <p>
                        {selectedSubmission.testCasesPassed}/{selectedSubmission.totalTestCases} test cases passed
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Meta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Ngôn ngữ</p>
                  <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                    {selectedSubmission.language}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Thời gian chạy</p>
                  <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                    {selectedSubmission.executionTime || "-"} ms
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSubmissions;
