const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
async function test() {
  console.log("Attempting login...");
  const start = Date.now();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'axelp7223@gmail.com', // just to trigger network req
    password: 'wrongpassword'
  });
  console.log("Time:", Date.now() - start, "ms");
  console.log("Data:", data, "Error:", error);
}
test();
