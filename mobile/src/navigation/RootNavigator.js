import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from '../store/slices/authSlice';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';

export const RootNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token, loading } = useSelector((state) => state.auth);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const bootstrap = async () => {
      try {
        await dispatch(getCurrentUser()).catch((e) => {
          console.warn('Failed to get current user:', e);
          // Continue anyway - user will see login screen
        });
      } catch (e) {
        console.error('Failed to restore token', e);
      } finally {
        setIsReady(true);
      }
    };

    bootstrap();
  }, [dispatch]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated && token ? <AppNavigator /> : <AuthNavigator isLoading={loading} />}
    </NavigationContainer>
  );
};
