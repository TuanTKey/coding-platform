import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ProblemsScreen } from '../screens/ProblemsScreen';
import { ProblemDetailScreen } from '../screens/ProblemDetailScreen';
import { ContestsScreen } from '../screens/ContestsScreen';
import { ContestDetailScreen } from '../screens/ContestDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MySubmissionsScreen } from '../screens/MySubmissionsScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export function RootNavigator() {
  const { user, token, restoreToken } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      await restoreToken();
    } catch (error) {
      console.error('Failed to restore token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token && user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function ProblemsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#667eea' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="ProblemsList" component={ProblemsScreen} options={{ title: 'Problems' }} />
      <Stack.Screen name="ProblemDetail" component={ProblemDetailScreen} options={{ title: 'Problem Details' }} />
    </Stack.Navigator>
  );
}

function ContestsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#667eea' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="ContestsList" component={ContestsScreen} options={{ title: 'Contests' }} />
      <Stack.Screen name="ContestDetail" component={ContestDetailScreen} options={{ title: 'Contest Details' }} />
    </Stack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#667eea' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="MySubmissions" component={MySubmissionsScreen} options={{ title: 'My Submissions' }} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: 'Leaderboard' }} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          borderTopColor: '#eee',
          borderTopWidth: 1,
          paddingBottom: 4,
        },
      }}
    >
      <Tab.Screen
        name="ProblemsStack"
        component={ProblemsStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: 'Problems',
        }}
      />
      <Tab.Screen
        name="ContestsStack"
        component={ContestsStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: 'Contests',
        }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}
