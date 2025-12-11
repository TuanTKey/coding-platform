import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { userService } from '../services/authAPI';
import { Card } from '../components/Button';

export function LeaderboardScreen() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await userService.getLeaderboard(page);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderUserItem = ({ item, index }) => (
    <Card>
      <View style={styles.userRow}>
        <View style={[styles.rankBadge, { backgroundColor: getRankColor(index) }]}>
          <Text style={styles.rankText}>#{index + 1}</Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userRole}>{item.role?.toUpperCase()}</Text>
        </View>

        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.statistics?.solvedProblems || 0}</Text>
            <Text style={styles.statLabel}>Solved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.rating || 0}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const getRankColor = (index) => {
    if (index === 0) return '#ffd700'; // Gold
    if (index === 1) return '#c0c0c0'; // Silver
    if (index === 2) return '#cd7f32'; // Bronze
    return '#667eea';
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
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
      />
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
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  userRole: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  userStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
});
