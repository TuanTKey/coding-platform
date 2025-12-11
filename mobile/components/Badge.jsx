import React from "react";
import { View, Text } from "react-native";
import {
  getDifficultyColor,
  getStatusColor,
  getStatusLabel,
} from "../utils/helpers";
import { useTheme } from "../contexts/ThemeContext";

export const DifficultyBadge = ({ difficulty }) => {
  const { isDark } = useTheme();
  const colors = getDifficultyColor(difficulty);

  return (
    <View
      className={`px-3 py-1 rounded-full ${isDark ? "bg-gray-700" : colors.bg}`}
    >
      <Text
        className={`text-xs font-semibold uppercase ${
          isDark ? "text-gray-300" : colors.text
        }`}
      >
        {difficulty}
      </Text>
    </View>
  );
};

export const StatusBadge = ({ status }) => {
  const { isDark } = useTheme();
  const colors = getStatusColor(status);
  const label = getStatusLabel(status);

  return (
    <View
      className={`px-3 py-1 rounded-full ${isDark ? "bg-gray-700" : colors.bg}`}
    >
      <Text
        className={`text-xs font-semibold ${
          isDark ? "text-gray-300" : colors.text
        }`}
      >
        {label}
      </Text>
    </View>
  );
};
