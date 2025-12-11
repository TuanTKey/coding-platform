import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return { bg: '#d1fae5', text: '#047857' };
    case 'medium':
      return { bg: '#fef3c7', text: '#d97706' };
    case 'hard':
      return { bg: '#fee2e2', text: '#dc2626' };
    default:
      return { bg: '#f3f4f6', text: '#6b7280' };
  }
};

export const ProblemCard = ({ problem, onPress }) => {
  const diffColor = getDifficultyColor(problem.difficulty);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {problem.title}
        </Text>
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: diffColor.bg },
          ]}
        >
          <Text style={[styles.difficultyText, { color: diffColor.text }]}>
            {problem.difficulty}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Accepted</Text>
          <Text style={styles.statValue}>{problem.acceptedCount || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Submissions</Text>
          <Text style={styles.statValue}>{problem.submissionCount || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
});
