// POManager/App.tsx
// Import necessary dependencies and components
import React, { useEffect } from 'react'; // useEffect is for running code once when the app starts
import { NavigationContainer } from '@react-navigation/native'; // Routing tools. Handles Back button and switching screens
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Routing tools. Handles Back button and switching screens
import { Provider as PaperProvider } from 'react-native-paper'; // UI Kit
import { SafeAreaProvider } from 'react-native-safe-area-context'; 
import * as Notifications from 'expo-notifications'; // Notifications Library

// Import the DB
import { initDatabase } from './src/database/db'; // Start the database

// Import Screens
import DashboardScreen from './src/screens/DashboardScreen';
import CreatePOScreen from './src/screens/CreatePOScreen';
import AIAssistantScreen from './src/screens/AIAssistantScreen'

// Configure Notification Handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Show the pop-up
    shouldPlaySound: true, // "Ding!"
    shouldSetBadge: false, // No badge on app icon
    shouldShowBanner: true, // Show banner on iOS
    shouldShowList: true, // Show in notification center on iOS
  }),
});

// Create a stack navigator
const Stack = createNativeStackNavigator();

// Main App Component
export default function App() {

  useEffect(() => {
    initDatabase(); // 1. Start SQLite
    registerForPushNotificationsAsync(); // 2. Ask for permission
  }, []); // Empty array [] means "Run ONCE on launch"

  // Function to Request Permissions
  async function registerForPushNotificationsAsync() {
    // Check if we already have permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    // Default to existing status
    let finalStatus = existingStatus;
    
    // If not, ask the user (Pop-up: "Allow App to send notifications?")
    if (existingStatus !== 'granted') {
      // Ask for permission
      const { status } = await Notifications.requestPermissionsAsync();
      // Update final status
      finalStatus = status;
    }
    // If no permission, exit the function
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
  }

  // Render the app structure
  return (
    <SafeAreaProvider> {/* 1. Protects against notch/dynamic island */}
      <PaperProvider> {/* 2. Injects the UI theme styles */}
        <NavigationContainer> {/* 3. Manages the Navigation State */}
          <Stack.Navigator initialRouteName="Dashboard">

            {/* Define your routes (Screens) */}
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