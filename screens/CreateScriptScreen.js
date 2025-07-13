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
  Image
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalStyles, Colors } from '../GlobalStyles';

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
      console.log('Showing prescription template...');
      
      // Just show the preview modal with template
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
            <Text style={styles.dropdownItemText}>
              {preset.diagnosis}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSimpleTemplate = () => {
    return (
      <View style={styles.templateContainer}>
        <Text style={styles.debugText}>🔍 Debugging Prescription Template</Text>
        
        {/* Test with a simple placeholder first */}
        <View style={styles.placeholderTemplate}>
          <Text style={styles.placeholderText}>DR P. HIRA INC.</Text>
          <Text style={styles.placeholderText}>PR. NO 0929484</Text>
          <Text style={styles.placeholderSubtext}>This is a placeholder template</Text>
          <Text style={styles.placeholderSubtext}>If you see this, the container works</Text>
          <Text style={styles.placeholderSubtext}>✅ GREEN BOX SHOULD BE VISIBLE</Text>
        </View>
        
        <Text style={styles.debugText}>⬆️ GREEN PLACEHOLDER ABOVE</Text>
        
        {/* Try loading the actual image */}
        <Image
          source={require('../assets/prescription-template.jpg')}
          style={styles.templateImage}
          resizeMode="contain"
          onError={(error) => {
            console.error('❌ JPG Image failed:', error.nativeEvent?.error || 'Unknown error');
          }}
          onLoad={() => {
            console.log('✅ JPG Template loaded successfully');
          }}
          onLoadStart={() => {
            console.log('🔄 JPG Template loading started');
          }}
          onLoadEnd={() => {
            console.log('🏁 JPG Template loading ended');
          }}
        />
        
        <Text style={styles.debugText}>⬆️ BLUE BOX = JPG IMAGE ABOVE</Text>
        <Text style={styles.debugText}>Check console for loading messages</Text>
      </View>
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
                {renderSimpleTemplate()}
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  previewModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: '95%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },

  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGrey,
  },

  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },

  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.borderGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },

  previewScrollContainer: {
    flex: 1,
  },

  previewScrollContent: {
    padding: 20,
  },

  captureContainer: {
    backgroundColor: Colors.white,
    alignItems: 'center',
  },

  // Simple Template Styles
  templateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5', // Light gray background
    padding: 20,
    minHeight: 400,
    width: '100%', // Ensure full width
  },

  templateImage: {
    width: screenWidth * 0.7, // Smaller to ensure it fits
    height: 300, // Fixed height to ensure it's visible
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#2196F3', // Thick blue border
    marginVertical: 10,
  },

  debugText: {
    fontSize: 16, // Larger text
    fontWeight: 'bold',
    color: '#FF5722', // Orange color to stand out
    marginVertical: 8,
    textAlign: 'center',
    backgroundColor: '#FFEB3B', // Yellow background
    padding: 5,
  },

  placeholderTemplate: {
    width: screenWidth * 0.7, // Smaller to ensure it fits
    height: 250, // Fixed height
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#4CAF50', // Thick green border
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    padding: 20,
  },

  placeholderText: {
    fontSize: 16, // Larger text
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginVertical: 3,
  },

  placeholderSubtext: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginVertical: 2,
  },
});

export default CreateScriptScreen;