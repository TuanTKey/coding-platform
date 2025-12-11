import React from 'react';
import { View, StyleSheet } from 'react-native';

export const Container = ({ children, style, paddingHorizontal = 16, paddingVertical = 16 }) => {
  return (
    <View style={[styles.container, { paddingHorizontal, paddingVertical }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
