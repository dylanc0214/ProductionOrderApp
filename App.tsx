// POManager/App.tsx
// Import necessary dependencies and components
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Create a stack navigator
const Stack = createNativeStackNavigator();

// FIX: Changed <></> to <View>
const DashboardScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Dashboard Work in Progress</Text>
  </View>
);

const CreatePOScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Create PO Work in Progress</Text>
  </View>
);

// 
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
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}