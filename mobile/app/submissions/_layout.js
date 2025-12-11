import React from "react";
import { Stack } from "expo-router";

export default function SubmissionDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
