import React from "react";
import { View, Text, TextInput } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export const Input = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  editable = true,
  className = "",
}) => {
  const { isDark } = useTheme();

  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      numberOfLines={numberOfLines}
      editable={editable}
      placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
      className={`px-4 py-3 rounded-lg border ${
        isDark
          ? "bg-gray-800 border-gray-700 text-white"
          : "bg-white border-gray-300 text-dark"
      } ${className}`}
    />
  );
};

export const FormGroup = ({ label, children, error }) => {
  const { isDark } = useTheme();

  return (
    <View className="mb-4">
      <Text
        className={`text-sm font-semibold mb-2 ${
          isDark ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {label}
      </Text>
      {children}
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
};

export const Select = ({ label, value, onValueChange, options, error }) => {
  const { isDark } = useTheme();

  return (
    <FormGroup label={label} error={error}>
      <View
        className={`px-4 py-3 rounded-lg border ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
        }`}
      >
        {/* Simple text-based select - in real app, use react-native-picker */}
        <Text className={`${isDark ? "text-white" : "text-dark"}`}>
          {value || "Select an option"}
        </Text>
      </View>
    </FormGroup>
  );
};
