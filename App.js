import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Colors } from './GlobalStyles';

import CreateScriptScreen from './screens/CreateScriptScreen';
import HomeScreen from './screens/HomeScreen';
import PatientListScreen from './screens/PatientListScreen';
import PresetPrescriptionScreen from './screens/PresetPrescriptionScreen';
import SettingsScreen from './screens/SettingsScreen';
import ICD10CodesScreen from './screens/ICD10CodesScreen';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={Colors.primaryBlue} />
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.primaryBlue,
            elevation: 4,
            shadowOpacity: 0.3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerTitleAlign: 'center',
          headerBackTitleVisible: false,
          cardStyle: { 
            backgroundColor: Colors.backgroundGrey 
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ 
            title: 'Prescription App',
            headerStyle: {
              backgroundColor: Colors.primaryBlue,
              elevation: 0,
              shadowOpacity: 0,
            },
          }}
        />
        <Stack.Screen 
          name="CreateScript" 
          component={CreateScriptScreen} 
          options={{ 
            title: 'Create New Script',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen 
          name="PresetPrescription" 
          component={PresetPrescriptionScreen} 
          options={{ 
            title: 'Preset Prescriptions',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen 
          name="PatientList" 
          component={PatientListScreen} 
          options={{ 
            title: 'Patient List',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen 
          name="ICD10Codes" 
          component={ICD10CodesScreen} 
          options={{ 
            title: 'ICD-10 Codes',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ 
            title: 'Settings',
            headerBackTitle: 'Back',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;