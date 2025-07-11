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
import { GlobalStyles, Colors, TexturedBackgroundStyles } from '../GlobalStyles';

const PATIENTS_STORAGE_KEY = '@patients_data';

// Textured Background Component
const TexturedBackground = ({ children }) => (
  <View style={[GlobalStyles.container, TexturedBackgroundStyles.container]}>
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

  // Edit patient form fields
  const [editPatientName, setEditPatientName] = React.useState('');
  const [editPatientSurname, setEditPatientSurname] = React.useState('');

  // Load patients from AsyncStorage on component mount
  React.useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const storedPatients = await AsyncStorage.getItem(PATIENTS_STORAGE_KEY);
      if (storedPatients) {
        setPatients(JSON.parse(storedPatients));
      } else {
        // Initialize with sample data if no data exists
        const samplePatients = [
          { 
            id: 1, 
            name: 'John',
            surname: 'Doe',
            prescriptions: []
          },
          { 
            id: 2, 
            name: 'Jane',
            surname: 'Smith',
            prescriptions: []
          },
          { 
            id: 3, 
            name: 'Mike',
            surname: 'Johnson',
            prescriptions: []
          },
        ];
        setPatients(samplePatients);
        await savePatients(samplePatients);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      Alert.alert('Error', 'Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const savePatients = async (patientsToSave) => {
    try {
      await AsyncStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patientsToSave));
    } catch (error) {
      console.error('Error saving patients:', error);
      Alert.alert('Error', 'Failed to save patient data');
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchText.toLowerCase()) ||
    patient.surname.toLowerCase().includes(searchText.toLowerCase())
  );

  const editPatient = (patient) => {
    setSelectedPatient(patient);
    setEditPatientName(patient.name);
    setEditPatientSurname(patient.surname);
    setEditModalVisible(true);
  };

  const deletePatient = (patientId) => {
    Alert.alert(
      'Delete Patient',
      'Are you sure you want to delete this patient? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const updatedPatients = patients.filter(patient => patient.id !== patientId);
            setPatients(updatedPatients);
            await savePatients(updatedPatients);
            Alert.alert('Success', 'Patient deleted successfully');
          }
        }
      ]
    );
  };

  const addNewPatient = async () => {
    if (newPatientName.trim() && newPatientSurname.trim()) {
      const newPatient = {
        id: Date.now(),
        name: newPatientName.trim(),
        surname: newPatientSurname.trim(),
        prescriptions: []
      };
      const updatedPatients = [...patients, newPatient];
      setPatients(updatedPatients);
      await savePatients(updatedPatients);
      clearNewPatientForm();
      setModalVisible(false);
      Alert.alert('Success', 'New patient added successfully!');
    } else {
      Alert.alert('Error', 'Please fill in both name and surname fields.');
    }
  };

  const updatePatient = async () => {
    if (editPatientName.trim() && editPatientSurname.trim()) {
      const updatedPatients = patients.map(patient => 
        patient.id === selectedPatient.id 
          ? {
              ...patient,
              name: editPatientName.trim(),
              surname: editPatientSurname.trim()
            }
          : patient
      );
      setPatients(updatedPatients);
      await savePatients(updatedPatients);
      setEditModalVisible(false);
      setSelectedPatient(null);
      Alert.alert('Success', 'Patient updated successfully!');
    } else {
      Alert.alert('Error', 'Please fill in both name and surname fields.');
    }
  };

  const clearNewPatientForm = () => {
    setNewPatientName('');
    setNewPatientSurname('');
  };

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
          placeholder="Search by name or surname..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={Colors.textLight}
        />

        {/* Patient Count */}
        <Text style={GlobalStyles.countText}>
          {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} found
        </Text>

        {/* Patient List */}
        <ScrollView style={styles.patientList} showsVerticalScrollIndicator={false}>
          {filteredPatients.length === 0 ? (
            <View style={GlobalStyles.emptyState}>
              <Text style={GlobalStyles.emptyStateText}>
                {searchText ? 'No patients match your search' : 'No patients added yet'}
              </Text>
              {!searchText && (
                <TouchableOpacity
                  style={GlobalStyles.secondaryButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={GlobalStyles.buttonText}>Add Your First Patient</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredPatients.map((patient) => (
              <View key={patient.id} style={[GlobalStyles.card, styles.patientCard]}>
                <View style={styles.patientContent}>
                  <Text style={GlobalStyles.cardTitle}>{patient.name} {patient.surname}</Text>
                </View>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[GlobalStyles.lightButton, styles.actionButton]}
                    onPress={() => editPatient(patient)}
                  >
                    <Text style={GlobalStyles.buttonTextSmall}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[GlobalStyles.dangerButton, styles.actionButton]}
                    onPress={() => deletePatient(patient.id)}
                  >
                    <Text style={GlobalStyles.buttonTextSmall}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Add New Patient Button */}
        <TouchableOpacity
          style={[GlobalStyles.primaryButton, styles.addPatientButton]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={GlobalStyles.buttonText}>+ Add New Patient</Text>
        </TouchableOpacity>

        {/* Add New Patient Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={GlobalStyles.modalOverlay}>
            <View style={GlobalStyles.modalContent}>
              <Text style={GlobalStyles.modalTitle}>Add New Patient</Text>
              
              <Text style={GlobalStyles.inputLabel}>First Name *</Text>
              <TextInput
                style={GlobalStyles.input}
                value={newPatientName}
                onChangeText={setNewPatientName}
                placeholder="Enter first name"
                autoCapitalize="words"
                placeholderTextColor={Colors.textLight}
              />
              
              <Text style={GlobalStyles.inputLabel}>Surname *</Text>
              <TextInput
                style={GlobalStyles.input}
                value={newPatientSurname}
                onChangeText={setNewPatientSurname}
                placeholder="Enter surname"
                autoCapitalize="words"
                placeholderTextColor={Colors.textLight}
              />
              
              <View style={GlobalStyles.modalButtonContainer}>
                <TouchableOpacity
                  style={[GlobalStyles.modalButton, styles.cancelButton]}
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
              
              <Text style={GlobalStyles.inputLabel}>First Name *</Text>
              <TextInput
                style={GlobalStyles.input}
                value={editPatientName}
                onChangeText={setEditPatientName}
                placeholder="Enter first name"
                autoCapitalize="words"
                placeholderTextColor={Colors.textLight}
              />
              
              <Text style={GlobalStyles.inputLabel}>Surname *</Text>
              <TextInput
                style={GlobalStyles.input}
                value={editPatientSurname}
                onChangeText={setEditPatientSurname}
                placeholder="Enter surname"
                autoCapitalize="words"
                placeholderTextColor={Colors.textLight}
              />
              
              <View style={GlobalStyles.modalButtonContainer}>
                <TouchableOpacity
                  style={[GlobalStyles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setEditModalVisible(false);
                    setSelectedPatient(null);
                  }}
                >
                  <Text style={GlobalStyles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[GlobalStyles.modalButton, GlobalStyles.secondaryButton]}
                  onPress={updatePatient}
                >
                  <Text style={GlobalStyles.buttonText}>Update</Text>
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
    // Simulate a subtle dot pattern
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
    backgroundColor: 'rgba(30, 58, 138, 0.02)', // Very subtle blue tint
  },
  
  contentContainer: {
    flex: 1,
    zIndex: 1,
  },
  
  // Component Specific Styles
  patientList: {
    flex: 1,
    marginBottom: 16,
  },
  
  patientCard: {
    marginVertical: 6,
    borderLeftColor: Colors.primaryBlue,
    borderLeftWidth: 5,
  },
  
  patientContent: {
    paddingBottom: 12,
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
  
  addPatientButton: {
    marginTop: 8,
    marginBottom: 20,
  },
  
  cancelButton: {
    backgroundColor: Colors.textGrey,
  },
});

// Export helper functions for other screens to use
export const PatientDataManager = {
  getPatients: async () => {
    try {
      const storedPatients = await AsyncStorage.getItem(PATIENTS_STORAGE_KEY);
      return storedPatients ? JSON.parse(storedPatients) : [];
    } catch (error) {
      console.error('Error getting patients:', error);
      return [];
    }
  },
  
  savePatients: async (patients) => {
    try {
      await AsyncStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
      return true;
    } catch (error) {
      console.error('Error saving patients:', error);
      return false;
    }
  },
  
  getPatientById: async (patientId) => {
    try {
      const patients = await PatientDataManager.getPatients();
      return patients.find(patient => patient.id === patientId);
    } catch (error) {
      console.error('Error getting patient by ID:', error);
      return null;
    }
  },
  
  updatePatient: async (patientId, updatedData) => {
    try {
      const patients = await PatientDataManager.getPatients();
      const updatedPatients = patients.map(patient => 
        patient.id === patientId ? { ...patient, ...updatedData } : patient
      );
      return await PatientDataManager.savePatients(updatedPatients);
    } catch (error) {
      console.error('Error updating patient:', error);
      return false;
    }
  }
};

export default PatientListScreen;