import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeaderboard } from '../store/slices/userSlice';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/Alerts';

export const LeaderboardScreen = () => {
  const dispatch = useDispatch();
  const { leaderboard, loading, error, currentPage, totalPages } = useSelector(
    (state) => state.users
  );
  const [currentPageLocal, setCurrentPageLocal] = useState(1);

  useEffect(() => {
    dispatch(fetchLeaderboard({ page: currentPageLocal, limit: 50 }));
  }, [currentPageLocal]);

  if (loading && currentPageLocal === 1) {
    return <LoadingSpinner />;
  }

  const renderLeaderboardItem = ({ item, index }) => (
    <View style={[styles.item, index % 2 === 0 && styles.itemAlt]}>
      <View style={styles.rankBadge}>
        <Text style={styles.rank}>#{index + 1}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.fullName}>{item.fullName}</Text>
      </View>
      <Text style={styles.rating}>{item.rating || 1200}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top rated programmers</Text>
      </View>

      <ErrorAlert message={error} />

      <FlatList
        data={leaderboard}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderLeaderboardItem}
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>No users found</Text>
        }
        contentContainerStyle={styles.listContainer}
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
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  itemAlt: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0891b2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  fullName: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0891b2',
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
