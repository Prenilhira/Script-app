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
    {/* Base background */}
    <View style={styles.backgroundBase} />
    
    {/* Subtle texture overlays */}
    <View style={styles.textureLayer1} />
    <View style={styles.textureLayer2} />
    
    {/* Content */}
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
        // Initialize with sample data
        const samplePresets = [
          {
            id: 1,
            diagnosis: 'Common Cold',
            medications: [
              { id: 1, name: 'Paracetamol', dose: '500mg', direction: 'Take every 6 hours', quantity: '20 tablets' },
              { id: 2, name: 'Cough Syrup', dose: '10ml', direction: 'Take 3 times daily', quantity: '100ml bottle' }
            ]
          },
          {
            id: 2,
            diagnosis: 'Headache',
            medications: [
              { id: 1, name: 'Ibuprofen', dose: '400mg', direction: 'Take when needed', quantity: '10 tablets' }
            ]
          },
          {
            id: 3,
            diagnosis: 'Allergies',
            medications: [
              { id: 1, name: 'Antihistamine', dose: '10mg', direction: 'Take once daily', quantity: '30 tablets' },
              { id: 2, name: 'Nasal Spray', dose: '2 sprays', direction: 'Use twice daily', quantity: '1 bottle' }
            ]
          }
        ];
        setPresets(samplePresets);
        await savePresets(samplePresets);
      }
    } catch (error) {
      console.error('Error loading presets:', error);
      Alert.alert('Error', 'Failed to load presets');
    } finally {
      setLoading(false);
    }
  };

  const savePresets = async (presetsToSave) => {
    try {
      await AsyncStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presetsToSave));
    } catch (error) {
      console.error('Error saving presets:', error);
      Alert.alert('Error', 'Failed to save presets');
    }
  };

  const filteredPresets = presets.filter(preset =>
    preset.diagnosis.toLowerCase().includes(searchText.toLowerCase())
  );

  const openCreateModal = () => {
    setDiagnosis('');
    setMedications([]);
    clearMedicationForm();
    setModalVisible(true);
  };

  const openEditModal = (preset) => {
    setSelectedPreset(preset);
    setDiagnosis(preset.diagnosis);
    setMedications([...preset.medications]);
    clearMedicationForm();
    setEditModalVisible(true);
  };

  const deletePreset = (presetId) => {
    Alert.alert(
      'Delete Preset',
      'Are you sure you want to delete this preset?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const updatedPresets = presets.filter(preset => preset.id !== presetId);
            setPresets(updatedPresets);
            await savePresets(updatedPresets);
            Alert.alert('Success', 'Preset deleted successfully');
          }
        }
      ]
    );
  };

  const addMedication = () => {
    if (medicationName.trim() && dose.trim() && direction.trim() && quantity.trim()) {
      const newMedication = {
        id: Date.now(),
        name: medicationName.trim(),
        dose: dose.trim(),
        direction: direction.trim(),
        quantity: quantity.trim()
      };
      
      if (editingMedicationIndex >= 0) {
        // Editing existing medication
        const updatedMedications = [...medications];
        updatedMedications[editingMedicationIndex] = { ...newMedication, id: medications[editingMedicationIndex].id };
        setMedications(updatedMedications);
        setEditingMedicationIndex(-1);
      } else {
        // Adding new medication
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
    setEditingMedicationIndex(-1);
  };

  const savePreset = async () => {
    if (diagnosis.trim() && medications.length > 0) {
      const newPreset = {
        id: Date.now(),
        diagnosis: diagnosis.trim(),
        medications: medications
      };
      const updatedPresets = [...presets, newPreset];
      setPresets(updatedPresets);
      await savePresets(updatedPresets);
      setModalVisible(false);
      Alert.alert('Success', 'New preset created successfully!');
    } else {
      Alert.alert('Error', 'Please add a diagnosis and at least one medication.');
    }
  };

  const updatePreset = async () => {
    if (diagnosis.trim() && medications.length > 0) {
      const updatedPresets = presets.map(preset =>
        preset.id === selectedPreset.id
          ? { ...preset, diagnosis: diagnosis.trim(), medications: medications }
          : preset
      );
      setPresets(updatedPresets);
      await savePresets(updatedPresets);
      setEditModalVisible(false);
      setSelectedPreset(null);
      Alert.alert('Success', 'Preset updated successfully!');
    } else {
      Alert.alert('Error', 'Please add a diagnosis and at least one medication.');
    }
  };

  const usePreset = (preset) => {
    Alert.alert(
      'Use Preset',
      `Use "${preset.diagnosis}" preset for prescription?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Use', 
          onPress: () => {
            navigation.navigate('CreateScript', { preset: preset });
          }
        }
      ]
    );
  };

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
        <Text style={GlobalStyles.pageTitle}>Prescription Presets</Text>
        
        {/* Search Bar */}
        <TextInput
          style={GlobalStyles.searchInput}
          placeholder="Search by diagnosis..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={Colors.textLight}
        />

        {/* Presets Count */}
        <Text style={GlobalStyles.countText}>
          {filteredPresets.length} preset{filteredPresets.length !== 1 ? 's' : ''} found
        </Text>

        {/* Presets List */}
        <ScrollView style={styles.presetsList} showsVerticalScrollIndicator={false}>
          {filteredPresets.length === 0 ? (
            <View style={GlobalStyles.emptyState}>
              <Text style={GlobalStyles.emptyStateText}>
                {searchText ? 'No presets match your search' : 'No presets created yet'}
              </Text>
              {!searchText && (
                <TouchableOpacity
                  style={GlobalStyles.secondaryButton}
                  onPress={openCreateModal}
                >
                  <Text style={GlobalStyles.buttonText}>Create Your First Preset</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredPresets.map((preset) => (
              <View key={preset.id} style={[GlobalStyles.card, styles.presetCard]}>
                <TouchableOpacity
                  style={styles.presetContent}
                  onPress={() => usePreset(preset)}
                >
                  <Text style={GlobalStyles.cardTitle}>{preset.diagnosis}</Text>
                  <Text style={styles.medicationCount}>
                    {preset.medications.length} medication{preset.medications.length !== 1 ? 's' : ''}
                  </Text>
                  <View style={styles.medicationPreview}>
                    {preset.medications.slice(0, 2).map((med, index) => (
                      <Text key={index} style={styles.medicationText}>
                        • {med.name} {med.dose}
                      </Text>
                    ))}
                    {preset.medications.length > 2 && (
                      <Text style={styles.moreText}>
                        +{preset.medications.length - 2} more...
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[GlobalStyles.lightButton, styles.actionButton]}
                    onPress={() => openEditModal(preset)}
                  >
                    <Text style={GlobalStyles.buttonTextSmall}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[GlobalStyles.dangerButton, styles.actionButton]}
                    onPress={() => deletePreset(preset.id)}
                  >
                    <Text style={GlobalStyles.buttonTextSmall}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Add New Preset Button */}
        <TouchableOpacity
          style={[GlobalStyles.primaryButton, styles.addPresetButton]}
          onPress={openCreateModal}
        >
          <Text style={GlobalStyles.buttonText}>+ Create New Preset</Text>
        </TouchableOpacity>

        {/* Create Preset Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={GlobalStyles.modalOverlay}>
            <View style={[GlobalStyles.modalContent, styles.largeModal]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={GlobalStyles.modalTitle}>Create New Preset</Text>
                
                <Text style={GlobalStyles.inputLabel}>Diagnosis *</Text>
                <TextInput
                  style={GlobalStyles.input}
                  value={diagnosis}
                  onChangeText={setDiagnosis}
                  placeholder="e.g., Common Cold, Flu, Headache"
                  placeholderTextColor={Colors.textLight}
                />

                {/* Medications Section */}
                <Text style={[GlobalStyles.sectionTitle, styles.medicationsTitle]}>Medications</Text>
                
                {/* Add/Edit Medication Form */}
                <View style={styles.medicationForm}>
                  <Text style={GlobalStyles.inputLabel}>Medication Name *</Text>
                  <TextInput
                    style={GlobalStyles.input}
                    value={medicationName}
                    onChangeText={setMedicationName}
                    placeholder="e.g., Paracetamol"
                    placeholderTextColor={Colors.textLight}
                  />
                  
                  <Text style={GlobalStyles.inputLabel}>Dose *</Text>
                  <TextInput
                    style={GlobalStyles.input}
                    value={dose}
                    onChangeText={setDose}
                    placeholder="e.g., 500mg, 10ml"
                    placeholderTextColor={Colors.textLight}
                  />
                  
                  <Text style={GlobalStyles.inputLabel}>Direction *</Text>
                  <TextInput
                    style={GlobalStyles.input}
                    value={direction}
                    onChangeText={setDirection}
                    placeholder="e.g., Take every 6 hours"
                    placeholderTextColor={Colors.textLight}
                  />
                  
                  <Text style={GlobalStyles.inputLabel}>Quantity *</Text>
                  <TextInput
                    style={GlobalStyles.input}
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="e.g., 20 tablets, 100ml bottle"
                    placeholderTextColor={Colors.textLight}
                  />
                  
                  <View style={styles.medicationButtonContainer}>
                    {editingMedicationIndex >= 0 && (
                      <TouchableOpacity
                        style={[GlobalStyles.modalButton, styles.cancelEditButton]}
                        onPress={clearMedicationForm}
                      >
                        <Text style={GlobalStyles.buttonText}>Cancel Edit</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[GlobalStyles.modalButton, GlobalStyles.secondaryButton]}
                      onPress={addMedication}
                    >
                      <Text style={GlobalStyles.buttonText}>
                        {editingMedicationIndex >= 0 ? '✓ Update' : '+ Add'} Medication
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Medications List */}
                {medications.length > 0 && (
                  <View style={styles.medicationsList}>
                    <Text style={styles.medicationsListTitle}>Added Medications:</Text>
                    {medications.map((medication, index) => (
                      <View key={medication.id} style={styles.medicationItem}>
                        <View style={styles.medicationInfo}>
                          <Text style={styles.medicationNameText}>{medication.name}</Text>
                          <Text style={styles.medicationDetailsText}>
                            {medication.dose} - {medication.direction} - {medication.quantity}
                          </Text>
                        </View>
                        <View style={styles.medicationActions}>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => editMedication(index)}
                          >
                            <Text style={styles.iconText}>✏️</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => deleteMedication(index)}
                          >
                            <Text style={styles.iconText}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
                
                <View style={GlobalStyles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[GlobalStyles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setModalVisible(false);
                      clearMedicationForm();
                    }}
                  >
                    <Text style={GlobalStyles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[GlobalStyles.modalButton, GlobalStyles.primaryButton]}
                    onPress={savePreset}
                  >
                    <Text style={GlobalStyles.buttonText}>Create Preset</Text>
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
                
                <Text style={GlobalStyles.inputLabel}>Diagnosis *</Text>
                <TextInput
                  style={GlobalStyles.input}
                  value={diagnosis}
                  onChangeText={setDiagnosis}
                  placeholder="e.g., Common Cold, Flu, Headache"
                  placeholderTextColor={Colors.textLight}
                />

                {/* Medications Section */}
                <Text style={[GlobalStyles.sectionTitle, styles.medicationsTitle]}>Medications</Text>
                
                {/* Add/Edit Medication Form */}
                <View style={styles.medicationForm}>
                  <Text style={GlobalStyles.inputLabel}>Medication Name *</Text>
                  <TextInput
                    style={GlobalStyles.input}
                    value={medicationName}
                    onChangeText={setMedicationName}
                    placeholder="e.g., Paracetamol"
                    placeholderTextColor={Colors.textLight}
                  />
                  
                  <Text style={GlobalStyles.inputLabel}>Dose *</Text>
                  <TextInput
                    style={GlobalStyles.input}
                    value={dose}
                    onChangeText={setDose}
                    placeholder="e.g., 500mg, 10ml"
                    placeholderTextColor={Colors.textLight}
                  />
                  
                  <Text style={GlobalStyles.inputLabel}>Direction *</Text>
                  <TextInput
                    style={GlobalStyles.input}
                    value={direction}
                    onChangeText={setDirection}
                    placeholder="e.g., Take every 6 hours"
                    placeholderTextColor={Colors.textLight}
                  />
                  
                  <Text style={GlobalStyles.inputLabel}>Quantity *</Text>
                  <TextInput
                    style={GlobalStyles.input}
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="e.g., 20 tablets, 100ml bottle"
                    placeholderTextColor={Colors.textLight}
                  />
                  
                  <View style={styles.medicationButtonContainer}>
                    {editingMedicationIndex >= 0 && (
                      <TouchableOpacity
                        style={[GlobalStyles.modalButton, styles.cancelEditButton]}
                        onPress={clearMedicationForm}
                      >
                        <Text style={GlobalStyles.buttonText}>Cancel Edit</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[GlobalStyles.modalButton, GlobalStyles.secondaryButton]}
                      onPress={addMedication}
                    >
                      <Text style={GlobalStyles.buttonText}>
                        {editingMedicationIndex >= 0 ? '✓ Update' : '+ Add'} Medication
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Medications List */}
                {medications.length > 0 && (
                  <View style={styles.medicationsList}>
                    <Text style={styles.medicationsListTitle}>Added Medications:</Text>
                    {medications.map((medication, index) => (
                      <View key={medication.id} style={styles.medicationItem}>
                        <View style={styles.medicationInfo}>
                          <Text style={styles.medicationNameText}>{medication.name}</Text>
                          <Text style={styles.medicationDetailsText}>
                            {medication.dose} - {medication.direction} - {medication.quantity}
                          </Text>
                        </View>
                        <View style={styles.medicationActions}>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => editMedication(index)}
                          >
                            <Text style={styles.iconText}>✏️</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => deleteMedication(index)}
                          >
                            <Text style={styles.iconText}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
                
                <View style={GlobalStyles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[GlobalStyles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setEditModalVisible(false);
                      setSelectedPreset(null);
                      clearMedicationForm();
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
  presetsList: {
    flex: 1,
    marginBottom: 16,
  },

  presetCard: {
    marginVertical: 6,
    borderLeftColor: Colors.primaryBlue,
    borderLeftWidth: 5,
  },

  presetContent: {
    paddingBottom: 12,
  },

  medicationCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },

  medicationPreview: {
    backgroundColor: Colors.backgroundGrey,
    padding: 12,
    borderRadius: 8,
  },

  medicationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },

  moreText: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginTop: 4,
  },

  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderGrey,
    gap: 12,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 8,
  },

  addPresetButton: {
    marginTop: 8,
    marginBottom: 20,
  },

  // Modal Styles
  largeModal: {
    maxHeight: '90%',
    width: '95%',
  },

  medicationsTitle: {
    marginTop: 20,
    marginBottom: 16,
  },

  medicationForm: {
    backgroundColor: Colors.backgroundGrey,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },

  medicationButtonContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },

  cancelEditButton: {
    backgroundColor: Colors.textGrey,
  },

  medicationsList: {
    marginBottom: 20,
  },

  medicationsListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },

  medicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.lightBlue,
  },

  medicationInfo: {
    flex: 1,
  },

  medicationNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },

  medicationDetailsText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  medicationActions: {
    flexDirection: 'row',
    gap: 8,
  },

  iconButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: Colors.backgroundGrey,
  },

  iconText: {
    fontSize: 16,
  },

  cancelButton: {
    backgroundColor: Colors.textGrey,
  },
});

export default PresetPrescriptionScreen;