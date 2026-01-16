import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { CardDetails } from '../../services/authService';

interface CardDetailsInputProps {
  value?: CardDetails;
  onChange: (cardDetails: CardDetails) => void;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  error?: string;
  errorStyle?: TextStyle;
}

const CardDetailsInput: React.FC<CardDetailsInputProps> = ({
  value,
  onChange,
  style,
  labelStyle,
  error,
  errorStyle,
}) => {
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);

  const updateField = (field: keyof CardDetails, fieldValue: string) => {
    const updatedCard = {
      cardNumber: value?.cardNumber || '',
      cardHolderName: value?.cardHolderName || '',
      expiryDate: value?.expiryDate || '',
      cvv: value?.cvv || '',
      cardType: value?.cardType || 'visa',
      [field]: fieldValue,
    };
    onChange(updatedCard);
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const getCardType = (cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'discover' => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'mastercard';
    if (cleaned.startsWith('3')) return 'amex';
    return 'discover';
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, labelStyle]}>Card Details</Text>
      
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.cardNumberInput]}
          placeholder="1234 5678 9012 3456"
          value={value ? formatCardNumber(value.cardNumber) : ''}
          onChangeText={(text) => {
            const cleaned = text.replace(/\s/g, '');
            if (cleaned.length <= 16) {
              updateField('cardNumber', cleaned);
              updateField('cardType', getCardType(cleaned));
            }
          }}
          keyboardType="numeric"
          maxLength={19}
          secureTextEntry={!showCardNumber}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowCardNumber(!showCardNumber)}
        >
          <Ionicons
            name={showCardNumber ? 'eye-off' : 'eye'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Cardholder Name"
        value={value?.cardHolderName || ''}
        onChangeText={(text) => updateField('cardHolderName', text)}
        autoCapitalize="words"
      />

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <TextInput
            style={[styles.input, styles.smallInput]}
            placeholder="MM/YY"
            value={value ? formatExpiryDate(value.expiryDate) : ''}
            onChangeText={(text) => {
              const cleaned = text.replace(/\D/g, '');
              if (cleaned.length <= 4) {
                updateField('expiryDate', formatExpiryDate(text));
              }
            }}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        
        <View style={styles.halfWidth}>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.smallInput, styles.cvvInput]}
              placeholder="CVV"
              value={value?.cvv || ''}
              onChangeText={(text) => {
                if (text.length <= 4) {
                  updateField('cvv', text);
                }
              }}
              keyboardType="numeric"
              secureTextEntry={!showCvv}
              maxLength={4}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowCvv(!showCvv)}
            >
              <Ionicons
                name={showCvv ? 'eye-off' : 'eye'}
                size={16}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {error && (
        <Text style={[styles.errorText, errorStyle]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
    marginBottom: 12,
  },
  inputRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardNumberInput: {
    flex: 1,
    paddingRight: 40,
  },
  cvvInput: {
    paddingRight: 35,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  halfWidth: {
    width: '48%',
  },
  smallInput: {
    marginBottom: 0,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 4,
  },
});

export default CardDetailsInput;
