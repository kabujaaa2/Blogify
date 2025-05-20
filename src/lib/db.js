// MongoDB client for the application
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '..', '..', '.env') });

// MongoDB connection string
const uri = process.env.DATABASE_URL || "mongodb+srv://2022btechaidsprince12080:aABmHKWA9IwKq8gH@cluster0.itkp6o2.mongodb.net/blogify";

// Create MongoDB client
const client = new MongoClient(uri);
let clientPromise;

// In development mode, use a global variable so that the value
// is preserved across module reloads caused by HMR (Hot Module Replacement).
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = client.connect();
}

export { clientPromise };

// Helper function to get the database
export async function getDatabase() {
  const client = await clientPromise;
  return client.db('blogify');
}

// Helper function to get a collection
export async function getCollection(collectionName) {
  const db = await getDatabase();
  return db.collection(collectionName);
}

// Execute a database query or operation with error handling
export async function executeDbOperation(operation) {
  try {
    return await operation();
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
} 