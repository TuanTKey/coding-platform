import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminUsers from '../components/admin/AdminUsers';
import AdminProblems from '../components/admin/AdminProblems';
import AdminContests from '../components/admin/AdminContests';
import AdminSubmissions from '../components/admin/AdminSubmissions';
import AdminClasses from '../components/admin/AdminClasses';

const Tab = createBottomTabNavigator();

export default function AdminTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="Users" component={AdminUsers} />
      <Tab.Screen name="Problems" component={AdminProblems} />
      <Tab.Screen name="Contests" component={AdminContests} />
      <Tab.Screen name="Submissions" component={AdminSubmissions} />
      <Tab.Screen name="Classes" component={AdminClasses} />
    </Tab.Navigator>
  );
}

