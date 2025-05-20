import * as dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the .env file (in the project root, one level up from src)
const envPath = resolve(__dirname, '..', '.env');
console.log('Loading .env from:', envPath);
console.log('File exists:', fs.existsSync(envPath) ? 'Yes' : 'No');

// Try to read .env file content directly
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('Content of .env file:', envContent);
}

// Load environment variables
dotenv.config({ path: envPath });

// Direct connection string (as a fallback)
const MONGODB_URI = process.env.DATABASE_URL || "mongodb+srv://2022btechaidsprince12080:aABmHKWA9IwKq8gH@cluster0.itkp6o2.mongodb.net/blogify";

// Log the database URL
console.log('Using DATABASE_URL:', MONGODB_URI);

// Now try to connect to MongoDB directly (without Prisma)
const testMongoConnection = async () => {
  try {
    // Import MongoDB driver
    const { MongoClient } = await import('mongodb');
    
    if (!MONGODB_URI) {
      throw new Error('No MongoDB connection string available');
    }
    
    console.log('Attempting to connect to MongoDB...');
    
    // Create a new MongoDB client
    const client = new MongoClient(MONGODB_URI);
    
    // Connect to the MongoDB server
    await client.connect();
    console.log('Successfully connected to MongoDB!');
    
    // List all databases to verify connection
    const dbs = await client.db().admin().listDatabases();
    console.log('Available databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    // Close the connection
    await client.close();
    console.log('Connection closed.');
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

// Run the test
testMongoConnection(); 