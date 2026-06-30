const express = require('express');
const router = express.Router();
const db = require('./config/database');

// Importa rotas
const veterinarioRoutes = require('./routes/veterinario.routes');
const animaisRoutes = require('./routes/animais.routes');
const consultaRoutes = require('./routes/consulta.routes');
const pagamentosRoutes = require('./routes/pagamentos.routes');
const relatoriosRoutes = require('./routes/relatorios.routes');

// Rota raiz
router.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API do PetVida!' });
});

// GET /api/agenda/:data — usa vw_consultas_completas filtrada por data
router.get('/api/agenda/:data', async (req, res) => {
  try {
    const { data } = req.params;
    const [rows] = await db.query(
      'SELECT * FROM vw_consultas_completas WHERE DATE(data_hora) = ?',
      [data]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar agenda:', error.message);
    res.status(500).json({ erro: 'Erro ao buscar agenda', detalhes: error.message });
  }
});

// Monta os endpoints sob /api
router.use('/api/veterinarios', veterinarioRoutes);
router.use('/api/animais', animaisRoutes);
router.use('/api/consultas', consultaRoutes);
router.use('/api/pagamentos', pagamentosRoutes);
router.use('/api/relatorios', relatoriosRoutes);

module.exports = router;