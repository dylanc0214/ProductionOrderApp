// POManager/src/database/db.ts
// Import SQLite
import * as SQLite from 'expo-sqlite';

// Open the database
const db = SQLite.openDatabaseSync('production_orders.db');

export interface ProductionOrder {
    id: number;
    finished_goods: string;
    produced_quantity: number;
    raw_materials: string;
    due_date: string;
    storage_location: string;
    status: 'Pending' | 'In Progress' | 'Completed';
}

// Create Table
export const initDatabase = () => {
    try {
        db.execSync(`
        CREATE TABLE IF NOT EXISTS production_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            finished_goods TEXT NOT NULL,
            produced_quantity INTEGER NOT NULL,
            raw_materials TEXT NOT NULL,
            due_date TEXT NOT NULL,
            storage_location TEXT NOT NULL,
            status TEXT DEFAULT 'Pending'
        );
        `);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

// Add a PO
export const addProductionOrder = (
    finished_goods: string,
    produced_quantity: number,
    raw_materials: string,
    due_date: string,
    storage_location: string
) => {
    try {
        db.runSync(
        'INSERT INTO production_orders (finished_goods, produced_quantity, raw_materials, due_date, storage_location, status) VALUES (?, ?, ?, ?, ?, ?)',
        [finished_goods, produced_quantity, raw_materials, due_date, storage_location, 'Pending']
        );
    } catch (error) {
        console.error('Error adding PO:', error);
        throw error;
    }
};

// Get All POs
export const getProductionOrders = (): ProductionOrder[] => {
    try {
        const results = db.getAllSync('SELECT * FROM production_orders ORDER BY id DESC');
        return results as ProductionOrder[];
    } catch (error) {
        console.error('Error fetching POs:', error);
        return [];
    }
};

// Update Status
export const updatePOStatus = (id: number, status: string) => {
    try {
        db.runSync('UPDATE production_orders SET status = ? WHERE id = ?', [status, id]);
    } catch (error) {
        console.error('Error updating status:', error);
    }
};