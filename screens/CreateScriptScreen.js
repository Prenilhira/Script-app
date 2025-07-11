import React from 'react';
import { 
  Alert, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  Modal,
  Platform,
  Linking,
  ActivityIndicator,
  Image
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalStyles, Colors } from '../GlobalStyles';
import { PatientDataManager } from './PatientListScreen';

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

function CreateScriptScreen({ navigation, route }) {
  // States
  const [date, setDate] = React.useState(new Date());
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [age, setAge] = React.useState('');
  const [selectedPatient, setSelectedPatient] = React.useState(null);
  const [customPatientName, setCustomPatientName] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [prescription, setPrescription] = React.useState('');
  const [selectedPreset, setSelectedPreset] = React.useState(null);
  const [customPrescription, setCustomPrescription] = React.useState('');
  
  // Dropdown states
  const [showPatientDropdown, setShowPatientDropdown] = React.useState(false);
  const [showPresetDropdown, setShowPresetDropdown] = React.useState(false);
  const [useCustomPatient, setUseCustomPatient] = React.useState(false);
  const [useCustomPrescription, setUseCustomPrescription] = React.useState(false);
  
  // Data states
  const [patients, setPatients] = React.useState([]);
  const [presets, setPresets] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  
  // Refs
  const prescriptionRef = React.useRef();

  // Load data on mount
  React.useEffect(() => {
    loadData();
  }, []);

  // Handle preset from navigation (when coming from PresetPrescriptionScreen)
  React.useEffect(() => {
    if (route.params?.preset) {
      setSelectedPreset(route.params.preset);
      setPrescription(formatPresetPrescription(route.params.preset));
      setUseCustomPrescription(false);
    }
  }, [route.params]);

  const loadData = async () => {
    try {
      // Load patients
      const patientsData = await PatientDataManager.getPatients();
      setPatients(patientsData);

      // Load presets
      const storedPresets = await AsyncStorage.getItem(PRESETS_STORAGE_KEY);
      if (storedPresets) {
        setPresets(JSON.parse(storedPresets));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const formatPresetPrescription = (preset) => {
    let formatted = `Diagnosis: ${preset.diagnosis}\n\nMedications:\n`;
    preset.medications.forEach((med, index) => {
      formatted += `${index + 1}. ${med.name} ${med.dose}\n   ${med.direction}\n   Quantity: ${med.quantity}\n\n`;
    });
    return formatted;
  };

  const formatDate = (dateObj) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return dateObj.toLocaleDateString('en-US', options);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setUseCustomPatient(false);
    setShowPatientDropdown(false);
    setAddress(`${patient.name} ${patient.surname}`);
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    setPrescription(formatPresetPrescription(preset));
    setUseCustomPrescription(false);
    setShowPresetDropdown(false);
  };

  const generatePrescription = async () => {
    try {
      setLoading(true);
      
      // Capture the prescription as image
      const uri = await captureRef(prescriptionRef, {
        format: 'jpg',
        quality: 1.0,
      });
      
      setLoading(false);
      
      // Show export options
      Alert.alert(
        'Prescription Generated',
        'Choose how to share the prescription:',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'WhatsApp', 
            onPress: () => exportToWhatsApp(uri)
          },
          { 
            text: 'Email', 
            onPress: () => exportToEmail(uri)
          }
        ]
      );
    } catch (error) {
      setLoading(false);
      console.error('Error generating prescription:', error);
      Alert.alert('Error', 'Failed to generate prescription');
    }
  };

  const exportToWhatsApp = async (imageUri) => {
    try {
      const patientName = selectedPatient 
        ? `${selectedPatient.name} ${selectedPatient.surname}` 
        : customPatientName;
      
      if (!patientName) {
        Alert.alert('Error', 'Please select or enter a patient name first');
        return;
      }

      // Check if patient has a cell number for WhatsApp direct link
      if (selectedPatient && selectedPatient.cellNumber) {
        // Format cell number for WhatsApp (remove spaces, dashes, etc.)
        const cleanNumber = selectedPatient.cellNumber.replace(/[^\d]/g, '');
        const whatsappUrl = `whatsapp://send?phone=${cleanNumber}&text=Prescription for ${patientName}`;
        
        // Check if WhatsApp is available
        const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);
        
        if (canOpenWhatsApp) {
          // First share the image
          await Sharing.shareAsync(imageUri, {
            mimeType: 'image/jpeg',
            dialogTitle: `Prescription for ${patientName}`,
          });
          
          // Then open WhatsApp chat with the patient
          setTimeout(() => {
            Linking.openURL(whatsappUrl);
          }, 1000);
        } else {
          // Fallback to general sharing if WhatsApp not available
          await Sharing.shareAsync(imageUri, {
            mimeType: 'image/jpeg',
            dialogTitle: `Prescription for ${patientName}`,
          });
        }
      } else {
        // If no cell number, just share the image normally
        await Sharing.shareAsync(imageUri, {
          mimeType: 'image/jpeg',
          dialogTitle: `Prescription for ${patientName}`,
        });
        
        // Inform user about adding cell number for direct WhatsApp
        if (selectedPatient) {
          Alert.alert(
            'WhatsApp Sharing',
            'Prescription shared! To send directly to patient\'s WhatsApp, add their cell number in Patient Management.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      Alert.alert('Error', 'Failed to share to WhatsApp');
    }
  };

  const exportToEmail = async (imageUri) => {
    try {
      const patientName = selectedPatient 
        ? `${selectedPatient.name} ${selectedPatient.surname}` 
        : customPatientName;
      
      if (!patientName) {
        Alert.alert('Error', 'Please select or enter a patient name first');
        return;
      }

      const subject = `Prescription for ${patientName}`;
      const body = `Please find attached prescription for ${patientName}.`;
      
      // Create email URL
      const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Share the image first, then open email
      await Sharing.shareAsync(imageUri, {
        mimeType: 'image/jpeg',
        dialogTitle: subject,
      });
      
      // Open email app
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert('Error', 'No email app found');
      }
    } catch (error) {
      console.error('Error sharing to email:', error);
      Alert.alert('Error', 'Failed to export to email');
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Clear Form',
      'Are you sure you want to clear all fields?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            setDate(new Date());
            setAge('');
            setSelectedPatient(null);
            setCustomPatientName('');
            setAddress('');
            setPrescription('');
            setSelectedPreset(null);
            setCustomPrescription('');
            setUseCustomPatient(false);
            setUseCustomPrescription(false);
          }
        }
      ]
    );
  };

  const getCurrentPrescriptionText = () => {
    if (useCustomPrescription) {
      return customPrescription;
    } else if (selectedPreset) {
      return prescription;
    } else {
      return customPrescription;
    }
  };

  return (
    <TexturedBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Prescription Form */}
        <View style={styles.formContainer}>
          <Text style={GlobalStyles.pageTitle}>Create Prescription</Text>
          
          {/* Date Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Date *</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={onDateChange}
              />
            )}
          </View>

          {/* Age Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Age (Optional)</Text>
            <TextInput
              style={GlobalStyles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Enter patient age"
              keyboardType="numeric"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          {/* Patient Name Selection */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Patient Name *</Text>
            
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, !useCustomPatient && styles.toggleButtonActive]}
                onPress={() => setUseCustomPatient(false)}
              >
                <Text style={[styles.toggleText, !useCustomPatient && styles.toggleTextActive]}>
                  Select Patient
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, useCustomPatient && styles.toggleButtonActive]}
                onPress={() => setUseCustomPatient(true)}
              >
                <Text style={[styles.toggleText, useCustomPatient && styles.toggleTextActive]}>
                  Custom Name
                </Text>
              </TouchableOpacity>
            </View>

            {!useCustomPatient ? (
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowPatientDropdown(true)}
              >
                <Text style={styles.dropdownText}>
                  {selectedPatient 
                    ? `${selectedPatient.name} ${selectedPatient.surname}` 
                    : 'Select a patient'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            ) : (
              <TextInput
                style={GlobalStyles.input}
                value={customPatientName}
                onChangeText={setCustomPatientName}
                placeholder="Enter patient name"
                placeholderTextColor={Colors.textLight}
              />
            )}
          </View>

          {/* Address Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Address</Text>
            <TextInput
              style={[GlobalStyles.input, styles.multilineInput]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter patient address"
              multiline
              numberOfLines={3}
              placeholderTextColor={Colors.textLight}
            />
          </View>

          {/* Prescription Content */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Prescription Content *</Text>
            
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, !useCustomPrescription && styles.toggleButtonActive]}
                onPress={() => setUseCustomPrescription(false)}
              >
                <Text style={[styles.toggleText, !useCustomPrescription && styles.toggleTextActive]}>
                  Use Preset
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, useCustomPrescription && styles.toggleButtonActive]}
                onPress={() => setUseCustomPrescription(true)}
              >
                <Text style={[styles.toggleText, useCustomPrescription && styles.toggleTextActive]}>
                  Custom
                </Text>
              </TouchableOpacity>
            </View>

            {!useCustomPrescription ? (
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowPresetDropdown(true)}
              >
                <Text style={styles.dropdownText}>
                  {selectedPreset ? selectedPreset.diagnosis : 'Select a preset prescription'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            ) : null}

            <TextInput
              style={[GlobalStyles.input, styles.prescriptionInput]}
              value={useCustomPrescription ? customPrescription : prescription}
              onChangeText={useCustomPrescription ? setCustomPrescription : setPrescription}
              placeholder="Enter prescription details..."
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[GlobalStyles.primaryButton, styles.generateButton]}
              onPress={generatePrescription}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={GlobalStyles.buttonText}>Generate Prescription</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[GlobalStyles.lightButton, styles.clearButton]}
              onPress={handleClear}
            >
              <Text style={GlobalStyles.buttonText}>Clear Form</Text>
            </TouchableOpacity>
          </View>
        </View>

                  {/* Hidden Prescription Layout for Capture */}
        <View style={styles.hiddenContainer}>
          <View ref={prescriptionRef} style={styles.prescriptionContainer}>
            {/* Header */}
            <View style={styles.headerSection}>
              <Text style={styles.practiceTitle}>DR P. HIRA INC.</Text>
              <Text style={styles.practiceNumber}>PR. NO 0929484</Text>
              
              <View style={styles.contactInfo}>
                <View style={styles.leftContact}>
                  <Text style={styles.contactText}>Consulting rooms :</Text>
                  <Text style={styles.contactText}>5/87 Dunswart Avenue</Text>
                  <Text style={styles.contactText}>Dunswart, Boksburg, 1459</Text>
                  <Text style={styles.contactText}>PO Box 18131</Text>
                  <Text style={styles.contactText}>Actonville, Benoni, 1501</Text>
                </View>
                <View style={styles.rightContact}>
                  <Text style={styles.contactText}>Tel: 010 493 3544</Text>
                  <Text style={styles.contactText}>Tel: 011 914 3093</Text>
                  <Text style={styles.contactText}>Cell: 060 557 3625</Text>
                  <Text style={styles.contactText}>e-mail: info@drhirainc.com</Text>
                </View>
              </View>
            </View>

            {/* Patient Information */}
            <View style={styles.patientSection}>
              <View style={styles.patientInfoRow}>
                <View style={styles.dateField}>
                  <Text style={styles.patientFieldLabel}>Date:</Text>
                  <View style={styles.underline}>
                    <Text style={styles.patientFieldValue}>{formatDate(date)}</Text>
                  </View>
                </View>
                <View style={styles.ageField}>
                  <Text style={styles.patientFieldLabel}>Age of Minor:</Text>
                  <View style={styles.underline}>
                    <Text style={styles.patientFieldValue}>{age || ''}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.nameField}>
                <Text style={styles.patientFieldLabel}>Name:</Text>
                <View style={styles.underline}>
                  <Text style={styles.patientFieldValue}>
                    {selectedPatient 
                      ? `${selectedPatient.name} ${selectedPatient.surname}` 
                      : customPatientName}
                  </Text>
                </View>
              </View>
              
              <View style={styles.addressField}>
                <Text style={styles.patientFieldLabel}>Address :</Text>
                <View style={styles.underline}>
                  <Text style={styles.patientFieldValue}>{address || ''}</Text>
                </View>
              </View>
            </View>

            {/* Prescription Content */}
            <View style={styles.rxSection}>
              <Text style={styles.rxLabel}>Rx :</Text>
              <View style={styles.rxContentContainer}>
                <Text style={styles.rxContent}>{getCurrentPrescriptionText()}</Text>
              </View>
            </View>

            {/* Signature Section */}
            <View style={styles.signatureMainSection}>
              <Text style={styles.signedText}>Signed</Text>
              <Text style={styles.signedDoctor}>Dr P Hira</Text>
              <Text style={styles.signedQualification}>MBBCh</Text>
              
              {/* Signature image placeholder */}
              <View style={styles.signatureImageContainer}>
                {/* TODO: Replace with actual signature image */}
                {/* 
              // Replace the signature placeholder with:
              <Image 
                source={require('../assets/signature.png')} 
                style={styles.signatureImage}
                resizeMode="contain"
              />
                */}
                <View style={styles.signaturePlaceholder}>
                  <Text style={styles.signatureText}>Signature</Text>
                </View>
              </View>
            </View>

            {/* Bottom Doctors Section */}
            <View style={styles.bottomDoctorsSection}>
              <View style={styles.bottomDoctorLeft}>
                <Text style={styles.bottomDoctorName}>Dr P.Hira</Text>
                <Text style={styles.bottomDoctorQualification}>MBBCH(Wits)</Text>
              </View>
              <View style={styles.bottomDoctorRight}>
                <Text style={styles.bottomDoctorName}>Dr. H.E. Foster</Text>
                <Text style={styles.bottomDoctorQualification}>MBBCH(Wits)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Patient Selection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showPatientDropdown}
          onRequestClose={() => setShowPatientDropdown(false)}
        >
          <View style={GlobalStyles.modalOverlay}>
            <View style={GlobalStyles.modalContent}>
              <Text style={GlobalStyles.modalTitle}>Select Patient</Text>
              
              <ScrollView style={styles.modalList}>
                {patients.map((patient) => (
                  <TouchableOpacity
                    key={patient.id}
                    style={styles.modalItem}
                    onPress={() => handlePatientSelect(patient)}
                  >
                    <Text style={styles.modalItemText}>
                      {patient.name} {patient.surname}
                    </Text>
                  </TouchableOpacity>
                ))}
                
                {patients.length === 0 && (
                  <Text style={styles.emptyText}>No patients found</Text>
                )}
              </ScrollView>
              
              <TouchableOpacity
                style={[GlobalStyles.lightButton, styles.modalCloseButton]}
                onPress={() => setShowPatientDropdown(false)}
              >
                <Text style={GlobalStyles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Preset Selection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showPresetDropdown}
          onRequestClose={() => setShowPresetDropdown(false)}
        >
          <View style={GlobalStyles.modalOverlay}>
            <View style={GlobalStyles.modalContent}>
              <Text style={GlobalStyles.modalTitle}>Select Preset Prescription</Text>
              
              <ScrollView style={styles.modalList}>
                {presets.map((preset) => (
                  <TouchableOpacity
                    key={preset.id}
                    style={styles.modalItem}
                    onPress={() => handlePresetSelect(preset)}
                  >
                    <Text style={styles.modalItemText}>{preset.diagnosis}</Text>
                    <Text style={styles.modalItemSubtext}>
                      {preset.medications.length} medication{preset.medications.length !== 1 ? 's' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
                
                {presets.length === 0 && (
                  <Text style={styles.emptyText}>No presets found</Text>
                )}
              </ScrollView>
              
              <TouchableOpacity
                style={[GlobalStyles.lightButton, styles.modalCloseButton]}
                onPress={() => setShowPresetDropdown(false)}
              >
                <Text style={GlobalStyles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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

  // Main Container
  container: {
    flex: 1,
    padding: 20,
  },

  formContainer: {
    marginBottom: 40,
  },

  // Field Styles
  fieldContainer: {
    marginBottom: 20,
  },

  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },

  // Date Picker Styles
  dateButton: {
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
  },

  dateText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },

  // Toggle Styles
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundGrey,
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },

  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },

  toggleButtonActive: {
    backgroundColor: Colors.primaryBlue,
  },

  toggleText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  toggleTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },

  // Dropdown Styles
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    marginBottom: 12,
  },

  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },

  dropdownArrow: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Input Styles
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  prescriptionInput: {
    minHeight: 150,
    textAlignVertical: 'top',
  },

  // Action Buttons
  actionButtons: {
    gap: 12,
    marginTop: 20,
  },

  generateButton: {
    paddingVertical: 16,
  },

  clearButton: {
    paddingVertical: 16,
  },

  // Hidden Prescription Layout
  hiddenContainer: {
    position: 'absolute',
    left: -9999,
    top: -9999,
  },

  prescriptionContainer: {
    backgroundColor: Colors.white,
    width: 600,
    padding: 30,
  },

  // Header Section
  headerSection: {
    borderWidth: 2,
    borderColor: '#000',
    padding: 20,
    marginBottom: 30,
  },

  practiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },

  practiceNumber: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#000',
  },

  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  leftContact: {
    flex: 1,
  },

  rightContact: {
    flex: 1,
    alignItems: 'flex-end',
  },

  contactText: {
    fontSize: 14,
    marginBottom: 3,
    color: '#000',
  },

  // Patient Section
  patientSection: {
    marginBottom: 30,
    paddingHorizontal: 10,
  },

  patientInfoRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end',
  },

  dateField: {
    flex: 2,
    marginRight: 30,
  },

  ageField: {
    flex: 1,
  },

  nameField: {
    marginBottom: 20,
  },

  addressField: {
    marginBottom: 0,
  },

  patientFieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 5,
  },

  underline: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minHeight: 25,
    paddingBottom: 2,
    justifyContent: 'flex-end',
  },

  patientFieldValue: {
    fontSize: 16,
    color: '#000',
    minHeight: 20,
  },

  // Prescription Section
  rxSection: {
    marginBottom: 60,
    paddingHorizontal: 10,
  },

  rxLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },

  rxContentContainer: {
    minHeight: 150,
  },

  rxContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
  },

  // Signature Section
  signatureMainSection: {
    paddingHorizontal: 10,
    marginBottom: 40,
    alignItems: 'flex-start',
  },

  signedText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 5,
  },

  signedDoctor: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 5,
  },

  signedQualification: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 15,
  },

  signatureImageContainer: {
    width: 120,
    height: 60,
    marginBottom: 20,
  },

  signatureImage: {
    width: 120,
    height: 60,
  },

  signaturePlaceholder: {
    width: 120,
    height: 60,
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },

  signatureText: {
    fontSize: 12,
    color: Colors.textLight,
  },

  // Bottom Doctors Section
  bottomDoctorsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 15,
    paddingHorizontal: 10,
  },

  bottomDoctorLeft: {
    alignItems: 'center',
  },

  bottomDoctorRight: {
    alignItems: 'center',
  },

  bottomDoctorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },

  bottomDoctorQualification: {
    fontSize: 12,
    color: '#000',
    textAlign: 'center',
  },

  // Modal Styles
  modalList: {
    maxHeight: 300,
    marginBottom: 20,
  },

  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGrey,
  },

  modalItemText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },

  modalItemSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  modalCloseButton: {
    paddingVertical: 12,
  },

  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default CreateScriptScreen;