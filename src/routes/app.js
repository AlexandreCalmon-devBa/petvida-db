
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Rotas da aplicação
router.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API do PetVida!' });
});

router.get('/health', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok');
    res.json({ status: 'ok', db: rows[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;