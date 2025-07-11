import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GlobalStyles, Colors } from './GlobalStyles';

// Textured Background Component
const TexturedBackground = ({ children }) => (
  <View style={[GlobalStyles.container]}>
    {/* Base background */}
    <View style={styles.backgroundBase} />
    
    {/* Subtle texture overlays */}
    <View style={styles.textureLayer1} />
    <View style={styles.textureLayer2} />
    
    {/* Content */}
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
              <View style={styles.menuCardContent}>
                <View style={styles.menuCardHeader}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={GlobalStyles.cardTitle}>{item.title}</Text>
                </View>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              
              <View style={styles.menuCardButton}>
                <View style={[item.buttonStyle, styles.actionButton]}>
                  <Text style={GlobalStyles.buttonText}>Open</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer Information */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            Personal Medical Practice Management
          </Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
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
    marginBottom: 30,
  },

  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primaryBlue,
    marginBottom: 8,
    letterSpacing: 1,
  },

  appSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },

  headerDivider: {
    width: 60,
    height: 4,
    backgroundColor: Colors.primaryBlue,
    borderRadius: 2,
  },

  // Welcome Card Styles
  welcomeCard: {
    marginBottom: 25,
    borderLeftColor: Colors.primaryBlue,
    borderLeftWidth: 5,
    backgroundColor: Colors.white,
  },

  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primaryBlue,
    marginBottom: 12,
  },

  welcomeText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // Menu Styles
  menuContainer: {
    flex: 1,
    gap: 16,
  },

  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderLeftColor: Colors.lightBlue,
    borderLeftWidth: 4,
    backgroundColor: Colors.white,
  },

  menuCardContent: {
    flex: 1,
  },

  menuCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  menuIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  menuDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  menuCardButton: {
    marginLeft: 16,
  },

  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 80,
  },

  // Footer Styles
  footerSection: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.borderGrey,
  },

  footerText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 8,
  },

  versionText: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
});

export default HomeScreen;