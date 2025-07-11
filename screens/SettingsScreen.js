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
      await AsyncStorage.multiRemove([
        '@patients_data', 
        '@prescription_presets'
      ]);
      
      setDeleteModalVisible(false);
      setDeleteConfirmText('');
      
      Alert.alert(
        'Success', 
        'All data has been deleted successfully. The app will restart.',
        [
          {
            text: 'OK',
            onPress: () => {
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
      const presets = await AsyncStorage.getItem('@prescription_presets');
      
      let dataCount = 0;
      let message = 'Data found:\n';
      
      if (patients) {
        const patientCount = JSON.parse(patients).length;
        dataCount += patientCount;
        message += `• ${patientCount} patients\n`;
      }
      
      if (presets) {
        const presetCount = JSON.parse(presets).length;
        dataCount += presetCount;
        message += `• ${presetCount} prescription presets\n`;
      }
      
      if (dataCount > 0) {
        message += '\nBackup feature coming soon!';
        Alert.alert('Data Backup', message);
      } else {
        Alert.alert('No Data', 'No data found to backup.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check data for backup.');
    }
  };

  const getAppInfo = () => {
    Alert.alert(
      'App Information',
      'Dr. P. Hira Prescription App\nVersion: 1.0.0\nPersonal Use Edition\n\nDeveloped for efficient patient management and prescription creation.\n\nThis app helps streamline medical practice workflows while maintaining patient data security.'
    );
  };

  return (
    <TexturedBackground>
      <ScrollView style={GlobalStyles.padding} showsVerticalScrollIndicator={false}>
        <Text style={GlobalStyles.pageTitle}>Settings</Text>
        <Text style={styles.subtitle}>Manage your app preferences and data</Text>

        {/* Settings Options */}
        <View style={styles.settingsContainer}>
          {/* Backup Data */}
          <View style={[GlobalStyles.card, styles.settingCard]}>
            <View style={styles.settingCardContent}>
              <View style={styles.settingHeader}>
                <Text style={styles.settingIcon}>💾</Text>
                <Text style={GlobalStyles.cardTitle}>Backup Data</Text>
              </View>
              <Text style={styles.settingDescription}>
                Backup your patient and prescription data
              </Text>
            </View>
            <View style={styles.settingButton}>
              <TouchableOpacity
                style={[GlobalStyles.primaryButton, styles.actionButton]}
                onPress={handleBackupData}
              >
                <Text style={GlobalStyles.buttonText}>Open</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* App Information */}
          <View style={[GlobalStyles.card, styles.settingCard]}>
            <View style={styles.settingCardContent}>
              <View style={styles.settingHeader}>
                <Text style={styles.settingIcon}>ℹ️</Text>
                <Text style={GlobalStyles.cardTitle}>App Information</Text>
              </View>
              <Text style={styles.settingDescription}>
                View app version and details
              </Text>
            </View>
            <View style={styles.settingButton}>
              <TouchableOpacity
                style={[GlobalStyles.secondaryButton, styles.actionButton]}
                onPress={getAppInfo}
              >
                <Text style={GlobalStyles.buttonText}>Open</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Delete All Data */}
          <View style={[GlobalStyles.card, styles.settingCard]}>
            <View style={styles.settingCardContent}>
              <View style={styles.settingHeader}>
                <Text style={styles.settingIcon}>🗑️</Text>
                <Text style={GlobalStyles.cardTitle}>Delete All Data</Text>
              </View>
              <Text style={styles.settingDescription}>
                Permanently delete all stored data
              </Text>
            </View>
            <View style={styles.settingButton}>
              <TouchableOpacity
                style={[GlobalStyles.dangerButton, styles.actionButton]}
                onPress={handleDeleteAllData}
              >
                <Text style={GlobalStyles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About This App</Text>
          <Text style={styles.infoText}>
            This prescription management system is designed for Dr. P. Hira's personal medical practice. 
            It helps streamline patient management and prescription creation while maintaining the highest 
            standards of data security and privacy.
          </Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>

        {/* Delete Confirmation Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={deleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={GlobalStyles.modalOverlay}>
            <View style={GlobalStyles.modalContent}>
              <Text style={GlobalStyles.modalTitle}>Delete All Data</Text>
              
              <Text style={styles.warningText}>
                ⚠️ This action cannot be undone!
                
                This will permanently delete all patient records, 
                prescription presets, and app data.
                
                Type "delete" below to confirm:
              </Text>
              
              <TextInput
                style={GlobalStyles.input}
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                placeholder="Type 'delete' to confirm"
                placeholderTextColor={Colors.textLight}
              />
              
              <View style={GlobalStyles.modalButtonContainer}>
                <TouchableOpacity
                  style={[GlobalStyles.modalButton, GlobalStyles.lightButton]}
                  onPress={() => {
                    setDeleteModalVisible(false);
                    setDeleteConfirmText('');
                  }}
                >
                  <Text style={GlobalStyles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[GlobalStyles.modalButton, GlobalStyles.dangerButton]}
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
      </ScrollView>
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
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: -10,
    marginBottom: 24,
  },

  // Settings Styles
  settingsContainer: {
    gap: 12,
    marginBottom: 24,
  },

  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderLeftColor: Colors.lightBlue,
    borderLeftWidth: 4,
  },

  settingCardContent: {
    flex: 1,
  },

  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  settingDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  settingButton: {
    marginLeft: 12,
  },

  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 70,
  },

  // Info Section Styles
  infoSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryBlue,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primaryBlue,
    marginBottom: 8,
  },

  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
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
    marginBottom: 16,
    lineHeight: 20,
  },
});

export default SettingsScreen;