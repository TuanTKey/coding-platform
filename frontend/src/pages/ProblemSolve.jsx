import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Editor from '@monaco-editor/react';
import { Play, Clock, Database, AlertCircle, CheckCircle, Terminal as TerminalIcon, Minimize2, Send } from 'lucide-react';

const ProblemSolve = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState(null);
  const [sampleTestCases, setSampleTestCases] = useState([]);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  
  // Terminal & Input state
  const [showTerminal, setShowTerminal] = useState(true);
  const [terminalHeight, setTerminalHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showInputBox, setShowInputBox] = useState(true);
  const terminalRef = useRef(null);

  const languageTemplates = {
    python: '# Write your solution here\nx = int(input().strip())\n\n# Số âm không phải palindrome\nif x < 0:\n    print("false")\nelse:\n    s = str(x)\n    if s == s[::-1]:\n        print("true")\n    else:\n        print("false")\n',
    javascript: '// Write your solution here\nconst input = require("fs").readFileSync(0, "utf-8").trim();\nconst x = parseInt(input);\n\nif (x < 0) {\n    console.log("false");\n} else {\n    const s = x.toString();\n    console.log(s === s.split("").reverse().join("") ? "true" : "false");\n}\n',
    cpp: '#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int x;\n    cin >> x;\n    \n    if (x < 0) {\n        cout << "false" << endl;\n    } else {\n        string s = to_string(x);\n        string rev = s;\n        reverse(rev.begin(), rev.end());\n        cout << (s == rev ? "true" : "false") << endl;\n    }\n    return 0;\n}\n',
    java: 'import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int x = sc.nextInt();\n        \n        if (x < 0) {\n            System.out.println("false");\n        } else {\n            String s = String.valueOf(x);\n            String rev = new StringBuilder(s).reverse().toString();\n            System.out.println(s.equals(rev) ? "true" : "false");\n        }\n    }\n}\n'
  };

  useEffect(() => {
    fetchProblem();
  }, [slug]);

  useEffect(() => {
    setCode(languageTemplates[language]);
  }, [language]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const container = terminalRef.current?.parentElement;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const newHeight = containerRect.bottom - e.clientY;
          setTerminalHeight(Math.max(200, Math.min(600, newHeight)));
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const fetchProblem = async () => {
    try {
      const response = await api.get(`/problems/slug/${slug}`);
      setProblem(response.data.problem);
      setSampleTestCases(response.data.sampleTestCases);
      setCode(languageTemplates[language]);
      
      // Set default input từ sample test case đầu tiên
      if (response.data.sampleTestCases.length > 0) {
        setCustomInput(response.data.sampleTestCases[0].input);
      }
    } catch (error) {
      console.error('Error fetching problem:', error);
      alert('Failed to load problem');
      navigate('/problems');
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Please write some code first!');
      return;
    }

    setShowTerminal(true);
    setSubmitting(true);
    setResult({ status: 'judging', message: 'Submitting your solution...' });

    try {
      const response = await api.post('/submissions', {
        problemId: problem._id,
        code: code,
        language: language
      });

      const submissionId = response.data.submissionId;
      let pollCount = 0;

      const pollInterval = setInterval(async () => {
        try {
          pollCount++;
          const statusResponse = await api.get(`/submissions/${submissionId}`);
          const submission = statusResponse.data.submission;

          if (submission.status !== 'pending' && submission.status !== 'judging') {
            setResult(submission);
            setSubmitting(false);
            clearInterval(pollInterval);
          }

          if (pollCount >= 30) {
            clearInterval(pollInterval);
            setSubmitting(false);
            setResult({ 
              status: 'error', 
              errorMessage: 'Timeout' 
            });
          }
        } catch (error) {
          clearInterval(pollInterval);
          setSubmitting(false);
          setResult({ 
            status: 'error', 
            errorMessage: 'Error checking status' 
          });
        }
      }, 1000);

    } catch (error) {
      setSubmitting(false);
      setResult({ 
        status: 'error', 
        errorMessage: error.response?.data?.error || 'Submission failed' 
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="text-green-400" size={20} />;
      case 'judging':
      case 'pending':
        return <Clock className="text-yellow-400 animate-spin" size={20} />;
      default:
        return <AlertCircle className="text-red-400" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-900 border-green-700';
      case 'judging':
      case 'pending':
        return 'bg-blue-900 border-blue-700';
      default:
        return 'bg-red-900 border-red-700';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      accepted: 'Accepted ✅',
      wrong_answer: 'Wrong Answer ❌',
      time_limit: 'Time Limit Exceeded ⏰',
      runtime_error: 'Runtime Error 💥',
      compile_error: 'Compilation Error 🔧',
      error: 'Error ❌',
      pending: 'Pending...',
      judging: 'Judging...'
    };
    return statusMap[status] || status;
  };

  if (!problem) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{problem.title}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {problem.difficulty.toUpperCase()}
              </span>
              <span className="flex items-center text-gray-600">
                <Clock size={16} className="mr-1" />
                {problem.timeLimit}ms
              </span>
              <span className="flex items-center text-gray-600">
                <Database size={16} className="mr-1" />
                {problem.memoryLimit}MB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Problem Description */}
        <div className="w-1/2 overflow-y-auto p-6 bg-gray-50">
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-xl font-bold mb-4">Problem Description</h2>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {problem.description}
            </div>
          </div>

          {problem.inputFormat && (
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <h3 className="font-bold mb-2">Input Format</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{problem.inputFormat}</p>
            </div>
          )}

          {problem.outputFormat && (
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <h3 className="font-bold mb-2">Output Format</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{problem.outputFormat}</p>
            </div>
          )}

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-bold mb-4">Sample Test Cases</h3>
            {sampleTestCases.map((testCase, idx) => (
              <div key={idx} className="mb-4 p-4 bg-gray-50 rounded">
                <div className="mb-2">
                  <strong>Input:</strong>
                  <pre className="mt-1 p-2 bg-white rounded border text-sm">{testCase.input}</pre>
                </div>
                <div>
                  <strong>Expected Output:</strong>
                  <pre className="mt-1 p-2 bg-white rounded border text-sm">{testCase.expectedOutput}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="w-1/2 flex flex-col bg-gray-900 relative">
          {/* Editor Header */}
          <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowTerminal(!showTerminal)}
                className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                <TerminalIcon size={18} />
                <span>{showTerminal ? 'Hide' : 'Show'} Output</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                <Send size={18} />
                <span>{submitting ? 'Judging...' : 'Submit'}</span>
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div style={{ 
            height: showTerminal ? `calc(100% - ${terminalHeight}px)` : '100%',
            transition: 'height 0.3s ease'
          }}>
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Terminal Panel */}
          {showTerminal && (
            <div 
              ref={terminalRef}
              style={{ height: `${terminalHeight}px` }}
              className="bg-gray-900 border-t border-gray-700 flex flex-col"
            >
              {/* Resize Handle */}
              <div
                onMouseDown={() => setIsResizing(true)}
                className="h-1 bg-gray-700 hover:bg-blue-500 cursor-ns-resize transition-colors"
              />
              
              {/* Terminal Header */}
              <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <TerminalIcon size={16} className="text-green-400" />
                    <span className="text-white font-semibold text-sm">Input/Output</span>
                  </div>
                  <button
                    onClick={() => setShowInputBox(!showInputBox)}
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    {showInputBox ? 'Hide' : 'Show'} Input
                  </button>
                </div>
                <button
                  onClick={() => setShowTerminal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <Minimize2 size={16} />
                </button>
              </div>

              {/* Terminal Content */}
              <div className="flex-1 flex overflow-hidden">
                {/* Input Box */}
                {showInputBox && (
                  <div className="w-1/2 border-r border-gray-700 flex flex-col">
                    <div className="bg-gray-800 px-3 py-2 border-b border-gray-700">
                      <span className="text-gray-400 text-xs font-semibold">INPUT</span>
                    </div>
                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Enter input here (one per line)&#10;Example: 121"
                      className="flex-1 bg-gray-900 text-white p-3 font-mono text-sm resize-none focus:outline-none"
                    />
                  </div>
                )}

                {/* Output Box */}
                <div className={`${showInputBox ? 'w-1/2' : 'w-full'} flex flex-col`}>
                  <div className="bg-gray-800 px-3 py-2 border-b border-gray-700">
                    <span className="text-gray-400 text-xs font-semibold">OUTPUT</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 font-mono text-sm">
                    {result ? (
                      <div className={`p-3 rounded border ${getStatusColor(result.status)}`}>
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(result.status)}
                          <span className="text-white font-bold">
                            {getStatusText(result.status)}
                          </span>
                        </div>

                        {result.status === 'accepted' ? (
                          <div className="text-white text-sm">
                            <p className="mb-2">✨ All test cases passed!</p>
                            <div className="bg-green-800 bg-opacity-50 p-2 rounded">
                              <p>📊 Test Cases: {result.testCasesPassed}/{result.totalTestCases}</p>
                              <p>⏱️ Time: {result.executionTime}ms</p>
                            </div>
                            {result.aiAnalysis && (
                              <div className="mt-2 p-2 bg-green-800 bg-opacity-50 rounded">
                                <p className="font-semibold">🤖 AI Analysis:</p>
                                <p className="text-xs mt-1">{result.aiAnalysis}</p>
                              </div>
                            )}
                          </div>
                        ) : result.status === 'judging' || result.status === 'pending' ? (
                          <div className="text-white text-sm">
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              <span>Processing...</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-white text-sm">
                            <p className="mb-2">{result.errorMessage || 'Failed'}</p>
                            {result.testCasesPassed !== undefined && (
                              <div className="bg-red-800 bg-opacity-50 p-2 rounded mb-2">
                                <p>📊 Passed: {result.testCasesPassed}/{result.totalTestCases}</p>
                              </div>
                            )}
                            {result.aiAnalysis && (
                              <div className="mt-2 p-2 bg-red-800 bg-opacity-50 rounded">
                                <p className="font-semibold">🤖 Feedback:</p>
                                <p className="text-xs mt-1">{result.aiAnalysis}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-center py-8">
                        <TerminalIcon size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Click Submit to see output</p>
                        <p className="text-xs mt-1">Tip: Edit input on the left to test</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemSolve;