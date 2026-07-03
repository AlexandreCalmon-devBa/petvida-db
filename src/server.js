const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const appRoutes = require('./app');
const db = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/', appRoutes);

// No Vercel, o ambiente é gerenciado via Serverless Functions, então não damos listen() na porta.
// Apenas exportamos o app para o Vercel.
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  // Inicia o servidor e testa conexão com o banco localmente
  app.listen(PORT, async () => {
    console.log('\n===========================================');
    console.log('   🐾 PetVida API - Servidor Iniciado');
    console.log('===========================================\n');
    console.log(`🌐 URL base: http://localhost:${PORT}`);
    console.log(`📘 Documentação Swagger: http://localhost:${PORT}/api-docs`);
    console.log('\n📋 Endpoints disponíveis:\n');
    console.log('   GET    /api/veterinarios');
    console.log('   GET    /api/animais');
    console.log('   GET    /api/agenda/:data');
    console.log('   POST   /api/consultas');
    console.log('   PUT    /api/consultas/:id/concluir');
    console.log('   POST   /api/pagamentos/:consulta_id');
    console.log('   GET    /api/relatorios/dashboard');
    console.log('   GET    /api/relatorios/inadimplentes');
    console.log('\n-------------------------------------------');

    // Testa conexão com o MySQL
    try {
      const [rows] = await db.query('SELECT 1');
      console.log('✅ Conexão com MySQL: OK');
    } catch (error) {
      console.log('❌ Conexão com MySQL: FALHOU');
      console.log(`   Erro: ${error.message}`);
      console.log('   Verifique as variáveis no .env');
    }

    console.log('===========================================\n');
  });
}

module.exports = app;
