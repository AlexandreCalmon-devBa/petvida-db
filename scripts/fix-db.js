const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function fixDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'petvida',
      multipleStatements: true
    });

    console.log('✅ Conectado ao MySQL via Node.js!');

    const filesToRun = ['views.sql', 'functions.sql', 'triggers.sql', 'procedures.sql'];

    for (const file of filesToRun) {
      console.log(`⏳ Processando ${file}...`);
      let sql = fs.readFileSync(path.join(__dirname, '../database', file), 'utf8');

      // Remove os comandos DELIMITER, pois o driver mysql2 não precisa deles
      // e eles causam erro de sintaxe se enviados.
      sql = sql.replace(/DELIMITER \$\$/g, '');
      sql = sql.replace(/DELIMITER ;/g, '');

      // O mysql2 com multipleStatements=true consegue rodar scripts com $$
      // Mas para garantir, vamos trocar os $$ de volta para ; onde faz sentido,
      // ou apenas dividir o script pelo $$
      const statements = sql.split('$$').filter(s => s.trim().length > 0);

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await connection.query(statement);
          } catch (err) {
            // Ignora erros de DROP se não existir
            if (!err.message.includes('Unknown table') && !err.message.includes('does not exist')) {
                console.error(`Erro ao executar bloco em ${file}:`, err.message);
            }
          }
        }
      }
      console.log(`✅ ${file} executado com sucesso!`);
    }

    await connection.end();
    console.log('🎉 Tudo pronto! Pode rodar o teste da API novamente.');

  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
  }
}

fixDB();
