/**
 * Script para aplicar la migración de campos de firma
 * Ejecutar con: npx ts-node scripts/migrate-signatures.ts
 */

import { PrismaClient } from '@prisma/client';
import { readFile } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Iniciando migración de campos de firma...');
  
  try {
    // Leer el archivo de migración SQL
    const sqlPath = join(process.cwd(), 'prisma', 'migrations', 'update_signature_fields.sql');
    const sqlContent = await readFile(sqlPath, 'utf-8');
    
    // Dividir por statements SQL (separados por punto y coma)
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Ejecutando ${statements.length} statements SQL...`);
    
    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n${i + 1}. Ejecutando:`);
      console.log(statement.substring(0, 100) + '...');
      
      try {
        await prisma.$executeRawUnsafe(statement);
        console.log('✅ Ejecutado exitosamente');
      } catch (error) {
        console.error('❌ Error ejecutando statement:', error);
        throw error;
      }
    }
    
    console.log('\n✅ Migración completada exitosamente');
    console.log('\n📌 Recuerda:');
    console.log('1. En producción, las firmas se guardarán como data URLs en la BD');
    console.log('2. En desarrollo, seguirán guardándose como archivos (opcional)');
    console.log('3. El sistema soporta ambos formatos automáticamente');
    
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

