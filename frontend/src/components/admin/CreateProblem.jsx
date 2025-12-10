import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Save, Plus, Trash2 } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const CreateProblem = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "easy",
    timeLimit: 2000,
    memoryLimit: 256,
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    tags: "",
  });

  const [sampleTestCases, setSampleTestCases] = useState([
    { input: "", expectedOutput: "" },
  ]);

  const [hiddenTestCases, setHiddenTestCases] = useState([
    { input: "", expectedOutput: "" },
  ]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addSampleTestCase = () => {
    setSampleTestCases([...sampleTestCases, { input: "", expectedOutput: "" }]);
  };

  const removeSampleTestCase = (index) => {
    setSampleTestCases(sampleTestCases.filter((_, i) => i !== index));
  };

  const updateSampleTestCase = (index, field, value) => {
    const updated = [...sampleTestCases];
    updated[index][field] = value;
    setSampleTestCases(updated);
  };

  const addHiddenTestCase = () => {
    setHiddenTestCases([...hiddenTestCases, { input: "", expectedOutput: "" }]);
  };

  const removeHiddenTestCase = (index) => {
    setHiddenTestCases(hiddenTestCases.filter((_, i) => i !== index));
  };

  const updateHiddenTestCase = (index, field, value) => {
    const updated = [...hiddenTestCases];
    updated[index][field] = value;
    setHiddenTestCases(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const payload = {
        ...formData,
        tags: tagsArray,
        sampleTestCases: sampleTestCases.filter(
          (tc) => tc.input && tc.expectedOutput
        ),
        hiddenTestCases: hiddenTestCases.filter(
          (tc) => tc.input && tc.expectedOutput
        ),
      };

      await api.post("/problems", payload);
      alert("Problem created successfully!");
      navigate("/admin/problems");
    } catch (error) {
      console.error("Error creating problem:", error);
      alert(error.response?.data?.error || "Failed to create problem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
            Create New Problem
          </h1>
          <p
            className={`text-lg font-medium ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Fill in the details to create a new coding problem
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div
            className={`rounded-2xl border transition-all p-6 ${
              isDark
                ? "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-700/50"
                : "bg-gradient-to-br from-white to-slate-50 border-gray-200"
            }`}
          >
            <h2
              className={`text-xl font-bold mb-4 ${
                isDark ? "text-cyan-400" : "text-blue-600"
              }`}
            >
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Problem Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border transition-colors ${
                    isDark
                      ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="e.g., Two Sum"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={8}
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border transition-colors ${
                    isDark
                      ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Detailed problem description..."
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Difficulty *
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border transition-colors ${
                      isDark
                        ? "bg-slate-700/50 border-slate-600/50 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Time Limit (ms) *
                  </label>
                  <input
                    type="number"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border transition-colors ${
                      isDark
                        ? "bg-slate-700/50 border-slate-600/50 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Memory Limit (MB) *
                  </label>
                  <input
                    type="number"
                    name="memoryLimit"
                    value={formData.memoryLimit}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border transition-colors ${
                      isDark
                        ? "bg-slate-700/50 border-slate-600/50 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border transition-colors ${
                    isDark
                      ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="array, hash-table, dynamic-programming"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Input Format
                </label>
                <textarea
                  name="inputFormat"
                  value={formData.inputFormat}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border transition-colors ${
                    isDark
                      ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Describe the input format..."
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Output Format
                </label>
                <textarea
                  name="outputFormat"
                  value={formData.outputFormat}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border transition-colors ${
                    isDark
                      ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Describe the output format..."
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Constraints
                </label>
                <textarea
                  name="constraints"
                  value={formData.constraints}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border transition-colors ${
                    isDark
                      ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="e.g., 1 <= n <= 10^5"
                />
              </div>
            </div>
          </div>

          {/* Sample Test Cases */}
          <div
            className={`rounded-2xl border transition-all p-6 ${
              isDark
                ? "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-700/50"
                : "bg-gradient-to-br from-white to-slate-50 border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                className={`text-xl font-bold ${
                  isDark ? "text-cyan-400" : "text-blue-600"
                }`}
              >
                Sample Test Cases (Visible)
              </h2>
              <button
                type="button"
                onClick={addSampleTestCase}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={18} />
                <span>Add</span>
              </button>
            </div>

            {sampleTestCases.map((testCase, index) => (
              <div
                key={index}
                className={`mb-4 p-4 rounded-lg ${
                  isDark
                    ? "bg-slate-700/30 border border-slate-600/30"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3
                    className={`font-semibold ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Test Case {index + 1}
                  </h3>
                  {sampleTestCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSampleTestCase(index)}
                      className={`transition-colors ${
                        isDark
                          ? "text-red-400 hover:text-red-300"
                          : "text-red-600 hover:text-red-800"
                      }`}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-1 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Input
                    </label>
                    <textarea
                      value={testCase.input}
                      onChange={(e) =>
                        updateSampleTestCase(index, "input", e.target.value)
                      }
                      rows={3}
                      className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border transition-colors ${
                        isDark
                          ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                      placeholder="Input data..."
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-1 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Expected Output
                    </label>
                    <textarea
                      value={testCase.expectedOutput}
                      onChange={(e) =>
                        updateSampleTestCase(
                          index,
                          "expectedOutput",
                          e.target.value
                        )
                      }
                      rows={3}
                      className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border transition-colors ${
                        isDark
                          ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                      placeholder="Expected output..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Hidden Test Cases */}
          <div
            className={`rounded-2xl border transition-all p-6 ${
              isDark
                ? "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-700/50"
                : "bg-gradient-to-br from-white to-slate-50 border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                className={`text-xl font-bold ${
                  isDark ? "text-cyan-400" : "text-blue-600"
                }`}
              >
                Hidden Test Cases
              </h2>
              <button
                type="button"
                onClick={addHiddenTestCase}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus size={18} />
                <span>Add</span>
              </button>
            </div>

            {hiddenTestCases.map((testCase, index) => (
              <div
                key={index}
                className={`mb-4 p-4 rounded-lg ${
                  isDark
                    ? "bg-slate-700/30 border border-slate-600/30"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3
                    className={`font-semibold ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Hidden Test Case {index + 1}
                  </h3>
                  {hiddenTestCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHiddenTestCase(index)}
                      className={`transition-colors ${
                        isDark
                          ? "text-red-400 hover:text-red-300"
                          : "text-red-600 hover:text-red-800"
                      }`}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-1 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Input
                    </label>
                    <textarea
                      value={testCase.input}
                      onChange={(e) =>
                        updateHiddenTestCase(index, "input", e.target.value)
                      }
                      rows={3}
                      className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border transition-colors ${
                        isDark
                          ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-1 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Expected Output
                    </label>
                    <textarea
                      value={testCase.expectedOutput}
                      onChange={(e) =>
                        updateHiddenTestCase(
                          index,
                          "expectedOutput",
                          e.target.value
                        )
                      }
                      rows={3}
                      className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border transition-colors ${
                        isDark
                          ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/admin/problems")}
              className={`px-6 py-3 rounded-lg font-semibold border transition-colors ${
                isDark
                  ? "border-slate-600 text-gray-300 hover:bg-slate-700/50"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all"
            >
              <Save size={20} />
              <span>{loading ? "Creating..." : "Create Problem"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProblem;
