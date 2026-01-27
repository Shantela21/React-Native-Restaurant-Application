import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { CardDetails } from '../../services/authService';

interface CardDetailsInputProps {
  value: CardDetails;
  onChange: (cardDetails: CardDetails) => void;
  error?: string;
  errorStyle?: any;
}

const CardDetailsInput: React.FC<CardDetailsInputProps> = ({
  value,
  onChange,
  error,
  errorStyle,
}) => {
  const updateCardDetails = (field: keyof CardDetails, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substr(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.cardNumberInput]}
          placeholder="Card Number"
          value={formatCardNumber(value.cardNumber)}
          onChangeText={(text) => updateCardDetails('cardNumber', text.replace(/\s/g, ''))}
          keyboardType="numeric"
          maxLength={19}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="MM/YY"
          value={formatExpiryDate(value.expiryDate)}
          onChangeText={(text) => updateCardDetails('expiryDate', text)}
          keyboardType="numeric"
          maxLength={5}
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="CVV"
          value={value.cvv}
          onChangeText={(text) => updateCardDetails('cvv', text)}
          keyboardType="numeric"
          maxLength={4}
          secureTextEntry
        />
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.fullInput]}
          placeholder="Cardholder Name"
          value={value.cardHolderName}
          onChangeText={(text) => updateCardDetails('cardHolderName', text)}
        />
      </View>

      {error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  cardNumberInput: {
    flex: 1,
  },
  halfInput: {
    flex: 1,
    marginRight: 10,
    maxWidth: '48%',
  },
  fullInput: {
    flex: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
});

export default CardDetailsInput;
