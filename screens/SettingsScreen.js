import React from 'react';
import { 
  Alert, 
  Modal, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalStyles, Colors } from '../GlobalStyles';

const PATIENTS_STORAGE_KEY = '@patients_data';
const PRESETS_STORAGE_KEY = '@prescription_presets';

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
  const [loading, setLoading] = React.useState(false);

  const handleBackupData = async () => {
    try {
      setLoading(true);
      const patients = await AsyncStorage.getItem(PATIENTS_STORAGE_KEY);
      const presets = await AsyncStorage.getItem(PRESETS_STORAGE_KEY);
      
      const patientCount = patients ? JSON.parse(patients).length : 0;
      const presetCount = presets ? JSON.parse(presets).length : 0;
      
      if (patientCount > 0 || presetCount > 0) {
        const message = `Backup Data Summary:\n\n• ${patientCount} patient${patientCount !== 1 ? 's' : ''}\n• ${presetCount} preset${presetCount !== 1 ? 's' : ''}\n\nNote: This is a demonstration of backup functionality. In a real app, this would export or sync your data to cloud storage.`;
        Alert.alert('Data Backup', message);
      } else {
        Alert.alert('No Data', 'No data found to backup.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check data for backup.');
    } finally {
      setLoading(false);
    }
  };

  const getAppInfo = () => {
    Alert.alert(
      'App Information',
      'Dr. P. Hira Prescription App\nVersion: 1.0.0\nPersonal Use Edition\n\nDeveloped for efficient patient management and prescription creation.\n\nThis app helps streamline medical practice workflows while maintaining patient data security and privacy.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleDeleteAllData = () => {
    setDeleteModalVisible(true);
  };

  const confirmDeleteAllData = async () => {
    try {
      setLoading(true);
      await AsyncStorage.multiRemove([PATIENTS_STORAGE_KEY, PRESETS_STORAGE_KEY]);
      setDeleteModalVisible(false);
      Alert.alert(
        'Data Deleted', 
        'All data has been permanently deleted.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Optionally navigate back to home or refresh the app
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to delete data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const settingsItems = [
    {
      id: 1,
      title: 'Backup Data',
      description: 'Backup your patient and prescription data',
      icon: '💾',
      action: handleBackupData,
      buttonText: 'Open',
      buttonStyle: GlobalStyles.primaryButton
    },
    {
      id: 2,
      title: 'App Information',
      description: 'View app version and details',
      icon: 'ℹ️',
      action: getAppInfo,
      buttonText: 'Open',
      buttonStyle: GlobalStyles.secondaryButton
    },
    {
      id: 3,
      title: 'Delete All Data',
      description: 'Permanently delete all stored data',
      icon: '🗑️',
      action: handleDeleteAllData,
      buttonText: 'Delete',
      buttonStyle: GlobalStyles.dangerButton
    }
  ];

  return (
    <TexturedBackground>
      <ScrollView style={GlobalStyles.padding} showsVerticalScrollIndicator={false}>
        <Text style={GlobalStyles.pageTitle}>Settings</Text>
        <Text style={styles.subtitle}>Manage your app preferences and data</Text>

        {/* Settings Options */}
        <View style={styles.settingsContainer}>
          {settingsItems.map((item) => (
            <View key={item.id} style={[GlobalStyles.card, styles.settingCard]}>
              <View style={styles.settingCardContent}>
                <View style={styles.settingHeader}>
                  <View style={styles.settingIconContainer}>
                    <Text style={styles.settingIcon}>{item.icon}</Text>
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingDescription}>{item.description}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.settingButton}>
                <TouchableOpacity
                  style={[item.buttonStyle, styles.actionButton]}
                  onPress={item.action}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Text style={GlobalStyles.buttonText}>{item.buttonText}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* About Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About This App</Text>
          <Text style={styles.infoText}>
            This prescription management system is designed for Dr. P. Hira's personal medical practice. 
            It helps streamline patient management and prescription creation while maintaining the highest 
            standards of data security and privacy.
          </Text>
          <Text style={styles.infoText}>
            The app provides a complete solution for managing patient information, creating standardized 
            prescription presets, and generating professional prescription documents.
          </Text>
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
            <Text style={styles.versionSubtext}>Personal Medical Practice Edition</Text>
          </View>
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
              
              <View style={styles.warningContainer}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.warningTitle}>This action cannot be undone!</Text>
              </View>
              
              <Text style={styles.warningText}>
                This will permanently delete all patient records, 
                prescription presets, and app data.
                
                {'\n\n'}Are you sure you want to continue?
              </Text>
              
              <View style={GlobalStyles.modalButtonContainer}>
                <TouchableOpacity
                  style={[GlobalStyles.modalButton, GlobalStyles.lightButton]}
                  onPress={() => setDeleteModalVisible(false)}
                  disabled={loading}
                >
                  <Text style={GlobalStyles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[GlobalStyles.modalButton, GlobalStyles.dangerButton]}
                  onPress={confirmDeleteAllData}
                  disabled={loading}
                >
                  {loading ? (
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
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },

  settingsContainer: {
    gap: 16,
    marginBottom: 32,
  },

  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accentBlue,
  },

  settingCardContent: {
    flex: 1,
    marginRight: 16,
  },

  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  settingIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: Colors.backgroundGrey,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  settingIcon: {
    fontSize: 24,
  },

  settingTextContainer: {
    flex: 1,
  },

  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },

  settingDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  settingButton: {
    minWidth: 80,
  },

  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 70,
  },

  // About Section
  infoSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryBlue,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primaryBlue,
    marginBottom: 16,
    textAlign: 'center',
  },

  infoText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 12,
  },

  versionContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderGrey,
  },

  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primaryBlue,
    marginBottom: 4,
  },

  versionSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Warning Modal Styles
  warningContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },

  warningIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
    textAlign: 'center',
  },

  warningText: {
    fontSize: 14,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
});

export default SettingsScreen;