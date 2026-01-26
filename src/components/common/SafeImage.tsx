import React from 'react';
import { Image, ImageProps, View } from 'react-native';

interface SafeImageProps extends Omit<ImageProps, 'source'> {
  uri?: string;
  fallbackUri?: string;
  placeholder?: React.ReactNode;
}

const SafeImage: React.FC<SafeImageProps> = ({
  uri,
  fallbackUri = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9Ijc1IiB5PSI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=',
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
