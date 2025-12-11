import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, Text, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProblems } from '../store/slices/problemSlice';
import { ProblemCard } from '../components/ProblemCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/Alerts';
import { Container } from '../components/Container';

export const ProblemsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { problems, loading, error, currentPage, totalPages } = useSelector(
    (state) => state.problems
  );
  const [filters, setFilters] = useState({ difficulty: '', search: '' });
  const [currentPageLocal, setCurrentPageLocal] = useState(1);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = () => {
    dispatch(
      fetchProblems({
        page: currentPageLocal,
        limit: 20,
        filters,
      })
    );
  };

  useEffect(() => {
    fetchProblems();
  }, [filters, currentPageLocal]);

  const handleProblemPress = (problem) => {
    navigation.navigate('ProblemDetail', { problemId: problem._id, slug: problem.slug });
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setCurrentPageLocal(1);
  };

  if (loading && currentPageLocal === 1) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Problems</Text>
        <Text style={styles.subtitle}>Practice coding problems</Text>
      </View>

      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search problems..."
          value={filters.search}
          onChangeText={(value) => handleFilterChange('search', value)}
        />
      </View>

      <ErrorAlert message={error} />

      <FlatList
        data={problems}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ProblemCard problem={item} onPress={() => handleProblemPress(item)} />
        )}
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>No problems found</Text>
        }
        contentContainerStyle={styles.listContainer}
        scrollEnabled={true}
      />

      {currentPage < totalPages && (
        <View style={styles.pagination}>
          <Text
            onPress={() => setCurrentPageLocal(currentPageLocal + 1)}
            style={styles.loadMoreButton}
          >
            Load More
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
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f9fafb',
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
