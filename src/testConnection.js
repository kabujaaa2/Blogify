import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Database URL:', process.env.DATABASE_URL);
    
    // Test the connection by trying to create and delete a test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test@test.com',
        name: 'Test User',
        password: 'test123',
        role: 'USER'
      }
    });
    
    console.log('Successfully created test user:', testUser);

    // Delete the test user
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    
    console.log('Successfully deleted test user');
    console.log('Database connection test completed successfully!');
    
  } catch (error) {
    console.error('Error testing database connection:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 