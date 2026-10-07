import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT policyname, permissive, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename IN ('plans', 'profiles');
  `);
  console.log("Policies:");
  console.table(res.rows);

  const resTrigger = await client.query(`
    SELECT pg_get_functiondef(oid) as def 
    FROM pg_proc 
    WHERE proname = 'handle_new_user';
  `);
  console.log("Trigger function:");
  console.log(resTrigger.rows[0]?.def);

  await client.end();
}
run().catch(console.error);
