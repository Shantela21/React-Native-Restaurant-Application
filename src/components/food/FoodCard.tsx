import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Colors, Typography } from '../../constants';
import { FoodItem } from '../../services/foodService';
import SafeImage from '../common/SafeImage';

interface FoodCardProps {
  item: FoodItem;
  onPress: (item: FoodItem) => void;
  onAddToCart: (item: FoodItem) => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ item, onPress, onAddToCart }) => {
  const animatedValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: animatedValue }] }]}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.imageContainer}>
          <SafeImage 
            uri={item.image}
            fallbackUri="https://via.placeholder.com/150x150?text=No+Image"
            style={styles.image} 
          />
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>R{item.price.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          
          <View style={styles.footer}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => onAddToCart(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color={Colors.surface} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 8,
    marginVertical: 8,
  } as ViewStyle,
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  } as ViewStyle,
  imageContainer: {
    position: 'relative',
    height: 160,
  } as ViewStyle,
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background,
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  } as ViewStyle,
  priceText: {
    color: Colors.surface,
    fontSize: Typography.sm,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  } as ViewStyle,
  name: {
    fontSize: Typography.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 22,
  },
  description: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  categoryBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  } as ViewStyle,
  categoryText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  } as ViewStyle,
});

export default FoodCard;
