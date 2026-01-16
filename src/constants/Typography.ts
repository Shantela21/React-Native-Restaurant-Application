export const Typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  heading: 32,
  
  // Font weights
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  
  // Line heights
  tightHeight: 1.2,
  normalHeight: 1.4,
  relaxedHeight: 1.6,
  
  // Letter spacing
  tightSpacing: -0.5,
  normalSpacing: 0,
  wideSpacing: 0.5,
  
  // Font families (using system fonts for better performance)
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
};
