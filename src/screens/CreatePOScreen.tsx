// POManager/src/screens/CreatePOScreen.tsx
// Import necessary dependencies and components
import React, { useState } from 'react'; // React and Hooks
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native'; // React Native components
import { TextInput, Button, HelperText } from 'react-native-paper'; // UI components from react-native-paper
import { addProductionOrder } from '../database/db'; // Database function to add production order
import * as Notifications from 'expo-notifications'; // Expo Notifications
import { SchedulableTriggerInputTypes } from 'expo-notifications'; // Import trigger types

// CreatePOScreen Component
export default function CreatePOScreen({ navigation }: any) {
    // Form State
    const [goods, setGoods] = useState(''); // Finished Goods Name
    const [quantity, setQuantity] = useState(''); // Produced Quantity
    const [materials, setMaterials] = useState(''); // Raw Materials (BOM)
    const [date, setDate] = useState(''); // Due Date
    const [location, setLocation] = useState(''); // Storage Location

    // Error State
    const [errors, setErrors] = useState({
        goods: false,
        quantity: false,
        materials: false,
        date: false,
        location: false,
    });

    // Strict Date Validation
    const validateDate = (dateString: string) => {
        // 1. Check Format (YYYY-MM-DD)
        const regex = /^\d{4}-\d{2}-\d{2}$/; // Strict regex for YYYY-MM-DD
        if (!regex.test(dateString)) return false; // Invalid format

        // 2. Check Logical Validity (e.g., no Month 13, no Day 32)
        const [year, month, day] = dateString.split('-').map(Number); // Extract year, month, day
        const dateObj = new Date(year, month - 1, day); // Create Date object

        // If the Date object shifts the day/month, the input was invalid
        // (e.g. 2025-02-30 becomes 2025-03-02, so 30 !== 2)
        if (dateObj.getFullYear() !== year ||
            dateObj.getMonth() !== month - 1 || 
            dateObj.getDate() !== day) {
        return false;
        }

        return true;
    };

    // Schedule Notification
    const scheduleReminder = async (orderTitle: string, dueDateString: string) => { // dueDateString in 'YYYY-MM-DD' format
        try {
        const [year, month, day] = dueDateString.split('-').map(Number); // Extract year, month, day
        // Set trigger time to 9:00 AM on the due date
        const triggerDate = new Date(year, month - 1, day, 9, 0, 0);

        // Avoid scheduling notifications in the past
        if (triggerDate.getTime() < Date.now()) return;

        // Schedule notification
        await Notifications.scheduleNotificationAsync({
            // Define notification content
            content: {
            title: "Production Due Today! 🏭",
            body: `Order for ${orderTitle} is due today. Check status!`,
            },
            // Explicitly define the trigger type and date
            trigger: { 
            type: SchedulableTriggerInputTypes.DATE,
            date: triggerDate 
            },
        });
        console.log("Notification scheduled for:", triggerDate);
        } catch (error) {
        console.log("Notification Error:", error);
        }
    };

    // Handle Save Action
    const handleSave = async () => {
        const isDateValid = validateDate(date); // Validate date

        // Validate Inputs
        const newErrors = {
        goods: !goods, // Required field
        quantity: !quantity || isNaN(Number(quantity)) || Number(quantity) <= 0, // Ensure positive number
        materials: !materials, // Required field
        date: !isDateValid, // Use strict date validation
        location: !location, // Required field
        };

        setErrors(newErrors); // Update error state

        // If any errors, do not proceed
        if (Object.values(newErrors).some(Boolean)) {
        // Give specific alert if date is wrong
        if (!isDateValid && date.length > 0) {
            Alert.alert("Invalid Date", "Please enter a real calendar date (YYYY-MM-DD).");
        }
        return; // Stop if there are validation errors
        }

        // Save to Database
        try {
        addProductionOrder(
            goods,
            parseInt(quantity),
            materials,
            date,
            location
        );
        // Schedule the notification
        await scheduleReminder(goods, date);
        Alert.alert("Success", "Order created and Reminder set successfully!", [
            { text: "OK", onPress: () => navigation.goBack() }
        ]);
        } catch (e) {
        Alert.alert("Error", "Failed to save order.");
        }
    };

    // Render Form
    return (
        // Keyboard Avoiding View for better UX with keyboard
        <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}  // Adjust behavior based on platform
        style={{ flex: 1 }} // Full height
        >
        <ScrollView contentContainerStyle={styles.container}> {/* Scrollable Container */}
            
            {/* Finished Goods */}
            <TextInput
            label="Finished Goods Name"
            value={goods}
            onChangeText={setGoods}
            mode="outlined"
            error={errors.goods}
            style={styles.input}
            />
            {/* Updated Error Text */}
            <HelperText type="error" visible={errors.goods}>
            Goods name is required.
            </HelperText>

            {/* Quantity */}
            <TextInput
            label="Produced Quantity"
            value={quantity}
            onChangeText={setQuantity}
            mode="outlined"
            keyboardType="numeric"
            error={errors.quantity}
            style={styles.input}
            />
            {/* Updated Error Text */}
            <HelperText type="error" visible={errors.quantity}>
            Enter a valid positive number.
            </HelperText>

            {/* Raw Materials */}
            <TextInput
            label="Raw Materials (BOM)"
            value={materials}
            onChangeText={setMaterials}
            mode="outlined"
            multiline
            numberOfLines={3}
            error={errors.materials}
            style={styles.input}
            />
            {/* Updated Error Text */}
            <HelperText type="error" visible={errors.materials}>
            List the raw materials needed.
            </HelperText>

            {/* Due Date */}
            <TextInput
            label="Due Date (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
            mode="outlined"
            placeholder="2025-12-31"
            error={errors.date}
            right={<TextInput.Icon icon="calendar" />}
            style={styles.input}
            />
            {/* Updated Error Text */}
            <HelperText type="error" visible={errors.date}>
            Enter a valid date (YYYY-MM-DD).
            </HelperText>

            {/* Location */}
            <TextInput
            label="Storage Location"
            value={location}
            onChangeText={setLocation}
            mode="outlined"
            error={errors.location}
            style={styles.input}
            />
            {/* Updated Error Text */}
            <HelperText type="error" visible={errors.location}>
            Warehouse location is required.
            </HelperText>

            {/* Submit Button */}
            <Button 
            mode="contained" 
            onPress={handleSave} 
            style={styles.button}
            contentStyle={{ height: 50 }}
            >
            Create Order
            </Button>

        </ScrollView>
        </KeyboardAvoidingView>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flexGrow: 1,
    },
    input: {
        marginBottom: 5,
        backgroundColor: 'white',
    },
    button: {
        marginTop: 20,
        borderRadius: 8,
        backgroundColor: '#999999',
    },
});