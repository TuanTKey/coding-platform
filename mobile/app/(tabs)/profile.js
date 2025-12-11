import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuthStore } from "../../stores/authStore";
import { SafeContainer } from "../../components/Layout";
import { userService } from "../../services/user";
import { LogOut, Settings, User as UserIcon } from "lucide-react";

export default function ProfileScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const data = await userService.getUserProfile(user.id);
        setProfile(data.user || data);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
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

  const userData = profile || user;

  return (
    <SafeContainer className={isDark ? "bg-dark" : "bg-light"}>
      {/* Header */}
      <View
        className={`px-4 py-8 border-b ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <View className="flex-row items-center mb-4">
          <View
            className={`w-16 h-16 rounded-full items-center justify-center ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            <UserIcon size={32} color={isDark ? "#E5E7EB" : "#6B7280"} />
          </View>
          <View className="ml-4 flex-1">
            <Text
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-dark"
              }`}
            >
              {userData?.fullName || userData?.username || "User"}
            </Text>
            <Text className={isDark ? "text-gray-400" : "text-gray-600"}>
              @{userData?.username}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View className="px-4 py-6">
        <View className="grid grid-cols-2 gap-4 mb-6">
          <View
            className={`p-4 rounded-lg ${
              isDark ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-dark"
              }`}
            >
              {profile?.statistics?.solvedProblems || 0}
            </Text>
            <Text
              className={`text-sm mt-1 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Problems Solved
            </Text>
          </View>

          <View
            className={`p-4 rounded-lg ${
              isDark ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-dark"
              }`}
            >
              {profile?.statistics?.totalSubmissions || 0}
            </Text>
            <Text
              className={`text-sm mt-1 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Total Submissions
            </Text>
          </View>
        </View>

        {/* User Info */}
        <View
          className={`mb-6 p-4 rounded-lg border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <Text
            className={`text-sm font-semibold mb-3 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            ACCOUNT INFORMATION
          </Text>
          <View className="mb-3">
            <Text
              className={`text-xs ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Email
            </Text>
            <Text
              className={`text-base font-semibold ${
                isDark ? "text-white" : "text-dark"
              }`}
            >
              {userData?.email}
            </Text>
          </View>
          <View>
            <Text
              className={`text-xs ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Student ID
            </Text>
            <Text
              className={`text-base font-semibold ${
                isDark ? "text-white" : "text-dark"
              }`}
            >
              {userData?.studentId || "N/A"}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="gap-3">
          <TouchableOpacity
            className="flex-row items-center px-4 py-3 rounded-lg bg-primary"
            onPress={() => router.push("/profile/edit")}
          >
            <Settings size={20} color="white" />
            <Text className="ml-3 text-white font-semibold">Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-row items-center px-4 py-3 rounded-lg ${
              isDark ? "bg-gray-800" : "bg-gray-200"
            }`}
            onPress={handleLogout}
          >
            <LogOut size={20} color={isDark ? "#EF4444" : "#DC2626"} />
            <Text
              className={`ml-3 font-semibold ${
                isDark ? "text-red-400" : "text-red-600"
              }`}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeContainer>
  );
}
