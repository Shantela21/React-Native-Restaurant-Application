import React from 'react';
import { Image, ImageProps, View } from 'react-native';

interface SafeImageProps extends Omit<ImageProps, 'source'> {
  uri?: string;
  fallbackUri?: string;
  placeholder?: React.ReactNode;
}

const SafeImage: React.FC<SafeImageProps> = ({
  uri,
  fallbackUri = 'https://via.placeholder.com/150x150?text=No+Image',
  placeholder,
  style,
  ...imageProps
}) => {
  // Check if URI is valid (not empty, not undefined, not just whitespace)
  const isValidUri = uri && uri.trim() !== '';

  if (!isValidUri && placeholder) {
    // Show custom placeholder if provided
    return <View style={style}>{placeholder}</View>;
  }

  return (
    <Image
      source={{ uri: isValidUri ? uri : fallbackUri }}
      style={style}
      {...imageProps}
    />
  );
};

export default SafeImage;
