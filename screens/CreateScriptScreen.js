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
  Share,
  Dimensions
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { captureRef } from 'react-native-view-shot';
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
  const [patientAddress, setPatientAddress] = React.useState('');
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
    // Auto-fill patient address if available
    if (patient.address) {
      setPatientAddress(patient.address);
    }
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
        result: 'tmpfile',
      });

      const patientName = useCustomPatient ? customPatientName : 
                         selectedPatient ? `${selectedPatient.name} ${selectedPatient.surname}` : 'Patient';

      // Share the prescription image
      await Share.share({
        url: uri,
        title: 'Share Prescription',
        message: `Prescription for ${patientName} - ${formatDate(date)}`,
      });
      
      Alert.alert('Success', 'Prescription generated successfully!');
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
            setDate(new Date());
            setAge('');
            setSelectedPatient(null);
            setCustomPatientName('');
            setPatientAddress('');
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
            <Text style={styles.dropdownItemText}>{preset.diagnosis}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <TexturedBackground>
      <ScrollView style={GlobalStyles.padding} showsVerticalScrollIndicator={false}>
        <Text style={GlobalStyles.pageTitle}>Create Prescription</Text>

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
          <Text style={styles.fieldLabel}>Age (Optional)</Text>
          <TextInput
            style={GlobalStyles.input}
            value={age}
            onChangeText={setAge}
            placeholder="Enter patient age"
            placeholderTextColor={Colors.textLight}
            keyboardType="numeric"
          />
        </View>

        {/* Patient Section */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Patient Name *</Text>
          
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
                  {selectedPatient ? `${selectedPatient.name} ${selectedPatient.surname}` : 'Select a patient'}
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

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Patient Address</Text>
          <TextInput
            style={GlobalStyles.input}
            value={patientAddress}
            onChangeText={setPatientAddress}
            placeholder="Enter patient address"
            placeholderTextColor={Colors.textLight}
            multiline
            numberOfLines={2}
          />
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

        {/* Hidden Prescription Layout for Capture */}
        <View style={styles.hiddenContainer}>
          <View ref={prescriptionRef} style={styles.prescriptionContainer}>
            {/* Header */}
            <View style={styles.headerSection}>
              <Text style={styles.practiceTitle}>DR P. HIRA INC.</Text>
              <Text style={styles.practiceNumber}>PR. NO: 0929484</Text>
              
              <View style={styles.contactInfo}>
                <View style={styles.leftContact}>
                  <Text style={styles.contactText}>Consulting rooms:</Text>
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

            {/* Patient Section */}
            <View style={styles.patientSection}>
              <View style={styles.patientInfoRow}>
                <View style={styles.dateField}>
                  <Text style={styles.patientFieldLabel}>Date:</Text>
                  <View style={styles.underline}>
                    <Text style={styles.patientFieldValue}>{formatDate(date)}</Text>
                  </View>
                </View>
                
                {age && (
                  <View style={styles.ageField}>
                    <Text style={styles.patientFieldLabel}>Age of Minor:</Text>
                    <View style={styles.underline}>
                      <Text style={styles.patientFieldValue}>{age}</Text>
                    </View>
                  </View>
                )}
              </View>
              
              <View style={[styles.patientInfoRow, styles.nameField]}>
                <Text style={styles.patientFieldLabel}>Name:</Text>
                <View style={styles.underline}>
                  <Text style={styles.patientFieldValue}>
                    {useCustomPatient ? customPatientName : 
                     selectedPatient ? `${selectedPatient.name} ${selectedPatient.surname}` : ''}
                  </Text>
                </View>
              </View>

              <View style={[styles.patientInfoRow, styles.nameField]}>
                <Text style={styles.patientFieldLabel}>Address:</Text>
                <View style={styles.underline}>
                  <Text style={styles.patientFieldValue}>{patientAddress}</Text>
                </View>
              </View>
            </View>

            {/* Prescription Section */}
            <View style={styles.rxSection}>
              <Text style={styles.rxLabel}>Rx :</Text>
              <View style={styles.prescriptionContent}>
                <Text style={styles.prescriptionText}>
                  {useCustomPrescription ? customPrescription : prescription}
                </Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footerSection}>
              <View style={styles.doctorSignature}>
                <Text style={styles.doctorName}>Dr P.Hira</Text>
                <Text style={styles.doctorTitle}>MBBCH(Wits)</Text>
              </View>
              <View style={styles.doctorSignature}>
                <Text style={styles.doctorName}>Dr. H.E. Foster</Text>
                <Text style={styles.doctorTitle}>MBBCH(Wits)</Text>
              </View>
            </View>
          </View>
        </View>
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
    maxHeight: 200,
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

  prescriptionContainer: {
    backgroundColor: Colors.white,
    width: 800,
    padding: 40,
  },

  // Header Section
  headerSection: {
    borderWidth: 2,
    borderColor: '#000',
    padding: 20,
    marginBottom: 30,
  },

  practiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },

  practiceNumber: {
    fontSize: 12,
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
    fontSize: 10,
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
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    marginBottom: 5,
  },

  underline: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 2,
    minHeight: 20,
  },

  patientFieldValue: {
    fontSize: 12,
    color: '#000',
  },

  // Prescription Section
  rxSection: {
    marginBottom: 50,
    paddingHorizontal: 10,
  },

  rxLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },

  prescriptionContent: {
    minHeight: 200,
  },

  prescriptionText: {
    fontSize: 12,
    color: '#000',
    lineHeight: 18,
  },

  // Footer Section
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 20,
  },

  doctorSignature: {
    alignItems: 'center',
    flex: 1,
  },

  doctorName: {
    fontSize: 10,
    color: '#000',
    marginTop: 30,
    marginBottom: 2,
  },

  doctorTitle: {
    fontSize: 9,
    color: '#000',
  },
});

export default CreateScriptScreen;