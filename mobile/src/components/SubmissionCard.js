import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const getStatusColor = (status) => {
  switch (status) {
    case 'accepted':
      return { bg: '#d1fae5', text: '#047857' };
    case 'wrong_answer':
      return { bg: '#fee2e2', text: '#dc2626' };
    case 'pending':
      return { bg: '#dbeafe', text: '#0369a1' };
    case 'compile_error':
      return { bg: '#fecaca', text: '#b91c1c' };
    default:
      return { bg: '#f3f4f6', text: '#6b7280' };
  }
};

export const SubmissionCard = ({ submission, onPress }) => {
  const statusColor = getStatusColor(submission.status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.problemTitle} numberOfLines={1}>
            {submission.problemId?.title || 'Unknown Problem'}
          </Text>
          <Text style={styles.language}>{submission.language}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColor.bg },
          ]}
        >
          <Text style={[styles.statusText, { color: statusColor.text }]}>
            {submission.status}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.time}>
          {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
        </Text>
        {submission.testCasesPassed && (
          <Text style={styles.testCases}>
            {submission.testCasesPassed}/{submission.totalTestCases} tests
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  info: {
    flex: 1,
  },
  problemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  language: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
  },
  testCases: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3b82f6',
  },
});
