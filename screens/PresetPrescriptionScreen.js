import React from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

function PresetPrescriptionScreen({ navigation }) {
  const [presets, setPresets] = React.useState([
    { id: 1, name: 'Common Cold', prescription: 'Paracetamol 500mg\nTake 1 tablet every 6 hours\nDuration: 3 days' },
    { id: 2, name: 'Headache', prescription: 'Ibuprofen 400mg\nTake 1 tablet when needed\nMax 3 times daily' },
    { id: 3, name: 'Cough', prescription: 'Cough syrup 10ml\nTake 3 times daily\nDuration: 5 days' },
    { id: 4, name: 'Allergies', prescription: 'Antihistamine 10mg\nTake 1 tablet daily\nDuration: 7 days' },
    { id: 5, name: 'Sore Throat', prescription: 'Throat lozenges\nSuck 1 every 2-3 hours\nDuration: 5 days' },
  ]);

  const [modalVisible, setModalVisible] = React.useState(false);
  const [newPresetName, setNewPresetName] = React.useState('');
  const [newPresetPrescription, setNewPresetPrescription] = React.useState('');

  const selectPreset = (preset) => {
    Alert.alert(
      'Use Preset',
      `Do you want to use the preset for ${preset.name}?`,
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

  const deletePreset = (presetId) => {
    Alert.alert(
      'Delete Preset',
      'Are you sure you want to delete this preset?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setPresets(presets.filter(preset => preset.id !== presetId));
          }
        }
      ]
    );
  };

  const addNewPreset = () => {
    if (newPresetName.trim() && newPresetPrescription.trim()) {
      const newPreset = {
        id: Date.now(),
        name: newPresetName.trim(),
        prescription: newPresetPrescription.trim()
      };
      setPresets([...presets, newPreset]);
      setNewPresetName('');
      setNewPresetPrescription('');
      setModalVisible(false);
      Alert.alert('Success', 'New preset added successfully!');
    } else {
      Alert.alert('Error', 'Please fill in both fields.');
    }
  };

  const clearForm = () => {
    setNewPresetName('');
    setNewPresetPrescription('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Preset Prescriptions</Text>
      
      <ScrollView style={styles.presetList}>
        {presets.map((preset) => (
          <View key={preset.id} style={styles.presetItem}>
            <TouchableOpacity
              style={styles.presetContent}
              onPress={() => selectPreset(preset)}
            >
              <Text style={styles.presetName}>{preset.name}</Text>
              <Text style={styles.presetPreview}>{preset.prescription}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deletePreset(preset.id)}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.addPresetButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>+ Add New Preset</Text>
      </TouchableOpacity>

      {/* Add New Preset Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Preset</Text>
            
            <Text style={styles.inputLabel}>Preset Name:</Text>
            <TextInput
              style={styles.modalInput}
              value={newPresetName}
              onChangeText={setNewPresetName}
              placeholder="e.g., Common Cold"
            />
            
            <Text style={styles.inputLabel}>Prescription:</Text>
            <TextInput
              style={[styles.modalInput, styles.prescriptionTextArea]}
              value={newPresetPrescription}
              onChangeText={setNewPresetPrescription}
              placeholder="Enter prescription details..."
              multiline
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  clearForm();
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={addNewPreset}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  presetList: {
    flex: 1,
  },
  presetItem: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    overflow: 'hidden',
  },
  presetContent: {
    flex: 1,
    padding: 15,
  },
  presetName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  presetPreview: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addPresetButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
  },
  prescriptionTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
});

export default PresetPrescriptionScreen;