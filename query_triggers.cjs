const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:lFOK6Kadvjth42DS@db.xeknazmbpoogiteumwmg.supabase.co:5432/postgres'
});
async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT trigger_name, event_manipulation, event_object_table, action_statement
    FROM information_schema.triggers
    WHERE event_object_table = 'applications' OR event_object_table = 'plan_changes';
  `);
  console.log(res.rows);
  await client.end();
}
run();
