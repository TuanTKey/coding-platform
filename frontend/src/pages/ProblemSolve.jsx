import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Editor from '@monaco-editor/react';
import { Play, Clock, Database, AlertCircle, CheckCircle, Terminal as TerminalIcon, Minimize2, Send, Square } from 'lucide-react';

const ProblemSolve = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState(null);
  const [sampleTestCases, setSampleTestCases] = useState([]);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  
  // Terminal state
  const [showTerminal, setShowTerminal] = useState(true);
  const [terminalHeight, setTerminalHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [runOutput, setRunOutput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState([]);
  const terminalRef = useRef(null);

const languageTemplates = {
  python: `# Write your solution here
s = input().strip()
reversed_str = s[::-1]
print(reversed_str)`,

  javascript: `// Write your solution here
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('', (input) => {
  const reversed = input.split('').reverse().join('');
  console.log(reversed);
  rl.close();
});`,

  cpp: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string s;
    getline(cin, s);
    reverse(s.begin(), s.end());
    cout << s << endl;
    return 0;
}`,

  java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        String reversed = new StringBuilder(input).reverse().toString();
        System.out.println(reversed);
        scanner.close();
    }
}`
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
      
      if (response.data.sampleTestCases.length > 0) {
        setCustomInput(response.data.sampleTestCases[0].input);
      }
    } catch (error) {
      console.error('Error fetching problem:', error);
      alert('Failed to load problem');
      navigate('/problems');
    }
  };

  // RUN CODE LOCALLY (test với input tự nhập)
  const handleRun = async () => {
    if (!code.trim()) {
      alert('Please write some code first!');
      return;
    }

    setShowTerminal(true);
    setRunning(true);
    setRunOutput('🚀 Running your code...\n');
    setResult(null);

    // Add to terminal history
    const newEntry = {
      type: 'command',
      content: `$ Running ${language} code...`,
      timestamp: new Date().toLocaleTimeString()
    };
    setTerminalHistory(prev => [...prev, newEntry]);

    try {
      const response = await api.post('/submissions/run', {
        code: code,
        language: language,
        input: customInput
      });

      console.log('Run response:', response.data);

      const outputEntry = {
        type: response.data.error ? 'error' : 'output',
        content: response.data.error 
          ? `❌ Execution Error:\n${response.data.error}`
          : `✅ Execution completed in ${response.data.executionTime || 0}ms\n\nOutput:\n${response.data.output}`,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setTerminalHistory(prev => [...prev, outputEntry]);
      setRunOutput(response.data.output || response.data.error);

    } catch (error) {
      console.error('Run error:', error);
      const errorEntry = {
        type: 'error',
        content: `❌ Server Error:\n${error.response?.data?.error || error.message || 'Failed to run code'}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setTerminalHistory(prev => [...prev, errorEntry]);
      setRunOutput(`❌ Error:\n${error.response?.data?.error || error.message || 'Failed to run code'}`);
    } finally {
      setRunning(false);
    }
  };

  // SUBMIT CODE (chấm điểm chính thức)
  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Please write some code first!');
      return;
    }

    setShowTerminal(true);
    setSubmitting(true);
    setRunOutput('');
    setResult({ status: 'judging', message: 'Submitting your solution for grading...' });

    // Add to terminal history
    const submitEntry = {
      type: 'command',
      content: `$ Submitting solution for grading...`,
      timestamp: new Date().toLocaleTimeString()
    };
    setTerminalHistory(prev => [...prev, submitEntry]);

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
            
            // Add result to terminal history
            const resultEntry = {
              type: submission.status === 'accepted' ? 'success' : 'error',
              content: `📊 Result: ${getStatusText(submission.status)}\nTest Cases: ${submission.testCasesPassed}/${submission.totalTestCases}\nTime: ${submission.executionTime || 0}ms`,
              timestamp: new Date().toLocaleTimeString()
            };
            setTerminalHistory(prev => [...prev, resultEntry]);
            
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

  const clearTerminal = () => {
    setTerminalHistory([]);
    setRunOutput('');
    setResult(null);
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
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 border border-gray-600"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowTerminal(!showTerminal)}
                className="flex items-center space-x-2 bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-600 text-sm border border-gray-600"
              >
                <TerminalIcon size={16} />
                <span>{showTerminal ? 'Hide' : 'Show'} Terminal</span>
              </button>
              
              {/* RUN BUTTON */}
              <button
                onClick={handleRun}
                disabled={running || submitting}
                className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-semibold border border-blue-500"
              >
                {running ? <Square size={18} /> : <Play size={18} />}
                <span>{running ? 'Running...' : 'Run'}</span>
              </button>

              {/* SUBMIT BUTTON */}
              <button
                onClick={handleSubmit}
                disabled={submitting || running}
                className="flex items-center space-x-2 bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 disabled:opacity-50 font-semibold border border-green-500"
              >
                <Send size={18} />
                <span>{submitting ? 'Đang chấm...' : 'Nộp bài'}</span>
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
                fontFamily: 'Monaco, Menlo, "Courier New", monospace',
                tabSize: 2,
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
                <div className="flex items-center space-x-2">
                  <TerminalIcon size={16} className="text-green-400" />
                  <span className="text-white font-semibold text-sm">Terminal</span>
                  <span className="text-gray-400 text-xs">({language})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={clearTerminal}
                    className="text-gray-400 hover:text-white text-xs px-2 py-1 hover:bg-gray-700 rounded"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowTerminal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Minimize2 size={16} />
                  </button>
                </div>
              </div>

              {/* Terminal Content */}
              <div className="flex-1 flex overflow-hidden">
                {/* Input Box */}
                <div className="w-1/2 border-r border-gray-700 flex flex-col">
                  <div className="bg-gray-800 px-3 py-2 border-b border-gray-700 flex justify-between items-center">
                    <span className="text-gray-400 text-xs font-semibold">CUSTOM INPUT</span>
                    <span className="text-gray-500 text-xs">{customInput.length} chars</span>
                  </div>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter your test input here&#10;Example: hello"
                    className="flex-1 bg-gray-900 text-gray-300 p-3 font-mono text-sm resize-none focus:outline-none focus:text-white focus:ring-1 focus:ring-blue-500"
                    spellCheck={false}
                  />
                  <div className="bg-gray-800 px-3 py-2 border-t border-gray-700 text-xs text-gray-500 flex justify-between">
                    <span>💡 Click "Run" to test with this input</span>
                    <span className="text-gray-600">Line: {customInput.split('\n').length}</span>
                  </div>
                </div>

                {/* Output Box */}
                <div className="w-1/2 flex flex-col">
                  <div className="bg-gray-800 px-3 py-2 border-b border-gray-700 flex justify-between items-center">
                    <span className="text-gray-400 text-xs font-semibold">OUTPUT</span>
                    <span className="text-gray-500 text-xs">{terminalHistory.length} entries</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 font-mono text-sm bg-gray-900">
                    {/* Terminal History */}
                    {terminalHistory.length > 0 ? (
                      <div className="space-y-2">
                        {terminalHistory.map((entry, index) => (
                          <div key={index} className={`border-l-2 pl-2 ${
                            entry.type === 'command' ? 'border-yellow-500 text-yellow-300' :
                            entry.type === 'error' ? 'border-red-500 text-red-300' :
                            entry.type === 'success' ? 'border-green-500 text-green-300' :
                            'border-blue-500 text-blue-300'
                          }`}>
                            <div className="flex justify-between text-xs opacity-70 mb-1">
                              <span>{entry.timestamp}</span>
                              <span className="uppercase">{entry.type}</span>
                            </div>
                            <pre className="whitespace-pre-wrap text-sm">{entry.content}</pre>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* EMPTY STATE */
                      <div className="text-gray-500 text-center py-8 h-full flex items-center justify-center">
                        <div>
                          <TerminalIcon size={32} className="mx-auto mb-2 opacity-30" />
                          <p className="text-sm mb-2">No output yet</p>
                          <p className="text-xs mb-1">Click <strong className="text-blue-400">Run</strong> to test your code</p>
                          <p className="text-xs">Click <strong className="text-green-400">Submit</strong> to grade your solution</p>
                        </div>
                      </div>
                    )}

                    {/* Current Running Status */}
                    {(running || submitting) && (
                      <div className="border-l-2 border-yellow-500 pl-2 text-yellow-300 mt-2">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-500"></div>
                          <span className="text-sm">
                            {running ? 'Running your code...' : 'Judging your solution...'}
                          </span>
                        </div>
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