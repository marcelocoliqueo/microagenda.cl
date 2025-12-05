#!/usr/bin/env node
/**
 * Script para verificar el estado del trial de un usuario
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=:#]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Faltan variables de entorno');
    console.error('Necesitas NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const TRIAL_DAYS = 3;
const userEmail = process.argv[2] || 'marcelo.coliqueo@gmail.com';

async function checkTrialStatus() {
    try {
        console.log(`🔍 Buscando usuario: ${userEmail}\n`);

        // Buscar usuario por email (intentar con diferentes variaciones)
        let profile = null;
        let error = null;

        // Primero intentar búsqueda exacta
        let result = await supabase
            .from('profiles')
            .select('id, email, name, subscription_status, created_at')
            .eq('email', userEmail)
            .maybeSingle();

        if (result.error) {
            error = result.error;
        } else if (result.data) {
            profile = result.data;
        } else {
            // Si no se encuentra, buscar todos los perfiles para ver qué hay
            console.log('⚠️  Usuario no encontrado con búsqueda exacta. Buscando variaciones...\n');
            const allResult = await supabase
                .from('profiles')
                .select('id, email, name, subscription_status, created_at')
                .ilike('email', `%${userEmail.split('@')[0]}%`)
                .limit(5);
            
            if (allResult.data && allResult.data.length > 0) {
                console.log('📋 Usuarios encontrados con email similar:');
                allResult.data.forEach(u => {
                    console.log(`   - ${u.email} (${u.name})`);
                });
                console.log('');
            }
        }

        if (error) {
            console.error('❌ Error al buscar usuario:', error.message);
            process.exit(1);
        }

        if (!profile) {
            console.error('❌ Usuario no encontrado');
            console.log('\n📋 Listando últimos usuarios registrados:\n');
            const allUsers = await supabase
                .from('profiles')
                .select('email, name, subscription_status, created_at')
                .order('created_at', { ascending: false })
                .limit(10);
            
            if (allUsers.data && allUsers.data.length > 0) {
                allUsers.data.forEach(u => {
                    console.log(`   - ${u.email} (${u.name}) - ${u.subscription_status}`);
                });
            } else {
                console.log('   No hay usuarios en la base de datos');
            }
            process.exit(1);
        }

        console.log('📋 Información del usuario:');
        console.log(`   Nombre: ${profile.name}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Estado: ${profile.subscription_status}`);
        console.log(`   Creado: ${new Date(profile.created_at).toLocaleString('es-CL')}`);
        console.log('');

        // Calcular días transcurridos
        const createdDate = new Date(profile.created_at);
        const now = new Date();
        const diffTime = now - createdDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        console.log('⏰ Tiempo transcurrido:');
        console.log(`   ${diffDays} días y ${diffHours} horas`);
        console.log('');

        // Verificar si está en trial
        if (profile.subscription_status === 'trial') {
            const daysRemaining = TRIAL_DAYS - diffDays;
            const hoursRemaining = 24 - diffHours;

            if (daysRemaining > 0) {
                console.log(`✅ Trial activo`);
                console.log(`   Días restantes: ${daysRemaining} días`);
                console.log(`   El trial expira en: ${daysRemaining} días`);
            } else if (daysRemaining === 0 && hoursRemaining > 0) {
                console.log(`⚠️  Trial por expirar`);
                console.log(`   Horas restantes: ${hoursRemaining} horas`);
            } else {
                console.log(`❌ Trial vencido`);
                console.log(`   Debería haber sido marcado como 'expired'`);
                console.log(`   Días vencidos: ${Math.abs(daysRemaining)}`);
            }

            // Calcular fecha de expiración
            const expirationDate = new Date(createdDate);
            expirationDate.setDate(expirationDate.getDate() + TRIAL_DAYS);
            console.log(`   Fecha de expiración: ${expirationDate.toLocaleString('es-CL')}`);
        } else {
            console.log(`ℹ️  Estado actual: ${profile.subscription_status}`);
            if (profile.subscription_status === 'expired') {
                console.log('   El trial ya expiró');
            } else if (profile.subscription_status === 'active') {
                console.log('   Tiene suscripción activa');
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkTrialStatus();

