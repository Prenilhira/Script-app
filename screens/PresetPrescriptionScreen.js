import React from 'react';
import { 
  Alert, 
  FlatList,
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

// Import ICD-10 data
import icd10DataJson from '../data/icd10-codes.json';

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

function PresetPrescriptionScreen({ navigation }) {
  const [presets, setPresets] = React.useState([]);
  const [filteredPresets, setFilteredPresets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = React.useState(false);
  const [icd10ModalVisible, setIcd10ModalVisible] = React.useState(false);
  const [selectedPreset, setSelectedPreset] = React.useState(null);
  const [searchText, setSearchText] = React.useState('');

  // Preset form fields
  const [diagnosis, setDiagnosis] = React.useState('');
  const [selectedIcd10Codes, setSelectedIcd10Codes] = React.useState([]);
  const [medications, setMedications] = React.useState([]);

  // Medication form fields
  const [medicationName, setMedicationName] = React.useState('');
  const [dose, setDose] = React.useState('');
  const [direction, setDirection] = React.useState('');
  const [quantity, setQuantity] = React.useState('');
  const [editingMedicationIndex, setEditingMedicationIndex] = React.useState(-1);

  React.useEffect(() => {
    loadPresets();
  }, []);

  React.useEffect(() => {
    filterPresets();
  }, [searchText, presets]);

  const loadPresets = async () => {
    try {
      setLoading(true);
      
      // Enhanced sample presets with ICD-10 codes
      const samplePresets = [
        {
          id: 1,
          diagnosis: 'Common Cold',
          icd10Codes: [
            {
              code: 'J00',
              description: 'Acute nasopharyngitis [common cold]'
            }
          ],
          medications: [
            {
              id: 1,
              name: 'Paracetamol',
              dose: '500mg',
              direction: 'Take twice daily after meals',
              quantity: '20 tablets'
            },
            {
              id: 2,
              name: 'Vitamin C',
              dose: '1000mg',
              direction: 'Take once daily',
              quantity: '30 tablets'
            }
          ]
        },
        {
          id: 2,
          diagnosis: 'Hypertension',
          icd10Codes: [
            {
              code: 'I10',
              description: 'Essential (primary) hypertension'
            }
          ],
          medications: [
            {
              id: 3,
              name: 'Amlodipine',
              dose: '5mg',
              direction: 'Take once daily in the morning',
              quantity: '30 tablets'
            },
            {
              id: 4,
              name: 'Metoprolol',
              dose: '50mg',
              direction: 'Take twice daily',
              quantity: '60 tablets'
            }
          ]
        },
        {
          id: 3,
          diagnosis: 'Type 2 Diabetes',
          icd10Codes: [
            {
              code: 'E11.9',
              description: 'Type 2 diabetes mellitus without complications'
            }
          ],
          medications: [
            {
              id: 5,
              name: 'Metformin',
              dose: '500mg',
              direction: 'Take twice daily with meals',
              quantity: '60 tablets'
            }
          ]
        },
        {
          id: 4,
          diagnosis: 'High Cholesterol',
          icd10Codes: [
            {
              code: 'E78.0',
              description: 'Pure hypercholesterolaemia'
            }
          ],
          medications: [
            {
              id: 6,
              name: 'Atorvastatin',
              dose: '20mg',
              direction: 'Take once daily at bedtime',
              quantity: '30 tablets'
            }
          ]
        }
      ];

      setPresets(samplePresets);
      
      try {
        const storedPresets = await AsyncStorage.getItem(PRESETS_STORAGE_KEY);
        if (storedPresets) {
          const presetsData = JSON.parse(storedPresets);
          if (Array.isArray(presetsData) && presetsData.length > 0) {
            // Migrate old presets to include ICD-10 codes if they don't have them
            const migratedPresets = presetsData.map(preset => ({
              ...preset,
              icd10Codes: preset.icd10Codes || []
            }));
            setPresets(migratedPresets);
          } else {
            await savePresets(samplePresets);
          }
        } else {
          await savePresets(samplePresets);
        }
      } catch (storageError) {
        console.log('Storage error, using sample data:', storageError);
        await savePresets(samplePresets);
      }
    } catch (error) {
      console.error('Error loading presets:', error);
      const fallbackPresets = [
        {
          id: 1,
          diagnosis: 'Common Cold',
          icd10Codes: [],
          medications: [
            {
              id: 1,
              name: 'Paracetamol',
              dose: '500mg',
              direction: 'Take twice daily',
              quantity: '20 tablets'
            }
          ]
        },
        {
          id: 2,
          diagnosis: 'Headache',
          icd10Codes: [],
          medications: [
            {
              id: 2,
              name: 'Ibuprofen',
              dose: '400mg',
              direction: 'Take as needed',
              quantity: '10 tablets'
            }
          ]
        }
      ];
      setPresets(fallbackPresets);
    } finally {
      setLoading(false);
    }
  };

  const filterPresets = () => {
    if (!searchText.trim()) {
      setFilteredPresets(presets);
    } else {
      const filtered = presets.filter(preset => 
        preset.diagnosis.toLowerCase().includes(searchText.toLowerCase()) ||
        preset.medications.some(med => 
          med.name.toLowerCase().includes(searchText.toLowerCase())
        ) ||
        (preset.icd10Codes && preset.icd10Codes.some(code =>
          code.code.toLowerCase().includes(searchText.toLowerCase()) ||
          code.description.toLowerCase().includes(searchText.toLowerCase())
        ))
      );
      setFilteredPresets(filtered);
    }
  };

  const savePresets = async (presetsData) => {
    try {
      await AsyncStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presetsData));
    } catch (error) {
      console.error('Error saving presets:', error);
    }
  };

  const addMedication = () => {
    if (medicationName.trim() && dose.trim() && direction.trim() && quantity.trim()) {
      const newMedication = {
        id: Date.now() + Math.random(),
        name: medicationName.trim(),
        dose: dose.trim(),
        direction: direction.trim(),
        quantity: quantity.trim()
      };

      if (editingMedicationIndex >= 0) {
        const updatedMedications = [...medications];
        updatedMedications[editingMedicationIndex] = newMedication;
        setMedications(updatedMedications);
        setEditingMedicationIndex(-1);
      } else {
        setMedications([...medications, newMedication]);
      }

      clearMedicationForm();
    } else {
      Alert.alert('Error', 'Please fill in all medication fields.');
    }
  };

  const editMedication = (index) => {
    const medication = medications[index];
    setMedicationName(medication.name);
    setDose(medication.dose);
    setDirection(medication.direction);
    setQuantity(medication.quantity);
    setEditingMedicationIndex(index);
  };

  const removeMedication = (index) => {
    const updatedMedications = medications.filter((_, i) => i !== index);
    setMedications(updatedMedications);
    if (editingMedicationIndex === index) {
      clearMedicationForm();
      setEditingMedicationIndex(-1);
    }
  };

  const clearMedicationForm = () => {
    setMedicationName('');
    setDose('');
    setDirection('');
    setQuantity('');
  };

  const clearPresetForm = () => {
    setDiagnosis('');
    setSelectedIcd10Codes([]);
    setMedications([]);
    clearMedicationForm();
    setEditingMedicationIndex(-1);
  };

  const addNewPreset = async () => {
    if (diagnosis.trim() && medications.length > 0) {
      const newPreset = {
        id: Date.now(),
        diagnosis: diagnosis.trim(),
        icd10Codes: selectedIcd10Codes,
        medications: medications.map(med => ({
          ...med,
          id: Date.now() + Math.random()
        }))
      };
      
      const updatedPresets = [...presets, newPreset];
      setPresets(updatedPresets);
      
      try {
        await savePresets(updatedPresets);
        setModalVisible(false);
        clearPresetForm();
        Alert.alert('Success', 'Preset added successfully!');
      } catch (error) {
        Alert.alert('Error', 'Failed to save preset. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Please enter a diagnosis and at least one medication.');
    }
  };

  const viewPresetDetails = (preset) => {
    setSelectedPreset(preset);
    setDetailsModalVisible(true);
  };

  const editPreset = (preset) => {
    setSelectedPreset(preset);
    setDiagnosis(preset.diagnosis);
    setSelectedIcd10Codes(preset.icd10Codes || []);
    setMedications([...preset.medications]);
    setEditModalVisible(true);
  };

  const updatePreset = async () => {
    if (diagnosis.trim() && medications.length > 0) {
      const updatedPresets = presets.map(preset =>
        preset.id === selectedPreset.id
          ? {
              ...preset,
              diagnosis: diagnosis.trim(),
              icd10Codes: selectedIcd10Codes,
              medications: medications
            }
          : preset
      );
      setPresets(updatedPresets);
      
      try {
        await savePresets(updatedPresets);
        setEditModalVisible(false);
        setSelectedPreset(null);
        clearPresetForm();
        Alert.alert('Success', 'Preset updated successfully!');
      } catch (error) {
        Alert.alert('Error', 'Failed to update preset. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Please enter a diagnosis and at least one medication.');
    }
  };

  const deletePreset = async (presetId) => {
    Alert.alert(
      'Delete Preset',
      'Are you sure you want to delete this preset? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedPresets = presets.filter(p => p.id !== presetId);
            setPresets(updatedPresets);
            try {
              await savePresets(updatedPresets);
              Alert.alert('Success', 'Preset deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete preset. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleIcd10Selection = (codes) => {
    setSelectedIcd10Codes(codes);
  };

  const renderPresetCard = ({ item: preset }) => (
    <TouchableOpacity 
      style={[GlobalStyles.card, styles.presetCard]}
      onPress={() => viewPresetDetails(preset)}
      activeOpacity={0.7}
    >
      <View style={styles.presetContent}>
        <Text style={styles.presetDiagnosis}>{preset.diagnosis}</Text>
        
        {/* ICD-10 Codes */}
        {preset.icd10Codes && preset.icd10Codes.length > 0 && (
          <View style={styles.icd10CodesContainer}>
            {preset.icd10Codes.map((code, index) => (
              <View key={code.code} style={styles.icd10CodeChip}>
                <Text style={styles.icd10CodeText}>{code.code}</Text>
              </View>
            ))}
          </View>
        )}
        
        <Text style={styles.medicationCount}>
          {preset.medications.length} medication{preset.medications.length !== 1 ? 's' : ''}
        </Text>
      </View>
      
      <View style={styles.presetActions}>
        <TouchableOpacity
          style={[GlobalStyles.secondaryButton, styles.actionButton]}
          onPress={(e) => {
            e.stopPropagation();
            editPreset(preset);
          }}
        >
          <Text style={GlobalStyles.buttonTextSmall}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[GlobalStyles.dangerButton, styles.actionButton]}
          onPress={(e) => {
            e.stopPropagation();
            deletePreset(preset.id);
          }}
        >
          <Text style={GlobalStyles.buttonTextSmall}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyListContainer}>
      <Text style={styles.emptyIcon}>💊</Text>
      <Text style={GlobalStyles.emptyStateText}>
        {searchText ? `No presets found for "${searchText}"` : 'No preset prescriptions found.'}
        {'\n'}
        {!searchText && 'Create your first preset to get started.'}
      </Text>
      {!searchText && (
        <TouchableOpacity
          style={[GlobalStyles.primaryButton, styles.emptyStateButton]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={GlobalStyles.buttonText}>Create First Preset</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <TexturedBackground>
        <View style={GlobalStyles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBlue} />
          <Text style={GlobalStyles.loadingText}>Loading presets...</Text>
        </View>
      </TexturedBackground>
    );
  }

  return (
    <TexturedBackground>
      <View style={styles.screenContainer}>
        <Text style={GlobalStyles.pageTitle}>Preset Prescriptions</Text>
        
        <TextInput
          style={GlobalStyles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search by diagnosis, medication, or ICD-10 code"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={GlobalStyles.countText}>
          {filteredPresets.length} preset{filteredPresets.length !== 1 ? 's' : ''} found
        </Text>

        <TouchableOpacity
          style={[GlobalStyles.primaryButton, styles.addButton]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={GlobalStyles.buttonText}>+ Add New Preset</Text>
        </TouchableOpacity>

        <View style={styles.listContainer}>
          {filteredPresets.length > 0 ? (
            <FlatList
              data={filteredPresets}
              renderItem={renderPresetCard}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            renderEmptyState()
          )}
        </View>

        {/* Add Preset Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={GlobalStyles.modalOverlay}>
            <View style={[GlobalStyles.modalContent, styles.largeModal]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={GlobalStyles.modalTitle}>Add New Preset</Text>
                
                <Text style={GlobalStyles.inputLabel}>Diagnosis/Condition *</Text>
                <TextInput
                  style={GlobalStyles.input}
                  value={diagnosis}
                  onChangeText={setDiagnosis}
                  placeholder="Enter diagnosis or condition"
                  placeholderTextColor={Colors.textLight}
                />

                {/* ICD-10 Codes Section */}
                <Text style={[GlobalStyles.inputLabel, { marginTop: 16 }]}>ICD-10 Codes</Text>
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

                <Text style={[GlobalStyles.inputLabel, { marginTop: 20 }]}>Medications</Text>
                
                <View style={styles.medicationForm}>
                  <TextInput
                    style={GlobalStyles.input}
                    value={medicationName}
                    onChangeText={setMedicationName}
                    placeholder="Medication name"
                    placeholderTextColor={Colors.textLight}
                  />
                  
                  <TextInput
                    style={GlobalStyles.input}
                    value={dose}
                    onChangeText={setDose}
                    placeholder="Dose (e.g., 500mg)"
                    placeholderTextColor={Colors.textLight}
                  />
                  
                  <TextInput
                    style={GlobalStyles.input}
                    value={direction}
                    onChangeText={setDirection}
                    placeholder="Direction (e.g., Take twice daily)"
                    placeholderTextColor={Colors.textLight}
                  />
                  
                  <TextInput
                    style={GlobalStyles.input}
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="Quantity (e.g., 30 tablets)"
                    placeholderTextColor={Colors.textLight}
                  />
                  
                  <TouchableOpacity
                    style={[GlobalStyles.lightButton, styles.addMedicationButton]}
                    onPress={addMedication}
                  >
                    <Text style={GlobalStyles.buttonText}>
                      {editingMedicationIndex >= 0 ? 'Update Medication' : 'Add Medication'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {medications.length > 0 && (
                  <View style={styles.medicationsList}>
                    <Text style={styles.medicationsTitle}>Added Medications:</Text>
                    {medications.map((medication, index) => (
                      <View key={medication.id} style={styles.medicationItem}>
                        <View style={styles.medicationInfo}>
                          <Text style={styles.medicationItemName}>
                            {medication.name} {medication.dose}
                          </Text>
                          <Text style={styles.medicationItemDirection}>
                            {medication.direction}
                          </Text>
                          <Text style={styles.medicationItemQuantity}>
                            Quantity: {medication.quantity}
                          </Text>
                        </View>
                        <View style={styles.medicationItemActions}>
                          <TouchableOpacity
                            style={[GlobalStyles.lightButton, styles.smallActionButton]}
                            onPress={() => editMedication(index)}
                          >
                            <Text style={styles.smallButtonText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[GlobalStyles.dangerButton, styles.smallActionButton]}
                            onPress={() => removeMedication(index)}
                          >
                            <Text style={styles.smallButtonText}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
                
                <View style={GlobalStyles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[GlobalStyles.modalButton, GlobalStyles.lightButton]}
                    onPress={() => {
                      setModalVisible(false);
                      clearPresetForm();
                    }}
                  >
                    <Text style={GlobalStyles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[GlobalStyles.modalButton, GlobalStyles.primaryButton]}
                    onPress={addNewPreset}
                  >
                    <Text style={GlobalStyles.buttonText}>Add Preset</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Edit Preset Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={GlobalStyles.modalOverlay}>
            <View style={[GlobalStyles.modalContent, styles.largeModal]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={GlobalStyles.modalTitle}>Edit Preset</Text>
                
                <Text style={GlobalStyles.inputLabel}>Diagnosis/Condition *</Text>
                <TextInput
                  style={GlobalStyles.input}
                  value={diagnosis}
                  onChangeText={setDiagnosis}
                  placeholder="Enter diagnosis or condition"
                  placeholderTextColor={Colors.textLight}
                />

                {/* ICD-10 Codes Section */}
                <Text style={[GlobalStyles.inputLabel, { marginTop: 16 }]}>ICD-10 Codes</Text>
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

                <Text style={[GlobalStyles.inputLabel, { marginTop: 20 }]}>Medications</Text>
                
                <View style={styles.medicationForm}>
                  <TextInput
                    style={GlobalStyles.input}
                    value={medicationName}
                    onChangeText={setMedicationName}
                    placeholder="Medication name"
                    placeholderTextColor={Colors.textLight}
                  />
                  
                  <TextInput
                    style={GlobalStyles.input}
                    value={dose}
                    onChangeText={setDose}
                    placeholder="Dose (e.g., 500mg)"
                    placeholderTextColor={Colors.textLight}
                  />
                  
                  <TextInput
                    style={GlobalStyles.input}
                    value={direction}
                    onChangeText={setDirection}
                    placeholder="Direction (e.g., Take twice daily)"
                    placeholderTextColor={Colors.textLight}
                  />
                  
                  <TextInput
                    style={GlobalStyles.input}
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="Quantity (e.g., 30 tablets)"
                    placeholderTextColor={Colors.textLight}
                  />
                  
                  <TouchableOpacity
                    style={[GlobalStyles.lightButton, styles.addMedicationButton]}
                    onPress={addMedication}
                  >
                    <Text style={GlobalStyles.buttonText}>
                      {editingMedicationIndex >= 0 ? 'Update Medication' : 'Add Medication'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {medications.length > 0 && (
                  <View style={styles.medicationsList}>
                    <Text style={styles.medicationsTitle}>Medications:</Text>
                    {medications.map((medication, index) => (
                      <View key={medication.id} style={styles.medicationItem}>
                        <View style={styles.medicationInfo}>
                          <Text style={styles.medicationItemName}>
                            {medication.name} {medication.dose}
                          </Text>
                          <Text style={styles.medicationItemDirection}>
                            {medication.direction}
                          </Text>
                          <Text style={styles.medicationItemQuantity}>
                            Quantity: {medication.quantity}
                          </Text>
                        </View>
                        <View style={styles.medicationItemActions}>
                          <TouchableOpacity
                            style={[GlobalStyles.lightButton, styles.smallActionButton]}
                            onPress={() => editMedication(index)}
                          >
                            <Text style={styles.smallButtonText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[GlobalStyles.dangerButton, styles.smallActionButton]}
                            onPress={() => removeMedication(index)}
                          >
                            <Text style={styles.smallButtonText}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
                
                <View style={GlobalStyles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[GlobalStyles.modalButton, GlobalStyles.lightButton]}
                    onPress={() => {
                      setEditModalVisible(false);
                      setSelectedPreset(null);
                      clearPresetForm();
                    }}
                  >
                    <Text style={GlobalStyles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[GlobalStyles.modalButton, GlobalStyles.secondaryButton]}
                    onPress={updatePreset}
                  >
                    <Text style={GlobalStyles.buttonText}>Update Preset</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Preset Details Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={detailsModalVisible}
          onRequestClose={() => setDetailsModalVisible(false)}
        >
          <View style={GlobalStyles.modalOverlay}>
            <View style={[GlobalStyles.modalContent, styles.detailsModal]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={GlobalStyles.modalTitle}>Preset Details</Text>
                
                {selectedPreset && (
                  <>
                    <Text style={styles.detailsTitle}>Diagnosis:</Text>
                    <Text style={styles.detailsText}>{selectedPreset.diagnosis}</Text>
                    
                    {/* ICD-10 Codes Display */}
                    {selectedPreset.icd10Codes && selectedPreset.icd10Codes.length > 0 && (
                      <>
                        <Text style={[styles.detailsTitle, { marginTop: 16 }]}>
                          ICD-10 Codes ({selectedPreset.icd10Codes.length}):
                        </Text>
                        {selectedPreset.icd10Codes.map((code) => (
                          <View key={code.code} style={styles.detailsIcd10Item}>
                            <Text style={styles.detailsIcd10Code}>{code.code}</Text>
                            <Text style={styles.detailsIcd10Description}>{code.description}</Text>
                          </View>
                        ))}
                      </>
                    )}
                    
                    <Text style={[styles.detailsTitle, { marginTop: 20 }]}>
                      Medications ({selectedPreset.medications.length}):
                    </Text>
                    
                    {selectedPreset.medications.map((medication, index) => (
                      <View key={medication.id} style={styles.medicationDetailCard}>
                        <Text style={styles.medicationDetailName}>
                          {index + 1}. {medication.name} {medication.dose}
                        </Text>
                        <Text style={styles.medicationDetailDirection}>
                          {medication.direction}
                        </Text>
                        <Text style={styles.medicationDetailQuantity}>
                          Quantity: {medication.quantity}
                        </Text>
                      </View>
                    ))}
                  </>
                )}
                
                <View style={[GlobalStyles.modalButtonContainer, { marginTop: 20 }]}>
                  <TouchableOpacity
                    style={[GlobalStyles.modalButton, GlobalStyles.lightButton]}
                    onPress={() => setDetailsModalVisible(false)}
                  >
                    <Text style={GlobalStyles.buttonText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[GlobalStyles.modalButton, GlobalStyles.secondaryButton]}
                    onPress={() => {
                      setDetailsModalVisible(false);
                      setTimeout(() => editPreset(selectedPreset), 100);
                    }}
                  >
                    <Text style={GlobalStyles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* ICD-10 Selection Modal */}
        <ICD10SelectionModal
          visible={icd10ModalVisible}
          onClose={() => setIcd10ModalVisible(false)}
          onSelect={handleIcd10Selection}
          selectedCodes={selectedIcd10Codes}
          multiSelect={true}
        />
      </View>
    </TexturedBackground>
  );
}

const styles = StyleSheet.create({
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

  screenContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },

  addButton: {
    paddingVertical: 14,
    marginBottom: 12,
  },

  listContainer: {
    flex: 1,
    marginBottom: 8,
  },

  listContent: {
    paddingBottom: 16,
    flexGrow: 1,
  },

  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  presetCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
    borderLeftColor: Colors.primaryBlue,
    borderLeftWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  presetContent: {
    flex: 1,
    marginRight: 12,
  },

  presetDiagnosis: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },

  icd10CodesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },

  icd10CodeChip: {
    backgroundColor: Colors.accentBlue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },

  icd10CodeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primaryBlue,
  },

  medicationCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },

  presetActions: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 60,
  },

  largeModal: {
    maxHeight: '90%',
    width: '95%',
  },

  detailsModal: {
    maxHeight: '80%',
    width: '95%',
  },

  // ICD-10 Button and Selection Styles
  icd10Button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
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

  medicationForm: {
    gap: 10,
    marginBottom: 16,
  },

  addMedicationButton: {
    paddingVertical: 12,
    marginTop: 8,
  },

  medicationsList: {
    marginBottom: 16,
  },

  medicationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },

  medicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: Colors.backgroundGrey,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },

  medicationInfo: {
    flex: 1,
    marginRight: 12,
  },

  medicationItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },

  medicationItemDirection: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },

  medicationItemQuantity: {
    fontSize: 12,
    color: Colors.textLight,
  },

  medicationItemActions: {
    flexDirection: 'row',
    gap: 4,
  },

  smallActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 40,
  },

  smallButtonText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  },

  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },

  detailsText: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 4,
  },

  detailsIcd10Item: {
    backgroundColor: Colors.backgroundGrey,
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },

  detailsIcd10Code: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primaryBlue,
    marginBottom: 2,
  },

  detailsIcd10Description: {
    fontSize: 11,
    color: Colors.textPrimary,
  },

  medicationDetailCard: {
    backgroundColor: Colors.backgroundGrey,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.lightBlue,
  },

  medicationDetailName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },

  medicationDetailDirection: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },

  medicationDetailQuantity: {
    fontSize: 12,
    color: Colors.textLight,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    textAlign: 'center',
  },

  emptyStateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
});

export default PresetPrescriptionScreen;