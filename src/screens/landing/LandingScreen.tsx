import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ImageBackground,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors, Typography } from '../../constants';

interface Props {
  navigation: any;
}

export default function LandingScreen({ navigation }: Props) {
  return (
    <ImageBackground 
      source={require('../../assets/images/background (2).png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="restaurant" size={80} color={Colors.surface} />
            </View>
            <Text style={styles.appName}>Foodie</Text>
            <Text style={styles.tagline}>Delicious food delivered fast</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Welcome to Foodie</Text>
            <Text style={styles.heroSubtitle}>
              Experience the best dining experience with our premium restaurant services
            </Text>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="star" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Premium Quality</Text>
              <Text style={styles.featureDescription}>Fresh ingredients and expert chefs</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="time" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Fast Service</Text>
              <Text style={styles.featureDescription}>Quick delivery and table service</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="heart" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Made with Love</Text>
              <Text style={styles.featureDescription}>Passionate about great food</Text>
            </View>
          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaSection}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
            >
              <Ionicons name="log-in" size={20} color={Colors.surface} />
              <Text style={styles.primaryButtonText}>Reserve a Table</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
            >
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Foodie Restaurant</Text>
          <View style={styles.socialLinks}>
            <TouchableOpacity style={styles.socialLink}>
              <Ionicons name="logo-facebook" size={24} color={Colors.surface} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialLink}>
              <Ionicons name="logo-instagram" size={24} color={Colors.surface} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialLink}>
              <Ionicons name="logo-twitter" size={24} color={Colors.surface} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flexGrow: 1,
    minHeight: "100%",
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: Typography.xxxl,
    fontWeight: Typography.bold,
    color: Colors.surface,
    marginBottom: 8,
    fontFamily: Typography.fontFamily.bold,
  },
  tagline: {
    fontSize: Typography.base,
    fontWeight: Typography.normal,
    color: Colors.surface,
    textAlign: "center",
    opacity: 0.9,
    fontFamily: Typography.fontFamily.regular,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    color: Colors.surface,
    textAlign: "center",
    marginBottom: 12,
    fontFamily: Typography.fontFamily.bold,
  },
  heroSubtitle: {
    fontSize: Typography.base,
    fontWeight: Typography.normal,
    color: Colors.surface,
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 22,
    fontFamily: Typography.fontFamily.regular,
  },
  features: {
    marginBottom: 40,
  },
  featureItem: {
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    borderRadius: 15,
    backdropFilter: "blur(10px)",
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.surface,
    marginBottom: 6,
    textAlign: "center",
    fontFamily: Typography.fontFamily.medium,
  },
  featureDescription: {
    fontSize: Typography.sm,
    fontWeight: Typography.normal,
    color: Colors.surface,
    textAlign: "center",
    opacity: 0.8,
    fontFamily: Typography.fontFamily.regular,
  },
  ctaSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.surface,
    marginLeft: 8,
    fontFamily: Typography.fontFamily.medium,
  },
  secondaryButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  secondaryButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.surface,
    fontFamily: Typography.fontFamily.medium,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    fontSize: Typography.sm,
    fontWeight: Typography.normal,
    color: Colors.surface,
    opacity: 0.7,
    marginBottom: 15,
    fontFamily: Typography.fontFamily.regular,
  },
  socialLinks: {
    flexDirection: "row",
    gap: 20,
  },
  socialLink: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
});
