// Importing necessary types and modules
import type { Config } from 'drizzle-kit'
import * as dotenv from 'dotenv'

// Loading environment variables from .env file
dotenv.config({ path: '.env' })

// Checking if DATABASE_URL is present in the environment variables
if (!process.env.DATABASE_URL) {
    console.log('😒Cannot find DATABASE_URL in .env file')
}

// Exporting the configuration object
export default {
    schema: './lib/supabase/schema.ts',
    out: './migrations',
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL || '',
    },
} satisfies Config