import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDistanceToNow } from 'date-fns';

const getContestStatus = (contest) => {
  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);

  if (now < start) return { label: 'Upcoming', color: '#0891b2' };
  if (now > end) return { label: 'Finished', color: '#6b7280' };
  return { label: 'Running', color: '#059669' };
};

export const ContestCard = ({ contest, onPress }) => {
  const status = getContestStatus(contest);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {contest.title}
          </Text>
          <Text style={styles.problemCount}>
            {contest.problems?.length || 0} problems
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: status.color + '20' },
          ]}
        >
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.time}>
          Starts {formatDistanceToNow(new Date(contest.startTime), { addSuffix: true })}
        </Text>
        <Text style={styles.duration}>{contest.duration} minutes</Text>
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
  info: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  problemCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    color: '#6b7280',
  },
  duration: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3b82f6',
  },
});
