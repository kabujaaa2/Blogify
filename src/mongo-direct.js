import { MongoClient } from 'mongodb';

// Direct connection string
const url = "mongodb+srv://2022btechaidsprince12080:aABmHKWA9IwKq8gH@cluster0.itkp6o2.mongodb.net/blogify";

async function connectToMongo() {
  console.log('Starting MongoDB connection test...');
  console.log('Using connection URL:', url);
  
  try {
    console.log('Creating MongoDB client...');
    const client = new MongoClient(url);
    
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Successfully connected to MongoDB!');
    
    // Get the database
    const db = client.db('blogify');
    console.log('Connected to database:', db.databaseName);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:');
    if (collections.length === 0) {
      console.log('- No collections found (new database)');
    } else {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
    
    // Close the connection
    await client.close();
    console.log('Connection closed successfully.');
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

// Run the connection test
connectToMongo(); 