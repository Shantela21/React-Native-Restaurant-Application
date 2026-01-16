import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from '../../constants';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  style?: any;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  width = '100%', 
  height = 20, 
  style 
}) => {
  return (
    <LinearGradient
      colors={[Colors.background, Colors.overlayLight, Colors.background]}
      style={[
        styles.skeleton,
        { width, height },
        style
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    borderRadius: 8,
    opacity: 0.7,
  },
});

export default SkeletonLoader;
