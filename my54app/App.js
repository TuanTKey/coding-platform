import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AdminTabNavigator from './app/admin-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  return (
    <NavigationContainer>
      <AdminTabNavigator />
    </NavigationContainer>
  );
}
