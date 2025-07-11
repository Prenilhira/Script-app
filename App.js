import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import CreateScriptScreen from './screens/CreateScriptScreen';
import HomeScreen from './screens/HomeScreen';
import PatientListScreen from './screens/PatientListScreen';
import PresetPrescriptionScreen from './screens/PresetPrescriptionScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Prescription App' }}
        />
        <Stack.Screen 
          name="CreateScript" 
          component={CreateScriptScreen} 
          options={{ title: 'Create New Script' }}
        />
        <Stack.Screen 
          name="PresetPrescription" 
          component={PresetPrescriptionScreen} 
          options={{ title: 'Preset Prescriptions' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Settings' }}
        />
        <Stack.Screen 
          name="PatientList" 
          component={PatientListScreen} 
          options={{ title: 'Patient List' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;