import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AdminDashboard from '../screens/admin/AdminDashboard';

type AdminStackParamList = {
  AdminDashboard: undefined;
};

const AdminStack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminNavigator() {
  return (
    <AdminStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AdminStack.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{ title: 'Admin Dashboard' }}
      />
    </AdminStack.Navigator>
  );
}
