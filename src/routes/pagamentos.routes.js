const express = require('express');
const router = express.Router();
const db = require('../config/database');

// POST /api/pagamentos/:consulta_id — chama CALL sp_registrar_pagamento
router.post('/:consulta_id', async (req, res) => {
  try {
    const { consulta_id } = req.params;
    const { forma_pagamento } = req.body;

    if (!forma_pagamento) {
      return res.status(400).json({ erro: 'Campo obrigatório: forma_pagamento' });
    }

    const [rows] = await db.query(
      'CALL sp_registrar_pagamento(?, ?)',
      [consulta_id, forma_pagamento]
    );

    res.json(rows[0][0]);
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error.message);

    if (error.sqlState === '45000') {
      return res.status(422).json({ erro: error.message });
    }
    res.status(500).json({ erro: 'Erro ao registrar pagamento', detalhes: error.message });
  }
});

module.exports = router;
