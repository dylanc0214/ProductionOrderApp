// POManager/src/screens/DashboardScreen.tsx
// Import necessary dependencies and components
import React, { useState, useCallback, useEffect } from 'react'; // React and hooks
import { View, FlatList, StyleSheet, ScrollView, Alert } from 'react-native'; // React Native components
import { Text, Card, Chip, FAB, ActivityIndicator, Badge, Button, IconButton } from 'react-native-paper'; // React Native Paper components
import { useFocusEffect } from '@react-navigation/native'; // Navigation hook
import { getProductionOrders, updatePOStatus, ProductionOrder, deleteProductionOrder } from '../database/db'; // Database functions and types

// DashboardScreen Component
export default function DashboardScreen({ navigation }: any) { // Navigation prop
    // Set up header with AI Assistant button
    React.useLayoutEffect(() => {
        // Add "Ask AI" button to header
        navigation.setOptions({
        headerRight: () => (
            <Button 
            onPress={() => navigation.navigate('AIAssistant')} 
            mode="text" 
            textColor="#999999"
            icon="robot"
            compact
            >
            Ask AI
            </Button>
        ),
        });
    }, [navigation]); // Dependency on navigation
    // State variables
    const [orders, setOrders] = useState<ProductionOrder[]>([]); // All orders
    const [filteredOrders, setFilteredOrders] = useState<ProductionOrder[]>([]); // Filtered orders
    const [loading, setLoading] = useState(true); // Loading state
    
    // Filter State
    const [statusFilter, setStatusFilter] = useState('All');

    // Load Data Function
    const loadData = useCallback(() => {
        setLoading(true); // Start loading
        const data = getProductionOrders(); // Fetch orders from DB
        setOrders(data); // Update state
        setLoading(false); // End loading
    }, []); // No dependencies

    // Refresh data when screen is focused
    useFocusEffect(
        useCallback(() => {
        loadData();
        }, [loadData])
    );

    // Update filtered orders when filter or orders change
    useEffect(() => {
        if (statusFilter === 'All') { // No filter
        setFilteredOrders(orders); // Show all orders
        } else { // Apply filter
        const filtered = orders.filter(item => item.status === statusFilter); // Filtered list
        setFilteredOrders(filtered); // Update state
        }
    }, [statusFilter, orders]); // Dependencies

    // Handle Status Update
    const handleStatusUpdate = (id: number, currentStatus: string) => { // Determine new status
        let newStatus = 'Pending'; // Default
        if (currentStatus === 'Pending') newStatus = 'In Progress'; // Next status
        else if (currentStatus === 'In Progress') newStatus = 'Completed'; // Next status
        
        // Update in database
        updatePOStatus(id, newStatus);
        
        // Update local state
        const updatedOrders = orders.map(item => // Map through orders
        item.id === id ? { ...item, status: newStatus as any } : item // Update status
        );
        setOrders(updatedOrders); // Update state
    };

    // Handle Delete Function
    const handleDelete = (id: number) => {
        Alert.alert(
        "Delete Order",
        "Are you sure you want to delete this order?",
        [
            { text: "Cancel", style: "cancel" },
            { 
            text: "Delete", 
            style: "destructive",
            onPress: () => {
                deleteProductionOrder(id);
                // Refresh list immediately
                const updatedList = orders.filter(item => item.id !== id); // Filter out deleted item
                setOrders(updatedList); // Update main list
                setFilteredOrders(updatedList); // Update filter view too
            }
            }
        ]
        );
    };

    // Render Item
    const renderItem = ({ item }: { item: ProductionOrder }) => {
        const isCompleted = item.status === 'Completed'; // Check if completed
        const isInProgress = item.status === 'In Progress'; // Check if in progress

        return (
        // Card for each production order
        <Card style={[styles.card, isCompleted && { opacity: 0.7 }]}> 
            <Card.Content>
            {/* Row for Header with Goods Name and Status Chip */}
            <View style={styles.header}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.finished_goods}</Text>
                <Chip 
                icon={isCompleted ? "check" : isInProgress ? "progress-clock" : "clock-outline"} // Status icon
                mode="flat" // Flat style
                onPress={() => handleStatusUpdate(item.id, item.status)} // Update status on press
                style={{ backgroundColor: isCompleted ? '#e8f5e9' : isInProgress ? '#fff3e0' : '#ffebee' }} // Color based on status
                >
                {item.status}
                </Chip>
            </View>
            
            {/* Row for Quantity and Due Date */}
            <View style={styles.row}>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold', marginRight: 5 }}>Quantity:</Text>
                <Badge size={24} style={{ backgroundColor: '#999999' }}>{item.produced_quantity}</Badge>
                <Text variant="bodySmall" style={{ marginLeft: 10 }}>📅 {item.due_date}</Text>
            </View>

            {/* Row for Location and Delete Button */}
            <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center', // Center vertically
                marginTop: 10 
            }}>
                <Text variant="bodySmall" style={{ color: 'gray', flex: 1 }}>
                📍 {item.storage_location}
                </Text>
                
                <IconButton 
                icon="delete" 
                size={20} 
                iconColor="#ef5350"
                onPress={() => handleDelete(item.id)} // Delete action
                style={{ margin: 0 }} // Remove extra margin so it hugs the right side
                />
            </View>
            </Card.Content>
        </Card>
        );
    };

    return (
        <View style={styles.container}>
        {/* Filter Section */}
        <View style={styles.filterContainer}>
            {/* Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['All', 'Pending', 'In Progress', 'Completed'].map((status) => ( // Map through statuses
                <Chip
                key={status} // Unique key
                mode={statusFilter === status ? 'flat' : 'outlined'} // Highlight selected
                selected={statusFilter === status} // Selected state
                onPress={() => setStatusFilter(status)} // Update filter
                style={[styles.filterChip, { borderRadius: 10 }]}  // Rounded corners
                textStyle={{ fontWeight: statusFilter === status ? 'bold' : 'normal' }}
                selectedColor="white"
                >
                {status}
                </Chip>
            ))}
            </ScrollView>
        </View>

        {/* Orders List */}
        {loading ? (
            <ActivityIndicator animating={true} size="large" style={{ marginTop: 20 }} />
        ) : filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
            <Text variant="bodyLarge">No orders found.</Text>
            <Text variant="bodySmall" style={{ color: 'gray' }}>
                {statusFilter === 'All' ? 'Tap + to create one.' : `No orders in "${statusFilter}".`}
            </Text>
            </View>
        ) : (
            <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 80 }}
            />
        )}

        {/* Floating Action Button */}
        <FAB
            icon="plus"
            label="New Order"
            color="white" 
            style={styles.fab}
            onPress={() => navigation.navigate('CreatePO')}
        />
        </View>
    );
}

// Styles (CSS-in-JS)
const styles = StyleSheet.create({
    container: { 
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 10 
    },
    filterContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        height: 40,
    },
    filterChip: {
        marginRight: 8,
        backgroundColor: '#999999',
    },
    card: { 
        marginBottom: 12, 
        backgroundColor: 'white' 
    },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 10 
    },
    row: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    emptyState: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    fab: { 
        position: 'absolute', 
        margin: 16, 
        right: 0, 
        bottom: 0, 
        backgroundColor: '#999999'
    },
});