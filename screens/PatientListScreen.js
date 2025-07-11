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

function PatientListScreen({ navigation }) {
  const [patients, setPatients] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState(null);
  const [searchText, setSearchText] = React.useState('');
  
  // New patient form fields
  const [newPatientName, setNewPatientName] = React.useState('');
  const [newPatientSurname, setNewPatientSurname] = React.useState('');
  const [newPatientCellNumber, setNewPatientCellNumber] = React.useState('');

  // Edit patient form fields
  const [editPatientName, setEditPatientName] = React.useState('');
  const [editPatientSurname, setEditPatientSurname] = React.useState('');
  const [editPatientCellNumber, setEditPatientCellNumber] = React.useState('');

  React.useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const storedPatients = await AsyncStorage.getItem(PATIENTS_STORAGE_KEY);
      if (storedPatients) {
        const parsedPatients = JSON.parse(storedPatients);
        const updatedPatients = parsedPatients.map(patient => ({
          ...patient,
          cellNumber: patient.cellNumber || ''
        }));
        setPatients(updatedPatients);
        
        if (parsedPatients.some(p => !p.hasOwnProperty('cellNumber'))) {
          await savePatients(updatedPatients);
        }
      } else {
        // Start with empty array - no sample data
        setPatients([]);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      Alert.alert('Error', 'Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const savePatients = async (patientsData) => {
    try {
      await AsyncStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patientsData));
    } catch (error) {
      console.error('Error saving patients:', error);
      throw error;
    }
  };

  const formatCellNumber = (cellNumber) => {
    // Remove all non-digits
    const digits = cellNumber.replace(/\D/g, '');
    
    // If it starts with 27, keep as is
    if (digits.startsWith('27')) {
      return `+${digits}`;
    }
    
    // If it starts with 0, replace with +27
    if (digits.startsWith('0')) {
      return `+27${digits.substring(1)}`;
    }
    
    // If it doesn't start with 0 or 27, assume it's missing country code
    if (digits.length === 9) {
      return `+27${digits}`;
    }
    
    return cellNumber;
  };

  const addNewPatient = async () => {
    if (newPatientName.trim() && newPatientSurname.trim()) {
      const newPatient = {
        id: Date.now(),
        name: newPatientName.trim(),
        surname: newPatientSurname.trim(),
        cellNumber: formatCellNumber(newPatientCellNumber.trim()),
        prescriptions: []
      };
      
      const updatedPatients = [...patients, newPatient];
      setPatients(updatedPatients);
      
      try {
        await savePatients(updatedPatients);
        setModalVisible(false);
        clearNewPatientForm();
        Alert.alert('Success', 'Patient added successfully!');
      } catch (error) {
        Alert.alert('Error', 'Failed to save patient. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Please fill in both name and surname fields.');
    }
  };

  const editPatient = (patient) => {
    setSelectedPatient(patient);
    setEditPatientName(patient.name);
    setEditPatientSurname(patient.surname);
    setEditPatientCellNumber(patient.cellNumber);
    setEditModalVisible(true);
  };

  const updatePatient = async () => {
    if (editPatientName.trim() && editPatientSurname.trim()) {
      const updatedPatients = patients.map(patient =>
        patient.id === selectedPatient.id
          ? {
              ...patient,
              name: editPatientName.trim(),
              surname: editPatientSurname.trim(),
              cellNumber: formatCellNumber(editPatientCellNumber.trim())
            }
          : patient
      );
      setPatients(updatedPatients);
      
      try {
        await savePatients(updatedPatients);
        setEditModalVisible(false);
        setSelectedPatient(null);
        clearEditPatientForm();
        Alert.alert('Success', 'Patient updated successfully!');
      } catch (error) {
        Alert.alert('Error', 'Failed to update patient. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Please fill in both name and surname fields.');
    }
  };

  const deletePatient = (patient) => {
    Alert.alert(
      'Delete Patient',
      `Are you sure you want to delete ${patient.name} ${patient.surname}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const updatedPatients = patients.filter(p => p.id !== patient.id);
            setPatients(updatedPatients);
            
            try {
              await savePatients(updatedPatients);
              Alert.alert('Success', 'Patient deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete patient. Please try again.');
            }
          }
        }
      ]
    );
  };

  const clearNewPatientForm = () => {
    setNewPatientName('');
    setNewPatientSurname('');
    setNewPatientCellNumber('');
  };

  const clearEditPatientForm = () => {
    setEditPatientName('');
    setEditPatientSurname('');
    setEditPatientCellNumber('');
  };

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchText.toLowerCase();
    return patient.name.toLowerCase().includes(searchLower) ||
           patient.surname.toLowerCase().includes(searchLower) ||
           patient.cellNumber.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <TexturedBackground>
        <View style={GlobalStyles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBlue} />
          <Text style={GlobalStyles.loadingText}>Loading patients...</Text>
        </View>
      </TexturedBackground>
    );
  }

  return (
    <TexturedBackground>
      <View style={GlobalStyles.padding}>
        <Text style={GlobalStyles.pageTitle}>Patient Management</Text>
        
        {/* Search Bar */}
        <TextInput
          style={GlobalStyles.searchInput}
          placeholder="Search by name, surname, or cell number..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={Colors.textLight}
        />

        {/* Patient Count */}
        <Text style={GlobalStyles.countText}>
          {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} found
        </Text>

        {/* Add New Patient Button */}
        <TouchableOpacity
          style={[GlobalStyles.primaryButton, styles.addButton]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={GlobalStyles.buttonText}>+ Add New Patient</Text>
        </TouchableOpacity>

        {/* Patient List */}
        <ScrollView style={styles.patientList} showsVerticalScrollIndicator={false}>
          {filteredPatients.length === 0 ? (
            <View style={GlobalStyles.emptyState}>
              <Text style={GlobalStyles.emptyStateText}>
                {searchText ? 
                  'No patients found matching your search.' : 
                  'No patients added yet.\nTap "Add New Patient" to get started.'}
              </Text>
            </View>
          ) : (
            filteredPatients.map((patient) => (
              <View key={patient.id} style={[GlobalStyles.card, styles.patientCard]}>
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>
                    {patient.name} {patient.surname}
                  </Text>
                  {patient.cellNumber ? (
                    <Text style={styles.patientCell}>{patient.cellNumber}</Text>
                  ) : null}
                  <Text style={styles.prescriptionCount}>
                    {patient.prescriptions?.length || 0} prescriptions
                  </Text>
                </View>
                
                <View style={styles.patientActions}>
                  <TouchableOpacity
                    style={[GlobalStyles.secondaryButton, styles.actionButton]}
                    onPress={() => editPatient(patient)}
                  >
                    <Text style={GlobalStyles.buttonTextSmall}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[GlobalStyles.dangerButton, styles.actionButton]}
                    onPress={() => deletePatient(patient)}
                  >
                    <Text style={GlobalStyles.buttonTextSmall}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Add Patient Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={GlobalStyles.modalOverlay}>
            <View style={GlobalStyles.modalContent}>
              <Text style={GlobalStyles.modalTitle}>Add New Patient</Text>
              
              <View style={styles.modalForm}>
                <Text style={GlobalStyles.inputLabel}>First Name *</Text>
                <TextInput
                  style={GlobalStyles.input}
                  value={newPatientName}
                  onChangeText={setNewPatientName}
                  placeholder="Enter first name"
                  placeholderTextColor={Colors.textLight}
                />
                
                <Text style={GlobalStyles.inputLabel}>Surname *</Text>
                <TextInput
                  style={GlobalStyles.input}
                  value={newPatientSurname}
                  onChangeText={setNewPatientSurname}
                  placeholder="Enter surname"
                  placeholderTextColor={Colors.textLight}
                />
                
                <Text style={GlobalStyles.inputLabel}>Cell Number (Optional)</Text>
                <TextInput
                  style={GlobalStyles.input}
                  value={newPatientCellNumber}
                  onChangeText={setNewPatientCellNumber}
                  placeholder="Enter cell number"
                  keyboardType="phone-pad"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              
              <View style={GlobalStyles.modalButtonContainer}>
                <TouchableOpacity
                  style={[GlobalStyles.modalButton, GlobalStyles.lightButton]}
                  onPress={() => {
                    setModalVisible(false);
                    clearNewPatientForm();
                  }}
                >
                  <Text style={GlobalStyles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[GlobalStyles.modalButton, GlobalStyles.primaryButton]}
                  onPress={addNewPatient}
                >
                  <Text style={GlobalStyles.buttonText}>Add Patient</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Patient Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={GlobalStyles.modalOverlay}>
            <View style={GlobalStyles.modalContent}>
              <Text style={GlobalStyles.modalTitle}>Edit Patient</Text>
              
              <View style={styles.modalForm}>
                <Text style={GlobalStyles.inputLabel}>First Name *</Text>
                <TextInput
                  style={GlobalStyles.input}
                  value={editPatientName}
                  onChangeText={setEditPatientName}
                  placeholder="Enter first name"
                  placeholderTextColor={Colors.textLight}
                />
                
                <Text style={GlobalStyles.inputLabel}>Surname *</Text>
                <TextInput
                  style={GlobalStyles.input}
                  value={editPatientSurname}
                  onChangeText={setEditPatientSurname}
                  placeholder="Enter surname"
                  placeholderTextColor={Colors.textLight}
                />
                
                <Text style={GlobalStyles.inputLabel}>Cell Number (Optional)</Text>
                <TextInput
                  style={GlobalStyles.input}
                  value={editPatientCellNumber}
                  onChangeText={setEditPatientCellNumber}
                  placeholder="Enter cell number"
                  keyboardType="phone-pad"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              
              <View style={GlobalStyles.modalButtonContainer}>
                <TouchableOpacity
                  style={[GlobalStyles.modalButton, GlobalStyles.lightButton]}
                  onPress={() => {
                    setEditModalVisible(false);
                    setSelectedPatient(null);
                    clearEditPatientForm();
                  }}
                >
                  <Text style={GlobalStyles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[GlobalStyles.modalButton, GlobalStyles.secondaryButton]}
                  onPress={updatePatient}
                >
                  <Text style={GlobalStyles.buttonText}>Update Patient</Text>
                </TouchableOpacity>
              </View>
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

  patientList: {
    flex: 1,
    marginBottom: 16,
  },

  patientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
    borderLeftColor: Colors.primaryBlue,
    borderLeftWidth: 4,
  },

  patientInfo: {
    flex: 1,
    marginRight: 12,
  },

  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },

  patientCell: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },

  prescriptionCount: {
    fontSize: 12,
    color: Colors.textLight,
  },

  patientActions: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 60,
  },

  // Modal Styles
  modalForm: {
    marginBottom: 20,
  },
});

// Export PatientDataManager for use in other components
export const PatientDataManager = {
  loadPatients: async () => {
    try {
      const storedPatients = await AsyncStorage.getItem(PATIENTS_STORAGE_KEY);
      return storedPatients ? JSON.parse(storedPatients) : [];
    } catch (error) {
      console.error('Error loading patients:', error);
      return [];
    }
  },
  
  savePatients: async (patients) => {
    try {
      await AsyncStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
    } catch (error) {
      console.error('Error saving patients:', error);
      throw error;
    }
  }
};

export default PatientListScreen;