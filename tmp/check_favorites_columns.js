const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple .env.local parser
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length === 2) {
        env[parts[0].trim()] = parts[1].trim();
    }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  // Query a system view to find column names
  const { data, error } = await supabase
    .rpc('get_table_columns', { table_name: 'favorites' });

  if (error) {
    // If RPC doesn't exist, try a simple select
    console.log('RPC failed, trying simple select...');
    const { data: selectData, error: selectError } = await supabase
        .from('favorites')
        .select('*')
        .limit(1);
    
    if (selectError) {
        console.error('Select error:', selectError);
    } else {
        console.log('Sample data or column keys:', selectData.length > 0 ? Object.keys(selectData[0]) : 'No data');
        
        // Try to trigger an error that lists valid columns
        const { error: errorTrigger } = await supabase
            .from('favorites')
            .select('non_existent_column');
        console.log('Error hint for column names:', errorTrigger?.message);
    }
  } else {
    console.log('Columns from RPC:', data);
  }
}

checkSchema();
