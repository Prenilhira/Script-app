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

const PRESETS_STORAGE_KEY = '@prescription_presets';
const PATIENTS_STORAGE_KEY = '@patients_data';

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

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load patients
      const storedPatients = await AsyncStorage.getItem(PATIENTS_STORAGE_KEY);
      if (storedPatients) {
        setPatients(JSON.parse(storedPatients));
      }

      // Load presets
      const storedPresets = await AsyncStorage.getItem(PRESETS_STORAGE_KEY);
      if (storedPresets) {
        setPresets(JSON.parse(storedPresets));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const formatDate = (date) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setShowPatientDropdown(false);
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    
    // Format prescription from preset
    let prescriptionText = '';
    preset.medications.forEach((medication, index) => {
      prescriptionText += `${index + 1}. ${medication.name} ${medication.dose}\n   ${medication.direction}\n   Quantity: ${medication.quantity}\n\n`;
    });
    
    setPrescription(prescriptionText.trim());
    setShowPresetDropdown(false);
  };

  const validateForm = () => {
    if (!useCustomPatient && !selectedPatient) {
      Alert.alert('Error', 'Please select a patient or use custom name.');
      return false;
    }
    
    if (useCustomPatient && !customPatientName.trim()) {
      Alert.alert('Error', 'Please enter a patient name.');
      return false;
    }

    const prescriptionText = useCustomPrescription ? customPrescription : prescription;
    if (!prescriptionText.trim()) {
      Alert.alert('Error', 'Please enter prescription details.');
      return false;
    }

    return true;
  };

  const generatePrescription = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Capture the prescription as image
      const uri = await captureRef(prescriptionRef, {
        format: 'png',
        quality: 1.0,
      });

      // Share or save the prescription
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share Prescription',
        });
      } else {
        Alert.alert('Success', 'Prescription generated successfully!');
      }
    } catch (error) {
      console.error('Error generating prescription:', error);
      Alert.alert('Error', 'Failed to generate prescription. Please try again.');
    } finally {
      setLoading(false);
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
            setAge('');
            setSelectedPatient(null);
            setCustomPatientName('');
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

  const getPatientName = () => {
    if (useCustomPatient) {
      return customPatientName;
    }
    return selectedPatient ? `${selectedPatient.name} ${selectedPatient.surname}` : '';
  };

  const getPrescriptionText = () => {
    return useCustomPrescription ? customPrescription : prescription;
  };

  return (
    <TexturedBackground>
      <ScrollView style={GlobalStyles.padding} showsVerticalScrollIndicator={false}>
        <Text style={GlobalStyles.pageTitle}>Create Prescription</Text>

        {/* Form Fields */}
        <View style={styles.formContainer}>
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

            {!useCustomPrescription && (
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowPresetDropdown(true)}
              >
                <Text style={styles.dropdownText}>
                  {selectedPreset ? selectedPreset.diagnosis : 'Select a preset prescription'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            )}

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
              <Text style={styles.practiceNumber}>PR. NO: 0860000123456</Text>
              
              <View style={styles.contactInfo}>
                <View style={styles.leftContact}>
                  <Text style={styles.contactText}>📞 011 123 4567</Text>
                  <Text style={styles.contactText}>📧 admin@drhira.co.za</Text>
                </View>
                <View style={styles.rightContact}>
                  <Text style={styles.contactText}>123 Medical Street</Text>
                  <Text style={styles.contactText}>Johannesburg, 2000</Text>
                </View>
              </View>
            </View>

            {/* Patient Section */}
            <View style={styles.patientSection}>
              <View style={styles.patientInfoRow}>
                <View style={styles.dateField}>
                  <Text style={styles.patientFieldLabel}>Date:</Text>
                  <View style={styles.underline}>
                    <Text style={styles.patientFieldValue}>{formatDate(date)}</Text>
                  </View>
                </View>
                
                {age ? (
                  <View style={styles.ageField}>
                    <Text style={styles.patientFieldLabel}>Age:</Text>
                    <View style={styles.underline}>
                      <Text style={styles.patientFieldValue}>{age}</Text>
                    </View>
                  </View>
                ) : null}
              </View>

              <View style={styles.nameField}>
                <Text style={styles.patientFieldLabel}>Patient Name:</Text>
                <View style={styles.underline}>
                  <Text style={styles.patientFieldValue}>{getPatientName()}</Text>
                </View>
              </View>
            </View>

            {/* Prescription Section */}
            <View style={styles.rxSection}>
              <Text style={styles.rxLabel}>℞</Text>
              <View style={styles.rxContentContainer}>
                <Text style={styles.rxContent}>{getPrescriptionText()}</Text>
              </View>
            </View>

            {/* Signature Section */}
            <View style={styles.signatureMainSection}>
              <Text style={styles.signedText}>_____________________</Text>
              <Text style={styles.bottomDoctorName}>Dr. P. Hira</Text>
              <Text style={styles.bottomDoctorQualification}>MBBCH(Wits)</Text>
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

  // Form Styles
  formContainer: {
    gap: 16,
    marginBottom: 20,
  },

  fieldContainer: {
    marginBottom: 8,
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: Colors.textPrimary,
  },

  // Date Button
  dateButton: {
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    borderRadius: 10,
    paddingVertical: 12,
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
    marginBottom: 8,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    marginBottom: 8,
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
  prescriptionInput: {
    minHeight: 120,
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },

  practiceNumber: {
    fontSize: 14,
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
    fontSize: 12,
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
    marginBottom: 0,
  },

  patientFieldLabel: {
    fontSize: 14,
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
    fontSize: 14,
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
    fontSize: 14,
    lineHeight: 20,
    color: '#000',
  },

  // Signature Section
  signatureMainSection: {
    paddingHorizontal: 10,
    alignItems: 'flex-end',
  },

  signedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 10,
  },

  bottomDoctorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },

  bottomDoctorQualification: {
    fontSize: 12,
    color: '#000',
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
  },

  modalItemSubtext: {
    fontSize: 12,
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