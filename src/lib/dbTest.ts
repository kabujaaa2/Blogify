import { PrismaClient } from '@prisma/client'

async function testConnection() {
  const prisma = new PrismaClient()
  
  try {
    // Test the connection
    await prisma.$connect()
    console.log('Successfully connected to the database!')
    
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: 'test123',
        role: 'USER'
      }
    })
    
    console.log('Test user created:', user)
    
  } catch (error) {
    console.error('Error connecting to the database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection() 