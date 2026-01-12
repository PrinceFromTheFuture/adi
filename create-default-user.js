const { Client } = require('pg');
require('dotenv/config');

async function createDefaultUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check if user exists
    const checkResult = await client.query('SELECT id FROM users WHERE id = 1');
    
    if (checkResult.rows.length > 0) {
      console.log('User with ID 1 already exists');
      return;
    }

    // Create default user
    const result = await client.query(`
      INSERT INTO users (
        target_weight, 
        current_weight, 
        height, 
        gender, 
        activity_level, 
        profile_image,
        daily_water_goal,
        daily_calorie_goal,
        daily_steps_goal
      ) VALUES (
        60.00, 
        65.00, 
        165.00, 
        'female', 
        'moderately_active', 
        'https://i.pravatar.cc/150?img=1',
        2000,
        2000,
        10000
      ) RETURNING *
    `);

    console.log('Default user created:', result.rows[0]);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDefaultUser();
