import { useState, useEffect } from "react";
import api from "../../services/api";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Download,
  Filter,
  Loader,
  AlertCircle,
  Users,
  BookOpen,
  BarChart3,
} from "lucide-react";

const TeacherGradesBoard = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("all");
  const [filterProblem, setFilterProblem] = useState("all");

  useEffect(() => {
    fetchGradesBoard();
  }, []);

  const fetchGradesBoard = async () => {
    try {
      setLoading(true);
      const response = await api.get("/submissions/teacher/grades");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching grades board:", error);
      alert("Failed to load grades board");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredStudents = () => {
    if (!data) return [];
    
    return data.students.filter(item => {
      if (selectedClass !== "all" && item.student.class !== selectedClass) {
        return false;
      }
      return true;
    });
  };

  const getFilteredProblems = () => {
    if (!data) return [];
    
    if (filterProblem === "all") {
      return data.problems;
    }
    return data.problems.filter(p => p._id === filterProblem);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "hard":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getScoreBg = (score) => {
    if (score === null) {
      return isDark ? "bg-gray-700" : "bg-gray-100";
    }
    if (score === 100) return isDark ? "bg-green-900/30" : "bg-green-100";
    if (score >= 80) return isDark ? "bg-blue-900/30" : "bg-blue-100";
    if (score >= 60) return isDark ? "bg-yellow-900/30" : "bg-yellow-100";
    return isDark ? "bg-red-900/30" : "bg-red-100";
  };

  const getScoreColor = (score) => {
    if (score === null) return isDark ? "text-gray-400" : "text-gray-600";
    if (score === 100) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const downloadCSV = () => {
    if (!data) return;

    const filteredStudents = getFilteredStudents();
    const filteredProblems = getFilteredProblems();

    // Create CSV header
    const headers = ["Học Sinh", "Lớp", "Student ID", ...filteredProblems.map(p => p.title), "Trung Bình", "Tổng Điểm"];
    const rows = [];

    // Add student data
    filteredStudents.forEach(item => {
      const scores = filteredProblems.map(p => item.scores[p._id]?.score ?? "");
      rows.push([
        item.student.fullName,
        item.student.class,
        item.student.studentId || "-",
        ...scores,
        item.stats.averageScore,
        item.stats.totalScore
      ]);
    });

    // Convert to CSV
    const csv = [
      headers.join(","),
      ...rows.map(row => 
        row.map(cell => 
          typeof cell === "string" && cell.includes(",") 
            ? `"${cell}"` 
            : cell
        ).join(",")
      )
    ].join("\n");

    // Download
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv));
    element.setAttribute("download", `grades_${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-4 md:p-8 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="flex items-center justify-center h-screen">
          <Loader className="animate-spin" size={48} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`min-h-screen p-4 md:p-8 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <p>Failed to load grades board</p>
        </div>
      </div>
    );
  }

  const filteredStudents = getFilteredStudents();
  const filteredProblems = getFilteredProblems();

  return (
    <div className={`min-h-screen p-4 md:p-8 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            📊 Bảng Điểm Lớp
          </h1>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Quản lý điểm của tất cả học sinh
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`rounded-lg p-6 ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Số Học Sinh
                </p>
                <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {data.summary.totalStudents}
                </p>
              </div>
              <Users className="text-blue-500" size={32} />
            </div>
          </div>

          <div className={`rounded-lg p-6 ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Số Bài Tập
                </p>
                <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {data.summary.totalProblems}
                </p>
              </div>
              <BookOpen className="text-green-500" size={32} />
            </div>
          </div>

          <div className={`rounded-lg p-6 ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Số Lớp
                </p>
                <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {data.summary.totalClasses}
                </p>
              </div>
              <BarChart3 className="text-purple-500" size={32} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`rounded-lg p-6 mb-6 ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Lọc theo lớp
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
                <option value="all">Tất cả lớp</option>
                {data.classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Lọc theo bài tập
              </label>
              <select
                value={filterProblem}
                onChange={(e) => setFilterProblem(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="all">Tất cả bài tập</option>
                {data.problems.map(prob => (
                  <option key={prob._id} value={prob._id}>{prob.title}</option>
                ))}
              </select>
            </div>

            <button
              onClick={downloadCSV}
              className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 font-medium"
            >
              <Download size={18} />
              Tải CSV
            </button>
          </div>
        </div>

        {/* Grades Table */}
        <div className={`rounded-lg overflow-hidden shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
          {filteredStudents.length === 0 ? (
            <div className={`p-8 text-center ${isDark ? "bg-gray-800" : "bg-white"}`}>
              <AlertCircle className={`inline mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`} size={32} />
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>Không có học sinh</p>
            </div>
          ) : (
            <div className={`overflow-x-auto ${isDark ? "bg-gray-800" : "bg-white"}`}>
              <table className="w-full min-w-max">
                <thead className={`border-b ${isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase sticky left-0 z-10 ${isDark ? "text-gray-400 bg-gray-900" : "text-gray-600 bg-gray-50"}`}>
                      Học Sinh
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase sticky left-32 z-10 ${isDark ? "text-gray-400 bg-gray-900" : "text-gray-600 bg-gray-50"}`}>
                      Lớp
                    </th>
                    {filteredProblems.map(problem => (
                      <th
                        key={problem._id}
                        className={`px-4 py-3 text-center text-xs font-medium uppercase ${isDark ? "text-gray-400" : "text-gray-600"}`}
                        title={`${problem.title} (${problem.difficulty})`}
                      >
                        <div className="whitespace-nowrap">
                          <div className={getDifficultyColor(problem.difficulty)}>
                            {problem.title.substring(0, 10)}...
                          </div>
                          <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                            {problem.difficulty}
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className={`px-6 py-3 text-center text-xs font-medium uppercase sticky right-24 z-10 ${isDark ? "text-gray-400 bg-gray-900" : "text-gray-600 bg-gray-50"}`}>
                      Trung Bình
                    </th>
                    <th className={`px-6 py-3 text-center text-xs font-medium uppercase sticky right-0 z-10 ${isDark ? "text-gray-400 bg-gray-900" : "text-gray-600 bg-gray-50"}`}>
                      Tổng Điểm
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(item => (
                    <tr key={item.student._id} className={`border-b ${isDark ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"}`}>
                      <td className={`px-6 py-4 text-sm font-medium sticky left-0 z-10 ${isDark ? "text-white bg-gray-800 hover:bg-gray-700" : "text-gray-900 bg-white hover:bg-gray-50"}`}>
                        <div>
                          <p>{item.student.fullName}</p>
                          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            @{item.student.username}
                          </p>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm sticky left-32 z-10 ${isDark ? "text-white bg-gray-800 hover:bg-gray-700" : "text-gray-900 bg-white hover:bg-gray-50"}`}>
                        {item.student.class}
                      </td>
                      {filteredProblems.map(problem => {
                        const scoreData = item.scores[problem._id];
                        return (
                          <td
                            key={problem._id}
                            className={`px-4 py-4 text-center text-sm font-semibold ${getScoreBg(scoreData?.score)}`}
                            title={scoreData?.scoreNote || ""}
                          >
                            {scoreData ? (
                              <span className={getScoreColor(scoreData.score)}>
                                {scoreData.score}
                              </span>
                            ) : (
                              <span className={isDark ? "text-gray-500" : "text-gray-400"}>-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className={`px-6 py-4 text-center text-sm font-semibold sticky right-24 z-10 ${isDark ? "text-white bg-gray-800 hover:bg-gray-700" : "text-gray-900 bg-white hover:bg-gray-50"}`}>
                        {item.stats.averageScore}
                      </td>
                      <td className={`px-6 py-4 text-center text-sm font-bold sticky right-0 z-10 ${isDark ? "text-purple-400 bg-gray-800 hover:bg-gray-700" : "text-purple-600 bg-white hover:bg-gray-50"}`}>
                        {item.stats.totalScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className={`mt-6 p-4 rounded-lg ${isDark ? "bg-gray-800" : "bg-blue-50"} border ${isDark ? "border-gray-700" : "border-blue-200"}`}>
          <p className={`text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            Ghi chú:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${isDark ? "bg-green-900/30" : "bg-green-100"}`}></div>
              <span>100 điểm</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${isDark ? "bg-blue-900/30" : "bg-blue-100"}`}></div>
              <span>≥80 điểm</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${isDark ? "bg-yellow-900/30" : "bg-yellow-100"}`}></div>
              <span>≥60 điểm</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${isDark ? "bg-red-900/30" : "bg-red-100"}`}></div>
              <span>&lt;60 điểm</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${isDark ? "bg-gray-700" : "bg-gray-100"}`}></div>
              <span>Chưa chấm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherGradesBoard;
