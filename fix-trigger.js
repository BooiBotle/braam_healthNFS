import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
  await client.connect();
  const sql = fs.readFileSync('update_trigger.sql', 'utf8');
  await client.query(sql);
  console.log("Trigger updated successfully!");
  await client.end();
}
run().catch(console.error);
