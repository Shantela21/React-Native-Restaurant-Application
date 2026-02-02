import React, { useState } from 'react';
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
  const [imageError, setImageError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Check if URI is valid and not a problematic URL
  const isValidUri = uri && 
    uri.trim() !== '' && 
    !uri.startsWith('blob:http://localhost:8081/') &&
    !uri.startsWith('file://'); // Filter out local file URIs
  
  // Use fallback if image error occurred or URI is invalid
  const shouldUseFallback = imageError || !isValidUri;

  const handleImageError = () => {
    console.log('SafeImage: Image failed to load, using fallback:', uri);
    setImageError(true);
    setUseFallback(true);
  };

  if (!isValidUri && placeholder) {
    // Show custom placeholder if provided
    return <View style={style}>{placeholder}</View>;
  }

  return (
    <Image
      source={{ 
        uri: shouldUseFallback ? fallbackUri : uri 
      }}
      style={style}
      onError={handleImageError}
      {...imageProps}
    />
  );
};

export default SafeImage;
