import { Ionicons } from "@expo/vector-icons";
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
import { usePaystack } from "react-native-paystack-webview";
import CardDetailsInput from "../../components/inputs/CardDetailsInput";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { orderService } from "../../services/orderService";

type PaymentMethod = 'existing_card' | 'new_card' | 'cash_on_delivery' | 'paystack';

interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
}

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
  const { popup } = usePaystack();

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('paystack');
  const [selectedCard, setSelectedCard] = useState<any>(
    user?.cardDetails || null
  );
  const [loading, setLoading] = useState(false);

  // Mock saved cards for demonstration
  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    {
      id: '1',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: '12',
      expiryYear: '25'
    },
    {
      id: '2', 
      last4: '5555',
      brand: 'Mastercard',
      expiryMonth: '09',
      expiryYear: '24'
    }
  ]);

  const handleRemoveCard = (cardId: string) => {
    Alert.alert(
      "Remove Card",
      "Are you sure you want to remove this saved card?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            const updatedCards = savedCards.filter(card => card.id !== cardId);
            setSavedCards(updatedCards);
            
            // If the removed card was selected, clear the selection
            if (selectedCard?.id === cardId) {
              setSelectedCard(null);
            }
            
            // Show success alert
            Alert.alert("Success", "Card removed successfully");
          }
        }
      ]
    );
  };

  // Paystack Payment Integration
  const processPaystackPayment = async () => {
    if (!user) {
      Alert.alert("Error", "Please login to place an order");
      return;
    }

    if (items.length === 0) {
      Alert.alert("Error", "Your cart is empty");
      return;
    }

    try {
      // Paystack for South Africa uses Rands directly (no conversion needed)
      const amount = getTotalPrice() + 9.99; // Include delivery fee

      await popup.checkout({
        email: user.email || "customer@example.com",
        amount: Math.round(amount * 100), // Paystack expects amount in kobo/cents
        onSuccess: async (res) => {
          console.log("Payment successful:", res);
          
          try {
            // Create order in Firestore after successful payment
            const orderData = {
              userId: user.uid,
              items,
              totalAmount: getTotalPrice(),
              deliveryAddress,
              paymentMethod: 'card' as const,
              status: "pending" as const,
            };

            const orderResult = await orderService.placeOrder(orderData);
            
            if (orderResult.success) {
              console.log('Paystack order placed successfully, clearing cart...');
              // Clear cart immediately after successful order placement
              clearCart();
              
              Alert.alert(
                "Payment Successful", 
                `Your order #${orderResult.order?.id?.slice(-8) || 'Unknown'} has been placed successfully!`,
                [
                  {
                    text: "View Orders",
                    onPress: () => {
                      navigation.navigate("Main");
                    }
                  },
                  {
                    text: "Continue Shopping",
                    onPress: () => {
                      navigation.navigate("Main");
                    }
                  }
                ]
              );
            } else {
              Alert.alert(
                "Payment Successful", 
                "Payment was successful but there was an issue creating your order. Please contact support.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      clearCart();
                      navigation.navigate("Main");
                    }
                  }
                ]
              );
            }
          } catch (orderError: any) {
            console.error("Error creating order:", orderError);
            Alert.alert(
              "Payment Successful", 
              "Payment was successful but there was an issue creating your order. Please contact support.",
              [
                {
                  text: "OK",
                  onPress: () => {
                    clearCart();
                    navigation.navigate("Main");
                  }
                }
              ]
            );
          }
        },
        onCancel: () => {
          console.log("User cancelled payment");
          Alert.alert("Payment Cancelled", "You cancelled the payment process.");
        },
        onError: (error) => {
          console.error("Payment error:", error);
          Alert.alert("Payment Error", "An error occurred during payment. Please try again.");
        },
      });
    } catch (error: any) {
      console.error("Payment initialization error:", error);
      Alert.alert("Error", "Failed to initialize payment. Please try again.");
    }
  };

  // Payment Gateway Integration
  const processPayment = async (paymentDetails: any) => {
    setLoading(true);
    try {
      // Simulate payment gateway API call
      const paymentResponse = await simulatePaymentGateway(paymentDetails);
      
      if (paymentResponse.success) {
        return { success: true, transactionId: paymentResponse.transactionId };
      } else {
        return { success: false, error: paymentResponse.error };
      }
    } catch (error) {
      return { success: false, error: 'Payment processing failed' };
    } finally {
      setLoading(false);
    }
  };

  // Mock Payment Gateway Function
  const simulatePaymentGateway = async (paymentDetails: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock payment processing logic
    const { cardNumber, expiryMonth, expiryYear, cvv, cardHolderName, amount } = paymentDetails;
    
    // Basic validation with specific error messages
    if (!cardNumber) {
      return { success: false, error: 'Card number is required' };
    }
    
    if (!cardHolderName || cardHolderName.trim() === '') {
      return { success: false, error: 'Cardholder name is required' };
    }
    
    if (!expiryMonth) {
      return { success: false, error: 'Expiry month is required' };
    }
    
    if (!expiryYear) {
      return { success: false, error: 'Expiry year is required' };
    }
    
    if (!cvv) {
      return { success: false, error: 'CVV is required' };
    }
    
    if (!amount) {
      return { success: false, error: 'Amount is required' };
    }
    
    // Mock card validation (simplified)
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      return { success: false, error: 'Invalid card number' };
    }
    
    // Mock successful payment (90% success rate for demo)
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      return {
        success: true,
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: amount,
        currency: 'ZAR',
        status: 'completed'
      };
    } else {
      return { success: false, error: 'Payment declined by bank' };
    }
  };

  useEffect(() => {
    if (user?.address) {
      setDeliveryAddress(user.address);
    }
  }, [user]);

  const handlePlaceOrder = async () => {
    console.log('=== PLACE ORDER CLICKED ===');
    
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

    if (selectedPaymentMethod === 'existing_card' && !selectedCard) {
      Alert.alert("Payment Required", "Please select a saved card");
      return;
    }

    if (selectedPaymentMethod === 'new_card' && (!selectedCard || !selectedCard.cardNumber)) {
      Alert.alert("Payment Required", "Please enter card details");
      return;
    }

    console.log('All validations passed, showing payment confirmation...');
    // Show payment confirmation dialog
    showPaymentConfirmation();
  };

  const showPaymentConfirmation = () => {
    console.log('=== SHOWING PAYMENT CONFIRMATION ===');
    const totalAmount = getTotalPrice() + 9.99;
    const paymentMethodText = selectedPaymentMethod === 'cash_on_delivery' 
      ? 'Cash on Delivery' 
      : selectedPaymentMethod === 'paystack'
      ? 'Paystack (Credit/Debit Card)'
      : selectedPaymentMethod === 'existing_card'
      ? `Card ending in ${selectedCard?.last4}`
      : 'New Card';

    console.log('Payment confirmation details:', {
      totalAmount,
      paymentMethodText,
      items: getTotalItems(),
      address: deliveryAddress
    });

    Alert.alert(
      "Proceed with Payment?",
      `Order Summary:\n\n` +
      `📦 Items: ${getTotalItems()}\n` +
      `💰 Total: R${totalAmount.toFixed(2)}\n` +
      `🏠 Delivery: ${deliveryAddress}\n` +
      `💳 Payment: ${paymentMethodText}\n\n` +
      `Do you want to proceed with payment?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Proceed with Payment",
          onPress: () => {
            console.log('User confirmed payment, processing...');
            processOrderPayment();
          }
        }
      ]
    );
  };

  const processOrderPayment = async () => {
    // Process payment based on selected method
    if (selectedPaymentMethod === 'paystack') {
      await processPaystackPayment();
      return;
    }

    // Process payment if card payment is selected
    if (selectedPaymentMethod !== 'cash_on_delivery') {
      let paymentDetails;
      
      if (selectedPaymentMethod === 'existing_card') {
        // For saved cards, we'd typically have a tokenized version
        paymentDetails = {
          cardId: selectedCard.id,
          last4: selectedCard.last4,
          amount: getTotalPrice() + 9.99,
          currency: 'ZAR'
        };
      } else {
        // For new cards, use the entered details
        paymentDetails = {
          cardNumber: selectedCard.cardNumber,
          expiryMonth: selectedCard.expiryDate?.split('/')[0],
          expiryYear: selectedCard.expiryDate?.split('/')[1],
          cvv: selectedCard.cvv,
          cardHolderName: selectedCard.cardHolderName,
          amount: getTotalPrice() + 9.99,
          currency: 'ZAR'
        };
      }

      const paymentResult = await processPayment(paymentDetails);
      
      if (!paymentResult.success) {
        Alert.alert("Payment Failed", paymentResult.error || "Payment processing failed");
        return;
      }

      // Payment successful, proceed with order
      Alert.alert(
        "Payment Successful!",
        `Transaction ID: ${paymentResult.transactionId}`,
        [
          {
            text: "Continue",
            onPress: async () => {
              await finalizeOrder('card', paymentResult.transactionId);
            }
          }
        ]
      );
    } else {
      // Cash on delivery - proceed directly
      await finalizeOrder('cash');
    }
  };

  const finalizeOrder = async (paymentMethod: 'cash' | 'card', transactionId?: string) => {
    setLoading(true);
    try {
      const paymentMethodType: 'cash' | 'card' = paymentMethod;
      
      const orderData = {
        userId: user!.uid,
        items,
        totalAmount: getTotalPrice(),
        deliveryAddress,
        paymentMethod: paymentMethodType,
        status: "pending" as const,
      };

      console.log('Placing order with data:', orderData);
      const result = await orderService.placeOrder(orderData);
      console.log('Order placement result:', result);

      if (result.success) {
        console.log('Order placed successfully, clearing cart...');
        // Clear cart immediately after successful order placement
        clearCart();
        
        // Show success alert
        Alert.alert(
          "Order Placed Successfully!",
          transactionId ? `Transaction ID: ${transactionId}` : 'Order confirmed for cash on delivery',
          [
            {
              text: "View Orders",
              onPress: () => {
                // Navigate to main tab, then user can tap on Orders tab
                navigation.navigate("Main");
              },
            },
            {
              text: "Continue Shopping",
              onPress: () => {
                navigation.navigate("Main");
              },
              style: "cancel"
            },
          ]
        );
      } else {
        Alert.alert("Order Failed", result.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      Alert.alert("Error", 'An unexpected error occurred while placing your order');
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

  const renderPaymentMethod = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Method</Text>
      
      {/* Paystack Option */}
      <TouchableOpacity
        style={[
          styles.paymentOption,
          selectedPaymentMethod === 'paystack' && styles.selectedPaymentOption
        ]}
        onPress={() => setSelectedPaymentMethod('paystack')}
      >
        <View style={styles.paymentOptionLeft}>
          <Ionicons 
            name="card-outline" 
            size={24} 
            color={selectedPaymentMethod === 'paystack' ? '#007AFF' : '#666'} 
          />
          <View style={styles.paymentOptionText}>
            <Text style={styles.paymentOptionTitle}>Paystack</Text>
            <Text style={styles.paymentOptionSubtitle}>Secure payment via Paystack</Text>
          </View>
        </View>
        <View style={[
          styles.radioButton,
          selectedPaymentMethod === 'paystack' && styles.radioButtonSelected
        ]}>
          {selectedPaymentMethod === 'paystack' && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
      </TouchableOpacity>

      {/* Cash on Delivery Option */}
      <TouchableOpacity
        style={[
          styles.paymentOption,
          selectedPaymentMethod === 'cash_on_delivery' && styles.selectedPaymentOption
        ]}
        onPress={() => setSelectedPaymentMethod('cash_on_delivery')}
      >
        <View style={styles.paymentOptionLeft}>
          <Ionicons 
            name="cash-outline" 
            size={24} 
            color={selectedPaymentMethod === 'cash_on_delivery' ? '#007AFF' : '#666'} 
          />
          <View style={styles.paymentOptionText}>
            <Text style={styles.paymentOptionTitle}>Cash on Delivery</Text>
            <Text style={styles.paymentOptionSubtitle}>Pay when you receive your order</Text>
          </View>
        </View>
        <View style={[
          styles.radioButton,
          selectedPaymentMethod === 'cash_on_delivery' && styles.radioButtonSelected
        ]}>
          {selectedPaymentMethod === 'cash_on_delivery' && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
      </TouchableOpacity>

      {/* Saved Cards Option */}
      {savedCards.length > 0 && (
        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedPaymentMethod === 'existing_card' && styles.selectedPaymentOption
          ]}
          onPress={() => setSelectedPaymentMethod('existing_card')}
        >
          <View style={styles.paymentOptionLeft}>
            <Ionicons 
              name="card-outline" 
              size={24} 
              color={selectedPaymentMethod === 'existing_card' ? '#007AFF' : '#666'} 
            />
            <View style={styles.paymentOptionText}>
              <Text style={styles.paymentOptionTitle}>Saved Cards</Text>
              <Text style={styles.paymentOptionSubtitle}>{savedCards.length} cards saved</Text>
            </View>
          </View>
          <View style={[
            styles.radioButton,
            selectedPaymentMethod === 'existing_card' && styles.radioButtonSelected
          ]}>
            {selectedPaymentMethod === 'existing_card' && (
              <View style={styles.radioButtonInner} />
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* New Card Option */}
      <TouchableOpacity
        style={[
          styles.paymentOption,
          selectedPaymentMethod === 'new_card' && styles.selectedPaymentOption
        ]}
        onPress={() => setSelectedPaymentMethod('new_card')}
      >
        <View style={styles.paymentOptionLeft}>
          <Ionicons 
            name="add-circle-outline" 
            size={24} 
            color={selectedPaymentMethod === 'new_card' ? '#007AFF' : '#666'} 
          />
          <View style={styles.paymentOptionText}>
            <Text style={styles.paymentOptionTitle}>Add New Card</Text>
            <Text style={styles.paymentOptionSubtitle}>Credit or debit card</Text>
          </View>
        </View>
        <View style={[
          styles.radioButton,
          selectedPaymentMethod === 'new_card' && styles.radioButtonSelected
        ]}>
          {selectedPaymentMethod === 'new_card' && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
      </TouchableOpacity>

      {/* Show Saved Cards Selection */}
      {selectedPaymentMethod === 'existing_card' && (
        <View style={styles.savedCardsContainer}>
          <Text style={styles.savedCardsTitle}>Select a card:</Text>
          {savedCards.map((card) => (
            <View key={card.id} style={styles.savedCardWrapper}>
              <TouchableOpacity
                style={[
                  styles.savedCardOption,
                  selectedCard?.id === card.id && styles.selectedSavedCard
                ]}
                onPress={() => setSelectedCard(card)}
              >
                <View style={styles.savedCardLeft}>
                  <Ionicons 
                    name="card" 
                    size={20} 
                    color={selectedCard?.id === card.id ? '#007AFF' : '#666'} 
                  />
                  <Text style={styles.savedCardText}>
                    {card.brand} •••• {card.last4}
                  </Text>
                </View>
                <Text style={styles.savedCardExpiry}>
                  {card.expiryMonth}/{card.expiryYear}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeCardButton}
                onPress={() => {
                  console.log('Delete button pressed for card:', card.id);
                  handleRemoveCard(card.id);
                }}
              >
                <Ionicons name="trash-outline" size={16} color="#dc3545" />
              </TouchableOpacity>
            </View>
          ))}
          {savedCards.length === 0 && (
            <View style={styles.noSavedCards}>
              <Ionicons name="card-outline" size={32} color="#ccc" />
              <Text style={styles.noSavedCardsText}>No saved cards</Text>
              <Text style={styles.noSavedCardsSubtext}>Add a new card to save it for future orders</Text>
            </View>
          )}
        </View>
      )}

      {/* Show New Card Form */}
      {selectedPaymentMethod === 'new_card' && (
        <View style={styles.newCardContainer}>
          <CardDetailsInput 
            value={selectedCard || {}} 
            onChange={setSelectedCard} 
          />
        </View>
      )}
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
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

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

      {renderPaymentMethod()}

      <TouchableOpacity
        style={[
          styles.placeOrderButton,
          loading && styles.placeOrderButtonDisabled,
        ]}
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? (
          <>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.loadingText}>
              {selectedPaymentMethod === 'paystack' ? 'Initializing Paystack...' :
               selectedPaymentMethod !== 'cash_on_delivery' ? 'Processing Payment...' : 'Placing Order...'}
            </Text>
          </>
        ) : (
          <Text style={styles.placeOrderButtonText}>
            {selectedPaymentMethod === 'paystack' ? 'Pay with Paystack' :
             selectedPaymentMethod === 'cash_on_delivery' ? 'Place Order' : 'Pay & Place Order'}
          </Text>
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    flex: 1,
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
  loadingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
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
  // Header styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 40,
  },
  // Payment method styles
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 12,
  },
  selectedPaymentOption: {
    borderColor: "#007AFF",
    backgroundColor: "#f0f8ff",
  },
  paymentOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentOptionText: {
    marginLeft: 12,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  paymentOptionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: "#007AFF",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
  },
  savedCardsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  savedCardsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  savedCardOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flex: 1,
  },
  selectedSavedCard: {
    borderColor: "#007AFF",
    backgroundColor: "#f0f8ff",
    shadowColor: "#007AFF",
    shadowOpacity: 0.1,
    elevation: 3,
  },
  savedCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  savedCardText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  savedCardExpiry: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  newCardContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  savedCardWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  removeCardButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff5f5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffcdd2",
    marginLeft: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  noSavedCards: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  noSavedCardsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
    marginBottom: 6,
  },
  noSavedCardsSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
});
