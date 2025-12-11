import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuthStore } from "../../stores/authStore";
import { SafeContainer } from "../../components/Layout";
import { Button } from "../../components/Common";
import { Input, FormGroup } from "../../components/Form";
import { ArrowLeft } from "lucide-react";
import { userService } from "../../services/user";

export default function EditProfileScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      await userService.updateProfile(formData);
      updateUser(formData);
      router.back();
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

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
          className={`text-xl font-bold ml-3 ${
            isDark ? "text-white" : "text-dark"
          }`}
        >
          Edit Profile
        </Text>
      </View>

      {/* Form */}
      <View className="px-4 py-6">
        {error && (
          <View className="mb-4 p-3 bg-red-100 rounded-lg">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}

        <FormGroup label="Full Name">
          <Input
            placeholder="Enter your full name"
            value={formData.fullName}
            onChangeText={(text) =>
              setFormData({ ...formData, fullName: text })
            }
            editable={!loading}
          />
        </FormGroup>

        <FormGroup label="Bio">
          <TextInput
            multiline
            numberOfLines={4}
            placeholder="Tell us about yourself"
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
            placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
            className={`px-4 py-3 rounded-lg border ${
              isDark
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-300 text-dark"
            }`}
            editable={!loading}
          />
        </FormGroup>

        <FormGroup label="Avatar URL">
          <Input
            placeholder="Enter avatar image URL"
            value={formData.avatar}
            onChangeText={(text) => setFormData({ ...formData, avatar: text })}
            editable={!loading}
          />
        </FormGroup>

        <Button
          text={loading ? "Saving..." : "Save Changes"}
          onPress={handleSave}
          disabled={loading}
        />
      </View>
    </SafeContainer>
  );
}
