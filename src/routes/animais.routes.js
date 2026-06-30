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

// GET /api/animais/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM animais WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Animal não encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar animal', detalhes: error.message });
  }
});

// POST /api/animais
router.post('/', async (req, res) => {
  try {
    const { nome, especie_id, raca, data_nascimento, tutor_id } = req.body;
    const [result] = await db.query(
      'INSERT INTO animais (nome, especie_id, raca, data_nascimento, tutor_id) VALUES (?, ?, ?, ?, ?)',
      [nome, especie_id, raca, data_nascimento, tutor_id]
    );
    res.status(201).json({ id: result.insertId, nome, especie_id, tutor_id });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar animal', detalhes: error.message });
  }
});

// PUT /api/animais/:id
router.put('/:id', async (req, res) => {
  try {
    const { nome, especie_id, raca, data_nascimento, tutor_id } = req.body;
    const [result] = await db.query(
      'UPDATE animais SET nome=?, especie_id=?, raca=?, data_nascimento=?, tutor_id=? WHERE id=?',
      [nome, especie_id, raca, data_nascimento, tutor_id, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Animal não encontrado' });
    res.json({ mensagem: 'Animal atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar animal', detalhes: error.message });
  }
});

// DELETE /api/animais/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM animais WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Animal não encontrado' });
    res.json({ mensagem: 'Animal deletado com sucesso' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(422).json({ erro: 'Não é possível deletar: animal possui consultas amarradas a ele.' });
    }
    res.status(500).json({ erro: 'Erro ao deletar animal', detalhes: error.message });
  }
});

module.exports = router;
