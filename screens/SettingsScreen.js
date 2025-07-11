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

  return (
    <TexturedBackground>
      <ScrollView style={GlobalStyles.padding} showsVerticalScrollIndicator={false}>
        <Text style={GlobalStyles.pageTitle}>Settings</Text>

        {/* Data Management Section */}
        <View style={[GlobalStyles.card, styles.sectionCard]}>
          <Text style={GlobalStyles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity
            style={[GlobalStyles.secondaryButton, styles.settingButton]}
            onPress={handleBackupData}
          >
            <Text style={GlobalStyles.buttonText}>📊 View Data Info</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[GlobalStyles.dangerButton, styles.settingButton, styles.dangerButton]}
            onPress={handleDeleteAllData}
          >
            <Text style={GlobalStyles.buttonText}>🗑️ Delete All Data</Text>
          </TouchableOpacity>
        </View>

        {/* App Information Section */}
        <View style={[GlobalStyles.card, styles.sectionCard]}>
          <Text style={GlobalStyles.sectionTitle}>App Information</Text>
          
          <TouchableOpacity
            style={[GlobalStyles.lightButton, styles.settingButton]}
            onPress={getAppInfo}
          >
            <Text style={GlobalStyles.buttonText}>ℹ️ About This App</Text>
          </TouchableOpacity>
        </View>

        {/* Future Settings Placeholder */}
        <View style={[GlobalStyles.card, styles.sectionCard, styles.placeholderCard]}>
          <Text style={GlobalStyles.sectionTitle}>More Settings</Text>
          <Text style={styles.placeholderText}>
            Additional settings will be added here as needed.
          </Text>
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
              <Text style={[GlobalStyles.modalTitle, styles.dangerTitle]}>⚠️ Delete All Data</Text>
              
              <Text style={styles.warningText}>
                This will permanently delete ALL patient data and cannot be undone.
              </Text>
              
              <Text style={styles.confirmInstructions}>
                Type "delete" below to confirm:
              </Text>
              
              <TextInput
                style={[GlobalStyles.input, styles.confirmInput]}
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                placeholder="Type: delete"
                placeholderTextColor={Colors.textLight}
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              <View style={GlobalStyles.modalButtonContainer}>
                <TouchableOpacity
                  style={[GlobalStyles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setDeleteModalVisible(false);
                    setDeleteConfirmText('');
                  }}
                  disabled={isDeleting}
                >
                  <Text style={GlobalStyles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    GlobalStyles.modalButton, 
                    GlobalStyles.dangerButton,
                    deleteConfirmText.toLowerCase().trim() !== 'delete' && styles.disabledButton
                  ]}
                  onPress={confirmDeleteAllData}
                  disabled={isDeleting || deleteConfirmText.toLowerCase().trim() !== 'delete'}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color={Colors.white} />
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

  // Component Styles
  sectionCard: {
    marginBottom: 20,
    borderLeftColor: Colors.primaryBlue,
    borderLeftWidth: 5,
  },

  settingButton: {
    marginBottom: 12,
    paddingVertical: 16,
  },

  dangerButton: {
    marginTop: 8,
  },

  placeholderCard: {
    borderLeftColor: Colors.textLight,
    opacity: 0.7,
  },

  placeholderText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },

  // Modal Styles
  dangerTitle: {
    color: Colors.error,
  },

  warningText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    fontWeight: '500',
  },

  confirmInstructions: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontWeight: '600',
  },

  confirmInput: {
    borderColor: Colors.error,
    borderWidth: 2,
    marginBottom: 20,
  },

  cancelButton: {
    backgroundColor: Colors.textGrey,
  },

  disabledButton: {
    backgroundColor: Colors.textLight,
    opacity: 0.5,
  },
});

export default SettingsScreen;