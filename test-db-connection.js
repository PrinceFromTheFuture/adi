// Test database connection
// Run with: node test-db-connection.js

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'NOT SET');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env.local');
    return;
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Database connection successful!');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query test successful:', result.rows[0]);
    
    await client.end();
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('\nPlease check:');
    console.error('1. DATABASE_URL format: postgresql://username:password@host:port/database');
    console.error('2. Database server is running');
    console.error('3. Username and password are correct');
    console.error('4. Database exists');
  }
}

testConnection();

