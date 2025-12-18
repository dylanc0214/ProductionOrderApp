// POManager/src/screens/AIAssistantScreen.tsx
// A screen that uses Gemini API to provide AI insights on production orders.
// Import necessary dependencies and components
import React, { useState, useEffect } from 'react'; // React and hooks
import { View, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native'; // React Native components
import { Text, Card, Button, Avatar } from 'react-native-paper'; // UI components from react-native-paper
import { getProductionOrders } from '../database/db'; // Function to get production orders from the database

// Gemini API KEY
const GEMINI_API_KEY = "AIzaSyClj9-RFYbVTzCG5f3YJb2ZsfO3tu0-wWE";

// Main component for the AI Assistant Screen
export default function AIAssistantScreen() {
  const [insight, setInsight] = useState(''); // State to hold AI insights and loading status
  const [loading, setLoading] = useState(false); // State to track loading status

  // Function to fetch AI insights from Gemini API
  const fetchAIInsights = async () => { // Fetch AI insights
    setLoading(true); // Prepare Request
    setInsight(''); // Clear insight before new fetch

    // 1. Get current data
    const orders = getProductionOrders();
    
    // Safety check: If no orders, don't waste API calls
    if (orders.length === 0) { // If no data case
      setInsight("No production orders found. Create some orders first!"); // Inform user
      setLoading(false); // Stop loading
      return;
    }

    // 2. Prepare data for the AI prompt
    const dataString = JSON.stringify(orders.map(o => ({ // Format data
      item: o.finished_goods, // finished goods
      qty: o.produced_quantity, // produced quantity
      due: o.due_date, // due date
      status: o.status // status
    })));

    // 3. Create prompt
    const prompt = `
      You are a factory manager assistant. Analyze these production orders: 
      ${dataString}
      
      Provide 3 short, bulleted insights about urgent deadlines, stock risks, or bottlenecks. 
      Talk like a helpful assistant. Keep it brief.
    `;

    // 4. Call Gemini API
    try {
      console.log("Sending request to Gemini..."); // Debug log
      
      // Make API Request
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
        // Request options
        {
          method: 'POST', // HTTP method
          headers: {
            'Content-Type': 'application/json', // Content type
          },
          // 5. Request Body
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }] // Prompt content
          }),
        }
      );

      // Parse Response
      const result = await response.json(); // Parse JSON response
      console.log("Gemini Response:", JSON.stringify(result, null, 2)); // Debug log response

      // 6. Handle Response
      if (result.error) {
        // If Google sent an error, show it
        setInsight(`API Error: ${result.error.message}`);
      } else if (result.candidates && result.candidates.length > 0) { // If we have candidates
        // Extract the AI-generated text
        const aiText = result.candidates[0].content.parts[0].text; // Get AI text
        setInsight(aiText); // Update insight state
      } else { // No candidates case
        setInsight("AI returned no results. Try again.");
      }

    } catch (error: any) { // Network or other errors
      console.error("Fetch Error:", error); // Log error
      setInsight(`Network Error: ${error.message}`); // Show error to user
    } finally { // Always executed
      setLoading(false); // Stop loading
    }
  };

  // Fetch insights on component mount
  useEffect(() => { // On mount
    fetchAIInsights(); // Initial fetch
  }, []); // Empty dependency array

  // Render the UI
  return (
    // Container
    <View style={styles.container}>
      {/* Card for AI Insights */}
      <Card style={styles.card}>
        {/* Card Header */}
        <Card.Title 
          title="SuDu AI Assistant" 
          subtitle="Production Insights"
          left={(props) => <Avatar.Icon {...props} icon="robot" style={{ backgroundColor: '#999999' }} />}
        />
        {/* Card Content */}
        <Card.Content>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#999999" />
              <Text style={{ marginTop: 10 }}>Analyzing factory data...</Text>
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 400 }}>
              <Text variant="bodyLarge" style={styles.insightText}>
                {insight}
              </Text>
            </ScrollView>
          )}
        </Card.Content>
        {/* Card Actions */}
        <Card.Actions>
          <Button mode="text" onPress={fetchAIInsights} disabled={loading} textColor='#999999'>
            Refresh Analysis
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
}

// Styles for the component (using StyleSheet)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    padding: 10,
    backgroundColor: 'white',
    minHeight: 200,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  insightText: {
    lineHeight: 24,
  }
});