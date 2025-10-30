// Script para verificar si la tabla availability existe
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer variables de entorno del archivo .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAvailabilityTable() {
  console.log('🔍 Verificando si la tabla "availability" existe...\n');

  try {
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('❌ La tabla "availability" NO existe en la base de datos\n');
        console.log('📋 Necesitas ejecutar la migración SQL en Supabase:');
        console.log('   1. Ve a: https://supabase.com/dashboard/project/kfqdjwlvrtpqmeqzsaou/sql');
        console.log('   2. Copia el contenido de: supabase/migrations/create_availability_table.sql');
        console.log('   3. Pégalo en el SQL Editor y haz clic en "Run"\n');
        return false;
      }

      console.error('❌ Error al consultar la tabla:', error.message);
      return false;
    }

    console.log('✅ La tabla "availability" existe correctamente');
    console.log(`   Registros encontrados: ${data.length}\n`);
    return true;

  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
    return false;
  }
}

checkAvailabilityTable();
