// Script to fix existing meals that don't have created_by field
// Run this with: node fix-existing-meals.js

const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "adi",
  user: "postgres",
  password: "password",
});

async function fixExistingMeals() {
  const client = await pool.connect();

  try {
    // Check how many meals exist without created_by
    const checkResult = await client.query('SELECT COUNT(*) FROM meals WHERE "createdBy" IS NULL');
    console.log(`Found ${checkResult.rows[0].count} meals without created_by`);

    if (parseInt(checkResult.rows[0].count) > 0) {
      // Update all meals without created_by to use the default user email
      const updateResult = await client.query('UPDATE meals SET "createdBy" = $1 WHERE "createdBy" IS NULL RETURNING id', ["adi@gmail.com"]);
      console.log(`Updated ${updateResult.rowCount} meals to have created_by = 'adi@gmail.com'`);
    }

    // Show all meals now
    const allMeals = await client.query('SELECT id, "foodName", "mealDate", "createdBy" FROM meals ORDER BY "mealDate" DESC LIMIT 10');
    console.log("\nRecent meals:");
    console.table(allMeals.rows);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixExistingMeals();
