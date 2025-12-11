import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { SafeContainer, Header } from "../../components/Layout";
import { StatusBadge } from "../../components/Badge";
import { submissionService } from "../../services/submission";
import { formatDateTime } from "../../utils/helpers";

export default function SubmissionsScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await submissionService.getUserSubmissions();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error("Error loading submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderSubmissionItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/submissions/${item._id}`)}
      className={`mx-4 mb-4 p-4 rounded-lg border ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 pr-4">
          <Text
            className={`text-lg font-bold ${
              isDark ? "text-white" : "text-dark"
            }`}
            numberOfLines={1}
          >
            {item.problemId?.title || "Problem"}
          </Text>
          <Text
            className={`text-xs mt-2 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {item.language} • {formatDateTime(item.createdAt)}
          </Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      <View className="flex-row justify-between items-center">
        <Text className={isDark ? "text-gray-400" : "text-gray-600"}>
          {item.testCasesPassed || 0}/{item.totalTestCases || 0} test cases
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeContainer className={isDark ? "bg-dark" : "bg-light"}>
      <Header title="Submissions" subtitle="Your recent submissions" />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#06B6D4" />
        </View>
      ) : submissions.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text
            className={`text-lg font-semibold ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No submissions yet
          </Text>
          <Text
            className={`mt-2 text-center ${
              isDark ? "text-gray-500" : "text-gray-700"
            }`}
          >
            Start solving problems to see your submissions here
          </Text>
        </View>
      ) : (
        <FlatList
          data={submissions}
          renderItem={renderSubmissionItem}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
        />
      )}
    </SafeContainer>
  );
}
