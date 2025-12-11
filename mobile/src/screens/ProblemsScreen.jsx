import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card } from '../components/Button';
import { problemService } from '../services/authAPI';

export function ProblemsScreen({ navigation }) {
  const [problems, setProblems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);

  React.useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const response = await problemService.getAllProblems(page);
      setProblems(response.data.problems);
      setHasMore(response.data.hasMore);
    } catch (error) {
      console.error('Failed to load problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(page + 1);
      loadProblems();
    }
  };

  const renderProblemItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProblemDetail', { slug: item.slug })}
    >
      <Card>
        <Text style={styles.problemTitle}>{item.title}</Text>
        <Text style={styles.problemDesc} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.problemMeta}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
          <Text style={styles.submissionCount}>
            {item.submissionCount || 0} submissions
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#52c41a';
      case 'medium': return '#faad14';
      case 'hard': return '#f5222d';
      default: return '#999';
    }
  };

  if (loading && problems.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={problems}
        renderItem={renderProblemItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator color="#667eea" /> : null}
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
  problemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  problemDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  problemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  submissionCount: {
    fontSize: 12,
    color: '#999',
  },
});
