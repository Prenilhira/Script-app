import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen({ navigation }) {
  // Practice Information
  const [practiceTitle, setPracticeTitle] = React.useState('DR P. HIRA INC.');
  const [practiceNumber, setPracticeNumber] = React.useState('0929484');
  const [consultingRooms, setConsultingRooms] = React.useState('5/87 Dunswart Avenue');
  const [area, setArea] = React.useState('Dunswart, Boksburg, 1459');
  const [poBox, setPoBox] = React.useState('PO Box 18131');
  const [poBoxArea, setPoBoxArea] = React.useState('Actonville, Benoni, 1501');
  
  // Contact Information
  const [phone1, setPhone1] = React.useState('010 493 3544');
  const [phone2, setPhone2] = React.useState('011 914 3093');
  const [cell, setCell] = React.useState('060 557 3625');
  const [email, setEmail] = React.useState('info@drhirainc.com');
  
  // Doctor Information
  const [doctor1Name, setDoctor1Name] = React.useState('Dr P.Hira');
  const [doctor1Qualification, setDoctor1Qualification] = React.useState('MBBCH(Wits)');
  const [doctor2Name, setDoctor2Name] = React.useState('Dr. H.E. Foster');
  const [doctor2Qualification, setDoctor2Qualification] = React.useState('MBBCH(Wits)');
  
  // App Settings
  const [autoSave, setAutoSave] = React.useState(true);
  const [defaultPrintCopies, setDefaultPrintCopies] = React.useState('1');
  const [showPatientHistory, setShowPatientHistory] = React.useState(true);
  const [requireSignature, setRequireSignature] = React.useState(false);

  const saveSettings = () => {
    Alert.alert('Settings Saved', 'Your settings have been saved successfully.');
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setPracticeTitle('DR P. HIRA INC.');
            setPracticeNumber('0929484');
            setConsultingRooms('5/87 Dunswart Avenue');
            setArea('Dunswart, Boksburg, 1459');
            setPoBox('PO Box 18131');
            setPoBoxArea('Actonville, Benoni, 1501');
            setPhone1('010 493 3544');
            setPhone2('011 914 3093');
            setCell('060 557 3625');
            setEmail('info@drhirainc.com');
            setDoctor1Name('Dr P.Hira');
            setDoctor1Qualification('MBBCH(Wits)');
            setDoctor2Name('Dr. H.E. Foster');
            setDoctor2Qualification('MBBCH(Wits)');
            setAutoSave(true);
            setDefaultPrintCopies('1');
            setShowPatientHistory(true);
            setRequireSignature(false);
            Alert.alert('Reset Complete', 'All settings have been reset to defaults.');
          }
        }
      ]
    );
  };

  const exportSettings = () => {
    Alert.alert('Export Settings', 'Settings export functionality would be implemented here.');
  };

  const importSettings = () => {
    Alert.alert('Import Settings', 'Settings import functionality would be implemented here.');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Settings</Text>
      
      {/* Practice Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Practice Information</Text>
        
        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Practice Title:</Text>
          <TextInput
            style={styles.settingInput}
            value={practiceTitle}
            onChangeText={setPracticeTitle}
          />
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Practice Number:</Text>
          <TextInput
            style={styles.settingInput}
            value={practiceNumber}
            onChangeText={setPracticeNumber}
          />
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Consulting Rooms:</Text>
          <TextInput
            style={styles.settingInput}
            value={consultingRooms}
            onChangeText={setConsultingRooms}
          />
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Area:</Text>
          <TextInput
            style={styles.settingInput}
            value={area}
            onChangeText={setArea}
          />
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>PO Box:</Text>
          <TextInput
            style={styles.settingInput}
            value={poBox}
            onChangeText={setPoBox}
          />
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>PO Box Area:</Text>
          <TextInput
            style={styles.settingInput}
            value={poBoxArea}
            onChangeText={setPoBoxArea}
          />
        </View>
      </View>

      {/* Contact Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Phone 1:</Text>
          <TextInput
            style={styles.settingInput}
            value={phone1}
            onChangeText={setPhone1}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Phone 2:</Text>
          <TextInput
            style={styles.settingInput}
            value={phone2}
            onChangeText={setPhone2}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Cell:</Text>
          <TextInput
            style={styles.settingInput}
            value={cell}
            onChangeText={setCell}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Email:</Text>
          <TextInput
            style={styles.settingInput}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Doctor Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Doctor Information</Text>
        
        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Doctor 1 Name:</Text>
          <TextInput
            style={styles.settingInput}
            value={doctor1Name}
            onChangeText={setDoctor1Name}
          />
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Doctor 1 Qualification:</Text>
          <TextInput
            style={styles.settingInput}
            value={doctor1Qualification}
            onChangeText={setDoctor1Qualification}
          />
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Doctor 2 Name:</Text>
          <TextInput
            style={styles.settingInput}
            value={doctor2Name}
            onChangeText={setDoctor2Name}
          />
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Doctor 2 Qualification:</Text>
          <TextInput
            style={styles.settingInput}
            value={doctor2Qualification}
            onChangeText={setDoctor2Qualification}
          />
        </View>
      </View>

      {/* App Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <View style={styles.switchSetting}>
          <Text style={styles.settingLabel}>Auto-save Prescriptions:</Text>
          <Switch
            value={autoSave}
            onValueChange={setAutoSave}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={autoSave ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Default Print Copies:</Text>
          <TextInput
            style={styles.settingInput}
            value={defaultPrintCopies}
            onChangeText={setDefaultPrintCopies}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.switchSetting}>
          <Text style={styles.settingLabel}>Show Patient History:</Text>
          <Switch
            value={showPatientHistory}
            onValueChange={setShowPatientHistory}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={showPatientHistory ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.switchSetting}>
          <Text style={styles.settingLabel}>Require Digital Signature:</Text>
          <Switch
            value={requireSignature}
            onValueChange={setRequireSignature}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={requireSignature ? '#007AFF' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.buttonText}>Save Settings</Text>
        </TouchableOpacity>

        <View style={styles.secondaryButtons}>
          <TouchableOpacity style={styles.secondaryButton} onPress={exportSettings}>
            <Text style={styles.secondaryButtonText}>Export</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={importSettings}>
            <Text style={styles.secondaryButtonText}>Import</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.secondaryButton, styles.resetButton]} onPress={resetToDefaults}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  section: {
    marginBottom: 30,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#007AFF',
  },
  settingGroup: {
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  settingInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  switchSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  actionSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  resetButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});