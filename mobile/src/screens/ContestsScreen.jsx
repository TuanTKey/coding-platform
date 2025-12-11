import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card } from '../components/Button';
import { contestService } from '../services/authAPI';

export function ContestsScreen({ navigation }) {
  const [contests, setContests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadContests();
  }, []);

  const loadContests = async () => {
    try {
      setLoading(true);
      const response = await contestService.getAllContests();
      setContests(response.data.contests);
    } catch (error) {
      console.error('Failed to load contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContestItem = ({ item }) => {
    const startDate = new Date(item.startTime);
    const endDate = new Date(item.endTime);
    const now = new Date();
    const isActive = now >= startDate && now <= endDate;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ContestDetail', { id: item._id })}
      >
        <Card>
          <Text style={styles.contestTitle}>{item.title}</Text>
          <Text style={styles.contestDesc} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.contestMeta}>
            <View style={[styles.statusBadge, { backgroundColor: isActive ? '#52c41a' : '#999' }]}>
              <Text style={styles.statusText}>
                {isActive ? 'Active' : 'Upcoming'}
              </Text>
            </View>
            <Text style={styles.participantCount}>
              {item.participants?.length || 0} joined
            </Text>
          </View>

          <View style={styles.timeInfo}>
            <Text style={styles.timeLabel}>Start: {startDate.toLocaleDateString()}</Text>
            <Text style={styles.timeLabel}>End: {endDate.toLocaleDateString()}</Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
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
      {contests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No contests available</Text>
        </View>
      ) : (
        <FlatList
          data={contests}
          renderItem={renderContestItem}
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
  contestTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  contestDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  contestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
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
  participantCount: {
    fontSize: 12,
    color: '#999',
  },
  timeInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});
