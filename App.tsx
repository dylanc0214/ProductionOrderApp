// POManager/App.tsx
// Import necessary dependencies and components
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import the DB
import { initDatabase } from './src/database/db';

// Import Screens
import DashboardScreen from './src/screens/DashboardScreen';
import CreatePOScreen from './src/screens/CreatePOScreen';
import AIAssistantScreen from './src/screens/AIAssistantScreen'

// Create a stack navigator
const Stack = createNativeStackNavigator();

// Main App Component
export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Dashboard">
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen} 
              options={{ title: 'Production Orders' }} 
            />
            <Stack.Screen 
              name="CreatePO" 
              component={CreatePOScreen} 
              options={{ title: 'New Order' }} 
            />
            <Stack.Screen 
              name="AIAssistant" 
              component={AIAssistantScreen} 
              options={{ title: 'AI Insights' }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}