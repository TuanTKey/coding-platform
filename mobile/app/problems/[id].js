import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { SafeContainer } from "../../components/Layout";
import { DifficultyBadge } from "../../components/Badge";
import { problemService, submissionService } from "../../services/problem";
import { Button } from "../../components/Common";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

const LANGUAGES = ["javascript", "python", "java", "cpp", "c"];

export default function ProblemDetailScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);

  useEffect(() => {
    loadProblem();
  }, [id]);

  const loadProblem = async () => {
    try {
      setLoading(true);
      const data = await problemService.getProblemById(id);
      setProblem(data.problem);
    } catch (error) {
      console.error("Error loading problem:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert("Please enter some code");
      return;
    }

    try {
      setSubmitting(true);
      const response = await submissionService.submitSolution(
        id,
        code,
        language
      );
      alert("Submission received! ID: " + response.submissionId);
      router.push(`/submissions/${response.submissionId}`);
    } catch (error) {
      alert(
        "Submission failed: " + (error.response?.data?.error || error.message)
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View
        className={`flex-1 items-center justify-center ${
          isDark ? "bg-dark" : "bg-light"
        }`}
      >
        <ActivityIndicator size="large" color="#06B6D4" />
      </View>
    );
  }

  if (!problem) {
    return (
      <View
        className={`flex-1 items-center justify-center ${
          isDark ? "bg-dark" : "bg-light"
        }`}
      >
        <Text className={isDark ? "text-white" : "text-dark"}>
          Problem not found
        </Text>
      </View>
    );
  }

  return (
    <SafeContainer className={isDark ? "bg-dark" : "bg-light"}>
      {/* Header */}
      <View
        className={`flex-row items-center px-4 py-4 border-b ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDark ? "#E5E7EB" : "#6B7280"} />
        </TouchableOpacity>
        <Text
          className={`text-xl font-bold ml-3 flex-1 ${
            isDark ? "text-white" : "text-dark"
          }`}
          numberOfLines={1}
        >
          {problem.title}
        </Text>
      </View>

      {/* Problem Info */}
      <View className="px-4 py-4">
        <View className="flex-row justify-between items-center mb-4">
          <DifficultyBadge difficulty={problem.difficulty} />
          <View className="flex-row gap-4">
            <View className="items-center">
              <Text
                className={`text-sm font-semibold ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Submissions
              </Text>
              <Text
                className={`text-lg font-bold ${
                  isDark ? "text-white" : "text-dark"
                }`}
              >
                {problem.submissionCount || 0}
              </Text>
            </View>
            <View className="items-center">
              <Text
                className={`text-sm font-semibold ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Accepted
              </Text>
              <Text
                className={`text-lg font-bold ${
                  isDark ? "text-white" : "text-dark"
                }`}
              >
                {problem.acceptedCount || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View
          className={`p-4 rounded-lg mb-4 ${
            isDark ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-base ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {problem.description}
          </Text>
        </View>

        {/* Problem Details */}
        {problem.constraints && (
          <View
            className={`p-4 rounded-lg mb-4 ${
              isDark ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <Text
              className={`font-bold mb-2 ${
                isDark ? "text-white" : "text-dark"
              }`}
            >
              Constraints
            </Text>
            <Text
              className={`text-sm ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {problem.constraints}
            </Text>
          </View>
        )}

        {/* Code Editor Section */}
        {!showCodeEditor ? (
          <Button text="Write Code" onPress={() => setShowCodeEditor(true)} />
        ) : (
          <>
            {/* Language Selector */}
            <View className="mb-4">
              <Text
                className={`text-sm font-semibold mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Language
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    onPress={() => setLanguage(lang)}
                    className={`mr-2 px-4 py-2 rounded-lg ${
                      language === lang
                        ? "bg-primary"
                        : isDark
                        ? "bg-gray-800"
                        : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`capitalize font-semibold ${
                        language === lang
                          ? "text-white"
                          : isDark
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                    >
                      {lang}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Code Input */}
            <View className="mb-4">
              <Text
                className={`text-sm font-semibold mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Your Code
              </Text>
              <TextInput
                multiline
                numberOfLines={10}
                placeholder="Enter your code here..."
                value={code}
                onChangeText={setCode}
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                className={`px-4 py-3 rounded-lg border font-mono text-sm ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-dark"
                }`}
                style={{ minHeight: 300 }}
              />
            </View>

            {/* Submit Button */}
            <Button
              text={submitting ? "Submitting..." : "Submit Solution"}
              onPress={handleSubmit}
              disabled={submitting}
            />
          </>
        )}
      </View>
    </SafeContainer>
  );
}
