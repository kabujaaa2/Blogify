const { MongoClient } = require('mongodb');

// Connection URI with explicit database name
const uri = "mongodb+srv://2022btechaidsprince12080:aABmHKWA9IwKq8gH@cluster0.itkp6o2.mongodb.net/blogify?retryWrites=true&w=majority&appName=Cluster0";

async function testConnection() {
  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Successfully connected to MongoDB!");

    // Test database access - explicitly use blogify database
    const database = client.db("blogify");
    const collection = database.collection("test");
    
    // Try to insert a document
    await collection.insertOne({ test: "Hello MongoDB!", timestamp: new Date() });
    console.log("Successfully inserted a test document!");

    // Read the document back
    const document = await collection.findOne({ test: "Hello MongoDB!" });
    console.log("Retrieved document:", document);

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    await client.close();
  }
}

testConnection(); 