#!/usr/bin/env node
/**
 * Script para listar y eliminar cron jobs obsoletos de Vercel
 * Usa la API de Vercel directamente
 */

const https = require('https');
const { execSync } = require('child_process');

const PROJECT_ID = 'prj_utt2htkgfSVX89L3SnP7bBmAE6tF';
const OBSOLETE_PATH = '/api/cron/auto-update-appointments';

// Intentar obtener token de varias fuentes
function getToken() {
  // 1. Desde variable de entorno
  if (process.env.VERCEL_TOKEN) {
    return process.env.VERCEL_TOKEN;
  }

  // 2. Intentar leer desde archivo de configuración
  try {
    const fs = require('fs');
    const path = require('path');
    const authPath = path.join(process.env.HOME, '.vercel', 'auth.json');
    if (fs.existsSync(authPath)) {
      const auth = JSON.parse(fs.readFileSync(authPath, 'utf8'));
      if (auth.token) {
        return auth.token;
      }
    }
  } catch (e) {
    // Ignorar errores
  }

  return null;
}

function makeRequest(method, path, token, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function main() {
  console.log('🔍 Listando cron jobs del proyecto...\n');

  const token = getToken();
  if (!token) {
    console.error('❌ No se encontró token de Vercel');
    console.error('');
    console.error('Para obtener tu token:');
    console.error('1. Ve a: https://vercel.com/account/tokens');
    console.error('2. Crea un nuevo token o copia uno existente');
    console.error('3. Ejecuta: export VERCEL_TOKEN=tu_token_aqui');
    console.error('4. Luego ejecuta este script nuevamente');
    process.exit(1);
  }

  // Listar cron jobs
  try {
    const response = await makeRequest('GET', `/v1/crons?projectId=${PROJECT_ID}`, token);
    
    if (response.status !== 200) {
      console.error('❌ Error al listar cron jobs:');
      console.error(JSON.stringify(response.data, null, 2));
      process.exit(1);
    }

    const crons = response.data.crons || [];
    
    console.log('📋 Cron jobs encontrados:');
    console.log('');
    crons.forEach(cron => {
      console.log(`  ID: ${cron.id}`);
      console.log(`  Path: ${cron.path}`);
      console.log(`  Schedule: ${cron.schedule}`);
      console.log('  ---');
    });

    // Buscar el cron job obsoleto
    const obsoleteCron = crons.find(cron => cron.path === OBSOLETE_PATH);
    
    if (obsoleteCron) {
      console.log('');
      console.log(`🗑️  Cron job obsoleto encontrado:`);
      console.log(`   ID: ${obsoleteCron.id}`);
      console.log(`   Path: ${obsoleteCron.path}`);
      console.log('');
      
      // En modo no interactivo, eliminar directamente
      // En modo interactivo, pedir confirmación
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('¿Eliminar este cron job? (s/n): ', async (answer) => {
        if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'y') {
          console.log('🗑️  Eliminando cron job...');
          
          try {
            const deleteResponse = await makeRequest('DELETE', `/v1/crons/${obsoleteCron.id}`, token);
            
            if (deleteResponse.status === 200 || deleteResponse.status === 204) {
              console.log('✅ Cron job eliminado exitosamente');
            } else {
              console.error('❌ Error al eliminar:');
              console.error(JSON.stringify(deleteResponse.data, null, 2));
            }
          } catch (error) {
            console.error('❌ Error al eliminar cron job:', error.message);
          }
        } else {
          console.log('❌ Operación cancelada');
        }
        
        rl.close();
      });
    } else {
      console.log('');
      console.log(`✅ No se encontró el cron job obsoleto ${OBSOLETE_PATH}`);
      console.log('   Puede que ya haya sido eliminado o no existe');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

