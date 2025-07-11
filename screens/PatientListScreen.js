import React from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

function PatientListScreen({ navigation }) {
  const [patients, setPatients] = React.useState([
    { 
      id: 1, 
      name: 'John Doe', 
      age: 35, 
      phone: '011-123-4567',
      address: '123 Main Street, Johannesburg',
      lastVisit: '2025-07-05',
      prescriptions: [
        { date: '2025-07-05', prescription: 'Paracetamol 500mg - Take 1 tablet every 6 hours' },
        { date: '2025-06-20', prescription: 'Ibuprofen 400mg - Take 1 tablet when needed' }
      ]
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      age: 28, 
      phone: '011-987-6543',
      address: '456 Oak Avenue, Boksburg',
      lastVisit: '2025-07-08',
      prescriptions: [
        { date: '2025-07-08', prescription: 'Cough syrup 10ml - Take 3 times daily' }
      ]
    },
    { 
      id: 3, 
      name: 'Mike Johnson', 
      age: 42, 
      phone: '011-555-0123',
      address: '789 Pine Road, Benoni',
      lastVisit: '2025-07-01',
      prescriptions: [
        { date: '2025-07-01', prescription: 'Antihistamine 10mg - Take 1 tablet daily' },
        { date: '2025-06-15', prescription: 'Throat lozenges - Suck 1 every 2-3 hours' }
      ]
    },
  ]);

  const [modalVisible, setModalVisible] = React.useState(false);
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [historyModalVisible, setHistoryModalVisible] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState(null);
  const [searchText, setSearchText] = React.useState('');
  
  // New patient form fields
  const [newPatientName, setNewPatientName] = React.useState('');
  const [newPatientAge, setNewPatientAge] = React.useState('');
  const [newPatientPhone, setNewPatientPhone] = React.useState('');
  const [newPatientAddress, setNewPatientAddress] = React.useState('');

  // Edit patient form fields
  const [editPatientName, setEditPatientName] = React.useState('');
  const [editPatientAge, setEditPatientAge] = React.useState('');
  const [editPatientPhone, setEditPatientPhone] = React.useState('');
  const [editPatientAddress, setEditPatientAddress] = React.useState('');

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchText.toLowerCase()) ||
    patient.phone.includes(searchText)
  );

  const selectPatient = (patient) => {
    Alert.alert(
      'Patient Options',
      `What would you like to do for ${patient.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Create Script', 
          onPress: () => {
            navigation.navigate('CreateScript', { selectedPatient: patient });
          }
        },
        { 
          text: 'View History', 
          onPress: () => {
            setSelectedPatient(patient);
            setHistoryModalVisible(true);
          }
        }
      ]
    );
  };

  const editPatient = (patient) => {
    setSelectedPatient(patient);
    setEditPatientName(patient.name);
    setEditPatientAge(patient.age.toString());
    setEditPatientPhone(patient.phone);
    setEditPatientAddress(patient.address);
    setEditModalVisible(true);
  };

  const deletePatient = (patientId) => {
    Alert.alert(
      'Delete Patient',
      'Are you sure you want to delete this patient?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setPatients(patients.filter(patient => patient.id !== patientId));
          }
        }
      ]
    );
  };

  const addNewPatient = () => {
    if (newPatientName.trim() && newPatientAge.trim()) {
      const newPatient = {
        id: Date.now(),
        name: newPatientName.trim(),
        age: parseInt(newPatientAge),
        phone: newPatientPhone.trim(),
        address: newPatientAddress.trim(),
        lastVisit: new Date().toISOString().split('T')[0],
        prescriptions: []
      };
      setPatients([...patients, newPatient]);
      clearNewPatientForm();
      setModalVisible(false);
      Alert.alert('Success', 'New patient added successfully!');
    } else {
      Alert.alert('Error', 'Please fill in name and age fields.');
    }
  };

  const updatePatient = () => {
    if (editPatientName.trim() && editPatientAge.trim()) {
      const updatedPatients = patients.map(patient => 
        patient.id === selectedPatient.id 
          ? {
              ...patient,
              name: editPatientName.trim(),
              age: parseInt(editPatientAge),
              phone: editPatientPhone.trim(),
              address: editPatientAddress.trim()
            }
          : patient
      );
      setPatients(updatedPatients);
      setEditModalVisible(false);
      setSelectedPatient(null);
      Alert.alert('Success', 'Patient updated successfully!');
    } else {
      Alert.alert('Error', 'Please fill in name and age fields.');
    }
  };

  const clearNewPatientForm = () => {
    setNewPatientName('');
    setNewPatientAge('');
    setNewPatientPhone('');
    setNewPatientAddress('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Patient List</Text>
      
      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or phone..."
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Patient List */}
      <ScrollView style={styles.patientList}>
        {filteredPatients.map((patient) => (
          <View key={patient.id} style={styles.patientItem}>
            <TouchableOpacity
              style={styles.patientContent}
              onPress={() => selectPatient(patient)}
            >
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientDetails}>Age: {patient.age} | Phone: {patient.phone}</Text>
              <Text style={styles.patientAddress}>{patient.address}</Text>
              <Text style={styles.lastVisit}>Last Visit: {patient.lastVisit}</Text>
            </TouchableOpacity>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => editPatient(patient)}
              >
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deletePatient(patient.id)}
              >
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add New Patient Button */}
      <TouchableOpacity
        style={styles.addPatientButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>+ Add New Patient</Text>
      </TouchableOpacity>

      {/* Add New Patient Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Patient</Text>
            
            <Text style={styles.inputLabel}>Patient Name:</Text>
            <TextInput
              style={styles.modalInput}
              value={newPatientName}
              onChangeText={setNewPatientName}
              placeholder="Enter patient name"
            />
            
            <Text style={styles.inputLabel}>Age:</Text>
            <TextInput
              style={styles.modalInput}
              value={newPatientAge}
              onChangeText={setNewPatientAge}
              placeholder="Enter age"
              keyboardType="numeric"
            />
            
            <Text style={styles.inputLabel}>Phone:</Text>
            <TextInput
              style={styles.modalInput}
              value={newPatientPhone}
              onChangeText={setNewPatientPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
            
            <Text style={styles.inputLabel}>Address:</Text>
            <TextInput
              style={[styles.modalInput, styles.addressInput]}
              value={newPatientAddress}
              onChangeText={setNewPatientAddress}
              placeholder="Enter address"
              multiline
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  clearNewPatientForm();
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={addNewPatient}
              >
                <Text style={styles.buttonText}>Add</Text>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Patient</Text>
            
            <Text style={styles.inputLabel}>Patient Name:</Text>
            <TextInput
              style={styles.modalInput}
              value={editPatientName}
              onChangeText={setEditPatientName}
              placeholder="Enter patient name"
            />
            
            <Text style={styles.inputLabel}>Age:</Text>
            <TextInput
              style={styles.modalInput}
              value={editPatientAge}
              onChangeText={setEditPatientAge}
              placeholder="Enter age"
              keyboardType="numeric"
            />
            
            <Text style={styles.inputLabel}>Phone:</Text>
            <TextInput
              style={styles.modalInput}
              value={editPatientPhone}
              onChangeText={setEditPatientPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
            
            <Text style={styles.inputLabel}>Address:</Text>
            <TextInput
              style={[styles.modalInput, styles.addressInput]}
              value={editPatientAddress}
              onChangeText={setEditPatientAddress}
              placeholder="Enter address"
              multiline
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setEditModalVisible(false);
                  setSelectedPatient(null);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.updateButton]}
                onPress={updatePatient}
              >
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Prescription History Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={historyModalVisible}
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Prescription History - {selectedPatient?.name}
            </Text>
            
            <ScrollView style={styles.historyList}>
              {selectedPatient?.prescriptions?.length > 0 ? (
                selectedPatient.prescriptions.map((prescription, index) => (
                  <View key={index} style={styles.historyItem}>
                    <Text style={styles.historyDate}>{prescription.date}</Text>
                    <Text style={styles.historyPrescription}>{prescription.prescription}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noHistory}>No prescription history available</Text>
              )}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setHistoryModalVisible(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={() => {
                  setHistoryModalVisible(false);
                  navigation.navigate('CreateScript', { selectedPatient: selectedPatient });
                }}
              >
                <Text style={styles.buttonText}>New Script</Text>
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
    marginBottom: 20,
    color: '#333',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
    marginBottom: 15,
  },
  patientList: {
    flex: 1,
  },
  patientItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    overflow: 'hidden',
  },
  patientContent: {
    padding: 15,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  patientDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  patientAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  lastVisit: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#ffc107',
    padding: 10,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    padding: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addPatientButton: {
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
  addressInput: {
    height: 60,
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
  updateButton: {
    backgroundColor: '#28a745',
  },
  historyList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  historyItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  historyDate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  historyPrescription: {
    fontSize: 14,
    color: '#333',
  },
  noHistory: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 50,
  },
});

export default PatientListScreen;