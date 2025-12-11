import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserSubmissions } from '../store/slices/submissionSlice';
import { SubmissionCard } from '../components/SubmissionCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/Alerts';

export const MySubmissionsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { submissions, loading, error, currentPage, totalPages } = useSelector(
    (state) => state.submissions
  );
  const [currentPageLocal, setCurrentPageLocal] = useState(1);

  useEffect(() => {
    dispatch(fetchUserSubmissions({ page: currentPageLocal, limit: 20 }));
  }, [currentPageLocal]);

  const handleSubmissionPress = (submission) => {
    navigation.navigate('SubmissionDetail', { submissionId: submission._id });
  };

  if (loading && currentPageLocal === 1) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Submissions</Text>
        <Text style={styles.subtitle}>View your submission history</Text>
      </View>

      <ErrorAlert message={error} />

      <FlatList
        data={submissions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <SubmissionCard
            submission={item}
            onPress={() => handleSubmissionPress(item)}
          />
        )}
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>No submissions yet</Text>
        }
        contentContainerStyle={styles.listContainer}
      />

      {currentPage < totalPages && (
        <View style={styles.pagination}>
          <Text
            onPress={() => setCurrentPageLocal(currentPageLocal + 1)}
            style={styles.loadMoreButton}
          >
            Load More Submissions
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    marginTop: 20,
  },
  pagination: {
    padding: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    color: '#0891b2',
    fontWeight: '600',
    fontSize: 14,
    paddingVertical: 12,
  },
});
