import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CartItem } from '../../context/CartContext';

interface CartItemCardProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  onEdit: () => void;
}

interface SelectedOption {
  name: string;
  price: number;
  quantity: number;
  
}

const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  onEdit,
}) => {
  const [imageError, setImageError] = useState(false);

  const getImageSource = () => {
    // Check if image URL is a blob URL (which might be invalid)
    if (item.image && item.image.trim() !== '' && !item.image.startsWith('blob:')) {
      return { uri: item.image };
    }
    // Use fallback placeholder for blob URLs or empty images
    return null;
  };

  const renderSelectedOptions = () => {
    const options = [];
    
    if (item.selectedSides && item.selectedSides.length > 0) {
      options.push(
        <Text key="sides" style={styles.optionText}>
          Sides: {item.selectedSides.map(s => s.name).join(', ')}
        </Text>
      );
    }
    
    if (item.selectedDrinks && item.selectedDrinks.length > 0) {
      options.push(
        <Text key="drinks" style={styles.optionText}>
          Drinks: {item.selectedDrinks.map(d => d.name).join(', ')}
        </Text>
      );
    }
    
    if (item.selectedExtras && item.selectedExtras.length > 0) {
      options.push(
        <Text key="extras" style={styles.optionText}>
          Extras: {item.selectedExtras.map(e => e.name).join(', ')}
        </Text>
      );
    }
    
    return options;
  };

  return (
    <View style={styles.container}>
      <Image 
        source={getImageSource() || { uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjRmNGY0Ii8+PHRleHQgeD0iMzAiIHk9IjMyIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vPC90ZXh0Pjwvc3ZnPg==' }}
        style={styles.itemImage}
        onError={() => {
          console.log('Cart item image failed to load:', item.image);
          setImageError(true);
        }}
      />
      
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={onEdit}
          >
            <Ionicons name="create-outline" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.itemPrice}>R{item.price.toFixed(2)}</Text>
          <Text style={styles.quantityText}>x{item.quantity}</Text>
        </View>
        
        {renderSelectedOptions()}
        
        <View style={styles.itemTotal}>
          <Text style={styles.totalLabel}>Item Total:</Text>
          <Text style={styles.totalPrice}>R{item.totalPrice.toFixed(2)}</Text>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={onDecrease}
        >
          <Ionicons name="remove-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={onIncrease}
        >
          <Ionicons name="add-outline" size={20} color="#34C759" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  editButton: {
    padding: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  quantityText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  optionText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  itemTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  quantityButton: {
    backgroundColor: '#f0f0f0',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#FFF5F5',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CartItemCard;
