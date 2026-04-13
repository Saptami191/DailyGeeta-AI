const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching favorites:', error);
  } else {
    console.log('Sample data from favorites:', data);
    if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
    } else {
        // Try to fetch column names via RPC or just try a likely one
        console.log('No data found in favorites table.');
    }
  }
}

checkSchema();
