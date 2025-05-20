import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function main() {
  try {
    // Test the connection
    console.log('Testing database connection...')
    
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: 'test123',
        role: 'USER'
      },
    })
    
    console.log('Created test user:', user)
    
    // Fetch the user back
    const users = await prisma.user.findMany()
    console.log('All users:', users)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  }) 