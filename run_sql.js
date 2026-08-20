import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  await client.connect();
  const sql = fs.readFileSync('fix_rls.sql', 'utf8');
  await client.query(sql);
  console.log('SQL executed successfully!');
  await client.end();
}
run().catch(console.error);
