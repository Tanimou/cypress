/**
 * This file contains the database configuration and connection setup.
 * It imports necessary dependencies, sets up the database connection,
 * and exports the configured database instance.
 */

// Import necessary dependencies
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../../migrations/schema'
import * as dotenv from 'dotenv'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

// Load environment variables from .env file
dotenv.config({ path: '.env' })

// Check if DATABASE_URL is defined in the environment variables
if (!process.env.DATABASE_URL) {
    console.log('😒Cannot find DATABASE_URL in .env file')
}

// Create a PostgreSQL client using the DATABASE_URL
const client = postgres(process.env.DATABASE_URL as string)

// Create a drizzle instance with the client and schema
const db = drizzle(client, { schema })

const migrateDb = async () => {
    try {
        console.log('🚀Migrating database')
        await migrate(db, { migrationsFolder: 'migrations' })
        console.log('🎉Database migrated successfully')
    }
    catch (err) {
        console.log('🤯Error migrating database')
        console.log(err)
    }
}
migrateDb()

// Export the configured database instance
export default db
