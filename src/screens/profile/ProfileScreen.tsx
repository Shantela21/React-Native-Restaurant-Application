import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CardDetailsInput from '../../components/inputs/CardDetailsInput';
import { useAuth } from '../../context/AuthContext';
import { showAlert, showConfirmDialog } from '../../utils/platform';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Profile: undefined;
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

export default function ProfileScreen({ navigation }: Props) {
  const { user, updateProfile, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    address: '',
    cardDetails: {
      cardNumber: '',
      cardHolderName: '',
      expiryDate: '',
      cvv: '',
      cardType: 'visa' as 'visa' | 'mastercard' | 'amex' | 'discover',
    },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        surname: user.surname || '',
        phone: user.phone || '',
        address: user.address || '',
        cardDetails: user.cardDetails || {
          cardNumber: '',
          cardHolderName: '',
          expiryDate: '',
          cvv: '',
          cardType: 'visa',
        },
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!formData.name.trim() || !formData.surname.trim()) {
      Alert.alert('Error', 'Name and surname are required');
      return;
    }

    setLoading(true);
    try {
      const result = await updateProfile({
        name: formData.name,
        surname: formData.surname,
        phone: formData.phone,
        address: formData.address,
        cardDetails: formData.cardDetails,
      });

      if (result.success) {
        setEditMode(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', result.message || 'Profile update failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const shouldLogout = await showConfirmDialog('Are you sure you want to logout?');
      
      if (shouldLogout) {
        await logout();
        console.log('Logout successful');
      }
    } catch (error) {
      console.error('Logout error:', error);
      showAlert('Error', 'Failed to logout. Please try again.');
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          {editMode ? (
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
            />
          ) : (
            <Text style={styles.value}>{user.name}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Surname:</Text>
          {editMode ? (
            <TextInput
              style={styles.input}
              value={formData.surname}
              onChangeText={(value) => updateFormData('surname', value)}
            />
          ) : (
            <Text style={styles.value}>{user.surname}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone:</Text>
          {editMode ? (
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              keyboardType="phone-pad"
              placeholder="Enter phone number"
            />
          ) : (
            <Text style={styles.value}>{user.phone || 'Not provided'}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Address:</Text>
          {editMode ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.address}
              onChangeText={(value) => updateFormData('address', value)}
              multiline
              numberOfLines={3}
              placeholder="Enter address"
            />
          ) : (
            <Text style={styles.value}>{user.address}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Card Details:</Text>
          {editMode ? (
            <CardDetailsInput
              value={formData.cardDetails}
              onChange={(cardDetails) => setFormData(prev => ({ ...prev, cardDetails }))}
            />
          ) : (
            <Text style={styles.value}>
              {user?.cardDetails ? `**** **** **** ${user.cardDetails.cardNumber?.slice(-4) || ''}` : 'Not provided'}

            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {editMode ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setEditMode(false);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => setEditMode(true)}
              >
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.logoutButton]}
                onPress={handleLogout}
              >
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
   marginTop: 40,
    padding: 20,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  profileCard: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#666',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
