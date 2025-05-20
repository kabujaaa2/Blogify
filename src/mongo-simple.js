// Simple MongoDB connection test script
console.log('Starting MongoDB connection test');

// Import MongoDB driver dynamically
import('mongodb').then(async ({ MongoClient }) => {
  try {
    // MongoDB connection string
    const uri = "mongodb+srv://2022btechaidsprince12080:aABmHKWA9IwKq8gH@cluster0.itkp6o2.mongodb.net/blogify";
    console.log('Connection URI:', uri);
    
    // Create client
    const client = new MongoClient(uri);
    console.log('Connecting to MongoDB...');
    
    // Connect to the server
    await client.connect();
    console.log('Successfully connected to MongoDB!');
    
    // Get reference to database
    const db = client.db('blogify');
    console.log('Database:', db.databaseName);
    
    // Close connection
    await client.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}).catch(error => {
  console.error('Error importing MongoDB:', error);
}); 