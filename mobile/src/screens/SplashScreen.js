import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from '../store/slices/authSlice';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const SplashScreen = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if user is already logged in
    dispatch(getCurrentUser());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>CodeJudge</Text>
        <Text style={styles.tagline}>Online Programming Judge</Text>
      </View>
      <LoadingSpinner color="#0891b2" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0891b2',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#6b7280',
  },
});
