
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Rotas da aplicação
router.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API do PetVida!' });
});


module.exports = router;