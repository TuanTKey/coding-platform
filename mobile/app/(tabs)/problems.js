import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { useProblemStore } from "../../stores/problemStore";
import { SafeContainer, Header } from "../../components/Layout";
import { DifficultyBadge } from "../../components/Badge";
import { problemService } from "../../services/problem";
import { Search } from "lucide-react";

export default function ProblemsScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");

  useEffect(() => {
    loadProblems();
  }, [search, difficulty]);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const data = await problemService.getAllProblems({
        search: search || undefined,
        difficulty: difficulty || undefined,
      });
      setProblems(data.problems || []);
    } catch (error) {
      console.error("Error loading problems:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderProblemItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/problems/${item._id}`)}
      className={`mx-4 mb-4 p-4 rounded-lg border ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <View className="flex-row justify-between items-start mb-2">
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
            {item.submissionCount || 0} submissions
          </Text>
        </View>
        <DifficultyBadge difficulty={item.difficulty} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeContainer className={isDark ? "bg-dark" : "bg-light"}>
      <Header title="Problems" subtitle="Solve coding challenges" />

      {/* Search and Filter */}
      <View className="px-4 mb-6">
        <View
          className={`flex-row items-center rounded-lg border px-4 ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <Search size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
          <TextInput
            placeholder="Search problems..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
            className={`flex-1 py-3 ml-3 ${
              isDark ? "text-white" : "text-dark"
            }`}
          />
        </View>

        {/* Difficulty Filter */}
        <View className="flex-row gap-2 mt-4">
          {["easy", "medium", "hard"].map((level) => (
            <TouchableOpacity
              key={level}
              onPress={() => setDifficulty(difficulty === level ? "" : level)}
              className={`px-4 py-2 rounded-lg ${
                difficulty === level
                  ? "bg-primary"
                  : isDark
                  ? "bg-gray-800"
                  : "bg-gray-200"
              }`}
            >
              <Text
                className={`capitalize font-semibold ${
                  difficulty === level
                    ? "text-white"
                    : isDark
                    ? "text-gray-300"
                    : "text-gray-700"
                }`}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Problems List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#06B6D4" />
        </View>
      ) : problems.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text
            className={`text-lg font-semibold ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No problems found
          </Text>
        </View>
      ) : (
        <FlatList
          data={problems}
          renderItem={renderProblemItem}
          keyExtractor={(item) => item._id}
          onEndReachedThreshold={0.5}
          scrollEnabled={false}
        />
      )}
    </SafeContainer>
  );
}
