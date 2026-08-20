import dotenv from 'dotenv';
dotenv.config();
fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/?apikey=${process.env.VITE_SUPABASE_ANON_KEY}`)
  .then(res => res.json())
  .then(data => {
    console.log(Object.keys(data.paths).filter(p => p.startsWith('/rpc/')));
  });
