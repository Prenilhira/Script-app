import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

function CreateScriptScreen({ navigation }) {
  const [date, setDate] = React.useState('');
  const [ageOfMinor, setAgeOfMinor] = React.useState('');
  const [patientName, setPatientName] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [prescription, setPrescription] = React.useState('');

  const handleSave = () => {
    Alert.alert('Prescription Saved', 'The prescription has been saved successfully.');
  };

  const handlePrint = () => {
    Alert.alert('Print', 'Printing functionality would be implemented here.');
  };

  const handleClear = () => {
    setDate('');
    setAgeOfMinor('');
    setPatientName('');
    setAddress('');
    setPrescription('');
  };

  return (
    <ScrollView style={styles.scriptContainer}>
      <View style={styles.headerSection}>
        <Text style={styles.practiceTitle}>DR P. HIRA INC.</Text>
        <Text style={styles.practiceNumber}>PR. NO 0929484</Text>
        
        <View style={styles.contactInfo}>
          <View style={styles.leftContact}>
            <Text style={styles.contactText}>Consulting rooms :</Text>
            <Text style={styles.contactText}>5/87 Dunswart Avenue</Text>
            <Text style={styles.contactText}>Dunswart, Boksburg, 1459</Text>
            <Text style={styles.contactText}>PO Box 18131</Text>
            <Text style={styles.contactText}>Actonville, Benoni, 1501</Text>
          </View>
          <View style={styles.rightContact}>
            <Text style={styles.contactText}>Tel: 010 493 3544</Text>
            <Text style={styles.contactText}>Tel: 011 914 3093</Text>
            <Text style={styles.contactText}>Cell: 060 557 3625</Text>
            <Text style={styles.contactText}>e-mail: info@drhirainc.com</Text>
          </View>
        </View>
      </View>

      <View style={styles.formSection}>
        <View style={styles.dateAgeRow}>
          <View style={styles.dateField}>
            <Text style={styles.fieldLabel}>Date:</Text>
            <TextInput
              style={styles.dateInput}
              value={date}
              onChangeText={setDate}
              placeholder="Enter date"
            />
          </View>
          <View style={styles.ageField}>
            <Text style={styles.fieldLabel}>Age of Minor:</Text>
            <TextInput
              style={styles.ageInput}
              value={ageOfMinor}
              onChangeText={setAgeOfMinor}
              placeholder="Age"
            />
          </View>
        </View>

        <View style={styles.nameField}>
          <Text style={styles.fieldLabel}>Name:</Text>
          <TextInput
            style={styles.nameInput}
            value={patientName}
            onChangeText={setPatientName}
            placeholder="Enter patient name"
          />
        </View>

        <View style={styles.addressField}>
          <Text style={styles.fieldLabel}>Address:</Text>
          <TextInput
            style={styles.addressInput}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter patient address"
            multiline
          />
        </View>

        <View style={styles.rxField}>
          <Text style={styles.rxLabel}>Rx :</Text>
          <TextInput
            style={styles.prescriptionInput}
            value={prescription}
            onChangeText={setPrescription}
            placeholder="Enter prescription details..."
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.signatureSection}>
          <View style={styles.signatureLeft}>
            <Text style={styles.doctorName}>Dr P.Hira</Text>
            <Text style={styles.qualification}>MBBCH(Wits)</Text>
          </View>
          <View style={styles.signatureRight}>
            <Text style={styles.doctorName}>Dr. H.E. Foster</Text>
            <Text style={styles.qualification}>MBBCH(Wits)</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
          <Text style={styles.actionButtonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
          <Text style={styles.actionButtonText}>Print</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={handleClear}>
          <Text style={styles.actionButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scriptContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  headerSection: {
    borderWidth: 2,
    borderColor: '#000',
    padding: 15,
    marginBottom: 20,
  },
  practiceTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  practiceNumber: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftContact: {
    flex: 1,
  },
  rightContact: {
    flex: 1,
    alignItems: 'flex-end',
  },
  contactText: {
    fontSize: 12,
    marginBottom: 2,
  },
  formSection: {
    marginBottom: 20,
  },
  dateAgeRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  dateField: {
    flex: 2,
    marginRight: 10,
  },
  ageField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dateInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 5,
    fontSize: 14,
  },
  ageInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 5,
    fontSize: 14,
  },
  nameField: {
    marginBottom: 15,
  },
  nameInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 5,
    fontSize: 14,
  },
  addressField: {
    marginBottom: 15,
  },
  addressInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 5,
    fontSize: 14,
    minHeight: 40,
  },
  rxField: {
    marginBottom: 30,
  },
  rxLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  prescriptionInput: {
    borderWidth: 1,
    borderColor: '#000',
    minHeight: 200,
    padding: 10,
    fontSize: 14,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 20,
  },
  signatureLeft: {
    alignItems: 'center',
  },
  signatureRight: {
    alignItems: 'center',
  },
  doctorName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  qualification: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  actionButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateScriptScreen;