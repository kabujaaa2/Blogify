const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Testing Node.js script execution (CommonJS)');
console.log('Environment variables:', process.env.DATABASE_URL ? 'DATABASE_URL is set' : 'DATABASE_URL is not set');
console.log('DATABASE_URL:', process.env.DATABASE_URL); 