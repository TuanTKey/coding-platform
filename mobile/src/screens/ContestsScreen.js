import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContests } from '../store/slices/contestSlice';
import { ContestCard } from '../components/ContestCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/Alerts';

export const ContestsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { contests, loading, error } = useSelector((state) => state.contests);

  useEffect(() => {
    dispatch(fetchContests({ page: 1, limit: 20 }));
  }, []);

  const handleContestPress = (contest) => {
    navigation.navigate('ContestDetail', { contestId: contest._id });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contests</Text>
        <Text style={styles.subtitle}>Participate in coding contests</Text>
      </View>

      <ErrorAlert message={error} />

      <FlatList
        data={contests}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ContestCard contest={item} onPress={() => handleContestPress(item)} />
        )}
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>No contests available</Text>
        }
        contentContainerStyle={styles.listContainer}
      />
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
});
