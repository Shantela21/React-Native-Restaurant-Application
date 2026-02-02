/**
 * Utility functions for handling style prop conversions
 */

/**
 * Convert React Native shadow props to web-compatible boxShadow
 */
export const createBoxShadow = (
  shadowColor: string = '#000',
  shadowOffset: { width: number; height: number } = { width: 0, height: 2 },
  shadowOpacity: number = 0.1,
  shadowRadius: number = 4
): string => {
  const r = parseInt(shadowColor.slice(1, 3), 16);
  const g = parseInt(shadowColor.slice(3, 5), 16);
  const b = parseInt(shadowColor.slice(5, 7), 16);
  const a = shadowOpacity;
  
  return `${shadowOffset.width}px ${shadowOffset.height}px ${shadowRadius}px rgba(${r}, ${g}, ${b}, ${a})`;
};

/**
 * Convert React Native text shadow props to web-compatible textShadow
 */
export const createTextShadow = (
  textShadowColor: string = '#000',
  textShadowOffset: { width: number; height: number } = { width: 0, height: 1 },
  textShadowRadius: number = 0
): string => {
  return `${textShadowOffset.width}px ${textShadowOffset.height}px ${textShadowRadius}px ${textShadowColor}`;
};
