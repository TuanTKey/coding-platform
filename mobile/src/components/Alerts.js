import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ErrorAlert = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Error</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

export const SuccessAlert = ({ message }) => {
  if (!message) return null;

  return (
    <View style={styles.successContainer}>
      <Text style={styles.successTitle}>Success!</Text>
      <Text style={styles.successMessage}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#991b1b',
  },
  successContainer: {
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 4,
  },
  successMessage: {
    fontSize: 13,
    color: '#065f46',
  },
});
