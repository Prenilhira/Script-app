import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
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
      color: Colors.primaryBlue
    },
    {
      id: 2,
      title: 'Preset Prescriptions',
      description: 'Manage diagnosis-based medication presets',
      icon: '💊',
      route: 'PresetPrescription',
      color: Colors.secondaryBlue
    },
    {
      id: 3,
      title: 'Patient Management',
      description: 'Add, edit, and manage patient information',
      icon: '👥',
      route: 'PatientList',
      color: Colors.lightBlue
    },
    {
      id: 4,
      title: 'ICD-10 Codes',
      description: 'Search and lookup ICD-10 diagnostic codes',
      icon: '🔍',
      route: 'ICD10Codes',
      color: Colors.accentBlue
    },
    {
      id: 5,
      title: 'Settings',
      description: 'App configuration and data management',
      icon: '⚙️',
      route: 'Settings',
      color: Colors.textGrey
    }
  ];

  const navigateToScreen = (route) => {
    navigation.navigate(route);
  };

  return (
    <TexturedBackground>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={GlobalStyles.padding}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.appTitle}>Dr. P. Hira</Text>
            <Text style={styles.appSubtitle}>Easy Scripts</Text>
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
              <View key={item.id} style={[GlobalStyles.card, styles.menuCard]}>
                <View style={styles.menuItemContent}>
                  <View style={styles.menuIconContainer}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                  </View>
                  
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuDescription}>{item.description}</Text>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.menuButton, { backgroundColor: item.color }]}
                    onPress={() => navigateToScreen(item.route)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.menuButtonText}>Open</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Version Info */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Dr. P. Hira Prescription App v1.0.0</Text>
            <Text style={styles.versionSubtext}>
              Personal Use Edition - Streamlining patient care
            </Text>
          </View>
        </View>
      </ScrollView>
    </TexturedBackground>
  );
}

const styles = StyleSheet.create({
  // Background Styles
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

  scrollView: {
    flex: 1,
  },

  // Header Styles
  headerSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },

  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primaryBlue,
    marginBottom: 6,
    textAlign: 'center',
  },

  appSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },

  headerDivider: {
    width: 80,
    height: 4,
    backgroundColor: Colors.primaryBlue,
    borderRadius: 2,
  },

  // Welcome Card Styles
  welcomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryBlue,
    marginBottom: 20,
  },

  welcomeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
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
  },

  menuCard: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accentBlue,
  },

  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  menuIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: Colors.backgroundGrey,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuIcon: {
    fontSize: 24,
  },

  menuTextContainer: {
    flex: 1,
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },

  menuDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  menuButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  menuButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  // Version Info
  versionContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },

  versionText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },

  versionSubtext: {
    fontSize: 11,
    color: Colors.textLight,
    textAlign: 'center',
  },
});

export default HomeScreen;