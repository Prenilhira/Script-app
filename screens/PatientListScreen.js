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
  const [filteredPatients, setFilteredPatients] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchText, setSearchText] = React.useState('');
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState(null);

  // New patient form
  const [newPatientName, setNewPatientName] = React.useState('');
  const [newPatientSurname, setNewPatientSurname] = React.useState('');
  const [newPatientCellNumber, setNewPatientCellNumber] = React.useState('');

  // Edit patient form
  const [editPatientName, setEditPatientName] = React.useState('');
  const [editPatientSurname, setEditPatientSurname] = React.useState('');
  const [editPatientCellNumber, setEditPatientCellNumber] = React.useState('');

  React.useEffect(() => {
    loadPatients();
  }, []);

  React.useEffect(() => {
    filterPatients();
  }, [searchText, patients]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      
      const samplePatients = [
        {
          id: 1,
          name: 'John',
          surname: 'Smith',
          cellNumber: '+27123456789',
          prescriptions: []
        },
        {
          id: 2,
          name: 'Sarah',
          surname: 'Johnson',
          cellNumber: '+27987654321',
          prescriptions: []
        },
        {
          id: 3,
          name: 'Michael',
          surname: 'Brown',
          cellNumber: '+27555123456',
          prescriptions: []
        },
        {
          id: 4,
          name: 'Emma',
          surname: 'Davis',
          cellNumber: '+27444987654',
          prescriptions: []
        },
        {
          id: 5,
          name: 'David',
          surname: 'Wilson',
          cellNumber: '+27666789123',
          prescriptions: []
        }
      ];

      setPatients(samplePatients);
      
      try {
        const storedPatients = await AsyncStorage.getItem(PATIENTS_STORAGE_KEY);
        if (storedPatients) {
          const patientsData = JSON.parse(storedPatients);
          if (Array.isArray(patientsData) && patientsData.length > 0) {
            setPatients(patientsData);
          } else {
            await savePatients(samplePatients);
          }
        } else {
          await savePatients(samplePatients);
        }
      } catch (storageError) {
        console.log('Storage error, using sample data:', storageError);
        await savePatients(samplePatients);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      const fallbackPatients = [
        {
          id: 1,
          name: 'John',
          surname: 'Smith',
          cellNumber: '+27123456789',
          prescriptions: []
        },
        {
          id: 2,
          name: 'Sarah',
          surname: 'Johnson',
          cellNumber: '+27987654321',
          prescriptions: []
        }
      ];
      setPatients(fallbackPatients);
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    if (!searchText.trim()) {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => {
        const fullName = `${patient.name} ${patient.surname}`.toLowerCase();
        const cellNumber = patient.cellNumber.replace(/\D/g, '');
        const search = searchText.toLowerCase().replace(/\D/g, '');
        
        return fullName.includes(searchText.toLowerCase()) || 
               cellNumber.includes(search);
      });
      setFilteredPatients(filtered);
    }
  };

  const savePatients = async (patientsData) => {
    try {
      await AsyncStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patientsData));
    } catch (error) {
      console.error('Error saving patients:', error);
    }
  };

  const formatCellNumber = (cellNumber) => {
    const digits = cellNumber.replace(/\D/g, '');
    
    if (digits.startsWith('27')) {
      return `+${digits}`;
    }
    
    if (digits.startsWith('0')) {
      return `+27${digits.substring(1)}`;
    }
    
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

  const deletePatient = async (patientId) => {
    Alert.alert(
      'Delete Patient',
      'Are you sure you want to delete this patient? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedPatients = patients.filter(p => p.id !== patientId);
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

  const renderPatientCard = ({ item: patient }) => (
    <View style={[GlobalStyles.card, styles.patientCard]}>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>
          {patient.name} {patient.surname}
        </Text>
        <Text style={styles.patientCell}>{patient.cellNumber}</Text>
        <Text style={styles.prescriptionCount}>
          {patient.prescriptions?.length || 0} prescription(s)
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
          onPress={() => deletePatient(patient.id)}
        >
          <Text style={GlobalStyles.buttonTextSmall}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyListContainer}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={GlobalStyles.emptyStateText}>
        {searchText ? `No patients found for "${searchText}"` : 'No patients found.'}
        {'\n'}
        {!searchText && 'Add your first patient to get started.'}
      </Text>
      {!searchText && (
        <TouchableOpacity
          style={[GlobalStyles.primaryButton, styles.emptyStateButton]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={GlobalStyles.buttonText}>Add First Patient</Text>
        </TouchableOpacity>
      )}
    </View>
  );

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
      <View style={styles.screenContainer}>
        <Text style={GlobalStyles.pageTitle}>Patient Management</Text>
        
        <TextInput
          style={GlobalStyles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search by name, surname, or cell number"
          placeholderTextColor="#999999"
          color="#000000"
          selectionColor="#1e3a8a"
          underlineColorAndroid="transparent"
        />

        <Text style={GlobalStyles.countText}>
          {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} found
        </Text>

        <TouchableOpacity
          style={[GlobalStyles.primaryButton, styles.addButton]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={GlobalStyles.buttonText}>+ Add New Patient</Text>
        </TouchableOpacity>

        <View style={styles.listContainer}>
          {filteredPatients.length > 0 ? (
            <FlatList
              data={filteredPatients}
              renderItem={renderPatientCard}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            renderEmptyState()
          )}
        </View>

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
                  placeholderTextColor="#999999"
                  color="#000000"
                  selectionColor="#1e3a8a"
                  underlineColorAndroid="transparent"
                />
                
                <Text style={GlobalStyles.inputLabel}>Surname *</Text>
                <TextInput
                  style={GlobalStyles.input}
                  value={newPatientSurname}
                  onChangeText={setNewPatientSurname}
                  placeholder="Enter surname"
                  placeholderTextColor="#999999"
                  color="#000000"
                  selectionColor="#1e3a8a"
                  underlineColorAndroid="transparent"
                />
                
                <Text style={GlobalStyles.inputLabel}>Cell Number</Text>
                <TextInput
                  style={GlobalStyles.input}
                  value={newPatientCellNumber}
                  onChangeText={setNewPatientCellNumber}
                  placeholder="Enter cell number"
                  placeholderTextColor="#999999"
                  color="#000000"
                  selectionColor="#1e3a8a"
                  underlineColorAndroid="transparent"
                  keyboardType="phone-pad"
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
                  placeholderTextColor="#999999"
                  color="#000000"
                  selectionColor="#1e3a8a"
                  underlineColorAndroid="transparent"
                />
                
                <Text style={GlobalStyles.inputLabel}>Surname *</Text>
                <TextInput
                  style={GlobalStyles.input}
                  value={editPatientSurname}
                  onChangeText={setEditPatientSurname}
                  placeholder="Enter surname"
                  placeholderTextColor="#999999"
                  color="#000000"
                  selectionColor="#1e3a8a"
                  underlineColorAndroid="transparent"
                />
                
                <Text style={GlobalStyles.inputLabel}>Cell Number</Text>
                <TextInput
                  style={GlobalStyles.input}
                  value={editPatientCellNumber}
                  onChangeText={setEditPatientCellNumber}
                  placeholder="Enter cell number"
                  placeholderTextColor="#999999"
                  color="#000000"
                  selectionColor="#1e3a8a"
                  underlineColorAndroid="transparent"
                  keyboardType="phone-pad"
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

  patientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
    borderLeftColor: Colors.primaryBlue,
    borderLeftWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
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

  modalForm: {
    marginBottom: 20,
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

export default PatientListScreen;