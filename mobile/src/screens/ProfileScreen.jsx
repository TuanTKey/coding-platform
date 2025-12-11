import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { userService } from '../services/authAPI';
import { Card, GradientButton } from '../components/Button';

export function ProfileScreen({ navigation }) {
  const { user, logout } = useAuthStore();
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserStats(user._id);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('AuthStack');
  };

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text>User not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* User Info */}
        <Card>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user.role?.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Stats */}
        {loading ? (
          <ActivityIndicator size="large" color="#667eea" />
        ) : stats ? (
          <>
            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{stats.totalSubmissions || 0}</Text>
                <Text style={styles.statLabel}>Submissions</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{stats.solvedProblems || 0}</Text>
                <Text style={styles.statLabel}>Solved</Text>
              </Card>
            </View>

            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{stats.rating || 0}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{stats.rank || 'N/A'}</Text>
                <Text style={styles.statLabel}>Rank</Text>
              </Card>
            </View>
          </>
        ) : null}

        {/* Actions */}
        <Card>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('MySubmissions')}
          >
            <Text style={styles.menuItemText}>My Submissions</Text>
          </TouchableOpacity>
        </Card>

        <Card>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Text style={styles.menuItemText}>Leaderboard</Text>
          </TouchableOpacity>
        </Card>

        <GradientButton
          onPress={handleLogout}
          title="Logout"
          variant="danger"
          style={styles.logoutButton}
        />
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
    paddingVertical: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  menuItem: {
    paddingVertical: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 20,
    marginBottom: 20,
  },
});
