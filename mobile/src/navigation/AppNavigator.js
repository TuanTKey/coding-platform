import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ProblemsScreen } from '../screens/ProblemsScreen';
import { ProblemDetailScreen } from '../screens/ProblemDetailScreen';
import { ContestsScreen } from '../screens/ContestsScreen';
import { ContestDetailScreen } from '../screens/ContestDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MySubmissionsScreen } from '../screens/MySubmissionsScreen';
import { SubmissionDetailScreen } from '../screens/SubmissionDetailScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';

const ProblemsStack = createNativeStackNavigator();
const ContestsStack = createNativeStackNavigator();
const LeaderboardStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ProblemsStackScreen = () => (
  <ProblemsStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <ProblemsStack.Screen name="ProblemsList" component={ProblemsScreen} />
    <ProblemsStack.Screen name="ProblemDetail" component={ProblemDetailScreen} />
    <ProblemsStack.Screen name="SubmissionDetail" component={SubmissionDetailScreen} />
  </ProblemsStack.Navigator>
);

const ContestsStackScreen = () => (
  <ContestsStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <ContestsStack.Screen name="ContestsList" component={ContestsScreen} />
    <ContestsStack.Screen name="ContestDetail" component={ContestDetailScreen} />
  </ContestsStack.Navigator>
);

const LeaderboardStackScreen = () => (
  <LeaderboardStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <LeaderboardStack.Screen name="LeaderboardList" component={LeaderboardScreen} />
  </LeaderboardStack.Navigator>
);

const ProfileStackScreen = () => (
  <ProfileStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <ProfileStack.Screen name="ProfileView" component={ProfileScreen} />
    <ProfileStack.Screen name="MySubmissions" component={MySubmissionsScreen} />
    <ProfileStack.Screen name="SubmissionDetail" component={SubmissionDetailScreen} />
  </ProfileStack.Navigator>
);

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0891b2',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 4,
        },
      }}
    >
      <Tab.Screen
        name="Problems"
        component={ProblemsStackScreen}
        options={{
          tabBarLabel: 'Problems',
          tabBarIcon: ({ color }) => <TabBarIcon name="📚" color={color} />,
        }}
      />
      <Tab.Screen
        name="Contests"
        component={ContestsStackScreen}
        options={{
          tabBarLabel: 'Contests',
          tabBarIcon: ({ color }) => <TabBarIcon name="🏆" color={color} />,
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardStackScreen}
        options={{
          tabBarLabel: 'Leaderboard',
          tabBarIcon: ({ color }) => <TabBarIcon name="📈" color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="👤" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const TabBarIcon = ({ name, color }) => (
  <Text style={{ fontSize: 18 }}>{name}</Text>
);

import { Text } from 'react-native';
