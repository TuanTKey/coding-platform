import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import Editor from "@monaco-editor/react";
import {
  Play,
  Clock,
  Database,
  AlertCircle,
  CheckCircle,
  Terminal as TerminalIcon,
  X,
  Send,
  ChevronUp,
  ChevronDown,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const ProblemSolve = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDark } = useTheme();
  const contestId = searchParams.get("contest"); // Lấy contestId từ URL

  const [problem, setProblem] = useState(null);
  const [sampleTestCases, setSampleTestCases] = useState([]);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  // Terminal state
  const [showTerminal, setShowTerminal] = useState(true);
  const [terminalHeight, setTerminalHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [outputData, setOutputData] = useState(null);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const terminalRef = useRef(null);
  const outputRef = useRef(null);
  const inputRef = useRef(null);

  // Template trống cho mỗi ngôn ngữ - chỉ có comment hướng dẫn
  const languageTemplates = {
    python: `# Write your solution here
`,
    javascript: `// Write your solution here
`,
    cpp: `// Write your solution here
`,
    java: `// Write your solution here
`,
  };

  useEffect(() => {
    fetchProblem();
  }, [slug]);

  // Khi đổi ngôn ngữ, reset code về template trống
  useEffect(() => {
    setCode(languageTemplates[language]);
  }, [language]);

  // Auto scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [outputData]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const container = terminalRef.current?.parentElement;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const newHeight = containerRect.bottom - e.clientY;
          setTerminalHeight(Math.max(150, Math.min(500, newHeight)));
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const fetchProblem = async () => {
    try {
      const response = await api.get(`/problems/slug/${slug}`);
      setProblem(response.data.problem);
      setSampleTestCases(response.data.sampleTestCases);
      // Chỉ set code template trống, không lưu code cũ
      setCode(languageTemplates[language]);
    } catch (error) {
      console.error("Error fetching problem:", error);
      alert("Failed to load problem");
      navigate("/problems");
    }
  };

  // RUN CODE - giống VS Code terminal
  const handleRun = async () => {
    if (!code.trim()) {
      alert("Please write some code first!");
      return;
    }

    setShowTerminal(true);
    setWaitingForInput(true);
    setTerminalInput("");
    setTerminalHistory([
      { type: "system", text: `$ Running ${language}...` },
      {
        type: "system",
        text: "Enter input (press Enter when done, leave empty if no input needed):",
      },
    ]);
    setOutputData(null);
    setResult(null);

    // Focus vào input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Thực thi code với input đã nhập
  const executeCode = async (input) => {
    setWaitingForInput(false);
    setRunning(true);

    // Thêm input vào history
    setTerminalHistory((prev) => [
      ...prev,
      { type: "input", text: input || "(no input)" },
      { type: "system", text: "Executing..." },
    ]);

    try {
      const response = await api.post("/submissions/run", {
        code: code,
        language: language,
        input: input,
      });

      if (response.data.error) {
        // Parse và format lỗi đẹp hơn
        const errorText = response.data.error;
        let formattedErrors = [];

        // Kiểm tra loại lỗi
        if (errorText.includes("error:") || errorText.includes("Error:")) {
          // Lỗi compile - chỉ lấy phần quan trọng
          const lines = errorText.split("\n");
          formattedErrors = lines
            .filter(
              (line) =>
                line.includes("error:") ||
                line.includes("Error:") ||
                line.includes("note:")
            )
            .map((line) => {
              // Loại bỏ đường dẫn dài, chỉ giữ tên file và thông báo lỗi
              const match = line.match(
                /solution\.(cpp|py|js|java):(\d+):(\d+):\s*(error|note):\s*(.+)/
              );
              if (match) {
                const [, ext, lineNum, col, type, msg] = match;
                return `Line ${lineNum}: ${msg}`;
              }
              // Fallback - lấy phần sau "error:" hoặc "Error:"
              const errorMatch = line.match(/(error|Error):\s*(.+)/);
              if (errorMatch) {
                return errorMatch[2];
              }
              return line;
            })
            .filter((line) => line.trim());
        } else {
          // Runtime error hoặc lỗi khác
          formattedErrors = errorText.split("\n").filter((line) => line.trim());
        }

        setTerminalHistory((prev) => [
          ...prev.slice(0, -1), // Remove "Executing..."
          { type: "error", text: "❌ Compilation/Runtime Error:" },
          ...formattedErrors.map((line) => ({
            type: "error",
            text: "   " + line,
          })),
        ]);
      } else {
        setTerminalHistory((prev) => [
          ...prev.slice(0, -1), // Remove "Executing..."
          { type: "output", text: response.data.output || "(no output)" },
          {
            type: "success",
            text: `✓ Done in ${response.data.executionTime || 0}ms`,
          },
        ]);
      }
    } catch (error) {
      console.error("Run error:", error);
      const errorMsg =
        error.response?.data?.error || error.message || "Failed to run code";
      setTerminalHistory((prev) => [
        ...prev.slice(0, -1),
        { type: "error", text: "❌ Error: " + errorMsg },
      ]);
    } finally {
      setRunning(false);
    }
  };

  // Xử lý khi nhấn Enter trong terminal
  const handleTerminalKeyDown = (e) => {
    if (e.key === "Enter" && waitingForInput && !running) {
      e.preventDefault();
      executeCode(terminalInput);
    }
  };

  // SUBMIT CODE
  const handleSubmit = async () => {
    if (!code.trim()) {
      alert("Please write some code first!");
      return;
    }

    setShowTerminal(true);
    setSubmitting(true);
    setOutputData({
      type: "judging",
      message: "📤 Đang nộp bài...",
    });
    setResult(null);

    try {
      const submitData = {
        problemId: problem._id,
        code: code,
        language: language,
      };

      // Nếu đang trong contest, gửi thêm contestId
      if (contestId) {
        submitData.contestId = contestId;
      }

      console.log("📤 Submitting with data:", submitData);
      console.log("problemId:", problem._id);
      console.log("code length:", code.length);
      console.log("language:", language);

      const response = await api.post("/submissions", submitData);

      // ✅ Nộp thành công
      setSubmitting(false);
      
      // Hiển thị thông báo với countdown
      let countdown = 3;
      const isUpdate = response.data.isUpdate;
      const message = isUpdate 
        ? `Cập nhập bài tập thành công! Đang chuyển hướng trong ${countdown} giây...`
        : `Bài tập đã được nộp thành công! Đang chuyển hướng trong ${countdown} giây...`;
      
      setOutputData({
        type: "success",
        title: isUpdate ? "✅ Cập nhập thành công!" : "✅ Nộp bài thành công!",
        message: message,
      });

      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          const newMessage = isUpdate 
            ? `Cập nhập bài tập thành công! Đang chuyển hướng trong ${countdown} giây...`
            : `Bài tập đã được nộp thành công! Đang chuyển hướng trong ${countdown} giây...`;
          setOutputData((prev) => ({
            ...prev,
            message: newMessage,
          }));
        } else {
          clearInterval(countdownInterval);
        }
      }, 1000);

      // ⏱️ Chờ 3 giây rồi redirect
      setTimeout(() => {
        if (contestId) {
          navigate(`/contests/${contestId}`);
        } else {
          navigate("/problems");
        }
      }, 3000);

    } catch (error) {
      setSubmitting(false);
      setOutputData({
        type: "error",
        title: "❌ Lỗi nộp bài",
        message: error.response?.data?.error || "Failed to submit",
      });
    }
  };

  const clearTerminal = () => {
    setTerminalHistory([]);
    setOutputData(null);
    setResult(null);
    setWaitingForInput(false);
    setTerminalInput("");
  };

  const getStatusText = (status) => {
    const statusMap = {
      accepted: "Accepted",
      wrong_answer: "Wrong Answer",
      time_limit: "Time Limit Exceeded",
      runtime_error: "Runtime Error",
      compile_error: "Compilation Error",
      error: "Error",
      pending: "Pending",
      judging: "Judging",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "text-green-400";
      case "wrong_answer":
        return "text-red-400";
      case "time_limit":
        return "text-yellow-400";
      case "runtime_error":
        return "text-orange-400";
      case "compile_error":
        return "text-purple-400";
      default:
        return "text-gray-400";
    }
  };

  // Render Output Panel content
  if (!problem) {
    return (
      <div
        className={`flex justify-center items-center h-screen ${
          isDark ? "bg-slate-900" : "bg-slate-50"
        }`}
      >
        <div
          className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDark ? "border-cyan-500" : "border-cyan-600"
          }`}
        ></div>
      </div>
    );
  }

  return (
    <div
      className={`h-screen flex flex-col transition-colors duration-300 ${
        isDark ? "bg-slate-900" : "bg-slate-50"
      }`}
    >
      {/* Header */}
      <div
        className={`${
          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        } border-b px-6 py-4`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? "hover:bg-slate-700 text-gray-400 hover:text-white"
                  : "hover:bg-slate-100 text-gray-600 hover:text-gray-900"
              }`}
            >
              <ArrowLeft size={20} />
            </button>
            <h1
              className={`text-lg font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {problem.title}
            </h1>
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                problem.difficulty === "Easy"
                  ? isDark
                    ? "bg-green-500/20 text-green-300 border border-green-400/50"
                    : "bg-green-100 text-green-700 border border-green-200"
                  : problem.difficulty === "Medium"
                  ? isDark
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-400/50"
                    : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  : isDark
                  ? "bg-red-500/20 text-red-300 border border-red-400/50"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}
            >
              {problem.difficulty}
            </span>
          </div>
          <div
            className={`flex items-center space-x-6 text-sm ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <span className="flex items-center">
              <Clock size={14} className="mr-2" />
              {problem.timeLimit}ms
            </span>
            <span className="flex items-center">
              <Database size={14} className="mr-2" />
              {problem.memoryLimit}MB
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Problem Description */}
        <div
          className={`w-1/3 overflow-y-auto ${
            isDark ? "border-slate-700" : "border-slate-200"
          } border-r`}
        >
          <div className="p-6">
            <div className="mb-6">
              <h2
                className={`font-bold mb-3 text-lg ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Mô tả
              </h2>
              <div
                className={`text-sm whitespace-pre-wrap leading-relaxed ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {problem.description}
              </div>
            </div>

            {problem.inputFormat && (
              <div className="mb-6">
                <h3
                  className={`font-bold mb-2 text-lg ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Định dạng đầu vào
                </h3>
                <p
                  className={`text-sm whitespace-pre-wrap ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {problem.inputFormat}
                </p>
              </div>
            )}

            {problem.outputFormat && (
              <div className="mb-6">
                <h3
                  className={`font-bold mb-2 text-lg ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Định dạng đầu ra
                </h3>
                <p
                  className={`text-sm whitespace-pre-wrap ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {problem.outputFormat}
                </p>
              </div>
            )}

            {sampleTestCases.length > 0 && (
              <div>
                <h3
                  className={`font-bold mb-3 text-lg ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Ví dụ
                </h3>
                {sampleTestCases.map((testCase, idx) => (
                  <div
                    key={idx}
                    className={`mb-4 rounded-lg border overflow-hidden ${
                      isDark
                        ? "bg-slate-800/50 border-slate-700"
                        : "bg-slate-50/50 border-slate-200"
                    }`}
                  >
                    <div
                      className={`grid grid-cols-2 ${
                        isDark ? "divide-slate-700" : "divide-slate-200"
                      } divide-x`}
                    >
                      <div className="p-4">
                        <p
                          className={`text-xs mb-2 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Input
                        </p>
                        <pre
                          className={`text-sm font-mono ${
                            isDark ? "text-cyan-400" : "text-cyan-600"
                          }`}
                        >
                          {testCase.input}
                        </pre>
                      </div>
                      <div className="p-4">
                        <p
                          className={`text-xs mb-2 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Output
                        </p>
                        <pre
                          className={`text-sm font-mono ${
                            isDark ? "text-green-400" : "text-green-600"
                          }`}
                        >
                          {testCase.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="w-2/3 flex flex-col">
          {/* Editor Toolbar */}
          <div
            className={`flex items-center justify-between ${
              isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            } px-4 py-3 border-b`}
          >
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`text-sm px-3 py-2 rounded border transition-colors ${
                isDark
                  ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  : "bg-slate-100 border-slate-300 text-gray-900 hover:bg-slate-200"
              }`}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleRun}
                disabled={running || submitting}
                className={`flex items-center space-x-1.5 text-sm px-5 py-2 rounded font-bold transition-all ${
                  isDark
                    ? "bg-blue-600 hover:bg-blue-500 text-white disabled:bg-blue-600/50"
                    : "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-500/50"
                } disabled:cursor-not-allowed`}
              >
                {running ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Chạy</span>
                  </>
                ) : (
                  <>
                    <Play size={16} fill="currentColor" />
                    <span>Chạy</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting || running}
                className={`flex items-center space-x-1.5 text-sm px-5 py-2 rounded font-bold transition-all ${
                  isDark
                    ? "bg-green-600 hover:bg-green-500 text-white disabled:bg-green-600/50"
                    : "bg-green-500 hover:bg-green-600 text-white disabled:bg-green-500/50"
                } disabled:cursor-not-allowed`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Nộp bài</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Nộp bài</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div
            className="flex-1"
            style={{
              height: showTerminal
                ? `calc(100% - ${terminalHeight}px)`
                : "100%",
            }}
          >
            <Editor
              height="100%"
              language={language === "cpp" ? "cpp" : language}
              theme={isDark ? "vs-dark" : "vs"}
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                fontFamily: "'Consolas', 'Courier New', monospace",
                tabSize: 4,
                renderLineHighlight: "line",
                cursorBlinking: "smooth",
                smoothScrolling: true,
                padding: { top: 10 },
              }}
            />
          </div>

          {/* Terminal Panel - VS Code Style */}
          {showTerminal && (
            <div
              ref={terminalRef}
              style={{ height: `${terminalHeight}px` }}
              className={`flex flex-col ${
                isDark ? "border-slate-700" : "border-slate-200"
              } border-t`}
            >
              {/* Resize Handle */}
              <div
                onMouseDown={() => setIsResizing(true)}
                className={`h-1 ${
                  isDark
                    ? "bg-slate-800 hover:bg-blue-600"
                    : "bg-slate-100 hover:bg-blue-500"
                } cursor-ns-resize transition-colors flex-shrink-0`}
              />

              {/* Terminal Header */}
              <div
                className={`flex items-center justify-between ${
                  isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                } border-b flex-shrink-0`}
              >
                <div className="flex items-center px-4 py-2">
                  <TerminalIcon
                    size={14}
                    className={`${
                      isDark ? "text-green-400" : "text-green-600"
                    } mr-2`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Terminal
                  </span>
                  <span
                    className={`text-xs ml-2 ${
                      isDark ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    ({language})
                  </span>
                </div>

                <div className="flex items-center space-x-1 pr-2">
                  <button
                    onClick={clearTerminal}
                    className={`p-1.5 rounded transition-colors ${
                      isDark
                        ? "text-gray-500 hover:text-white hover:bg-slate-700"
                        : "text-gray-500 hover:text-gray-900 hover:bg-slate-100"
                    }`}
                    title="Xóa terminal"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() =>
                      setTerminalHeight((h) => Math.min(500, h + 50))
                    }
                    className={`p-1.5 rounded transition-colors ${
                      isDark
                        ? "text-gray-500 hover:text-white hover:bg-slate-700"
                        : "text-gray-500 hover:text-gray-900 hover:bg-slate-100"
                    }`}
                    title="Mở rộng"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() =>
                      setTerminalHeight((h) => Math.max(150, h - 50))
                    }
                    className={`p-1.5 rounded transition-colors ${
                      isDark
                        ? "text-gray-500 hover:text-white hover:bg-slate-700"
                        : "text-gray-500 hover:text-gray-900 hover:bg-slate-100"
                    }`}
                    title="Thu gọn"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    onClick={() => setShowTerminal(false)}
                    className={`p-1.5 rounded transition-colors ${
                      isDark
                        ? "text-gray-500 hover:text-white hover:bg-slate-700"
                        : "text-gray-500 hover:text-gray-900 hover:bg-slate-100"
                    }`}
                    title="Close"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Terminal Content - Interactive */}
              <div
                className={`flex-1 overflow-auto p-3 font-mono text-sm ${
                  isDark ? "bg-black" : "bg-slate-50"
                }`}
                onClick={() => inputRef.current?.focus()}
                ref={outputRef}
              >
                {/* Terminal History */}
                {terminalHistory.map((item, index) => (
                  <div
                    key={index}
                    className={`${
                      item.type === "system"
                        ? isDark
                          ? "text-gray-400"
                          : "text-gray-600"
                        : item.type === "input"
                        ? isDark
                          ? "text-green-400"
                          : "text-green-700"
                        : item.type === "output"
                        ? isDark
                          ? "text-white"
                          : "text-gray-900"
                        : item.type === "error"
                        ? isDark
                          ? "text-red-400"
                          : "text-red-600"
                        : item.type === "success"
                        ? isDark
                          ? "text-green-400"
                          : "text-green-700"
                        : isDark
                        ? "text-white"
                        : "text-gray-900"
                    } ${
                      item.type === "error"
                        ? isDark
                          ? "bg-red-900/20"
                          : "bg-red-100/50" + " px-2 py-0.5 rounded"
                        : ""
                    }`}
                  >
                    {item.type === "input" && (
                      <span
                        className={
                          isDark ? "text-yellow-400" : "text-yellow-600"
                        }
                      >
                        {">"}{" "}
                      </span>
                    )}
                    <span className="whitespace-pre-wrap font-mono">
                      {item.text}
                    </span>
                  </div>
                ))}

                {/* Input Line */}
                {waitingForInput && (
                  <div className="flex items-start mt-1">
                    <span
                      className={`mr-1 select-none ${
                        isDark ? "text-green-500" : "text-green-700"
                      }`}
                    >
                      $
                    </span>
                    <textarea
                      ref={inputRef}
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && !running) {
                          e.preventDefault();
                          executeCode(terminalInput);
                        }
                      }}
                      className={`flex-1 outline-none resize-none font-mono text-sm leading-5 focus:outline-none focus:ring-0 focus:border-transparent ${
                        isDark
                          ? "bg-black text-white placeholder-gray-600"
                          : "bg-slate-50 text-gray-900 placeholder-gray-500"
                      }`}
                      placeholder="Nhập dữ liệu, nhấn Enter để chạy..."
                      rows={3}
                      autoFocus
                      style={{
                        caretColor: isDark ? "#22c55e" : "#16a34a",
                        border: "none",
                        boxShadow: "none",
                        outline: "none",
                        WebkitAppearance: "none",
                      }}
                    />
                  </div>
                )}

                {/* Running Indicator */}
                {running && (
                  <div className="flex items-center text-yellow-400 mt-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-yellow-400 border-t-transparent mr-2"></div>
                    <span>Running...</span>
                  </div>
                )}

                {/* Run Again Button - shows after execution is done */}
                {!running && !waitingForInput && terminalHistory.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-800">
                    <button
                      onClick={handleRun}
                      className="flex items-center space-x-1.5 text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      <Play size={14} fill="currentColor" />
                      <span>Run Again</span>
                    </button>
                  </div>
                )}

                {/* Submit Result */}
                {outputData && outputData.type === "accepted" && (
                  <div className="mt-3 p-3 bg-green-900/30 border border-green-700 rounded">
                    <div className="flex items-center text-green-400 font-bold mb-2">
                      <CheckCircle size={16} className="mr-2" />
                      Accepted
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="text-gray-400">Tests</div>
                        <div className="text-green-400 font-bold">
                          {outputData.testCasesPassed}/
                          {outputData.totalTestCases}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400">Runtime</div>
                        <div className="text-white font-bold">
                          {outputData.executionTime || 0}ms
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400">Memory</div>
                        <div className="text-white font-bold">
                          {outputData.memoryUsed || 0}MB
                        </div>
                      </div>
                    </div>
                    {outputData.redirecting && (
                      <div className="mt-3 pt-3 border-t border-green-700 text-center">
                        <div className="text-cyan-400 animate-pulse">
                          🎉 {outputData.redirectMessage}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {outputData && outputData.type === "wrong" && (
                  <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded">
                    <div
                      className={`flex items-center font-bold mb-2 ${getStatusColor(
                        outputData.status
                      )}`}
                    >
                      <AlertCircle size={16} className="mr-2" />
                      {getStatusText(outputData.status)}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="text-gray-400">Tests</div>
                        <div className="text-red-400 font-bold">
                          {outputData.testCasesPassed}/
                          {outputData.totalTestCases}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400">Runtime</div>
                        <div className="text-white font-bold">
                          {outputData.executionTime || 0}ms
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400">Memory</div>
                        <div className="text-white font-bold">
                          {outputData.memoryUsed || 0}MB
                        </div>
                      </div>
                    </div>
                    {outputData.errorMessage && (
                      <div className="mt-2 text-red-400 text-xs">
                        {outputData.errorMessage}
                      </div>
                    )}
                  </div>
                )}

                {outputData && outputData.type === "judging" && (
                  <div className="flex items-center text-yellow-400 mt-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent mr-2"></div>
                    <span>Judging your solution...</span>
                  </div>
                )}

                {/* Empty State */}
                {terminalHistory.length === 0 &&
                  !outputData &&
                  !waitingForInput &&
                  !running && (
                    <div className="text-gray-600 text-center py-8">
                      <TerminalIcon
                        size={32}
                        className="mx-auto mb-2 opacity-30"
                      />
                      <p>
                        Click <span className="text-blue-400">Run</span> to
                        execute your code
                      </p>
                      <p className="text-xs mt-1">
                        Click <span className="text-green-400">Submit</span> to
                        grade your solution
                      </p>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hiển thị feedback chi tiết cho từng test case sau khi chấm */}
      {result &&
        result.testCasesResult &&
        result.testCasesResult.length > 0 && (
          <div className="mt-6">
            <h3 className="text-white font-semibold mb-2">
              Test Case Feedback
            </h3>
            <div className="space-y-3">
              {result.testCasesResult.map((tc, idx) => (
                <div
                  key={idx}
                  className="bg-[#222] rounded-lg border border-[#444] p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`font-bold text-sm ${getStatusColor(
                        tc.status
                      )}`}
                    >
                      Test Case #{idx + 1}: {getStatusText(tc.status)}
                    </span>
                    {tc.time !== undefined && (
                      <span className="text-xs text-gray-400">
                        Time: {tc.time}ms
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="text-gray-400 mb-1">Input</div>
                      <pre className="text-green-400 whitespace-pre-wrap">
                        {tc.input}
                      </pre>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Output</div>
                      <pre className="text-cyan-400 whitespace-pre-wrap">
                        {tc.output}
                      </pre>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Expected</div>
                      <pre className="text-yellow-400 whitespace-pre-wrap">
                        {tc.expected}
                      </pre>
                    </div>
                  </div>
                  {tc.error && (
                    <div className="mt-2 text-red-400 text-xs">
                      Error: {tc.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};

export default ProblemSolve;
