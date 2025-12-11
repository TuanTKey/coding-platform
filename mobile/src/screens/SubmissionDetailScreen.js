import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Text, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getSubmissionStatus } from '../store/slices/submissionSlice';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert, SuccessAlert } from '../components/Alerts';
import { TestCaseViewer } from '../components/TestCaseViewer';

const getStatusColor = (status) => {
  switch (status) {
    case 'accepted':
      return '#10b981';
    case 'wrong_answer':
      return '#ef4444';
    case 'pending':
      return '#3b82f6';
    case 'compile_error':
      return '#f97316';
    case 'runtime_error':
      return '#ef4444';
    case 'time_limit':
      return '#f59e0b';
    default:
      return '#6b7280';
  }
};

export const SubmissionDetailScreen = ({ route }) => {
  const { submissionId } = route.params;
  const dispatch = useDispatch();
  const { currentSubmission, loading, error } = useSelector(
    (state) => state.submissions
  );

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(getSubmissionStatus(submissionId));
    }, 2000);

    dispatch(getSubmissionStatus(submissionId));

    return () => clearInterval(interval);
  }, [submissionId]);

  if (loading && !currentSubmission) {
    return <LoadingSpinner />;
  }

  if (!currentSubmission) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorAlert message="Submission not found" />
      </SafeAreaView>
    );
  }

  const submission = currentSubmission;
  const statusColor = getStatusColor(submission.status);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={[styles.statusBar, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.status, { color: statusColor }]}>
            {submission.status.toUpperCase()}
          </Text>
          {submission.testCasesPassed && (
            <Text style={styles.testCaseInfo}>
              {submission.testCasesPassed}/{submission.totalTestCases} tests passed
            </Text>
          )}
        </View>

        <ErrorAlert message={error} />

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Submission Details</Text>

            <View style={styles.detailItem}>
              <Text style={styles.label}>Problem</Text>
              <Text style={styles.value}>
                {submission.problemId?.title || 'Unknown'}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.label}>Language</Text>
              <Text style={styles.value}>{submission.language}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.label}>Submitted</Text>
              <Text style={styles.value}>
                {new Date(submission.createdAt).toLocaleString()}
              </Text>
            </View>

            {submission.executionTime && (
              <View style={styles.detailItem}>
                <Text style={styles.label}>Execution Time</Text>
                <Text style={styles.value}>{submission.executionTime}ms</Text>
              </View>
            )}

            {submission.memory && (
              <View style={styles.detailItem}>
                <Text style={styles.label}>Memory</Text>
                <Text style={styles.value}>{submission.memory}KB</Text>
              </View>
            )}
          </View>

          {submission.code && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Code</Text>
              <View style={styles.codeBlock}>
                <Text style={styles.codeText}>{submission.code}</Text>
              </View>
            </View>
          )}

          {submission.errorMessage && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Error</Text>
              <View style={[styles.errorBlock]}>
                <Text style={styles.errorText}>{submission.errorMessage}</Text>
              </View>
            </View>
          )}

          {submission.testCasesResult && submission.testCasesResult.length > 0 && (
            <TestCaseViewer
              testCases={submission.testCasesResult}
              results={submission.testCasesResult}
            />
          )}

          {submission.aiAnalysis && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI Analysis</Text>
              <View style={styles.aiBox}>
                <Text style={styles.aiText}>{submission.aiAnalysis}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBar: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  status: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  testCaseInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  detailItem: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#1f2937',
  },
  codeBlock: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 12,
    maxHeight: 300,
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'Courier New',
    color: '#d1d5db',
  },
  errorBlock: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Courier New',
    color: '#dc2626',
  },
  aiBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0284c7',
  },
  aiText: {
    fontSize: 13,
    color: '#0c4a6e',
    lineHeight: 18,
  },
});
