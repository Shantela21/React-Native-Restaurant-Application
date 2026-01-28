import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from './src/constants';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';
import { PaystackProvider } from "react-native-paystack-webview";

const paystackPublicKey = "pk_test_745afea5d10e39659b36a024d451e440b55396c0";
export default function App() {
  return (
    <NavigationContainer>
      <PaystackProvider publicKey={paystackPublicKey}>
        <AuthProvider>
          <CartProvider>
          <View style={styles.container}>
            <AppNavigator />
            <StatusBar style="light" backgroundColor={Colors.primary} />
            <Toast />
          </View>
        </CartProvider>
      </AuthProvider>
      </PaystackProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
