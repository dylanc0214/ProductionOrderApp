// POManager/src/screens/DashboardScreen.tsx
// Import necessary dependencies and components
import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, FAB, ActivityIndicator, Badge, Button } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getProductionOrders, updatePOStatus, ProductionOrder } from '../database/db';

// DashboardScreen Component
export default function DashboardScreen({ navigation }: any) {
    React.useLayoutEffect(() => {
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
    }, [navigation]);
    // State variables
    const [orders, setOrders] = useState<ProductionOrder[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<ProductionOrder[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filter State
    const [statusFilter, setStatusFilter] = useState('All');

    // Load Data Function
    const loadData = useCallback(() => {
        setLoading(true);
        const data = getProductionOrders();
        setOrders(data);
        setLoading(false);
    }, []);

    // Refresh data when screen is focused
    useFocusEffect(
        useCallback(() => {
        loadData();
        }, [loadData])
    );

    // Update filtered orders when filter or orders change
    useEffect(() => {
        if (statusFilter === 'All') {
        setFilteredOrders(orders);
        } else {
        const filtered = orders.filter(item => item.status === statusFilter);
        setFilteredOrders(filtered);
        }
    }, [statusFilter, orders]);

    // Handle Status Update
    const handleStatusUpdate = (id: number, currentStatus: string) => {
        let newStatus = 'Pending';
        if (currentStatus === 'Pending') newStatus = 'In Progress';
        else if (currentStatus === 'In Progress') newStatus = 'Completed';
        
        updatePOStatus(id, newStatus);
        
        const updatedOrders = orders.map(item => 
        item.id === id ? { ...item, status: newStatus as any } : item
        );
        setOrders(updatedOrders);
    };

    // Render Item
    const renderItem = ({ item }: { item: ProductionOrder }) => {
        const isCompleted = item.status === 'Completed';
        const isInProgress = item.status === 'In Progress';

        return (
        <Card style={[styles.card, isCompleted && { opacity: 0.7 }]}>
            <Card.Content>
            <View style={styles.header}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.finished_goods}</Text>
                <Chip 
                icon={isCompleted ? "check" : isInProgress ? "progress-clock" : "clock-outline"}
                mode="flat" 
                onPress={() => handleStatusUpdate(item.id, item.status)}
                style={{ backgroundColor: isCompleted ? '#e8f5e9' : isInProgress ? '#fff3e0' : '#ffebee' }}
                >
                {item.status}
                </Chip>
            </View>
            
            <View style={styles.row}>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold', marginRight: 5 }}>Qty:</Text>
                <Badge size={24} style={{ backgroundColor: '#2196F3' }}>{item.produced_quantity}</Badge>
                <Text variant="bodySmall" style={{ marginLeft: 10 }}>📅 {item.due_date}</Text>
            </View>

            <Text variant="bodySmall" style={{ color: 'gray', marginTop: 8 }}>
                Location: {item.storage_location}
            </Text>
            </Card.Content>
        </Card>
        );
    };

    return (
        <View style={styles.container}>
        {/* Filter Section */}
        <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
                <Chip
                key={status}
                mode={statusFilter === status ? 'flat' : 'outlined'}
                selected={statusFilter === status}
                onPress={() => setStatusFilter(status)}
                style={[styles.filterChip, { borderRadius: 10 }]} 
                textStyle={{ fontWeight: statusFilter === status ? 'bold' : 'normal' }}
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