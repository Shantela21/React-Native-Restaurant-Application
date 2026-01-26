import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CardDetailsInput from "../../components/inputs/CardDetailsInput";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { orderService } from "../../services/orderService";

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  FoodDetails: { foodId: string };
  Cart: undefined;
  Checkout: undefined;
};

type CheckoutScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Checkout"
>;

interface Props {
  navigation: CheckoutScreenNavigationProp;
}

export default function CheckoutScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { items, clearCart, getTotalPrice, getTotalItems } = useCart();

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [selectedCard, setSelectedCard] = useState<any>(
    user?.cardDetails || null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.address) {
      setDeliveryAddress(user.address);
    }
  }, [user]);

  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to place an order");
      navigation.navigate("Auth");
      return;
    }

    if (items.length === 0) {
      Alert.alert(
        "Cart Empty",
        "Please add items to your cart before placing an order"
      );
      return;
    }

    if (!deliveryAddress.trim()) {
      Alert.alert("Address Required", "Please enter a delivery address");
      return;
    }

    if (!selectedCard) {
      Alert.alert("Payment Required", "Please select a payment method");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        userId: user.id,
        items,
        totalAmount: getTotalPrice(),
        deliveryAddress,
        paymentMethod: "card" as const,
        status: "pending" as const,
      };

      const result = await orderService.placeOrder(orderData);

      if (result.success) {
        Alert.alert(
          "Order Placed!",
          "Your order has been placed successfully.",
          [
            {
              text: "OK",
              onPress: () => {
                clearCart();
                navigation.navigate("Main");
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", result.message || "Failed to place order");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderOrderSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Summary</Text>
      {items.map((item, index) => (
        <View key={item.id} style={styles.orderItem}>
          <Text style={styles.itemName}>
            {item.quantity}x {item.name}
          </Text>
          <Text style={styles.itemPrice}>R{item.totalPrice.toFixed(2)}</Text>
        </View>
      ))}
    </View>
  );

  const renderTotals = () => (
    <View style={styles.section}>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Items ({getTotalItems()}):</Text>
        <Text style={styles.totalValue}>R{getTotalPrice().toFixed(2)}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Delivery Fee:</Text>
        <Text style={styles.totalValue}>R9.99</Text>
      </View>
      <View style={[styles.totalRow, styles.grandTotal]}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalValue}>
          R{(getTotalPrice() + 9.99).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.loginPrompt}>
          <Text style={styles.loginPromptTitle}>Login Required</Text>
          <Text style={styles.loginPromptText}>
            Please login to place an order
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Auth")}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      {renderOrderSummary()}
      {renderTotals()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <TextInput
          style={styles.addressInput}
          placeholder="Enter your delivery address"
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <CardDetailsInput value={selectedCard} onChange={setSelectedCard} />
      </View>

      <TouchableOpacity
        style={[
          styles.placeOrderButton,
          loading && styles.placeOrderButtonDisabled,
        ]}
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.placeOrderButtonText}>Place Order</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginVertical: 20,
  },
  section: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemName: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  grandTotal: {
    borderTopWidth: 2,
    borderTopColor: "#007AFF",
    paddingTop: 8,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    minHeight: 80,
    textAlignVertical: "top",
  },
  placeOrderButton: {
    backgroundColor: "#007AFF",
    margin: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  placeOrderButtonDisabled: {
    backgroundColor: "#ccc",
  },
  placeOrderButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginPrompt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loginPromptTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  loginPromptText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
