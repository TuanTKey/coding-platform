import React, { useEffect, useState } from 'react';
import { View, ScrollView, FlatList, StyleSheet, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContestById, fetchContestLeaderboard } from '../store/slices/contestSlice';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/Alerts';
import { Button } from '../components/Button';

export const ContestDetailScreen = ({ route, navigation }) => {
  const { contestId } = route.params;
  const dispatch = useDispatch();
  const { currentContest, leaderboard, loading, error } = useSelector(
    (state) => state.contests
  );
  const [tab, setTab] = useState('details');

  useEffect(() => {
    dispatch(fetchContestById(contestId));
    dispatch(fetchContestLeaderboard({ contestId, page: 1, limit: 20 }));
  }, [contestId]);

  const handleStartContest = () => {
    // Navigate to problems in contest
    navigation.navigate('ContestProblems', { contestId });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentContest) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorAlert message="Contest not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>{currentContest.title}</Text>
          <Text style={styles.description}>{currentContest.description}</Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{currentContest.duration} minutes</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Problems</Text>
            <Text style={styles.infoValue}>{currentContest.problems?.length || 0}</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'details' && styles.activeTab]}
            onPress={() => setTab('details')}
          >
            <Text style={[styles.tabText, tab === 'details' && styles.activeTabText]}>
              Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'leaderboard' && styles.activeTab]}
            onPress={() => setTab('leaderboard')}
          >
            <Text style={[styles.tabText, tab === 'leaderboard' && styles.activeTabText]}>
              Leaderboard
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {tab === 'details' ? (
            <View>
              {currentContest.rules && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Rules</Text>
                  <Text style={styles.sectionText}>{currentContest.rules}</Text>
                </View>
              )}
              <Button
                title="Start Contest"
                onPress={handleStartContest}
                style={styles.button}
              />
            </View>
          ) : (
            <FlatList
              data={leaderboard}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.leaderboardItem}>
                  <Text style={styles.rank}>#{index + 1}</Text>
                  <Text style={styles.username}>{item.username}</Text>
                  <Text style={styles.score}>{item.score || 0} pts</Text>
                </View>
              )}
              scrollEnabled={false}
            />
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  infoItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0891b2',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0891b2',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#0891b2',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  button: {
    marginTop: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  rank: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    width: 40,
  },
  username: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  score: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0891b2',
  },
});
