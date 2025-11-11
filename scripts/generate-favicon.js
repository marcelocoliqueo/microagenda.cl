const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const publicDir = path.join(__dirname, '..', 'public');
const logoPath = path.join(publicDir, 'logo.png');
const faviconPath = path.join(publicDir, 'favicon.ico');

// Verificar que el logo existe
if (!fs.existsSync(logoPath)) {
  console.error('❌ logo.png no encontrado en public/');
  process.exit(1);
}

console.log('🎨 Generando favicon.ico...');

// Crear tamaños temporales
const sizes = [16, 32, 48];
const tempFiles = [];

try {
  // Generar diferentes tamaños usando sips (macOS)
  sizes.forEach(size => {
    const tempPath = path.join(publicDir, `favicon-${size}.png`);
    execSync(`sips -z ${size} ${size} "${logoPath}" --out "${tempPath}"`, { stdio: 'inherit' });
    tempFiles.push(tempPath);
  });

  // Para crear un .ico real, necesitaríamos una librería como sharp o icon-gen
  // Por ahora, vamos a copiar el logo de 32x32 como favicon.ico
  // (muchos navegadores aceptan PNG con extensión .ico)
  const favicon32 = path.join(publicDir, 'favicon-32.png');
  execSync(`sips -z 32 32 "${logoPath}" --out "${favicon32}"`, { stdio: 'inherit' });
  
  // Copiar como favicon.ico (funciona en la mayoría de navegadores)
  fs.copyFileSync(favicon32, faviconPath);
  
  // Limpiar archivos temporales
  tempFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
  if (fs.existsSync(favicon32)) {
    fs.unlinkSync(favicon32);
  }

  console.log('✅ favicon.ico generado exitosamente en public/favicon.ico');
  console.log('📝 Nota: Para un favicon.ico multi-resolución completo, considera usar:');
  console.log('   - https://realfavicongenerator.net/');
  console.log('   - O instalar sharp: npm install --save-dev sharp');
  
} catch (error) {
  console.error('❌ Error generando favicon:', error.message);
  process.exit(1);
}

