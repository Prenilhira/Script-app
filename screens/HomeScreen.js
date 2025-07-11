import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GlobalStyles, Colors } from '../GlobalStyles';

// Textured Background Component
const TexturedBackground = ({ children }) => (
  <View style={[GlobalStyles.container]}>
    <View style={styles.backgroundBase} />
    <View style={styles.textureLayer1} />
    <View style={styles.textureLayer2} />
    <View style={styles.contentContainer}>
      {children}
    </View>
  </View>
);

function HomeScreen({ navigation }) {
  const menuItems = [
    {
      id: 1,
      title: 'Create New Script',
      description: 'Create a new prescription for patients',
      icon: '📝',
      route: 'CreateScript',
      buttonStyle: GlobalStyles.primaryButton
    },
    {
      id: 2,
      title: 'Preset Prescriptions',
      description: 'Manage diagnosis-based medication presets',
      icon: '💊',
      route: 'PresetPrescription',
      buttonStyle: GlobalStyles.secondaryButton
    },
    {
      id: 3,
      title: 'Patient Management',
      description: 'Add, edit, and manage patient information',
      icon: '👥',
      route: 'PatientList',
      buttonStyle: GlobalStyles.lightButton
    },
    {
      id: 4,
      title: 'Settings',
      description: 'App configuration and data management',
      icon: '⚙️',
      route: 'Settings',
      buttonStyle: [GlobalStyles.lightButton, { backgroundColor: Colors.textGrey }]
    }
  ];

  const navigateToScreen = (route) => {
    navigation.navigate(route);
  };

  return (
    <TexturedBackground>
      <StatusBar style="dark" />
      <View style={GlobalStyles.padding}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.appTitle}>Dr. P. Hira</Text>
          <Text style={styles.appSubtitle}>Prescription Management System</Text>
          <View style={styles.headerDivider} />
        </View>

        {/* Welcome Card */}
        <View style={[GlobalStyles.card, styles.welcomeCard]}>
          <Text style={styles.welcomeTitle}>Welcome Back, Doctor</Text>
          <Text style={styles.welcomeText}>
            Choose an option below to get started with patient care and prescription management.
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[GlobalStyles.card, styles.menuCard]}
              onPress={() => navigateToScreen(item.route)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.menuItemHeader}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                </View>
                <Text style={styles.menuDescription}>{item.description}</Text>
                <View style={[item.buttonStyle, styles.menuButton]}>
                  <Text style={GlobalStyles.buttonText}>Open</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </TexturedBackground>
  );
}

const styles = StyleSheet.create({
  // Textured Background Styles
  backgroundBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.backgroundGrey,
  },
  
  textureLayer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    opacity: 0.4,
    shadowColor: Colors.borderGrey,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  
  textureLayer2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(30, 58, 138, 0.02)',
  },
  
  contentContainer: {
    flex: 1,
    zIndex: 1,
  },

  // Header Styles
  headerSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },

  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primaryBlue,
    marginBottom: 4,
  },

  appSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },

  headerDivider: {
    width: 60,
    height: 3,
    backgroundColor: Colors.primaryBlue,
    borderRadius: 2,
  },

  // Welcome Card Styles
  welcomeCard: {
    marginBottom: 20,
    borderLeftColor: Colors.primaryBlue,
    borderLeftWidth: 4,
  },

  welcomeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primaryBlue,
    marginBottom: 8,
  },

  welcomeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  // Menu Styles
  menuContainer: {
    gap: 12,
    marginBottom: 20,
  },

  menuCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.lightBlue,
  },

  menuItemContent: {
    flex: 1,
  },

  menuItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },

  menuDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },

  menuButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-end',
    minWidth: 80,
  },
});

export default HomeScreen;