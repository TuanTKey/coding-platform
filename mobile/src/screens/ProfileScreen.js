import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, fetchUserStats } from '../store/slices/userSlice';
import { logoutUser } from '../store/slices/authSlice';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/Button';

export const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentUser, userStats, loading } = useSelector((state) => state.users);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchUserProfile(user._id));
      dispatch(fetchUserStats(user._id));
    }
  }, [user]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    // Navigation will be handled by auth state change
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const profile = currentUser || user;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.username?.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.username}>{profile?.username}</Text>
          <Text style={styles.fullName}>{profile?.fullName}</Text>
          {profile?.class && <Text style={styles.class}>Class: {profile.class}</Text>}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{userStats?.solvedProblems || profile?.solvedProblems || 0}</Text>
            <Text style={styles.statLabel}>Problems Solved</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile?.rating || 1200}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{userStats?.submissionCount || profile?.submissionCount || 0}</Text>
            <Text style={styles.statLabel}>Submissions</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile?.email}</Text>
          </View>
          {profile?.studentId && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Student ID</Text>
              <Text style={styles.infoValue}>{profile.studentId}</Text>
            </View>
          )}
          {profile?.bio && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Bio</Text>
              <Text style={styles.infoValue}>{profile.bio}</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Edit Profile"
            variant="secondary"
            onPress={() => navigation.navigate('EditProfile')}
            style={{ marginBottom: 12 }}
          />
          <Button
            title="My Submissions"
            variant="secondary"
            onPress={() => navigation.navigate('MySubmissions')}
            style={{ marginBottom: 12 }}
          />
          <Button
            title="Logout"
            variant="danger"
            onPress={handleLogout}
          />
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
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0891b2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  fullName: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  class: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0891b2',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoItem: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  buttonContainer: {
    padding: 16,
  },
});
