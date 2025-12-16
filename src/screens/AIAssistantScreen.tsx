// POManager/src/screens/AIAssistantScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Text, Card, Button, Avatar } from 'react-native-paper';
import { getProductionOrders } from '../database/db';

// YOUR API KEY
const GEMINI_API_KEY = "AIzaSyClj9-RFYbVTzCG5f3YJb2ZsfO3tu0-wWE";

export default function AIAssistantScreen() {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAIInsights = async () => {
    setLoading(true);
    setInsight('');

    // 1. Get current data
    const orders = getProductionOrders();
    
    // Safety check: If no orders, don't waste API calls
    if (orders.length === 0) {
      setInsight("No production orders found. Create some orders first!");
      setLoading(false);
      return;
    }

    const dataString = JSON.stringify(orders.map(o => ({
      item: o.finished_goods,
      qty: o.produced_quantity,
      due: o.due_date,
      status: o.status
    })));

    const prompt = `
      You are a factory manager assistant. Analyze these production orders: 
      ${dataString}
      
      Provide 3 short, bulleted insights about urgent deadlines, stock risks, or bottlenecks. 
      Talk like a helpful assistant. Keep it brief.
    `;

    try {
      console.log("Sending request to Gemini...");
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          }),
        }
      );

      const result = await response.json();
      console.log("Gemini Response:", JSON.stringify(result, null, 2)); // <--- CHECK YOUR TERMINAL FOR THIS

      // 4. Handle Response
      if (result.error) {
        // If Google sent an error, show it!
        setInsight(`API Error: ${result.error.message}`);
      } else if (result.candidates && result.candidates.length > 0) {
        const aiText = result.candidates[0].content.parts[0].text;
        setInsight(aiText);
      } else {
        setInsight("AI returned no results. Try again.");
      }

    } catch (error: any) {
      console.error("Fetch Error:", error);
      setInsight(`Network Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, []);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title 
          title="SuDu AI Assistant" 
          subtitle="Production Insights"
          left={(props) => <Avatar.Icon {...props} icon="robot" style={{ backgroundColor: '#999999' }} />}
        />
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
        <Card.Actions>
          <Button mode="text" onPress={fetchAIInsights} disabled={loading} textColor='#999999'>
            Refresh Analysis
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
}

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