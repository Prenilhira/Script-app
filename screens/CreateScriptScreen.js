import React from 'react';
import { 
  Alert, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  Platform,
  ActivityIndicator,
  Dimensions,
  Modal,
  Image,
  Linking,
  Share
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalStyles, Colors } from '../GlobalStyles';
import ViewShot from 'react-native-view-shot';
// import CameraRoll from '@react-native-community/cameraroll';

const PRESETS_STORAGE_KEY = '@prescription_presets';
const PATIENTS_STORAGE_KEY = '@patients_data';

// Get screen dimensions for responsive sizing
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
  const [repeats, setRepeats] = React.useState(0);
  
  // Dropdown states
  const [showPatientDropdown, setShowPatientDropdown] = React.useState(false);
  const [showPresetDropdown, setShowPresetDropdown] = React.useState(false);
  const [useCustomPatient, setUseCustomPatient] = React.useState(false);
  const [useCustomPrescription, setUseCustomPrescription] = React.useState(false);
  
  // Data states
  const [patients, setPatients] = React.useState([]);
  const [presets, setPresets] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  
  // Modal states
  const [showPreviewModal, setShowPreviewModal] = React.useState(false);

  // Ref for capturing prescription view
  const prescriptionRef = React.useRef(null);

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
    // Format as DD/MM/YYYY for prescription template
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
      // Show the preview modal with template
      setShowPreviewModal(true);
      setLoading(false);
      
    } catch (error) {
      console.error('Error generating prescription:', error);
      Alert.alert('Error', 'Failed to generate prescription. Please try again.');
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
            setRepeats(0);
          }
        }
      ]
    );
  };

  const shareViaWhatsApp = async () => {
    try {
      // Capture the prescription as image
      const uri = await captureViewAsImage();
      if (!uri) {
        Alert.alert('Error', 'Failed to capture prescription image');
        return;
      }

      const patientName = useCustomPatient ? customPatientName : 
        (selectedPatient ? `${selectedPatient.name} ${selectedPatient.surname}` : '');
      
      // Get patient's cell number for WhatsApp
      let phoneNumber = '';
      if (selectedPatient && selectedPatient.cellNumber) {
        phoneNumber = selectedPatient.cellNumber.replace(/\D/g, '');
        if (phoneNumber.startsWith('27')) {
          phoneNumber = phoneNumber;
        } else if (phoneNumber.startsWith('0')) {
          phoneNumber = '27' + phoneNumber.substring(1);
        } else if (phoneNumber.length === 9) {
          phoneNumber = '27' + phoneNumber;
        }
      }

      // Use React Native's built-in Share with the file URI
      try {
        const shareResult = await Share.share({
          url: `file://${uri}`,
          title: `Prescription for ${patientName}`,
        });

        // If sharing was successful, open WhatsApp
        if (shareResult.action === Share.sharedAction) {
          setTimeout(async () => {
            let whatsappUrl = phoneNumber ? 
              `whatsapp://send?phone=${phoneNumber}` : 
              'whatsapp://';
            
            const supported = await Linking.canOpenURL(whatsappUrl);
            if (supported) {
              await Linking.openURL(whatsappUrl);
            }
          }, 500);
        }
      } catch (shareError) {
        // Fallback: Save to gallery and open WhatsApp
        Alert.alert(
          'Share Prescription',
          `Prescription captured for ${patientName}. Opening WhatsApp - you can attach the image from your gallery.`,
          [
            {
              text: 'Open WhatsApp',
              onPress: async () => {
                let whatsappUrl = phoneNumber ? 
                  `whatsapp://send?phone=${phoneNumber}` : 
                  'whatsapp://';
                
                const supported = await Linking.canOpenURL(whatsappUrl);
                if (supported) {
                  await Linking.openURL(whatsappUrl);
                } else {
                  Alert.alert('Error', 'WhatsApp is not installed');
                }
              }
            },
            { text: 'Cancel' }
          ]
        );
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to process prescription: ' + error.message);
    }
  };

  const shareViaGmail = async () => {
    try {
      // Capture the prescription as image
      const uri = await captureViewAsImage();
      if (!uri) {
        Alert.alert('Error', 'Failed to capture prescription image');
        return;
      }

      const patientName = useCustomPatient ? customPatientName : 
        (selectedPatient ? `${selectedPatient.name} ${selectedPatient.surname}` : '');
      
      const subject = `Prescription for ${patientName}`;
      const body = `Please find attached original prescription for ${patientName}, for any queries please contact us at 011 914 3093 and ask for Dr P Hira`;
      
      // Use React Native's built-in Share with the file URI
      try {
        const shareResult = await Share.share({
          url: `file://${uri}`,
          title: subject,
          message: body,
        });

        // If sharing was successful, open email client
        if (shareResult.action === Share.sharedAction) {
          setTimeout(async () => {
            const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            const supported = await Linking.canOpenURL(emailUrl);
            if (supported) {
              await Linking.openURL(emailUrl);
            }
          }, 500);
        }
      } catch (shareError) {
        // Fallback: Open email directly
        Alert.alert(
          'Share Prescription',
          `Prescription captured for ${patientName}. Opening email - you can attach the image from your gallery.`,
          [
            {
              text: 'Open Email',
              onPress: async () => {
                const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                const supported = await Linking.canOpenURL(emailUrl);
                if (supported) {
                  await Linking.openURL(emailUrl);
                } else {
                  Alert.alert('Error', 'No email client found');
                }
              }
            },
            { text: 'Cancel' }
          ]
        );
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to process prescription: ' + error.message);
    }
  };

  const captureViewAsImage = async () => {
    try {
      const uri = await prescriptionRef.current.capture({
        format: 'jpg',
        quality: 0.9,
        result: 'tmpfile',
        width: 600,
        height: 800
      });
      return uri;
    } catch (error) {
      console.error('Error capturing view:', error);
      Alert.alert('Error', 'Failed to capture prescription image');
      return null;
    }
  };

  const renderPatientDropdown = () => {
    if (!showPatientDropdown) return null;
    
    return (
      <View style={styles.dropdownContainer}>
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
      </View>
    );
  };

  const renderPresetDropdown = () => {
    if (!showPresetDropdown) return null;
    
    return (
      <View style={styles.dropdownContainer}>
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
      </View>
    );
  };

  const renderPrescriptionTemplate = () => {
    const patientName = useCustomPatient ? customPatientName : 
      (selectedPatient ? `${selectedPatient.name} ${selectedPatient.surname}` : '');
    const prescriptionText = useCustomPrescription ? customPrescription : prescription;

    return (
      <ViewShot ref={prescriptionRef} options={{ format: "jpg", quality: 0.9 }}>
        <View style={styles.prescriptionFormContainer}>
          {/* Header Section */}
          <View style={styles.prescriptionHeader}>
            <View style={styles.headerTopRow}>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>DR P. HIRA INC.</Text>
                <Text style={styles.practiceNumber}>PR. NO 0929484</Text>
              </View>
            </View>
            
            <View style={styles.contactInfoRow}>
              <View style={styles.leftContactInfo}>
                <Text style={styles.contactText}>Consulting rooms:</Text>
                <Text style={styles.contactText}>5/87 Dunswart</Text>
                <Text style={styles.contactText}>Apartments</Text>
                <Text style={styles.contactText}>Dunswart, Boksburg,</Text>
                <Text style={styles.contactText}>1459</Text>
                <Text style={styles.contactText}>PO Box 18131</Text>
                <Text style={styles.contactText}>Actonville, Benoni, 1501</Text>
              </View>
              
              <View style={styles.centerContactInfo}>
              </View>
              
              <View style={styles.rightContactInfo}>
                <Text style={styles.contactText}>Tel: 010 493 3544</Text>
                <Text style={styles.contactText}>Fax: 011 914 3093</Text>
                <Text style={styles.contactText}>Cell: 069 711 0731</Text>
                <Text style={styles.contactText}>e-mail: info@drhirainc.com</Text>
              </View>
            </View>
          </View>

          {/* Form Fields Section */}
          <View style={styles.formFieldsContainer}>
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Date:</Text>
                <View style={styles.fieldLine}>
                  <Text style={styles.fieldValue}>{formatDate(date)}</Text>
                </View>
              </View>
              
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Age of Minor:</Text>
                <View style={styles.fieldLine}>
                  <Text style={styles.fieldValue}>{age || ''}</Text>
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formFieldFull}>
                <Text style={styles.fieldLabel}>Name:</Text>
                <View style={styles.fieldLine}>
                  <Text style={styles.fieldValue}>{patientName}</Text>
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formFieldFull}>
                <Text style={styles.fieldLabel}>Address:</Text>
                <View style={styles.fieldLine}>
                  <Text style={styles.fieldValue}></Text>
                </View>
              </View>
            </View>
          </View>

          {/* Prescription Section */}
          <View style={styles.prescriptionSection}>
            <View style={styles.rxHeader}>
              <Text style={styles.rxLabel}>Rx:</Text>
            </View>
            
            <View style={styles.prescriptionContent}>
              <Text style={styles.prescriptionText}>{prescriptionText}</Text>
              {repeats > 0 && (
                <Text style={styles.repeatsText}>Repeat x {repeats}</Text>
              )}
            </View>
          </View>

          {/* Signature Section */}
          <View style={styles.signatureSection}>
            <View style={styles.leftSignatureArea}>
              <View style={styles.signatureContainer}>
                <Image
                  source={require('../assets/signature.png')} // Place your signature image in assets folder
                  style={styles.signatureImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.signatureName}>Dr P.Hira</Text>
              <Text style={styles.signatureTitle}>MBBCh(Wits)</Text>
            </View>
          </View>
        </View>
      </ViewShot>
    );
  };

  return (
    <TexturedBackground>
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Date Section */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Date *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
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

        {/* Patient Selection */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Patient *</Text>
          
          {/* Toggle between saved patients and custom name */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, !useCustomPatient && styles.toggleButtonActive]}
              onPress={() => setUseCustomPatient(false)}
            >
              <Text style={[styles.toggleText, !useCustomPatient && styles.toggleTextActive]}>
                Saved Patients
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

          {useCustomPatient ? (
            <TextInput
              style={GlobalStyles.input}
              value={customPatientName}
              onChangeText={setCustomPatientName}
              placeholder="Enter patient name"
              placeholderTextColor={Colors.textLight}
            />
          ) : (
            <View>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowPatientDropdown(!showPatientDropdown)}
              >
                <Text style={styles.dropdownText}>
                  {selectedPatient ? `${selectedPatient.name} ${selectedPatient.surname}` : 'Select a patient'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
              {renderPatientDropdown()}
            </View>
          )}
        </View>

        {/* Prescription Section */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Prescription *</Text>
          
          {/* Toggle between presets and custom prescription */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, !useCustomPrescription && styles.toggleButtonActive]}
              onPress={() => setUseCustomPrescription(false)}
            >
              <Text style={[styles.toggleText, !useCustomPrescription && styles.toggleTextActive]}>
                Use Presets
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
            <View>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowPresetDropdown(!showPresetDropdown)}
              >
                <Text style={styles.dropdownText}>
                  {selectedPreset ? selectedPreset.diagnosis : 'Select a preset prescription'}
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

          {/* Repeats Section */}
          <View style={styles.repeatsSection}>
            <Text style={[styles.fieldLabel, {fontSize: 13, marginBottom: 6}]}>Repeats</Text>
            <View style={styles.repeatsContainer}>
              {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[styles.repeatButton, repeats === num && styles.repeatButtonActive]}
                  onPress={() => setRepeats(num)}
                >
                  <Text style={[styles.repeatButtonText, repeats === num && styles.repeatButtonTextActive]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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

        {/* FULLSCREEN Preview Modal */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={showPreviewModal}
          onRequestClose={() => setShowPreviewModal(false)}
        >
          <View style={styles.fullscreenModalContainer}>
            {/* Header Bar */}
            <View style={styles.fullscreenHeader}>
              <Text style={styles.fullscreenTitle}>Prescription Template</Text>
              <TouchableOpacity
                style={styles.fullscreenCloseButton}
                onPress={() => setShowPreviewModal(false)}
              >
                <Text style={styles.fullscreenCloseText}>✕ CLOSE</Text>
              </TouchableOpacity>
            </View>
            
            {/* Content Area */}
            <ScrollView style={styles.fullscreenContent}>
              <View style={styles.fullscreenContentContainer}>
                {renderPrescriptionTemplate()}
                
                {/* Export Buttons */}
                <View style={styles.exportButtonsContainer}>
                  <TouchableOpacity
                    style={styles.exportButton}
                    onPress={shareViaWhatsApp}
                  >
                    <View style={styles.whatsappIcon}>
                      <Text style={styles.iconText}>📱</Text>
                    </View>
                    <Text style={styles.exportButtonText}>WhatsApp Patient</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.exportButton}
                    onPress={shareViaGmail}
                  >
                    <View style={styles.gmailIcon}>
                      <Text style={styles.iconText}>📧</Text>
                    </View>
                    <Text style={styles.exportButtonText}>Email Patient</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
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

  scrollContainer: {
    flex: 1,
    padding: 16,
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

  dateButtonText: {
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
    maxHeight: 200,
    zIndex: 1000,
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

  // Fullscreen Modal Styles
  fullscreenModalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.primaryBlue,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGrey,
  },

  fullscreenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },

  fullscreenCloseButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
  },

  fullscreenCloseText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
  },

  fullscreenContent: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },

  fullscreenContentContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: screenHeight - 100,
    width: '100%',
  },

  // Prescription Form Styles
  prescriptionFormContainer: {
    backgroundColor: Colors.white,
    width: '100%',
    minWidth: 350,
    padding: 0,
    borderWidth: 3,
    borderColor: '#2c5aa0',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Header Styles
  prescriptionHeader: {
    borderBottomWidth: 2,
    borderBottomColor: '#2c5aa0',
    paddingBottom: 8,
    backgroundColor: '#f8f9ff',
  },

  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    marginBottom: 8,
  },

  doctorInfo: {
    alignItems: 'center',
  },

  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#1a365d',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },

  practiceNumber: {
    fontSize: 12,
    color: '#4a5568',
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  contactInfoRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: 'rgba(44, 90, 160, 0.05)',
    minHeight: 60,
  },

  leftContactInfo: {
    flex: 2,
    paddingRight: 8,
    minWidth: 120,
  },

  centerContactInfo: {
    flex: 1,
    alignItems: 'center',
    minWidth: 80,
  },

  rightContactInfo: {
    flex: 2,
    paddingLeft: 8,
    minWidth: 120,
  },

  contactText: {
    fontSize: 9,
    color: '#2d3748',
    lineHeight: 11,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    flexWrap: 'wrap',
  },

  // Form Fields Styles
  formFieldsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#2c5aa0',
    backgroundColor: 'rgba(44, 90, 160, 0.02)',
  },

  formRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
  },

  formField: {
    flex: 1,
    marginRight: 20,
    minWidth: 100,
  },

  formFieldFull: {
    flex: 1,
    minWidth: 200,
  },

  fieldLabel: {
    fontSize: 11,
    color: '#2c5aa0',
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  fieldLine: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#4299e1',
    minHeight: 20,
    paddingBottom: 2,
    backgroundColor: 'rgba(66, 153, 225, 0.05)',
  },

  fieldValue: {
    fontSize: 13,
    color: '#1a365d',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    flexWrap: 'wrap',
  },

  // Prescription Section Styles
  prescriptionSection: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 220,
    backgroundColor: 'rgba(247, 250, 252, 0.8)',
  },

  rxHeader: {
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  rxLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#2c5aa0',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  prescriptionContent: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 8,
    backgroundColor: Colors.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  prescriptionText: {
    fontSize: 13,
    color: '#2d3748',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  repeatsText: {
    fontSize: 13,
    color: '#2c5aa0',
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'left',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // Repeats Section Styles
  repeatsSection: {
    marginTop: 15,
    padding: 12,
    backgroundColor: 'rgba(66, 153, 225, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bee3f8',
  },

  repeatsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    flexWrap: 'wrap',
  },

  repeatButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4299e1',
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  repeatButtonActive: {
    backgroundColor: '#4299e1',
    borderColor: '#2c5aa0',
    transform: [{scale: 1.05}],
  },

  repeatButtonText: {
    fontSize: 15,
    color: '#2c5aa0',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  repeatButtonTextActive: {
    color: Colors.white,
    fontWeight: 'bold',
  },

  // Signature Section Styles
  signatureSection: {
    borderTopWidth: 2,
    borderTopColor: '#2c5aa0',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(247, 250, 252, 0.6)',
  },

  leftSignatureArea: {
    alignItems: 'flex-start',
  },

  signatureContainer: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: Colors.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  signatureImage: {
    width: 120,
    height: 45,
  },

  signatureName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a365d',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
  },

  signatureTitle: {
    fontSize: 11,
    color: '#4a5568',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
  },

  // Export Buttons Styles
  exportButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 20,
    gap: 15,
  },

  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4299e1',
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },

  whatsappIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  gmailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EA4335',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  iconText: {
    fontSize: 16,
    color: Colors.white,
  },

  exportButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c5aa0',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});

export default CreateScriptScreen;