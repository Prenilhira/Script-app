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
import { GlobalStyles, Colors } from '../GlobalStyles';

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

function PresetPrescriptionScreen({ navigation }) {
  const [presets, setPresets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [selectedPreset, setSelectedPreset] = React.useState(null);
  const [searchText, setSearchText] = React.useState('');

  // Preset form fields
  const [diagnosis, setDiagnosis] = React.useState('');
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

  const loadPresets = async () => {
    try {
      setLoading(true);
      const storedPresets = await AsyncStorage.getItem(PRESETS_STORAGE_KEY);
      if (storedPresets) {
        setPresets(JSON.parse(storedPresets));
      } else {
        // Start with empty array - no sample data
        setPresets([]);
      }
    } catch (error) {
      console.error('Error loading presets:', error);
      Alert.alert('Error', 'Failed to load presets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const savePresets = async (presetsData) => {
    try {
      await AsyncStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presetsData));
    } catch (error) {
      console.error('Error saving presets:', error);
      throw error;
    }
  };

  const addNewPreset = async () => {
    if (diagnosis.trim() && medications.length > 0) {
      const newPreset = {
        id: Date.now(),
        diagnosis: diagnosis.trim(),
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

  const updatePreset = async () => {
    if (diagnosis.trim() && medications.length > 0) {
      const updatedPresets = presets.map(preset =>
        preset.id === selectedPreset.id
          ? {
              ...preset,
              diagnosis: diagnosis.trim(),
              medications: medications.map(med => ({
                ...med,
                id: med.id || Date.now() + Math.random()
              }))
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

  const deletePreset = (preset) => {
    Alert.alert(
      'Delete Preset',
      `Are you sure you want to delete the "${preset.diagnosis}" preset?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const updatedPresets = presets.filter(p => p.id !== preset.id);
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

  const editPreset = (preset) => {
    setSelectedPreset(preset);
    setDiagnosis(preset.diagnosis);
    setMedications([...preset.medications]);
    setEditModalVisible(true);
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

  const deleteMedication = (index) => {
    const updatedMedications = medications.filter((_, i) => i !== index);
    setMedications(updatedMedications);
  };

  const clearPresetForm = () => {
    setDiagnosis('');
    setMedications([]);
    clearMedicationForm();
  };

  const clearMedicationForm = () => {
    setMedicationName('');
    setDose('');
    setDirection('');
    setQuantity('');
    setEditingMedicationIndex(-1);
  };

  const filteredPresets = presets.filter(preset =>
    preset.diagnosis.toLowerCase().includes(searchText.toLowerCase())
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
      <View style={GlobalStyles.padding}>
        <Text style={GlobalStyles.pageTitle}>Preset Prescriptions</Text>
        
        {/* Search Bar */}
        <TextInput
          style={GlobalStyles.searchInput}
          placeholder="Search by diagnosis..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={Colors.textLight}
        />

        {/* Preset Count */}
        <Text style={GlobalStyles.countText}>
          {filteredPresets.length} preset{filteredPresets.length !== 1 ? 's' : ''} found
        </Text>

        {/* Add New Preset Button */}
        <TouchableOpacity
          style={[GlobalStyles.primaryButton, styles.addButton]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={GlobalStyles.buttonText}>+ Add New Preset</Text>
        </TouchableOpacity>

        {/* Presets List */}
        <ScrollView style={styles.presetsList} showsVerticalScrollIndicator={false}>
          {filteredPresets.length === 0 ? (
            <View style={GlobalStyles.emptyState}>
              <Text style={GlobalStyles.emptyStateText}>
                {searchText ? 
                  'No presets found matching your search.' : 
                  'No presets created yet.\nTap "Add New Preset" to get started.'}
              </Text>
            </View>
          ) : (
            filteredPresets.map((preset) => (
              <View key={preset.id} style={[GlobalStyles.card, styles.presetCard]}>
                <View style={styles.presetContent}>
                  <Text style={styles.presetDiagnosis}>{preset.diagnosis}</Text>
                  <Text style={styles.medicationCount}>
                    {preset.medications.length} medication{preset.medications.length !== 1 ? 's' : ''}
                  </Text>
                  
                  <View style={styles.medicationPreview}>
                    {preset.medications.slice(0, 3).map((medication, index) => (
                      <Text key={medication.id || index} style={styles.medicationText}>
                        • {medication.name} {medication.dose}
                      </Text>
                    ))}
                    {preset.medications.length > 3 && (
                      <Text style={styles.moreText}>
                        +{preset.medications.length - 3} more...
                      </Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.presetActions}>
                  <TouchableOpacity
                    style={[GlobalStyles.secondaryButton, styles.actionButton]}
                    onPress={() => editPreset(preset)}
                  >
                    <Text style={GlobalStyles.buttonTextSmall}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[GlobalStyles.dangerButton, styles.actionButton]}
                    onPress={() => deletePreset(preset)}
                  >
                    <Text style={GlobalStyles.buttonTextSmall}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

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
                
                {/* Diagnosis Input */}
                <Text style={GlobalStyles.inputLabel}>Diagnosis/Condition *</Text>
                <TextInput
                  style={GlobalStyles.input}
                  value={diagnosis}
                  onChangeText={setDiagnosis}
                  placeholder="Enter diagnosis or condition"
                  placeholderTextColor={Colors.textLight}
                />

                {/* Medications Section */}
                <Text style={[GlobalStyles.inputLabel, { marginTop: 20 }]}>Medications</Text>
                
                {/* Medication Form */}
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

                {/* Medications List */}
                {medications.length > 0 && (
                  <View style={styles.medicationsList}>
                    <Text style={styles.medicationsTitle}>Added Medications:</Text>
                    {medications.map((medication, index) => (
                      <View key={medication.id || index} style={styles.medicationItem}>
                        <View style={styles.medicationInfo}>
                          <Text style={styles.medicationItemName}>
                            {medication.name} {medication.dose}
                          </Text>
                          <Text style={styles.medicationItemDirection}>
                            {medication.direction}
                          </Text>
                          <Text style={styles.medicationItemQuantity}>
                            Qty: {medication.quantity}
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
                            onPress={() => deleteMedication(index)}
                          >
                            <Text style={styles.smallButtonText}>×</Text>
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
                
                {/* Diagnosis Input */}
                <Text style={GlobalStyles.inputLabel}>Diagnosis/Condition *</Text>
                <TextInput
                  style={GlobalStyles.input}
                  value={diagnosis}
                  onChangeText={setDiagnosis}
                  placeholder="Enter diagnosis or condition"
                  placeholderTextColor={Colors.textLight}
                />

                {/* Medications Section */}
                <Text style={[GlobalStyles.inputLabel, { marginTop: 20 }]}>Medications</Text>
                
                {/* Medication Form */}
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

                {/* Medications List */}
                {medications.length > 0 && (
                  <View style={styles.medicationsList}>
                    <Text style={styles.medicationsTitle}>Medications:</Text>
                    {medications.map((medication, index) => (
                      <View key={medication.id || index} style={styles.medicationItem}>
                        <View style={styles.medicationInfo}>
                          <Text style={styles.medicationItemName}>
                            {medication.name} {medication.dose}
                          </Text>
                          <Text style={styles.medicationItemDirection}>
                            {medication.direction}
                          </Text>
                          <Text style={styles.medicationItemQuantity}>
                            Qty: {medication.quantity}
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
                            onPress={() => deleteMedication(index)}
                          >
                            <Text style={styles.smallButtonText}>×</Text>
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

  // Component Styles
  addButton: {
    paddingVertical: 14,
    marginBottom: 16,
  },

  presetsList: {
    flex: 1,
    marginBottom: 16,
  },

  presetCard: {
    marginVertical: 4,
    borderLeftColor: Colors.primaryBlue,
    borderLeftWidth: 4,
  },

  presetContent: {
    flex: 1,
    marginBottom: 12,
  },

  presetDiagnosis: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },

  medicationCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },

  medicationPreview: {
    backgroundColor: Colors.backgroundGrey,
    padding: 10,
    borderRadius: 8,
  },

  medicationText: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginBottom: 2,
  },

  moreText: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginTop: 4,
  },

  presetActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },

  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 60,
  },

  // Modal Styles
  largeModal: {
    maxHeight: '90%',
    width: '95%',
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
});

export default PresetPrescriptionScreen;