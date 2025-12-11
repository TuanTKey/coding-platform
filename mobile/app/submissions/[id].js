import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { SafeContainer } from "../../components/Layout";
import { StatusBadge } from "../../components/Badge";
import { submissionService } from "../../services/submission";
import { formatDateTime } from "../../utils/helpers";
import { ArrowLeft } from "lucide-react";

export default function SubmissionDetailScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmission();
  }, [id]);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      const data = await submissionService.getSubmissionStatus(id);
      setSubmission(data.submission);
    } catch (error) {
      console.error("Error loading submission:", error);
    } finally {
      setLoading(false);
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

  if (!submission) {
    return (
      <View
        className={`flex-1 items-center justify-center ${
          isDark ? "bg-dark" : "bg-light"
        }`}
      >
        <Text className={isDark ? "text-white" : "text-dark"}>
          Submission not found
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
        >
          Submission Details
        </Text>
      </View>

      {/* Status */}
      <View className="px-4 py-6">
        <View className="items-center mb-6">
          <StatusBadge status={submission.status} />
          <Text
            className={`text-lg font-semibold mt-4 ${
              isDark ? "text-white" : "text-dark"
            }`}
          >
            {submission.problemId?.title || "Problem"}
          </Text>
        </View>

        {/* Details */}
        <View
          className={`p-4 rounded-lg mb-6 ${
            isDark ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <View className="mb-4 flex-row justify-between">
            <Text className={isDark ? "text-gray-400" : "text-gray-600"}>
              Language
            </Text>
            <Text
              className={`font-semibold ${isDark ? "text-white" : "text-dark"}`}
            >
              {submission.language}
            </Text>
          </View>

          <View className="mb-4 flex-row justify-between">
            <Text className={isDark ? "text-gray-400" : "text-gray-600"}>
              Submitted at
            </Text>
            <Text
              className={`font-semibold ${isDark ? "text-white" : "text-dark"}`}
            >
              {formatDateTime(submission.createdAt)}
            </Text>
          </View>

          <View className="mb-4 flex-row justify-between">
            <Text className={isDark ? "text-gray-400" : "text-gray-600"}>
              Test Cases Passed
            </Text>
            <Text
              className={`font-semibold ${isDark ? "text-white" : "text-dark"}`}
            >
              {submission.testCasesPassed || 0}/{submission.totalTestCases || 0}
            </Text>
          </View>

          {submission.executionTime && (
            <View className="flex-row justify-between">
              <Text className={isDark ? "text-gray-400" : "text-gray-600"}>
                Execution Time
              </Text>
              <Text
                className={`font-semibold ${
                  isDark ? "text-white" : "text-dark"
                }`}
              >
                {submission.executionTime}ms
              </Text>
            </View>
          )}
        </View>

        {/* Code */}
        <View className="mb-6">
          <Text
            className={`text-lg font-bold mb-3 ${
              isDark ? "text-white" : "text-dark"
            }`}
          >
            Your Code
          </Text>
          <View
            className={`p-3 rounded-lg ${
              isDark ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <Text
              className={`font-mono text-xs ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {submission.code}
            </Text>
          </View>
        </View>

        {/* Error Message */}
        {submission.errorMessage && (
          <View className="mb-6 p-4 rounded-lg bg-red-100">
            <Text className="font-bold text-red-800 mb-2">Error</Text>
            <Text className="text-red-700 text-sm">
              {submission.errorMessage}
            </Text>
          </View>
        )}

        {/* Test Cases */}
        {submission.testCasesResult &&
          submission.testCasesResult.length > 0 && (
            <View>
              <Text
                className={`text-lg font-bold mb-3 ${
                  isDark ? "text-white" : "text-dark"
                }`}
              >
                Test Cases Results
              </Text>
              {submission.testCasesResult.map((tc, index) => (
                <View
                  key={index}
                  className={`mb-3 p-3 rounded-lg border ${
                    tc.status === "passed"
                      ? isDark
                        ? "border-green-700 bg-green-900/20"
                        : "border-green-200 bg-green-50"
                      : isDark
                      ? "border-red-700 bg-red-900/20"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <Text
                      className={`font-semibold ${
                        tc.status === "passed"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      Test Case {index + 1}
                    </Text>
                    <Text
                      className={`capitalize text-xs font-bold ${
                        tc.status === "passed"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {tc.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
      </View>
    </SafeContainer>
  );
}
