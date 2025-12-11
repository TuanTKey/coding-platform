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
import { contestService } from "../../services/contest";
import { Button } from "../../components/Common";
import { ArrowLeft, Users } from "lucide-react";

export default function ContestDetailScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadContest();
  }, [id]);

  const loadContest = async () => {
    try {
      setLoading(true);
      const data = await contestService.getContestById(id);
      setContest(data.contest || data);
    } catch (error) {
      console.error("Error loading contest:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinContest = async () => {
    try {
      setJoining(true);
      await contestService.joinContest(id);
      setJoined(true);
      alert("Successfully joined the contest!");
    } catch (error) {
      alert(
        "Failed to join: " + (error.response?.data?.error || error.message)
      );
    } finally {
      setJoining(false);
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

  if (!contest) {
    return (
      <View
        className={`flex-1 items-center justify-center ${
          isDark ? "bg-dark" : "bg-light"
        }`}
      >
        <Text className={isDark ? "text-white" : "text-dark"}>
          Contest not found
        </Text>
      </View>
    );
  }

  const now = new Date();
  const startTime = new Date(contest.startTime);
  const endTime = new Date(contest.endTime);
  const isOngoing = now >= startTime && now <= endTime;
  const isUpcoming = now < startTime;

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
          {contest.title}
        </Text>
      </View>

      {/* Contest Info */}
      <View className="px-4 py-6">
        {/* Status Badge */}
        <View className="mb-6">
          <View
            className={`inline-flex px-4 py-2 rounded-full self-start ${
              isOngoing
                ? "bg-green-100"
                : isUpcoming
                ? "bg-blue-100"
                : "bg-gray-100"
            }`}
          >
            <Text
              className={`font-semibold capitalize ${
                isOngoing
                  ? "text-green-800"
                  : isUpcoming
                  ? "text-blue-800"
                  : "text-gray-800"
              }`}
            >
              {isOngoing ? "Ongoing" : isUpcoming ? "Upcoming" : "Ended"}
            </Text>
          </View>
        </View>

        {/* Description */}
        {contest.description && (
          <View
            className={`p-4 rounded-lg mb-6 ${
              isDark ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-base ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {contest.description}
            </Text>
          </View>
        )}

        {/* Contest Details */}
        <View
          className={`p-4 rounded-lg mb-6 border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <View className="mb-4 flex-row justify-between">
            <Text className={isDark ? "text-gray-400" : "text-gray-600"}>
              Start Time
            </Text>
            <Text
              className={`font-semibold ${isDark ? "text-white" : "text-dark"}`}
            >
              {new Date(contest.startTime).toLocaleString("vi-VN")}
            </Text>
          </View>

          <View className="mb-4 flex-row justify-between">
            <Text className={isDark ? "text-gray-400" : "text-gray-600"}>
              End Time
            </Text>
            <Text
              className={`font-semibold ${isDark ? "text-white" : "text-dark"}`}
            >
              {new Date(contest.endTime).toLocaleString("vi-VN")}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className={isDark ? "text-gray-400" : "text-gray-600"}>
              Duration
            </Text>
            <Text
              className={`font-semibold ${isDark ? "text-white" : "text-dark"}`}
            >
              {contest.duration} minutes
            </Text>
          </View>
        </View>

        {/* Problems Count */}
        <View
          className={`flex-row items-center p-4 rounded-lg mb-6 ${
            isDark ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <Users size={24} color={isDark ? "#9CA3AF" : "#6B7280"} />
          <View className="ml-4 flex-1">
            <Text className={isDark ? "text-gray-400" : "text-gray-600"}>
              Problems
            </Text>
            <Text
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-dark"
              }`}
            >
              {contest.problems?.length || 0}
            </Text>
          </View>
        </View>

        {/* Rules */}
        {contest.rules && (
          <View
            className={`p-4 rounded-lg mb-6 ${
              isDark ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <Text
              className={`font-bold mb-2 ${
                isDark ? "text-white" : "text-dark"
              }`}
            >
              Rules
            </Text>
            <Text
              className={`text-sm ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {contest.rules}
            </Text>
          </View>
        )}

        {/* Join Button */}
        {!joined && (isOngoing || isUpcoming) && (
          <Button
            text={joining ? "Joining..." : "Join Contest"}
            onPress={handleJoinContest}
            disabled={joining}
          />
        )}

        {joined && (
          <Button
            text="View Problems"
            onPress={() => router.push(`/contests/${id}/problems`)}
          />
        )}
      </View>
    </SafeContainer>
  );
}
