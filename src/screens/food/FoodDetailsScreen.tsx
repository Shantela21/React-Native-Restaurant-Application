import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { DrinkOption, Extra, FoodItem, foodService, SideOption } from '../../services/foodService';

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  FoodDetails: { foodId: string };
  Cart: undefined;
  Checkout: undefined;
};

type FoodDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FoodDetails'>;

interface Props {
  route: { params: { foodId: string } };
  navigation: FoodDetailsScreenNavigationProp;
}

export default function FoodDetailsScreen({ route, navigation }: Props) {
  const { foodId } = route.params;
  const { user } = useAuth();
  const { addItem } = useCart();
  
  const [foodItem, setFoodItem] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSides, setSelectedSides] = useState<SideOption[]>([]);
  const [selectedDrinks, setSelectedDrinks] = useState<DrinkOption[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);
  const [customIngredients, setCustomIngredients] = useState(foodItem?.ingredients || []);

  React.useEffect(() => {
    const item = foodService.getFoodItemById(foodId);
    setFoodItem(item || null);
    if (item) {
      setCustomIngredients(item.ingredients);
    }
  }, [foodId]);

  if (!foodItem) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const calculateTotalPrice = () => {
    let total = foodItem.price * quantity;
    
    selectedSides.forEach(side => {
      total += side.price;
    });
    
    selectedDrinks.forEach(drink => {
      total += drink.price;
    });
    
    selectedExtras.forEach(extra => {
      total += extra.price;
    });
    
    return total;
  };

  const handleAddToCart = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to add items to cart');
      navigation.navigate('Auth');
      return;
    }

    const cartItem = {
      ...foodItem,
      quantity,
      selectedSides,
      selectedDrinks,
      selectedExtras,
      customIngredients,
      totalPrice: calculateTotalPrice(),
    };

    addItem(cartItem);
    Alert.alert('Added to Cart', `${foodItem.name} has been added to your cart`);
  };

  const toggleSide = (side: SideOption) => {
    setSelectedSides(prev => {
      const isSelected = prev.some(s => s.id === side.id);
      if (isSelected) {
        return prev.filter(s => s.id !== side.id);
      } else {
        if (prev.length >= 2) {
          Alert.alert('Maximum Sides', 'You can only select up to 2 sides');
          return prev;
        }
        return [...prev, side];
      }
    });
  };

  const toggleDrink = (drink: DrinkOption) => {
    setSelectedDrinks(prev => {
      const isSelected = prev.some(d => d.id === drink.id);
      if (isSelected) {
        return prev.filter(d => d.id !== drink.id);
      } else {
        return [...prev, drink];
      }
    });
  };

  const toggleExtra = (extra: Extra) => {
    setSelectedExtras(prev => {
      const isSelected = prev.some(e => e.id === extra.id);
      if (isSelected) {
        return prev.filter(e => e.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  };

  const toggleIngredient = (ingredient: any) => {
    if (!ingredient.removable) return;
    
    setCustomIngredients(prev => {
      const isSelected = prev.some(i => i.id === ingredient.id);
      if (isSelected) {
        return prev.filter(i => i.id !== ingredient.id);
      } else {
        return [...prev, ingredient];
      }
    });
  };

  const renderSideOption = (side: SideOption) => (
    <TouchableOpacity
      key={side.id}
      style={[
        styles.optionButton,
        selectedSides.some(s => s.id === side.id) && styles.optionButtonSelected
      ]}
      onPress={() => toggleSide(side)}
    >
      <Text style={styles.optionText}>{side.name}</Text>
      <Text style={styles.optionPrice}>+R{side.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  const renderDrinkOption = (drink: DrinkOption) => (
    <TouchableOpacity
      key={drink.id}
      style={[
        styles.optionButton,
        selectedDrinks.some(d => d.id === drink.id) && styles.optionButtonSelected
      ]}
      onPress={() => toggleDrink(drink)}
    >
      <Text style={styles.optionText}>{drink.name}</Text>
      <Text style={styles.optionPrice}>+R{drink.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  const renderExtra = (extra: Extra) => (
    <TouchableOpacity
      key={extra.id}
      style={[
        styles.optionButton,
        selectedExtras.some(e => e.id === extra.id) && styles.optionButtonSelected
      ]}
      onPress={() => toggleExtra(extra)}
    >
      <Text style={styles.optionText}>{extra.name}</Text>
      <Text style={styles.optionPrice}>+R{extra.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  const renderIngredient = (ingredient: any) => (
    <TouchableOpacity
      key={ingredient.id}
      style={[
        styles.ingredientButton,
        !ingredient.removable && styles.ingredientButtonDisabled,
        customIngredients.some(i => i.id === ingredient.id) && styles.ingredientButtonSelected
      ]}
      onPress={() => toggleIngredient(ingredient)}
      disabled={!ingredient.removable}
    >
      <Text style={[
        styles.ingredientText,
        !ingredient.removable && styles.ingredientTextDisabled
      ]}>
        {ingredient.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ 
          uri: foodItem.image && foodItem.image.trim() !== '' 
            ? foodItem.image 
            : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
        }} 
        style={styles.foodImage} 
      />
      
      <View style={styles.content}>
        <Text style={styles.foodName}>{foodItem.name}</Text>
        <Text style={styles.foodDescription}>{foodItem.description}</Text>
        <Text style={styles.foodPrice}>R{foodItem.price.toFixed(2)}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {foodItem.sideOptions && foodItem.sideOptions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Side Options (Select up to 2)</Text>
            <View style={styles.optionsContainer}>
              {foodItem.sideOptions.map(renderSideOption)}
            </View>
          </View>
        )}

        {foodItem.drinkOptions && foodItem.drinkOptions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Drink Options</Text>
            <View style={styles.optionsContainer}>
              {foodItem.drinkOptions.map(renderDrinkOption)}
            </View>
          </View>
        )}

        {foodItem.extras && foodItem.extras.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Extras</Text>
            <View style={styles.optionsContainer}>
              {foodItem.extras.map(renderExtra)}
            </View>
          </View>
        )}

        {foodItem.ingredients && foodItem.ingredients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.ingredientsContainer}>
              {foodItem.ingredients.map(renderIngredient)}
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>R{calculateTotalPrice().toFixed(2)}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  foodImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 20,
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  foodDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  foodPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 40,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  ingredientButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  ingredientButtonDisabled: {
    opacity: 0.5,
  },
  ingredientText: {
    fontSize: 14,
    color: '#333',
  },
  ingredientTextDisabled: {
    color: '#999',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 20,
    backgroundColor: '#fff',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    color: '#333',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  addToCartButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
