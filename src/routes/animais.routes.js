const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/animais — usa vw_animais_detalhados
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vw_animais_detalhados');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar animais:', error.message);
    res.status(500).json({ erro: 'Erro ao buscar animais', detalhes: error.message });
  }
});

module.exports = router;
