const express = require('express');
const router = express.Router();
const db = require('../config/database');

// POST /api/consultas — chama CALL sp_agendar_consulta
router.post('/', async (req, res) => {
  try {
    const { animal_id, veterinario_id, data_hora, valor } = req.body;

    if (!animal_id || !veterinario_id || !data_hora || !valor) {
      return res.status(400).json({
        erro: 'Campos obrigatórios: animal_id, veterinario_id, data_hora, valor'
      });
    }

    const [rows] = await db.query(
      'CALL sp_agendar_consulta(?, ?, ?, ?)',
      [animal_id, veterinario_id, data_hora, valor]
    );

    // Procedures retornam array de resultsets; o SELECT está no primeiro
    res.status(201).json(rows[0][0]);
  } catch (error) {
    console.error('Erro ao agendar consulta:', error.message);

    // Erros SIGNAL (SQLSTATE 45000) vêm como ER_SIGNAL_EXCEPTION
    if (error.sqlState === '45000') {
      return res.status(422).json({ erro: error.message });
    }
    res.status(500).json({ erro: 'Erro ao agendar consulta', detalhes: error.message });
  }
});

// PUT /api/consultas/:id/concluir — chama CALL sp_concluir_consulta
router.put('/:id/concluir', async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnostico } = req.body;

    if (!diagnostico) {
      return res.status(400).json({ erro: 'Campo obrigatório: diagnostico' });
    }

    const [rows] = await db.query(
      'CALL sp_concluir_consulta(?, ?)',
      [id, diagnostico]
    );

    res.json(rows[0][0]);
  } catch (error) {
    console.error('Erro ao concluir consulta:', error.message);

    if (error.sqlState === '45000') {
      return res.status(422).json({ erro: error.message });
    }
    res.status(500).json({ erro: 'Erro ao concluir consulta', detalhes: error.message });
  }
});

module.exports = router;
