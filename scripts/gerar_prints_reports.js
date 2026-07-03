/**
 * scripts/gerar_prints_reports.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Executa os 6 relatórios da Tarefa 7 contra o MySQL e gera prints estilo
 * MySQL Workbench / DBeaver, salvando em: docs/prints/
 *
 * Pré-requisito: MySQL rodando com o banco petvida populado e .env configurado.
 * Uso:           node scripts/gerar_prints_reports.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

require('dotenv').config();

const puppeteer = require('puppeteer');
const fs        = require('fs');
const path      = require('path');

// ─── Diretório de saída ───────────────────────────────────────────────────────

const PRINTS_DIR = path.join(__dirname, '..', 'docs', 'prints');
if (!fs.existsSync(PRINTS_DIR)) fs.mkdirSync(PRINTS_DIR, { recursive: true });

// ─── Definição dos 6 relatórios ──────────────────────────────────────────────

const REPORTS = [
  {
    index:    1,
    title:    'Ranking — Tutores que Mais Gastam',
    criteria: '3 pts — Ranking + Faturamento',
    icon:     '🏆',
    sql: `
      SELECT
        ROW_NUMBER() OVER (ORDER BY total_gasto DESC, qtd_consultas DESC, t.nome) AS posicao,
        t.nome AS tutor,
        ROUND(COALESCE(total_gasto, 0), 2) AS total_gasto,
        COALESCE(qtd_consultas, 0) AS qtd_consultas
      FROM (
        SELECT
          tut.id,
          SUM(c.valor) AS total_gasto,
          COUNT(c.id)  AS qtd_consultas
        FROM tutores tut
        LEFT JOIN animais   a ON a.tutor_id   = tut.id
        LEFT JOIN consultas c ON c.animal_id  = a.id
        GROUP BY tut.id
      ) gasto
      JOIN tutores t ON t.id = gasto.id
      ORDER BY total_gasto DESC, qtd_consultas DESC, t.nome
    `,
    filename: 'r01_ranking_tutores.png',
  },
  {
    index:    2,
    title:    'Faturamento Mensal por Ano/Mês',
    criteria: '3 pts — Ranking + Faturamento',
    icon:     '📅',
    sql: `
      SELECT
        YEAR(c.data_hora)  AS ano,
        MONTH(c.data_hora) AS mes,
        COUNT(c.id)        AS total_consultas,
        ROUND(SUM(c.valor), 2) AS bruto,
        ROUND(SUM(CASE WHEN p.status = 'pago' THEN p.valor_pago ELSE 0 END), 2) AS recebido,
        ROUND(SUM(CASE WHEN p.status <> 'pago' THEN c.valor ELSE 0 END), 2) AS pendente
      FROM consultas c
      LEFT JOIN pagamentos p ON p.consulta_id = c.id
      GROUP BY YEAR(c.data_hora), MONTH(c.data_hora)
      ORDER BY ano, mes
    `,
    filename: 'r02_faturamento_mensal.png',
  },
  {
    index:    3,
    title:    'Animais sem Consulta há 6+ Meses',
    criteria: '3 pts — Animais + Dashboard',
    icon:     '🐾',
    sql: `
      SELECT
        a.id,
        a.nome                               AS animal,
        esp.nome                             AS especie,
        tut.nome                             AS tutor,
        MAX(c.data_hora)                     AS ultima_consulta,
        DATEDIFF(CURDATE(), MAX(c.data_hora)) AS dias_sem_consulta
      FROM animais a
      LEFT JOIN consultas c   ON c.animal_id  = a.id
      LEFT JOIN especies  esp ON esp.id        = a.especie_id
      LEFT JOIN tutores   tut ON tut.id        = a.tutor_id
      GROUP BY a.id, a.nome, esp.nome, tut.nome
      HAVING MAX(c.data_hora) IS NULL
          OR DATEDIFF(CURDATE(), MAX(c.data_hora)) >= 180
      ORDER BY dias_sem_consulta DESC, a.nome
    `,
    filename: 'r03_animais_sem_consulta.png',
  },
  {
    index:    4,
    title:    'Dashboard Financeiro (1 Query)',
    criteria: '3 pts — Animais + Dashboard',
    icon:     '📊',
    sql: `
      SELECT
        COUNT(c.id)                                                  AS total_consultas,
        ROUND(SUM(c.valor), 2)                                       AS bruto,
        ROUND(SUM(CASE WHEN p.status = 'pago'
                       THEN p.valor_pago ELSE 0 END), 2)            AS recebido,
        ROUND(SUM(CASE WHEN p.status <> 'pago'
                       THEN c.valor ELSE 0 END), 2)                 AS pendente,
        ROUND(
          CASE WHEN SUM(c.valor) > 0
               THEN (SUM(CASE WHEN p.status <> 'pago'
                              THEN c.valor ELSE 0 END) / SUM(c.valor)) * 100
               ELSE 0 END, 2)                                        AS percentual_inadimplencia
      FROM consultas c
      LEFT JOIN pagamentos p ON p.consulta_id = c.id
    `,
    filename: 'r04_dashboard_financeiro.png',
  },
  {
    index:    5,
    title:    'Veterinário do Mês (Maior Faturamento)',
    criteria: '2 pts — Vet do Mês + Espécies',
    icon:     '🥇',
    sql: `
      SELECT
        v.nome                   AS veterinario,
        ROUND(SUM(c.valor), 2)   AS faturamento_mes,
        COUNT(c.id)              AS total_consultas_mes
      FROM consultas    c
      JOIN veterinarios v ON v.id = c.veterinario_id
      WHERE YEAR(c.data_hora)  = YEAR(CURDATE())
        AND MONTH(c.data_hora) = MONTH(CURDATE())
      GROUP BY v.id, v.nome
      ORDER BY faturamento_mes DESC
      LIMIT 1
    `,
    filename: 'r05_vet_do_mes.png',
  },
  {
    index:    6,
    title:    'Distribuição de Animais por Espécie',
    criteria: '2 pts — Vet do Mês + Espécies',
    icon:     '🐕',
    sql: `
      SELECT
        esp.nome          AS especie,
        COUNT(a.id)       AS qtd_animais,
        ROUND((COUNT(a.id) * 100.0 / total.total), 2) AS percentual_do_total
      FROM animais a
      JOIN especies esp ON esp.id = a.especie_id
      CROSS JOIN (SELECT COUNT(*) AS total FROM animais) total
      GROUP BY esp.id, esp.nome, total.total
      ORDER BY qtd_animais DESC, esp.nome
    `,
    filename: 'r06_distribuicao_especies.png',
  },
];

// ─── Gera HTML estilo MySQL Workbench ─────────────────────────────────────────

function buildHTML({ index, title, criteria, icon, sqlQuery, columns, rows, duration, rowCount }) {
  const now = new Date().toLocaleString('pt-BR');

  // Monta o cabeçalho da tabela
  const thCells = columns
    .map(col => `<th>${escapeHtml(col)}</th>`)
    .join('');

  // Monta as linhas da tabela
  const trRows = rows.length > 0
    ? rows.map((row, i) => {
        const tds = columns.map(col => {
          const val = row[col];
          const cls = val === null ? 'null'
                    : typeof val === 'number' ? 'num'
                    : '';
          const display = val === null ? 'NULL' : String(val);
          return `<td class="${cls}">${escapeHtml(display)}</td>`;
        }).join('');
        return `<tr class="${i % 2 === 0 ? 'even' : 'odd'}">${tds}</tr>`;
      }).join('\n')
    : `<tr><td colspan="${columns.length}" class="empty">Nenhum resultado encontrado</td></tr>`;

  // SQL formatado para exibição
  const sqlFormatted = sqlQuery.trim().replace(/\s+/g, ' ').replace(/ (FROM|JOIN|LEFT|WHERE|GROUP|ORDER|HAVING|LIMIT|SELECT|AND|OR|CROSS|CASE|WHEN|THEN|ELSE|END|ROUND|COALESCE|COUNT|SUM|YEAR|MONTH|MAX|DATEDIFF|CURDATE)\b/g, '\n  $1');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: #0d1117;
      color: #c9d1d9;
      padding: 24px 28px;
    }

    /* ── Topo ── */
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #586069;
    }
    .brand strong { color: #a78bfa; }
    .counter {
      font-size: 11px;
      font-weight: 700;
      background: #1a1040;
      color: #a78bfa;
      border: 1px solid #4c1d95;
      padding: 3px 10px;
      border-radius: 20px;
    }

    /* ── Cabeçalho do relatório ── */
    .report-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      background: #161b22;
      border: 1px solid #21262d;
      border-radius: 10px 10px 0 0;
      padding: 14px 18px;
      border-bottom: none;
    }
    .report-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .icon { font-size: 22px; }
    .title-text h2 {
      font-size: 15px;
      font-weight: 700;
      color: #e6edf3;
      margin-bottom: 3px;
    }
    .criteria-badge {
      font-size: 11px;
      font-weight: 600;
      background: #0d2d0d;
      color: #4ade80;
      border: 1px solid #166534;
      padding: 2px 8px;
      border-radius: 12px;
    }
    .exec-meta {
      text-align: right;
      font-size: 11px;
      color: #586069;
      line-height: 1.8;
    }
    .exec-meta .rows-badge {
      font-weight: 700;
      color: #58a6ff;
    }
    .exec-meta .time-badge {
      font-weight: 700;
      color: #f0883e;
    }

    /* ── SQL ── */
    .sql-panel {
      background: #0d1117;
      border: 1px solid #21262d;
      border-bottom: none;
      padding: 12px 18px;
    }
    .sql-label {
      font-size: 10px;
      font-weight: 700;
      color: #586069;
      text-transform: uppercase;
      letter-spacing: .08em;
      margin-bottom: 6px;
    }
    pre.sql {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      line-height: 1.65;
      color: #c9d1d9;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .kw  { color: #ff7b72; }   /* keywords */
    .fn  { color: #d2a8ff; }   /* functions */
    .str { color: #a5d6ff; }   /* strings */
    .num { color: #79c0ff; }   /* numbers */
    .cm  { color: #8b949e; font-style: italic; } /* comments */

    /* ── Tabela de resultados ── */
    .table-wrapper {
      border: 1px solid #21262d;
      border-radius: 0 0 10px 10px;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
    }
    thead { background: #1c2128; }
    thead th {
      padding: 9px 14px;
      text-align: left;
      font-weight: 700;
      font-size: 11px;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: .05em;
      border-right: 1px solid #21262d;
      white-space: nowrap;
    }
    thead th:last-child { border-right: none; }
    tbody tr.even { background: #0d1117; }
    tbody tr.odd  { background: #111519; }
    tbody tr:hover { background: #1c2128; }
    tbody td {
      padding: 8px 14px;
      border-right: 1px solid #21262d;
      border-top: 1px solid #21262d;
      color: #c9d1d9;
      max-width: 280px;
      word-break: break-word;
    }
    tbody td:last-child { border-right: none; }
    tbody td.num  { color: #79c0ff; font-family: 'JetBrains Mono', monospace; text-align: right; }
    tbody td.null { color: #586069; font-style: italic; }
    tbody td.empty { text-align: center; color: #586069; font-style: italic; padding: 20px; }

    /* ── Rodapé ── */
    .footer {
      font-size: 10px;
      color: #2d333b;
      text-align: center;
      margin-top: 12px;
    }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="brand">
      🐾 <strong>PetVida</strong> &nbsp;•&nbsp; Tarefa 7 — Relatórios SQL &nbsp;•&nbsp; ${now}
    </div>
    <span class="counter">Relatório ${index} / 6</span>
  </div>

  <div class="report-header">
    <div class="report-title">
      <span class="icon">${icon}</span>
      <div class="title-text">
        <h2>${escapeHtml(title)}</h2>
        <span class="criteria-badge">${escapeHtml(criteria)}</span>
      </div>
    </div>
    <div class="exec-meta">
      <div><span class="rows-badge">${rowCount} linha${rowCount !== 1 ? 's' : ''}</span> retornada${rowCount !== 1 ? 's' : ''}</div>
      <div>Tempo: <span class="time-badge">${duration} ms</span></div>
      <div>${now}</div>
    </div>
  </div>

  <div class="sql-panel">
    <div class="sql-label">📝 SQL Executado</div>
    <pre class="sql">${highlightSQL(sqlFormatted)}</pre>
  </div>

  <div class="table-wrapper">
    <table>
      <thead><tr>${thCells}</tr></thead>
      <tbody>${trRows}</tbody>
    </table>
  </div>

  <div class="footer">PetVida — Projeto Acadêmico de Banco de Dados · ${now}</div>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlightSQL(sql) {
  const keywords = /\b(SELECT|FROM|JOIN|LEFT|RIGHT|INNER|CROSS|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|AND|OR|NOT|AS|ON|BY|CASE|WHEN|THEN|ELSE|END|DISTINCT|INTO|INSERT|UPDATE|DELETE|SET|USE|NULL|IS|IN|BETWEEN|LIKE|ASC|DESC)\b/gi;
  const functions = /\b(COUNT|SUM|AVG|MAX|MIN|ROUND|COALESCE|YEAR|MONTH|DAY|DATEDIFF|CURDATE|NOW|ROW_NUMBER|OVER|IF|IFNULL)\b/gi;
  const strings = /'([^']*)'/g;
  const numbers = /\b(\d+(?:\.\d+)?)\b/g;

  return escapeHtml(sql)
    .replace(/&lt;|&gt;|&amp;|&quot;/g, m => m) // mantém entities já escapados
    .replace(/\b(SELECT|FROM|JOIN|LEFT|RIGHT|INNER|CROSS|WHERE|GROUP|ORDER|HAVING|LIMIT|AND|OR|NOT|AS|ON|BY|CASE|WHEN|THEN|ELSE|END|DISTINCT|INTO|INSERT|UPDATE|DELETE|SET|USE|NULL|IS|IN|BETWEEN|LIKE|ASC|DESC)\b/gi,
      m => `<span class="kw">${m.toUpperCase()}</span>`)
    .replace(/\b(COUNT|SUM|AVG|MAX|MIN|ROUND|COALESCE|YEAR|MONTH|DAY|DATEDIFF|CURDATE|NOW|ROW_NUMBER|OVER|IF|IFNULL)\b/gi,
      m => `<span class="fn">${m}</span>`)
    .replace(/'([^']*)'/g, (m) => `<span class="str">${m}</span>`)
    .replace(/\b(\d+(?:\.\d+)?)\b/g, m => `<span class="num">${m}</span>`);
}

// ─── Tira screenshot ──────────────────────────────────────────────────────────

async function screenshot(browser, html, filename) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 800 });
  await page.setContent(html, { waitUntil: 'networkidle2' });
  const height = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: 1100, height: Math.max(600, height + 40) });
  const outPath = path.join(PRINTS_DIR, filename);
  await page.screenshot({ path: outPath, fullPage: true });
  await page.close();
  return outPath;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n' + '═'.repeat(56));
  console.log('   🐾  PetVida Tarefa 7 — Gerador de Prints SQL');
  console.log('═'.repeat(56));

  // Conecta ao MySQL
  const db = require('../src/config/database');
  try {
    await db.query('SELECT 1');
    console.log('\n✅ MySQL conectado com sucesso!\n');
  } catch (e) {
    console.error('\n❌ Falha na conexão com MySQL:', e.message);
    console.error('   Verifique se o MySQL está rodando e o .env está correto.\n');
    process.exit(1);
  }

  console.log('Iniciando Puppeteer...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = [];

  for (const report of REPORTS) {
    process.stdout.write(`  [${report.index}/6] ${report.icon}  ${report.title.padEnd(45)} `);
    const start = Date.now();

    try {
      const [rows] = await db.query(report.sql);
      const duration = Date.now() - start;

      // Extrai colunas do primeiro resultado
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
      const rowCount = rows.length;

      console.log(`→ ${rowCount} linha${rowCount !== 1 ? 's' : ''} (${duration}ms)`);

      const html = buildHTML({
        index:     report.index,
        title:     report.title,
        criteria:  report.criteria,
        icon:      report.icon,
        sqlQuery:  report.sql,
        columns,
        rows,
        duration,
        rowCount,
      });

      await screenshot(browser, html, report.filename);
      console.log(`          ✅ Salvo: docs/prints/${report.filename}`);
      results.push({ index: report.index, rows: rowCount, file: report.filename, ok: true });

    } catch (err) {
      const duration = Date.now() - start;
      console.log(`→ ERRO (${duration}ms)`);
      console.log(`          ❌ ${err.message}`);
      results.push({ index: report.index, rows: 0, file: report.filename, ok: false, error: err.message });
    }
  }

  await browser.close();
  await db.end();

  // ── Resumo ────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(56));
  console.log('   📸  Resumo — Relatórios Tarefa 7');
  console.log('═'.repeat(56));

  results.forEach(r => {
    const icon = r.ok ? '✅' : '❌';
    const info = r.ok ? `${String(r.rows).padStart(2)} linha${r.rows !== 1 ? 's' : ''}` : 'ERRO';
    console.log(`  ${icon}  [${r.index}/6]  ${info.padEnd(12)}  docs/prints/${r.file}`);
    if (!r.ok) console.log(`           └─ ${r.error}`);
  });

  const ok    = results.filter(r => r.ok).length;
  const total = results.length;
  const pts   = ok === 6 ? '10/10 pts potenciais 🎉' : `${ok}/${total} relatórios ok`;

  console.log('\n' + '─'.repeat(56));
  console.log(`  Total: ${ok}/${total} — ${pts}`);
  console.log('  Pasta: docs/prints/');
  console.log('═'.repeat(56) + '\n');

  process.exit(ok === total ? 0 : 1);
}

main().catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
