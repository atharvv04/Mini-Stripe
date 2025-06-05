const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:Greenpear%4024@localhost:5432/mini_stripe"
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to database!");
    client.release();
  } catch (err) {
    console.error("❌ Failed to connect:", err.message);
  } finally {
    pool.end();
  }
}

testConnection();
