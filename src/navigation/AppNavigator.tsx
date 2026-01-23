import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { useAuth } from "../context/AuthContext";

import LandingScreen from "../screens/landing/LandingScreen";
import AdminNavigator from "./AdminNavigator";
import AuthNavigator from "./AuthNavigator";
import MainTabNavigator from "./MainTabNavigator";

import CartScreen from "../screens/cart/CartScreen";
import CheckoutScreen from "../screens/checkout/CheckoutScreen";
import FoodDetailsScreen from "../screens/food/FoodDetailsScreen";

export type RootStackParamList = {
  Landing: undefined;
  Auth: undefined;
  Main: undefined;
  Admin: undefined;
  FoodDetails: { foodId: string };
  Cart: undefined;
  Checkout: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // replace with Loader later
  }

  const isAdmin = user?.email === "admin@foodie.com";

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </>
      ) : (
        <>
          {isAdmin && <Stack.Screen name="Admin" component={AdminNavigator} />}

          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="FoodDetails" component={FoodDetailsScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
