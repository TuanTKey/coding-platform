import React from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native';
import { submissionService } from '../services/authAPI';
import { Card } from '../components/Button';
import dayjs from 'dayjs';

export function MySubmissionsScreen() {
  const [submissions, setSubmissions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await submissionService.getUserSubmissions();
      setSubmissions(response.data.submissions);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSubmissionItem = ({ item }) => (
    <Card>
      <View style={styles.submissionHeader}>
        <Text style={styles.problemTitle}>{item.problemId?.title || 'Problem'}</Text>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.submissionDetails}>
        <Text style={styles.detail}>Language: {item.language}</Text>
        <Text style={styles.detail}>
          Score: {item.score || 0}/{item.totalScore || 100}
        </Text>
        <Text style={styles.detail}>
          Submitted: {dayjs(item.createdAt).format('MMM D, HH:mm')}
        </Text>
      </View>
    </Card>
  );

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return { backgroundColor: '#52c41a' };
      case 'wrong_answer': return { backgroundColor: '#f5222d' };
      case 'runtime_error': return { backgroundColor: '#faad14' };
      default: return { backgroundColor: '#999' };
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {submissions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No submissions yet</Text>
        </View>
      ) : (
        <FlatList
          data={submissions}
          renderItem={renderSubmissionItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  problemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  submissionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  detail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});
