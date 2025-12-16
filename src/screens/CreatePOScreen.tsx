// POManager/src/screens/CreatePOScreen.tsx
// Import necessary dependencies and components
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { addProductionOrder } from '../database/db';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

// CreatePOScreen Component
export default function CreatePOScreen({ navigation }: any) {
    // Form State
    const [goods, setGoods] = useState('');
    const [quantity, setQuantity] = useState('');
    const [materials, setMaterials] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');

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
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;

        // 2. Check Logical Validity (e.g., no Month 13, no Day 32)
        const [year, month, day] = dateString.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);

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
    const scheduleReminder = async (orderTitle: string, dueDateString: string) => {
        try {
        const [year, month, day] = dueDateString.split('-').map(Number);
        // Set trigger time to 9:00 AM on the due date
        const triggerDate = new Date(year, month - 1, day, 9, 0, 0);

        if (triggerDate.getTime() < Date.now()) return;

        await Notifications.scheduleNotificationAsync({
            content: {
            title: "Production Due Today! 🏭",
            body: `Order for ${orderTitle} is due today. Check status!`,
            },
            // FIX: Explicitly define the trigger type and date
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

    const handleSave = async () => {
        const isDateValid = validateDate(date);

        const newErrors = {
        goods: !goods,
        quantity: !quantity || isNaN(Number(quantity)) || Number(quantity) <= 0,
        materials: !materials,
        date: !isDateValid,
        location: !location,
        };

        setErrors(newErrors);

        if (Object.values(newErrors).some(Boolean)) {
        // Give specific alert if date is wrong
        if (!isDateValid && date.length > 0) {
            Alert.alert("Invalid Date", "Please enter a real calendar date (YYYY-MM-DD).");
        }
        return;
        }

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
        <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
        >
        <ScrollView contentContainerStyle={styles.container}>
            
            {/* Finished Goods */}
            <TextInput
            label="Finished Goods Name"
            value={goods}
            onChangeText={setGoods}
            mode="outlined"
            error={errors.goods}
            style={styles.input}
            />
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