import React from 'react';
import { 
  Alert, 
  FlatList,
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
  Linking
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalStyles, Colors } from '../GlobalStyles';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Import ICD-10 data
import icd10DataJson from '../data/icd10-codes.json';

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

// ICD-10 Code Selection Modal Component
const ICD10SelectionModal = ({ 
  visible, 
  onClose, 
  onSelect, 
  selectedCodes = [],
  multiSelect = true 
}) => {
  const [searchText, setSearchText] = React.useState('');
  const [filteredCodes, setFilteredCodes] = React.useState([]);
  const [localSelectedCodes, setLocalSelectedCodes] = React.useState(selectedCodes);

  React.useEffect(() => {
    if (visible) {
      setLocalSelectedCodes(selectedCodes);
    }
  }, [visible, selectedCodes]);

  React.useEffect(() => {
    filterCodes();
  }, [searchText]);

  const filterCodes = () => {
    if (!searchText.trim()) {
      setFilteredCodes([]);
      return;
    }

    const searchLower = searchText.toLowerCase().trim();
    const filtered = icd10DataJson.codes.filter(item => {
      return (
        item.code.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.chapter.toLowerCase().includes(searchLower)
      );
    });

    // Sort results by relevance
    filtered.sort((a, b) => {
      const aCode = a.code.toLowerCase();
      const bCode = b.code.toLowerCase();
      
      if (aCode === searchLower) return -1;
      if (bCode === searchLower) return 1;
      if (aCode.startsWith(searchLower) && !bCode.startsWith(searchLower)) return -1;
      if (bCode.startsWith(searchLower) && !aCode.startsWith(searchLower)) return 1;
      
      return aCode.localeCompare(bCode);
    });

    setFilteredCodes(filtered.slice(0, 50)); // Limit for performance
  };

  const toggleCodeSelection = (code) => {
    if (multiSelect) {
      const isSelected = localSelectedCodes.some(c => c.code === code.code);
      if (isSelected) {
        setLocalSelectedCodes(localSelectedCodes.filter(c => c.code !== code.code));
      } else {
        setLocalSelectedCodes([...localSelectedCodes, code]);
      }
    } else {
      setLocalSelectedCodes([code]);
    }
  };

  const handleConfirm = () => {
    onSelect(localSelectedCodes);
    onClose();
  };

  const renderCodeItem = ({ item }) => {
    const isSelected = localSelectedCodes.some(c => c.code === item.code);
    
    return (
      <TouchableOpacity
        style={[styles.codeSelectItem, isSelected && styles.codeSelectItemSelected]}
        onPress={() => toggleCodeSelection(item)}
      >
        <View style={styles.codeSelectHeader}>
          <Text style={[styles.codeSelectCode, isSelected && styles.codeSelectCodeSelected]}>
            {item.code}
          </Text>
          {item.validClinical && (
            <View style={styles.validBadge}>
              <Text style={styles.validBadgeText}>Clinical</Text>
            </View>
          )}
        </View>
        <Text style={[styles.codeSelectDescription, isSelected && styles.codeSelectDescriptionSelected]} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.codeSelectChapter} numberOfLines={1}>
          {item.chapter}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={GlobalStyles.modalOverlay}>
        <View style={[GlobalStyles.modalContent, styles.icd10Modal]}>
          <Text style={GlobalStyles.modalTitle}>
            Select ICD-10 {multiSelect ? 'Codes' : 'Code'}
          </Text>
          
          <TextInput
            style={GlobalStyles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search ICD-10 codes..."
            placeholderTextColor={Colors.textLight}
            autoCapitalize="none"
          />

          {localSelectedCodes.length > 0 && (
            <View style={styles.selectedCodesContainer}>
              <Text style={styles.selectedCodesTitle}>
                Selected ({localSelectedCodes.length}):
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {localSelectedCodes.map((code, index) => (
                  <View key={code.code} style={styles.selectedCodeChip}>
                    <Text style={styles.selectedCodeText}>{code.code}</Text>
                    <TouchableOpacity
                      onPress={() => toggleCodeSelection(code)}
                      style={styles.removeCodeButton}
                    >
                      <Text style={styles.removeCodeText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.codeListContainer}>
            {!searchText.trim() ? (
              <View style={styles.searchPrompt}>
                <Text style={styles.searchPromptIcon}>🔍</Text>
                <Text style={styles.searchPromptText}>
                  Start typing to search ICD-10 codes
                  {'\n\n'}Try: diabetes, fever, hypertension
                </Text>
              </View>
            ) : filteredCodes.length > 0 ? (
              <FlatList
                data={filteredCodes}
                renderItem={renderCodeItem}
                keyExtractor={(item) => item.code}
                showsVerticalScrollIndicator={false}
                maxToRenderPerBatch={10}
                windowSize={10}
              />
            ) : (
              <View style={styles.searchPrompt}>
                <Text style={styles.searchPromptIcon}>❌</Text>
                <Text style={styles.searchPromptText}>
                  No codes found for "{searchText}"
                </Text>
              </View>
            )}
          </View>
          
          <View style={GlobalStyles.modalButtonContainer}>
            <TouchableOpacity
              style={[GlobalStyles.modalButton, GlobalStyles.lightButton]}
              onPress={onClose}
            >
              <Text style={GlobalStyles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[GlobalStyles.modalButton, GlobalStyles.primaryButton]}
              onPress={handleConfirm}
            >
              <Text style={GlobalStyles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
  
  // ICD-10 related states
  const [selectedIcd10Codes, setSelectedIcd10Codes] = React.useState([]);
  const [icd10ModalVisible, setIcd10ModalVisible] = React.useState(false);
  
  // Dropdown states
  const [showPatientDropdown, setShowPatientDropdown] = React.useState(false);
  const [showPresetDropdown, setShowPresetDropdown] = React.useState(false);
  const [useCustomPatient, setUseCustomPatient] = React.useState(false);
  const [useCustomPrescription, setUseCustomPrescription] = React.useState(false);
  
  // Data states
  const [patients, setPatients] = React.useState([]);
  const [presets, setPresets] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [exportLoading, setExportLoading] = React.useState(false);
  
  // Modal and image states
  const [showImageModal, setShowImageModal] = React.useState(false);
  const [generatedImageUri, setGeneratedImageUri] = React.useState(null);
  const [savedImagePath, setSavedImagePath] = React.useState(null);
  const [renderForCapture, setRenderForCapture] = React.useState(false);

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
        const parsedPresets = JSON.parse(storedPresets);
        // Ensure backward compatibility - add empty icd10Codes array if not present
        const migratedPresets = parsedPresets.map(preset => ({
          ...preset,
          icd10Codes: preset.icd10Codes || []
        }));
        setPresets(migratedPresets);
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
    setAge(patient.age ? patient.age.toString() : '');
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
    
    // Auto-populate ICD-10 codes from preset
    if (preset.icd10Codes && preset.icd10Codes.length > 0) {
      setSelectedIcd10Codes(preset.icd10Codes);
    } else {
      setSelectedIcd10Codes([]);
    }
    
    setShowPresetDropdown(false);
  };

  const handleIcd10Selection = (codes) => {
    setSelectedIcd10Codes(codes);
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

  const saveImageToFile = async (dataUri) => {
    try {
      // Extract base64 data from data URI
      const base64Data = dataUri.split(',')[1];
      
      // Generate unique filename
      const timestamp = new Date().getTime();
      const patientName = useCustomPatient ? customPatientName : 
        (selectedPatient ? `${selectedPatient.name}_${selectedPatient.surname}` : 'patient');
      const sanitizedName = patientName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `prescription_${sanitizedName}_${timestamp}.png`;
      
      // Create file path in document directory
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      // Write base64 data to file
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('Image saved to:', fileUri);
      return fileUri;
    } catch (error) {
      console.error('Error saving image:', error);
      throw error;
    }
  };

  const generatePrescriptionImage = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      console.log('Starting prescription image generation...');
      
      // First render the prescription template for capture
      setRenderForCapture(true);
      
      // Wait a moment for the component to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Capture the prescription as image
      if (prescriptionRef.current) {
        console.log('Capturing prescription image...');
        
        const imageUri = await prescriptionRef.current.capture({
          format: 'png',
          quality: 1.0,
          result: 'data-uri',
          width: 800,
          height: 1400
        });
        
        console.log('Prescription image captured successfully');
        
        // Save the image to file system
        const savedPath = await saveImageToFile(imageUri);
        
        // Store both URIs
        setGeneratedImageUri(imageUri);
        setSavedImagePath(savedPath);
        setShowImageModal(true);
        setRenderForCapture(false);
        
      } else {
        throw new Error('Prescription view reference not found');
      }
      
    } catch (error) {
      console.error('Error generating prescription image:', error);
      Alert.alert('Error', 'Failed to generate prescription image. Please try again.');
      setRenderForCapture(false);
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
            setSelectedIcd10Codes([]);
            setUseCustomPatient(false);
            setUseCustomPrescription(false);
            setRepeats(0);
            setGeneratedImageUri(null);
            setSavedImagePath(null);
            setShowImageModal(false);
          }
        }
      ]
    );
  };

  const shareViaWhatsApp = async () => {
    if (!savedImagePath) {
      Alert.alert('Error', 'No prescription image generated');
      return;
    }

    setExportLoading(true);
    
    try {
      console.log('Starting WhatsApp share with file:', savedImagePath);
      
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

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      // Share the image file
      await Sharing.shareAsync(savedImagePath, {
        mimeType: 'image/png',
        dialogTitle: `Prescription for ${patientName}`,
        UTI: 'public.png'
      });
      
      console.log('Image shared successfully');
      
      // Open WhatsApp after successful share if we have a phone number
      if (phoneNumber) {
        setTimeout(async () => {
          try {
            let whatsappUrl = `whatsapp://send?phone=${phoneNumber}`;
            const supported = await Linking.canOpenURL(whatsappUrl);
            if (supported) {
              await Linking.openURL(whatsappUrl);
            }
          } catch (linkError) {
            console.log('Could not open WhatsApp:', linkError);
          }
        }, 1000);
      }

    } catch (error) {
      console.error('WhatsApp share error:', error);
      Alert.alert('Error', 'Failed to share prescription via WhatsApp');
    } finally {
      setExportLoading(false);
    }
  };

  const shareViaEmail = async () => {
    if (!savedImagePath) {
      Alert.alert('Error', 'No prescription image generated');
      return;
    }

    setExportLoading(true);
    
    try {
      console.log('Starting Email share with file:', savedImagePath);
      
      const patientName = useCustomPatient ? customPatientName : 
        (selectedPatient ? `${selectedPatient.name} ${selectedPatient.surname}` : '');
      
      const subject = `Prescription for ${patientName}`;
      const body = `Please find attached prescription for ${patientName}, for any queries please contact us at 011 914 3093 and ask for Dr P Hira`;
      
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      // Share the image file
      await Sharing.shareAsync(savedImagePath, {
        mimeType: 'image/png',
        dialogTitle: subject,
        UTI: 'public.png'
      });
      
      console.log('Image shared successfully');

    } catch (error) {
      console.error('Email share error:', error);
      Alert.alert('Error', 'Failed to share prescription via email');
    } finally {
      setExportLoading(false);
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
            <View style={styles.dropdownPresetItem}>
              <Text style={styles.dropdownItemText}>
                {preset.diagnosis}
              </Text>
              {preset.icd10Codes && preset.icd10Codes.length > 0 && (
                <View style={styles.presetIcd10Container}>
                  {preset.icd10Codes.slice(0, 2).map((code, index) => (
                    <View key={code.code} style={styles.presetIcd10Chip}>
                      <Text style={styles.presetIcd10Text}>{code.code}</Text>
                    </View>
                  ))}
                  {preset.icd10Codes.length > 2 && (
                    <Text style={styles.presetIcd10More}>
                      +{preset.icd10Codes.length - 2}
                    </Text>
                  )}
                </View>
              )}
            </View>
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

          {/* ICD-10 Codes Section in Template */}
          {selectedIcd10Codes.length > 0 && (
            <View style={styles.formRow}>
              <View style={styles.formFieldFull}>
                <Text style={styles.fieldLabel}>ICD-10 Code(s):</Text>
                <View style={styles.fieldLine}>
                  <Text style={styles.fieldValue}>
                    {selectedIcd10Codes.map(code => code.code).join(', ')}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Prescription Section - Main Content Area */}
        <View style={styles.prescriptionSection}>
          <View style={styles.rxHeader}>
            <Text style={styles.rxLabel}>Rx:</Text>
          </View>
          
          <View style={styles.prescriptionContent}>
            <Text style={styles.prescriptionText}>{prescriptionText}</Text>
            
            {/* ICD-10 Diagnosis Section */}
            {selectedIcd10Codes.length > 0 && (
              <View style={styles.diagnosisSection}>
                <Text style={styles.diagnosisHeader}>Diagnosis:</Text>
                {selectedIcd10Codes.map((code, index) => (
                  <Text key={code.code} style={styles.diagnosisText}>
                    {code.code} - {code.description}
                  </Text>
                ))}
              </View>
            )}
            
            {/* Spacer to push repeats to bottom */}
            <View style={{flex: 1, minHeight: 50}} />
            
            {repeats > 0 && (
              <Text style={styles.repeatsText}>Repeat x {repeats}</Text>
            )}
          </View>
        </View>

        {/* Signature Section - Always at Bottom */}
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

        {/* ICD-10 Codes Section */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>ICD-10 Diagnostic Codes</Text>
          
          {!useCustomPrescription && selectedPreset && selectedPreset.icd10Codes && selectedPreset.icd10Codes.length > 0 && (
            <View style={styles.autoIcd10Container}>
              <Text style={styles.autoIcd10Label}>Auto-added from preset:</Text>
              <View style={styles.autoIcd10Codes}>
                {selectedPreset.icd10Codes.map((code) => (
                  <View key={code.code} style={styles.autoIcd10Chip}>
                    <Text style={styles.autoIcd10Text}>{code.code}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.icd10Button}
            onPress={() => setIcd10ModalVisible(true)}
          >
            <Text style={styles.icd10ButtonText}>
              {selectedIcd10Codes.length > 0 
                ? `${selectedIcd10Codes.length} code${selectedIcd10Codes.length !== 1 ? 's' : ''} selected`
                : 'Select ICD-10 codes'
              }
            </Text>
            <Text style={styles.icd10ButtonIcon}>+</Text>
          </TouchableOpacity>

          {/* Selected ICD-10 Codes Display */}
          {selectedIcd10Codes.length > 0 && (
            <View style={styles.selectedIcd10Container}>
              {selectedIcd10Codes.map((code) => (
                <View key={code.code} style={styles.selectedIcd10Item}>
                  <Text style={styles.selectedIcd10Code}>{code.code}</Text>
                  <Text style={styles.selectedIcd10Description} numberOfLines={1}>
                    {code.description}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedIcd10Codes(selectedIcd10Codes.filter(c => c.code !== code.code));
                    }}
                    style={styles.removeIcd10Button}
                  >
                    <Text style={styles.removeIcd10Text}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
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
            onPress={generatePrescriptionImage}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={Colors.white} size="small" />
                <Text style={[GlobalStyles.buttonText, {marginLeft: 10}]}>Generating Image...</Text>
              </View>
            ) : (
              <Text style={GlobalStyles.buttonText}>Generate Prescription Image</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[GlobalStyles.lightButton, styles.clearButton]}
            onPress={handleClear}
          >
            <Text style={GlobalStyles.buttonText}>Clear Form</Text>
          </TouchableOpacity>
        </View>

        {/* Hidden ViewShot for Capture */}
        {renderForCapture && (
          <View style={styles.hiddenCaptureContainer}>
            <ViewShot 
              ref={prescriptionRef} 
              options={{ format: "png", quality: 1.0, result: 'data-uri' }}
              style={styles.viewShotContainer}
            >
              {renderPrescriptionTemplate()}
            </ViewShot>
          </View>
        )}

        {/* ICD-10 Selection Modal */}
        <ICD10SelectionModal
          visible={icd10ModalVisible}
          onClose={() => setIcd10ModalVisible(false)}
          onSelect={handleIcd10Selection}
          selectedCodes={selectedIcd10Codes}
          multiSelect={true}
        />

        {/* Full Screen Image Modal */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={showImageModal}
          onRequestClose={() => setShowImageModal(false)}
        >
          <View style={styles.imageModalContainer}>
            {/* Header */}
            <View style={styles.imageModalHeader}>
              <Text style={styles.imageModalTitle}>Generated Prescription</Text>
              <TouchableOpacity
                style={styles.imageModalCloseButton}
                onPress={() => setShowImageModal(false)}
              >
                <Text style={styles.imageModalCloseText}>✕ Close</Text>
              </TouchableOpacity>
            </View>
            
            {/* Image Display */}
            <View style={styles.imageModalContent}>
              <View style={styles.imageContainer}>
                {generatedImageUri && (
                  <Image
                    source={{ uri: generatedImageUri }}
                    style={styles.generatedImage}
                    resizeMode="contain"
                  />
                )}
              </View>
            </View>

            {/* Export Buttons */}
            <View style={styles.imageModalFooter}>
              <TouchableOpacity
                style={[styles.exportButton, exportLoading && styles.exportButtonDisabled]}
                onPress={shareViaWhatsApp}
                disabled={exportLoading}
              >
                <View style={styles.whatsappIcon}>
                  <Text style={styles.iconText}>📱</Text>
                </View>
                {exportLoading ? (
                  <ActivityIndicator color={Colors.primaryBlue} size="small" />
                ) : (
                  <Text style={styles.exportButtonText}>WhatsApp</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.exportButton, exportLoading && styles.exportButtonDisabled]}
                onPress={shareViaEmail}
                disabled={exportLoading}
              >
                <View style={styles.emailIcon}>
                  <Text style={styles.iconText}>📧</Text>
                </View>
                {exportLoading ? (
                  <ActivityIndicator color={Colors.primaryBlue} size="small" />
                ) : (
                  <Text style={styles.exportButtonText}>Email</Text>
                )}
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

  dropdownPresetItem: {
    flex: 1,
  },

  presetIcd10Container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    alignItems: 'center',
  },

  presetIcd10Chip: {
    backgroundColor: Colors.accentBlue,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 2,
  },

  presetIcd10Text: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primaryBlue,
  },

  presetIcd10More: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  // ICD-10 Selection Styles
  autoIcd10Container: {
    backgroundColor: Colors.backgroundGrey,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },

  autoIcd10Label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },

  autoIcd10Codes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  autoIcd10Chip: {
    backgroundColor: Colors.primaryBlue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },

  autoIcd10Text: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },

  icd10Button: {
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

  icd10ButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  icd10ButtonIcon: {
    fontSize: 18,
    color: Colors.primaryBlue,
    fontWeight: 'bold',
  },

  selectedIcd10Container: {
    marginBottom: 8,
  },

  selectedIcd10Item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundGrey,
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },

  selectedIcd10Code: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primaryBlue,
    minWidth: 50,
  },

  selectedIcd10Description: {
    flex: 1,
    fontSize: 11,
    color: Colors.textPrimary,
    marginLeft: 8,
  },

  removeIcd10Button: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  removeIcd10Text: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },

  // ICD-10 Modal Styles
  icd10Modal: {
    maxHeight: '85%',
    width: '95%',
  },

  selectedCodesContainer: {
    marginBottom: 16,
  },

  selectedCodesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },

  selectedCodeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryBlue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },

  selectedCodeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },

  removeCodeButton: {
    marginLeft: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  removeCodeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },

  codeListContainer: {
    flex: 1,
    maxHeight: 300,
  },

  codeSelectItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGrey,
  },

  codeSelectItemSelected: {
    backgroundColor: Colors.accentBlue,
  },

  codeSelectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  codeSelectCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primaryBlue,
  },

  codeSelectCodeSelected: {
    color: Colors.primaryBlue,
  },

  validBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  validBadgeText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: '600',
  },

  codeSelectDescription: {
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 4,
  },

  codeSelectDescriptionSelected: {
    color: Colors.textPrimary,
  },

  codeSelectChapter: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  searchPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },

  searchPromptIcon: {
    fontSize: 32,
    marginBottom: 16,
  },

  searchPromptText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
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

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hidden Capture Container
  hiddenCaptureContainer: {
    position: 'absolute',
    top: -10000,
    left: -10000,
    width: 800,
    height: 1400,
  },

  // ViewShot Container
  viewShotContainer: {
    backgroundColor: Colors.white,
    width: 800,
    height: 1400,
  },

  // Prescription Form Styles
  prescriptionFormContainer: {
    backgroundColor: Colors.white,
    width: '100%',
    minWidth: 350,
    minHeight: 1000,
    padding: 0,
    borderWidth: 3,
    borderColor: '#2c5aa0',
    borderRadius: 8,
    flex: 1,
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
  },

  // Prescription Section Styles
  prescriptionSection: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 500,
    maxHeight: 700,
    backgroundColor: 'rgba(247, 250, 252, 0.8)',
  },

  rxHeader: {
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  rxLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#2c5aa0',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  prescriptionContent: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 400,
  },

  prescriptionText: {
    fontSize: 16,
    color: '#2d3748',
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 20,
    fontWeight: '500',
  },

  // Diagnosis section in prescription template
  diagnosisSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },

  diagnosisHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  diagnosisText: {
    fontSize: 12,
    color: '#4a5568',
    lineHeight: 16,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  repeatsText: {
    fontSize: 16,
    color: '#2c5aa0',
    fontWeight: 'bold',
    marginTop: 'auto',
    paddingTop: 20,
    textAlign: 'left',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
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
  },

  repeatButtonActive: {
    backgroundColor: '#4299e1',
    borderColor: '#2c5aa0',
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
    paddingHorizontal: 20,
    paddingVertical: 25,
    backgroundColor: 'rgba(247, 250, 252, 0.6)',
    marginTop: 'auto',
  },

  leftSignatureArea: {
    alignItems: 'flex-start',
  },

  signatureContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: Colors.white,
    borderRadius: 8,
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
    width: 140,
    height: 55,
  },

  signatureName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    marginBottom: 4,
  },

  signatureTitle: {
    fontSize: 14,
    color: '#4a5568',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    fontWeight: '500',
  },

  // Image Modal Styles
  imageModalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  imageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.primaryBlue,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGrey,
  },

  imageModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },

  imageModalCloseButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
  },

  imageModalCloseText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  },

  imageModalContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  imageContainer: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  generatedImage: {
    width: screenWidth - 20,
    height: screenHeight - 200, // Account for header (50px) + footer (80px) + status bar + padding
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primaryBlue,
  },

  imageModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingVertical: 15,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderGrey,
    minHeight: 80,
  },

  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4299e1',
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 120,
    maxWidth: 140,
  },

  exportButtonDisabled: {
    opacity: 0.6,
  },

  whatsappIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },

  emailIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EA4335',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },

  iconText: {
    fontSize: 10,
    color: Colors.white,
  },

  exportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c5aa0',
  },
});

export default CreateScriptScreen;