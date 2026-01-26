// Platform detection utilities
import { Alert, Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

export const showConfirmDialog = (message: string): Promise<boolean> => {
  if (isWeb && typeof window !== 'undefined' && window.confirm) {
    // Use native browser confirm on web
    return Promise.resolve(window.confirm(message));
  } else {
    // Use Alert.alert on mobile
    return new Promise((resolve) => {
      Alert.alert('Confirm', message, [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: 'OK',
          onPress: () => resolve(true),
        },
      ]);
    });
  }
};

export const showAlert = (title: string, message: string) => {
  if (isWeb && typeof window !== 'undefined' && window.alert) {
    window.alert(`${title}\n\n${message}`);
  } else {
    // Use Alert.alert on mobile
    Alert.alert(title, message);
  }
};
