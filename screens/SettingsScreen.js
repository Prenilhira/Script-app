import React from 'react';
import { 
  Alert, 
  Modal, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalStyles, Colors } from '../GlobalStyles'; // Fixed import path

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

function SettingsScreen({ navigation }) {
  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteAllData = () => {
    setDeleteModalVisible(true);
    setDeleteConfirmText('');
  };

  const confirmDeleteAllData = async () => {
    if (deleteConfirmText.toLowerCase().trim() !== 'delete') {
      Alert.alert('Error', 'Please type "delete" to confirm');
      return;
    }

    setIsDeleting(true);
    
    try {
      // Delete all stored data
      await AsyncStorage.multiRemove(['@patients_data']);
      
      setDeleteModalVisible(false);
      setDeleteConfirmText('');
      
      Alert.alert(
        'Success', 
        'All data has been deleted successfully. The app will restart.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to home or restart app logic
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting data:', error);
      Alert.alert('Error', 'Failed to delete data. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackupData = async () => {
    try {
      const patients = await AsyncStorage.getItem('@patients_data');
      if (patients) {
        const patientCount = JSON.parse(patients).length;
        Alert.alert(
          'Data Backup', 
          `Found ${patientCount} patients in your data.\n\nBackup feature coming soon!`
        );
      } else {
        Alert.alert('No Data', 'No patient data found to backup.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check data for backup.');
    }
  };

  const getAppInfo = () => {
    Alert.alert(
      'App Information',
      'Dr. P. Hira Prescription App\nVersion: 1.0.0\nPersonal Use Edition\n\nDeveloped for efficient patient management and prescription creation.'
    );
  };

  const settingsOptions = [
    {
      id: 1,
      title: 'Backup Data',
      description: 'Backup your patient and prescription data',
      icon: '💾',
      action: handleBackupData,
      buttonColor: GlobalStyles.primaryButton,
    },
    {
      id: 2,
      title: 'App Information',
      description: 'View app version and details',
      icon: 'ℹ️',
      action: getAppInfo,
      buttonColor: GlobalStyles.secondaryButton,
    },
    {
      id: 3,
      title: 'Delete All Data',
      description: 'Permanently delete all stored data',
      icon: '🗑️',
      action: handleDeleteAllData,
      buttonColor: GlobalStyles.errorButton,
    },
  ];

  return (
    <TexturedBackground>
      <ScrollView style={GlobalStyles.padding}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={GlobalStyles.headerText}>Settings</Text>
          <Text style={styles.subtitle}>Manage your app preferences and data</Text>
        </View>

        {/* Settings Options */}
        <View style={styles.settingsContainer}>
          {settingsOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[GlobalStyles.card, styles.settingCard]}
              onPress={option.action}
              activeOpacity={0.7}
            >
              <View style={styles.settingCardContent}>
                <View style={styles.settingHeader}>
                  <Text style={styles.settingIcon}>{option.icon}</Text>
                  <Text style={GlobalStyles.cardTitle}>{option.title}</Text>
                </View>
                <Text style={styles.settingDescription}>{option.description}</Text>
              </View>
              
              <View style={styles.settingButton}>
                <View style={[option.buttonColor, styles.actionButton]}>
                  <Text style={GlobalStyles.buttonText}>Open</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About This App</Text>
          <Text style={styles.infoText}>
            This prescription management system is designed for Dr. P. Hira's personal medical practice. 
            It helps streamline patient management and prescription creation.
          </Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={GlobalStyles.modalOverlay}>
          <View style={GlobalStyles.modalContent}>
            <Text style={GlobalStyles.modalTitle}>⚠️ Delete All Data</Text>
            <Text style={styles.warningText}>
              This action will permanently delete ALL patient data, prescriptions, and settings. 
              This cannot be undone.
            </Text>
            
            <Text style={GlobalStyles.inputLabel}>
              Type "delete" to confirm:
            </Text>
            <TextInput
              style={GlobalStyles.input}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder="Type 'delete' to confirm"
              autoCapitalize="none"
            />

            <View style={GlobalStyles.modalButtonContainer}>
              <TouchableOpacity
                style={[GlobalStyles.modalButton, GlobalStyles.secondaryButton]}
                onPress={() => setDeleteModalVisible(false)}
                disabled={isDeleting}
              >
                <Text style={GlobalStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[GlobalStyles.modalButton, GlobalStyles.errorButton]}
                onPress={confirmDeleteAllData}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={GlobalStyles.buttonText}>Delete All</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginTop: 10,
    marginBottom: 30,
  },

  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },

  // Settings Styles
  settingsContainer: {
    gap: 16,
    marginBottom: 30,
  },

  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderLeftColor: Colors.lightBlue,
    borderLeftWidth: 4,
    backgroundColor: Colors.white,
  },

  settingCardContent: {
    flex: 1,
  },

  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  settingIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  settingDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  settingButton: {
    marginLeft: 16,
  },

  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 80,
  },

  // Info Section Styles
  infoSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryBlue,
  },

  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primaryBlue,
    marginBottom: 12,
  },

  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },

  versionText: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Modal Styles
  warningText: {
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
});

export default SettingsScreen;