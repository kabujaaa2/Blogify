import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Try to query the database
    const userCount = await prisma.user.count();
    console.log('Successfully connected to the database!');
    console.log(`Number of users in the database: ${userCount}`);
    return true;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection()
  .then((success) => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  }); 