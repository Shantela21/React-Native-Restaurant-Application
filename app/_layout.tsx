import { Stack } from "expo-router";
import { PaystackProvider } from "react-native-paystack-webview";


const paystackPublicKey = "pk_test_745afea5d10e39659b36a024d451e440b55396c0"; // Replace with your actual Paystack public key
export default function RootLayout() {
  return (
    <PaystackProvider publicKey={paystackPublicKey}>
      <Stack />
    </PaystackProvider>
  );
}
