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

// GET /api/veterinarios/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM veterinarios WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Veterinário não encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar veterinário', detalhes: error.message });
  }
});

// POST /api/veterinarios
router.post('/', async (req, res) => {
  try {
    const { nome, crmv, especialidade, telefone } = req.body;
    const [result] = await db.query(
      'INSERT INTO veterinarios (nome, crmv, especialidade, telefone) VALUES (?, ?, ?, ?)',
      [nome, crmv, especialidade, telefone]
    );
    res.status(201).json({ id: result.insertId, nome, crmv, especialidade, telefone });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar veterinário', detalhes: error.message });
  }
});

// PUT /api/veterinarios/:id
router.put('/:id', async (req, res) => {
  try {
    const { nome, crmv, especialidade, telefone } = req.body;
    const [result] = await db.query(
      'UPDATE veterinarios SET nome=?, crmv=?, especialidade=?, telefone=? WHERE id=?',
      [nome, crmv, especialidade, telefone, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Veterinário não encontrado' });
    res.json({ mensagem: 'Veterinário atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar veterinário', detalhes: error.message });
  }
});

// DELETE /api/veterinarios/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM veterinarios WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Veterinário não encontrado' });
    res.json({ mensagem: 'Veterinário deletado com sucesso' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(422).json({ erro: 'Não é possível deletar: veterinário possui consultas amarradas a ele.' });
    }
    res.status(500).json({ erro: 'Erro ao deletar veterinário', detalhes: error.message });
  }
});

module.exports = router;
