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
import { contestService } from "../../services/contest";

export default function ContestsScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContests();
  }, []);

  const loadContests = async () => {
    try {
      setLoading(true);
      const data = await contestService.getAllContests();
      setContests(data.contests || []);
    } catch (error) {
      console.error("Error loading contests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getContestStatus = (contest) => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    if (now < start) return "upcoming";
    if (now > end) return "ended";
    return "ongoing";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ongoing":
        return { bg: "bg-green-100", text: "text-green-800" };
      case "upcoming":
        return { bg: "bg-blue-100", text: "text-blue-800" };
      case "ended":
        return { bg: "bg-gray-100", text: "text-gray-800" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800" };
    }
  };

  const renderContestItem = ({ item }) => {
    const status = getContestStatus(item);
    const colors = getStatusColor(status);

    return (
      <TouchableOpacity
        onPress={() => router.push(`/contests/${item._id}`)}
        className={`mx-4 mb-4 p-4 rounded-lg border ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text
              className={`text-lg font-bold ${
                isDark ? "text-white" : "text-dark"
              }`}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text
              className={`text-xs mt-1 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {item.problems?.length || 0} problems • {item.duration} mins
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${colors.bg}`}>
            <Text className={`text-xs font-semibold capitalize ${colors.text}`}>
              {status}
            </Text>
          </View>
        </View>
        {item.description && (
          <Text
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeContainer className={isDark ? "bg-dark" : "bg-light"}>
      <Header title="Contests" subtitle="Compete with others" />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#06B6D4" />
        </View>
      ) : contests.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text
            className={`text-lg font-semibold ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No contests available
          </Text>
        </View>
      ) : (
        <FlatList
          data={contests}
          renderItem={renderContestItem}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
        />
      )}
    </SafeContainer>
  );
}
