const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/veterinarios — lista todos os veterinários
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM veterinarios');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar veterinários:', error.message);
    res.status(500).json({ erro: 'Erro ao buscar veterinários', detalhes: error.message });
  }
});

module.exports = router;
