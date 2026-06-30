const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/relatorios/dashboard — query do dashboard financeiro
router.get('/dashboard', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        COUNT(c.id) AS total_consultas,
        ROUND(SUM(c.valor), 2) AS bruto,
        ROUND(SUM(CASE WHEN p.status = 'pago' THEN p.valor_pago ELSE 0 END), 2) AS recebido,
        ROUND(SUM(CASE WHEN p.status <> 'pago' THEN c.valor ELSE 0 END), 2) AS pendente,
        ROUND(
          CASE WHEN SUM(c.valor) > 0
            THEN (SUM(CASE WHEN p.status <> 'pago' THEN c.valor ELSE 0 END) / SUM(c.valor)) * 100
            ELSE 0
          END, 2
        ) AS percentual_inadimplencia
      FROM consultas c
      LEFT JOIN pagamentos p ON p.consulta_id = c.id
    `);

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error.message);
    res.status(500).json({ erro: 'Erro ao buscar dashboard', detalhes: error.message });
  }
});

// GET /api/relatorios/inadimplentes — usa vw_inadimplentes
router.get('/inadimplentes', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vw_inadimplentes');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar inadimplentes:', error.message);
    res.status(500).json({ erro: 'Erro ao buscar inadimplentes', detalhes: error.message });
  }
});

module.exports = router;
