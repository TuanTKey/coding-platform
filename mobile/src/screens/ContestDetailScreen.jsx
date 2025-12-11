import React from 'react';
import { StyleSheet, View, Text, ScrollView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { contestService } from '../services/authAPI';
import { Card, GradientButton } from '../components/Button';
import dayjs from 'dayjs';

export function ContestDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [contest, setContest] = React.useState(null);
  const [leaderboard, setLeaderboard] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [joined, setJoined] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    loadContest();
  }, []);

  const loadContest = async () => {
    try {
      setLoading(true);
      const response = await contestService.getContestById(id);
      setContest(response.data);
      
      // Load leaderboard
      const leaderboardResponse = await contestService.getContestLeaderboard(id);
      setLeaderboard(leaderboardResponse.data);
    } catch (error) {
      console.error('Failed to load contest:', error);
      alert('Failed to load contest');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinContest = async () => {
    try {
      setSubmitting(true);
      await contestService.joinContest(id);
      setJoined(true);
      alert('Successfully joined contest!');
    } catch (error) {
      alert('Failed to join: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!contest) {
    return (
      <View style={styles.centerContainer}>
        <Text>Contest not found</Text>
      </View>
    );
  }

  const startDate = new Date(contest.startTime);
  const endDate = new Date(contest.endTime);
  const now = new Date();
  const isActive = now >= startDate && now <= endDate;

  const renderLeaderboardItem = ({ item, index }) => (
    <View style={styles.leaderboardItem}>
      <Text style={styles.leaderboardRank}>#{index + 1}</Text>
      <View style={styles.leaderboardInfo}>
        <Text style={styles.leaderboardName}>{item.userId?.name}</Text>
        <Text style={styles.leaderboardScore}>{item.score || 0} points</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Contest Header */}
        <Card>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{contest.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: isActive ? '#52c41a' : '#999' }]}>
                <Text style={styles.statusText}>{isActive ? 'Active' : 'Upcoming'}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Contest Info */}
        <Card>
          <Text style={styles.sectionTitle}>Contest Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Start:</Text>
            <Text style={styles.infoValue}>{dayjs(startDate).format('MMM D, HH:mm')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>End:</Text>
            <Text style={styles.infoValue}>{dayjs(endDate).format('MMM D, HH:mm')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Participants:</Text>
            <Text style={styles.infoValue}>{contest.participants?.length || 0}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Problems:</Text>
            <Text style={styles.infoValue}>{contest.problems?.length || 0}</Text>
          </View>
        </Card>

        {/* Description */}
        {contest.description && (
          <Card>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{contest.description}</Text>
          </Card>
        )}

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>Leaderboard</Text>
            {leaderboard.slice(0, 5).map((item, index) => (
              <View key={item._id} style={styles.leaderboardItem}>
                <Text style={styles.leaderboardRank}>#{index + 1}</Text>
                <View style={styles.leaderboardInfo}>
                  <Text style={styles.leaderboardName}>{item.userId?.name}</Text>
                  <Text style={styles.leaderboardScore}>{item.score || 0} points</Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Action Button */}
        {isActive && !joined && (
          <GradientButton
            onPress={handleJoinContest}
            title={submitting ? 'Joining...' : 'Join Contest'}
            style={styles.actionButton}
          />
        )}

        {joined && (
          <Card style={styles.joinedMessage}>
            <Text style={styles.joinedText}>✓ You have joined this contest</Text>
          </Card>
        )}
      </View>
    </ScrollView>
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
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  leaderboardRank: {
    fontSize: 13,
    fontWeight: '700',
    color: '#667eea',
    width: 40,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  leaderboardScore: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  actionButton: {
    marginVertical: 16,
  },
  joinedMessage: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#f0f9ff',
  },
  joinedText: {
    fontSize: 14,
    color: '#52c41a',
    fontWeight: '600',
  },
});
