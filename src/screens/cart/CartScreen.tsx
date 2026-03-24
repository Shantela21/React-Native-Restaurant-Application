import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CartItemCard from "../../components/cards/CartItemCard";
import { useCart } from "../../context/CartContext";

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  FoodDetails: { foodId: string };
  Cart: undefined;
  Checkout: undefined;
};

type CartScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Cart"
>;

interface Props {
  navigation: CartScreenNavigationProp;
}

export default function CartScreen({ navigation }: Props) {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCart();

  // ✅ HANDLE CLEAR CART WITH CONFIRMATION + SUCCESS
  const handleClearCart = () => {
    if (items.length === 0) return;

    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove ALL items from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearCart(); // clears everything
            Alert.alert("Success", "Your cart has been cleared 🧹");
          },
        },
      ],
    );
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert(
        "Cart Empty",
        "Please add items to your cart before checkout",
      );
      return;
    }
    navigation.navigate("Checkout");
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <CartItemCard
      item={item}
      onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
      onDecrease={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
      onRemove={() => {
        Alert.alert("Remove Item", `Remove ${item.name} from cart?`, [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => removeItem(item.id),
          },
        ]);
      }}
      onEdit={() => navigation.navigate("FoodDetails", { foodId: item.id })}
    />
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>
        Add some delicious items to get started!
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: "Main" }],
          })
        }
      >
        <Text style={styles.browseButtonText}>Browse Menu</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>

        <TouchableOpacity
          style={[
            styles.clearButton,
            items.length === 0 && styles.clearButtonDisabled,
          ]}
          onPress={handleClearCart}
          disabled={items.length === 0}
        >
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* CART LIST */}
      {items.length > 0 ? (
        <FlatList
          data={items}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.cartList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyCart()
      )}

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items:</Text>
            <Text style={styles.summaryValue}>{getTotalItems()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total:</Text>
            <Text style={styles.summaryValue}>
              R{getTotalPrice().toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            items.length === 0 && styles.checkoutButtonDisabled,
          ]}
          onPress={handleCheckout}
          disabled={items.length === 0}
        >
          <Text style={styles.checkoutButtonText}>
            {items.length === 0 ? "Add Items First" : "Proceed to Checkout"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  clearButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearButtonDisabled: {
    backgroundColor: "#ccc",
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cartList: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 20,
    backgroundColor: "#fff",
  },
  summaryContainer: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  checkoutButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutButtonDisabled: {
    backgroundColor: "#ccc",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
