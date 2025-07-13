import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  Linking,
  Image,
  StyleSheet,
  Share,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureRef } from 'react-native-view-shot';
import { GlobalStyles, Colors } from '../GlobalStyles';

// Correct storage keys to match other screens
const PATIENTS_STORAGE_KEY = '@patients_data';
const PRESETS_STORAGE_KEY = '@prescription_presets';

// Prescription template background component
const PrescriptionTemplate = ({ children, style }) => (
  <View style={[styles.prescriptionTemplate, style]}>
    {/* Professional prescription background with letterhead design */}
    <View style={styles.prescriptionContent}>
      {children}
    </View>
  </View>
);

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

function CreateScriptScreen({ navigation }) {
  // Form State
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [age, setAge] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [customPatientName, setCustomPatientName] = useState('');
  const [prescription, setPrescription] = useState('');
  const [customPrescription, setCustomPrescription] = useState('');
  
  // Toggle States
  const [useCustomPatient, setUseCustomPatient] = useState(false);
  const [useCustomPrescription, setUseCustomPrescription] = useState(false);
  
  // Dropdown States
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  
  // Data State
  const [patients, setPatients] = useState([]);
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  
  // Refs
  const prescriptionRef = useRef();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading data...');
      
      // Load patients
      const storedPatients = await AsyncStorage.getItem(PATIENTS_STORAGE_KEY);
      if (storedPatients) {
        const patientsData = JSON.parse(storedPatients);
        console.log('Loaded patients:', patientsData.length);
        setPatients(patientsData);
      } else {
        console.log('No patients found in storage');
      }

      // Load presets
      const storedPresets = await AsyncStorage.getItem(PRESETS_STORAGE_KEY);
      if (storedPresets) {
        const presetsData = JSON.parse(storedPresets);
        console.log('Loaded presets:', presetsData.length);
        setPresets(presetsData);
      } else {
        console.log('No presets found in storage');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load patient and preset data.');
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

  const showPreview = () => {
    if (!validateForm()) return;
    setPreviewModalVisible(true);
  };

  const captureAndSavePrescription = async () => {
    try {
      // Capture the prescription as image
      const uri = await captureRef(prescriptionRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      return uri;
    } catch (error) {
      console.error('Error capturing prescription:', error);
      throw error;
    }
  };

  const exportToWhatsApp = async () => {
    try {
      setLoading(true);
      
      const imageUri = await captureAndSavePrescription();
      const patientName = useCustomPatient ? customPatientName : 
                         selectedPatient ? `${selectedPatient.name} ${selectedPatient.surname}` : 'Patient';

      const message = `Prescription for ${patientName} - ${formatDate(date)}`;
      
      // Use React Native Share API
      await Share.share({
        title: 'Share Prescription via WhatsApp',
        message: message,
        url: imageUri,
      });
      
      setPreviewModalVisible(false);
    } catch (error) {
      console.error('Error exporting to WhatsApp:', error);
      Alert.alert('Error', 'Failed to export to WhatsApp. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportToEmail = async () => {
    try {
      setLoading(true);
      
      const imageUri = await captureAndSavePrescription();
      const patientName = useCustomPatient ? customPatientName : 
                         selectedPatient ? `${selectedPatient.name} ${selectedPatient.surname}` : 'Patient';

      const subject = `Prescription for ${patientName}`;
      const body = `Please find attached the prescription for ${patientName} dated ${formatDate(date)}.`;
      
      // Use React Native Share API
      await Share.share({
        title: 'Share Prescription via Email',
        message: `${subject}\n\n${body}`,
        url: imageUri,
      });
      
      setPreviewModalVisible(false);
    } catch (error) {
      console.error('Error exporting to email:', error);
      Alert.alert('Error', 'Failed to export to email. Please try again.');
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
            setDate(new Date());
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

  const renderPatientDropdown = () => {
    if (!showPatientDropdown || patients.length === 0) return null;
    
    return (
      <View style={styles.dropdownContainer}>
        <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled>
          {patients.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              style={styles.dropdownItem}
              onPress={() => handlePatientSelect(patient)}
            >
              <Text style={styles.dropdownItemText}>
                {patient.name} {patient.surname}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderPresetDropdown = () => {
    if (!showPresetDropdown || presets.length === 0) return null;
    
    return (
      <View style={styles.dropdownContainer}>
        <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled>
          {presets.map((preset) => (
            <TouchableOpacity
              key={preset.id}
              style={styles.dropdownItem}
              onPress={() => handlePresetSelect(preset)}
            >
              <Text style={styles.dropdownItemText}>
                {preset.diagnosis}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderPrescriptionPreview = () => (
    <PrescriptionTemplate ref={prescriptionRef} style={styles.prescriptionContainer}>
      {/* Professional Header */}
      <View style={styles.headerSection}>
        <View style={styles.practiceHeader}>
          <Text style={styles.practiceTitle}>DR P. HIRA INC.</Text>
          <View style={styles.headerDivider} />
          <Text style={styles.practiceNumber}>PR. NO: 0929484</Text>
        </View>
        
        <View style={styles.contactSection}>
          <View style={styles.contactColumn}>
            <Text style={styles.contactTitle}>Consulting Rooms:</Text>
            <Text style={styles.contactText}>5/87 Dunswart Avenue</Text>
            <Text style={styles.contactText}>Dunswart, Boksburg, 1459</Text>
            <Text style={styles.contactText}>PO Box 18131</Text>
            <Text style={styles.contactText}>Actonville, Benoni, 1501</Text>
          </View>
          <View style={styles.contactColumn}>
            <Text style={styles.contactTitle}>Contact Details:</Text>
            <Text style={styles.contactText}>Tel: 010 493 3544</Text>
            <Text style={styles.contactText}>Tel: 011 914 3093</Text>
            <Text style={styles.contactText}>Cell: 060 557 3625</Text>
            <Text style={styles.contactText}>Email: info@drhirainc.com</Text>
          </View>
        </View>
      </View>

      {/* Patient Details Section */}
      <View style={styles.patientSection}>
        <View style={styles.patientRow}>
          <View style={styles.dateSection}>
            <Text style={styles.fieldLabel}>Date:</Text>
            <Text style={styles.fieldValue}>{formatDate(date)}</Text>
          </View>
          
          {age ? (
            <View style={styles.ageSection}>
              <Text style={styles.fieldLabel}>Age of Minor:</Text>
              <Text style={styles.fieldValue}>{age}</Text>
            </View>
          ) : null}
        </View>
        
        <View style={styles.patientRow}>
          <Text style={styles.fieldLabel}>Name:</Text>
          <Text style={styles.fieldValue}>
            {useCustomPatient ? customPatientName : 
             selectedPatient ? `${selectedPatient.name} ${selectedPatient.surname}` : ''}
          </Text>
        </View>
      </View>

      {/* Prescription Section */}
      <View style={styles.rxSection}>
        <Text style={styles.rxSymbol}>℞</Text>
        <View style={styles.prescriptionArea}>
          <Text style={styles.prescriptionText}>
            {useCustomPrescription ? customPrescription : prescription}
          </Text>
        </View>
      </View>

      {/* Signature Section */}
      <View style={styles.signatureSection}>
        <View style={styles.doctorSignature}>
          <View style={styles.signatureLine} />
          <Text style={styles.doctorName}>Dr P. Hira</Text>
          <Text style={styles.doctorCredentials}>MBBCH(Wits)</Text>
        </View>
        <View style={styles.doctorSignature}>
          <View style={styles.signatureLine} />
          <Text style={styles.doctorName}>Dr. H.E. Foster</Text>
          <Text style={styles.doctorCredentials}>MBBCH(Wits)</Text>
        </View>
      </View>
    </PrescriptionTemplate>
  );

  return (
    <TexturedBackground>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={GlobalStyles.padding}>
          
          {/* Date Section */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Date *</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
          </View>

          {/* Age Section */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Age of Minor (if applicable)</Text>
            <TextInput
              style={GlobalStyles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Enter age"
              placeholderTextColor={Colors.textLight}
              keyboardType="numeric"
            />
          </View>

          {/* Patient Selection Section */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Patient *</Text>
            
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !useCustomPatient && styles.toggleButtonActive
                ]}
                onPress={() => setUseCustomPatient(false)}
              >
                <Text style={[
                  styles.toggleText,
                  !useCustomPatient && styles.toggleTextActive
                ]}>
                  Select Patient
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  useCustomPatient && styles.toggleButtonActive
                ]}
                onPress={() => setUseCustomPatient(true)}
              >
                <Text style={[
                  styles.toggleText,
                  useCustomPatient && styles.toggleTextActive
                ]}>
                  Custom Name
                </Text>
              </TouchableOpacity>
            </View>

            {!useCustomPatient ? (
              <View>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowPatientDropdown(!showPatientDropdown)}
                >
                  <Text style={styles.dropdownText}>
                    {selectedPatient ? `${selectedPatient.name} ${selectedPatient.surname}` : 
                     patients.length > 0 ? 'Select a patient' : 'No patients available'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
                {renderPatientDropdown()}
              </View>
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

          {/* Prescription Section */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Prescription Content *</Text>
            
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !useCustomPrescription && styles.toggleButtonActive
                ]}
                onPress={() => setUseCustomPrescription(false)}
              >
                <Text style={[
                  styles.toggleText,
                  !useCustomPrescription && styles.toggleTextActive
                ]}>
                  Use Preset
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  useCustomPrescription && styles.toggleButtonActive
                ]}
                onPress={() => setUseCustomPrescription(true)}
              >
                <Text style={[
                  styles.toggleText,
                  useCustomPrescription && styles.toggleTextActive
                ]}>
                  Custom
                </Text>
              </TouchableOpacity>
            </View>

            {!useCustomPrescription && (
              <View>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowPresetDropdown(!showPresetDropdown)}
                >
                  <Text style={styles.dropdownText}>
                    {selectedPreset ? selectedPreset.diagnosis : 
                     presets.length > 0 ? 'Select a preset prescription' : 'No presets available'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
                {renderPresetDropdown()}
              </View>
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
              onPress={showPreview}
            >
              <Text style={GlobalStyles.buttonText}>Preview Prescription</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[GlobalStyles.lightButton, styles.clearButton]}
              onPress={handleClear}
            >
              <Text style={GlobalStyles.buttonText}>Clear Form</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Preview Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={previewModalVisible}
        onRequestClose={() => setPreviewModalVisible(false)}
      >
        <View style={styles.previewModalContainer}>
          {/* Modal Header */}
          <View style={styles.previewModalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setPreviewModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.previewModalTitle}>Prescription Preview</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Prescription Preview */}
          <ScrollView style={styles.previewScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.previewContainer}>
              {renderPrescriptionPreview()}
            </View>
          </ScrollView>

          {/* Export Buttons */}
          <View style={styles.exportButtonsContainer}>
            <TouchableOpacity
              style={[styles.exportButton, styles.whatsappButton]}
              onPress={exportToWhatsApp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <>
                  <Text style={styles.exportButtonIcon}>💬</Text>
                  <Text style={styles.exportButtonText}>Export to WhatsApp</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.exportButton, styles.emailButton]}
              onPress={exportToEmail}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <>
                  <Text style={styles.exportButtonIcon}>📧</Text>
                  <Text style={styles.exportButtonText}>Export to Email</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Hidden Prescription Layout for Capture */}
      <View style={styles.hiddenContainer}>
        {renderPrescriptionPreview()}
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

  scrollView: {
    flex: 1,
  },

  // Form Styles
  section: {
    marginBottom: 20,
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

  dropdownContainer: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    borderRadius: 8,
    marginBottom: 8,
    maxHeight: 150,
  },

  dropdownScrollView: {
    maxHeight: 150,
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGrey,
  },

  dropdownItemText: {
    fontSize: 14,
    color: Colors.textPrimary,
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
    marginBottom: 40,
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

  // Prescription Template Styles
  prescriptionTemplate: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  prescriptionContent: {
    padding: 0,
  },

  prescriptionContainer: {
    width: 800,
    minHeight: 600,
    padding: 30,
    backgroundColor: '#ffffff',
  },

  // Header Section
  headerSection: {
    borderWidth: 2,
    borderColor: '#1e3a8a',
    borderRadius: 8,
    padding: 20,
    marginBottom: 25,
    backgroundColor: '#fafbff',
  },

  practiceHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },

  practiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    letterSpacing: 1,
  },

  headerDivider: {
    width: 60,
    height: 3,
    backgroundColor: '#1e3a8a',
    marginVertical: 8,
  },

  practiceNumber: {
    fontSize: 12,
    color: '#64748b',
    letterSpacing: 1,
  },

  contactSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  contactColumn: {
    flex: 1,
  },

  contactTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 4,
  },

  contactText: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 1,
  },

  // Patient Section
  patientSection: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#1e3a8a',
  },

  patientRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },

  dateSection: {
    flex: 1,
    marginRight: 20,
  },

  ageSection: {
    flex: 1,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginRight: 8,
    minWidth: 50,
  },

  fieldValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 2,
    flex: 1,
  },

  // Prescription Section
  rxSection: {
    flexDirection: 'row',
    marginBottom: 40,
    minHeight: 200,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  rxSymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginRight: 15,
    marginTop: 5,
  },

  prescriptionArea: {
    flex: 1,
    minHeight: 180,
  },

  prescriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },

  // Signature Section
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },

  doctorSignature: {
    alignItems: 'center',
    minWidth: 150,
  },

  signatureLine: {
    width: 120,
    height: 1,
    backgroundColor: '#374151',
    marginBottom: 8,
  },

  doctorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },

  doctorCredentials: {
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
  },

  // Preview Modal Styles
  previewModalContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundGrey,
  },

  previewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.primaryBlue,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },

  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },

  closeButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },

  previewModalTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },

  headerSpacer: {
    width: 40,
  },

  previewScrollView: {
    flex: 1,
  },

  previewContainer: {
    padding: 16,
    alignItems: 'center',
  },

  // Export Buttons
  exportButtonsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderGrey,
  },

  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },

  whatsappButton: {
    backgroundColor: '#25D366',
  },

  emailButton: {
    backgroundColor: '#007BFF',
  },

  exportButtonIcon: {
    fontSize: 16,
  },

  exportButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CreateScriptScreen;