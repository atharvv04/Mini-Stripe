const fs = require('fs');
const path = require('path');
const { query, testConnection } = require('./connection');
const logger = require('../utils/logger');

/**
 * Database migration runner
 * Executes SQL migration files in order
 */
async function runMigrations() {
  try {
    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      logger.error('❌ Cannot connect to database. Please check your connection settings.');
      process.exit(1);
    }

    // Create migrations table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get list of executed migrations
    const executedMigrations = await query('SELECT filename FROM migrations ORDER BY id');
    const executedFiles = executedMigrations.rows.map(row => row.filename);

    // Get migration files from migrations directory
    const migrationsDir = path.join(__dirname, '../../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure order

    logger.info(`📁 Found ${migrationFiles.length} migration files`);
    logger.info(`✅ Already executed: ${executedFiles.length} migrations`);

    let executedCount = 0;

    for (const filename of migrationFiles) {
      if (executedFiles.includes(filename)) {
        logger.info(`⏭️  Skipping ${filename} (already executed)`);
        continue;
      }

      const filePath = path.join(migrationsDir, filename);
      const sql = fs.readFileSync(filePath, 'utf8');

      logger.info(`🔄 Executing migration: ${filename}`);

      try {
        // Execute the migration
        await query(sql);

        // Record the migration as executed
        await query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);

        logger.info(`✅ Successfully executed: ${filename}`);
        executedCount++;
      } catch (error) {
        logger.error(`❌ Failed to execute migration ${filename}:`, error.message);
        throw error;
      }
    }

    if (executedCount === 0) {
      logger.info('🎉 All migrations are up to date!');
    } else {
      logger.info(`🎉 Successfully executed ${executedCount} migration(s)`);
    }

    // Display current database schema
    await displaySchemaInfo();

  } catch (error) {
    logger.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

/**
 * Display current database schema information
 */
async function displaySchemaInfo() {
  try {
    logger.info('\n📊 Database Schema Summary:');
    
    // Get table information
    const tables = await query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    for (const table of tables.rows) {
      logger.info(`  📋 ${table.table_name} (${table.column_count} columns)`);
    }

    // Get migration count
    const migrationCount = await query('SELECT COUNT(*) as count FROM migrations');
    logger.info(`  🔄 Total migrations executed: ${migrationCount.rows[0].count}`);

  } catch (error) {
    logger.warn('Could not display schema info:', error.message);
  }
}

/**
 * Reset migrations (for development only)
 */
async function resetMigrations() {
  try {
    logger.warn('⚠️  This will drop all tables and reset migrations. Are you sure? (y/N)');
    
    // In a real scenario, you'd want to prompt for confirmation
    // For now, we'll just log a warning
    logger.warn('Reset migrations not implemented for safety. Use with caution.');
    
  } catch (error) {
    logger.error('❌ Reset failed:', error.message);
  }
}

// Handle command line arguments
const command = process.argv[2];

switch (command) {
  case 'run':
  case undefined:
    runMigrations();
    break;
  case 'reset':
    resetMigrations();
    break;
  default:
    logger.error('❌ Unknown command. Use: node migrate.js [run|reset]');
    process.exit(1);
} 