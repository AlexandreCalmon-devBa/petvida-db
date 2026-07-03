/**
 * scripts/gerar_prints_functions.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Gera prints da Tarefa 4: cada function usada dentro de SELECTs reais.
 *
 *  1. functions.sql — código das 5 functions
 *  2. fn_idade_animal    → SELECT nome, fn_idade_animal(data_nascimento) FROM animais
 *  3. fn_total_gasto_tutor → SELECT nome, fn_total_gasto_tutor(id) FROM tutores
 *  4. fn_qtd_consultas_animal → SELECT animais com contagem de consultas
 *  5. fn_status_emoji    → SELECT consultas com status formatado
 *  6. fn_classificar_valor → SELECT consultas com classificação de valor
 *  7. Combina 3 functions em 1 SELECT (showcase final)
 *
 * Uso: node scripts/gerar_prints_functions.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

require('dotenv').config();

const puppeteer = require('puppeteer');
const fs        = require('fs');
const path      = require('path');

const PRINTS_DIR = path.join(__dirname, '..', 'docs', 'prints', 'tarefa4_functions');
if (!fs.existsSync(PRINTS_DIR)) fs.mkdirSync(PRINTS_DIR, { recursive: true });

const FUNCTIONS_SQL = fs.readFileSync(
  path.join(__dirname, '..', 'database', 'functions.sql'), 'utf-8'
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function esc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function highlightSQL(code) {
  return esc(code)
    .replace(/--[^\n]*/g, m => `<span class="cm">${m}</span>`)
    .replace(/\b(CREATE|FUNCTION|RETURNS|DETERMINISTIC|READS|SQL|DATA|BEGIN|END|DECLARE|SET|RETURN|SELECT|FROM|WHERE|INTO|AND|OR|NOT|IF|ELSEIF|ELSE|CASE|WHEN|THEN|INNER|JOIN|ON|COALESCE|SUM|COUNT|TIMESTAMPDIFF|YEAR|MONTH|CURDATE|CONCAT|USE|DELIMITER|DROP|EXISTS|INT|DECIMAL|VARCHAR|DATE|LEFT|RIGHT|LIMIT|ORDER|BY|GROUP|AS)\b/gi,
      m => `<span class="kw">${m.toUpperCase()}</span>`)
    .replace(/'([^']*)'/g, m => `<span class="str">${m}</span>`)
    .replace(/\b(\d+(?:\.\d+)?)\b/g, m => `<span class="num">${m}</span>`);
}

function css() {
  return `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',sans-serif;background:#0d1117;color:#c9d1d9;padding:24px 28px}
  .topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
  .brand{font-size:12px;color:#586069}
  .brand strong{color:#a78bfa}
  .counter{font-size:11px;font-weight:700;background:#1a1040;color:#a78bfa;border:1px solid #4c1d95;padding:3px 10px;border-radius:20px}
  .panel{background:#161b22;border:1px solid #21262d;border-radius:10px;overflow:hidden;margin-bottom:14px}
  .ph{display:flex;align-items:center;justify-content:space-between;background:#1c2128;border-bottom:1px solid #21262d;padding:10px 16px}
  .ph h2{font-size:13px;color:#e6edf3;display:flex;align-items:center;gap:8px}
  .badge{font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px}
  .bg{background:#0d2d0d;color:#4ade80;border:1px solid #166534}
  .bb{background:#0c1a2e;color:#58a6ff;border:1px solid #1d4ed8}
  .by{background:#2d1f00;color:#fbbf24;border:1px solid #b45309}
  .bp{background:#1a0d2e;color:#c084fc;border:1px solid #7c3aed}
  .br{background:#2d0d0d;color:#f87171;border:1px solid #991b1b}
  pre.code{font-family:'JetBrains Mono',monospace;font-size:11.5px;line-height:1.7;padding:16px 18px;white-space:pre-wrap;word-break:break-word}
  .kw{color:#ff7b72;font-weight:700}.str{color:#a5d6ff}.num{color:#79c0ff}.cm{color:#8b949e;font-style:italic}
  .sql-exec{font-family:'JetBrains Mono',monospace;font-size:11px;color:#8b949e;padding:10px 18px;border-bottom:1px solid #21262d;background:#0d1117;white-space:pre-wrap}
  .sql-exec strong{color:#c084fc}
  table{width:100%;border-collapse:collapse;font-size:12.5px}
  thead{background:#1c2128}
  thead th{padding:9px 12px;text-align:left;font-weight:700;font-size:10px;color:#8b949e;text-transform:uppercase;letter-spacing:.05em;border-right:1px solid #21262d;white-space:nowrap}
  thead th:last-child{border-right:none}
  tbody tr:nth-child(even){background:#0d1117}
  tbody tr:nth-child(odd){background:#111519}
  tbody td{padding:8px 12px;border-right:1px solid #21262d;border-top:1px solid #21262d;word-break:break-word}
  tbody td:last-child{border-right:none}
  td.num{color:#79c0ff;font-family:'JetBrains Mono',monospace;text-align:right;font-size:12px}
  td.fn{color:#c084fc;font-family:'JetBrains Mono',monospace;font-size:12px}
  td.emoji{font-size:13px}
  td.cls{color:#fbbf24;font-weight:600}
  td.green{color:#4ade80;font-weight:700}
  .info-bar{display:flex;gap:20px;padding:10px 16px;background:#111519;border-bottom:1px solid #21262d}
  .info-item{font-size:11px;color:#586069}
  .info-item strong{color:#58a6ff}
  .fn-sig{font-family:'JetBrains Mono',monospace;font-size:12px;color:#c084fc;background:#1a0d2e;border:1px solid #4c1d95;padding:6px 12px;border-radius:6px;margin-bottom:0}
  .footer{font-size:10px;color:#2d333b;text-align:center;margin-top:12px}
  `;
}

function topbar(idx, total, now) {
  return `<div class="topbar">
    <div class="brand">🐾 <strong>PetVida</strong> &nbsp;•&nbsp; Tarefa 4 — Functions &nbsp;•&nbsp; ${now}</div>
    <span class="counter">Print ${idx} / ${total}</span>
  </div>`;
}

function tableHTML(rows, colClasses = {}) {
  if (!rows?.length) return '<tr><td colspan="10" style="text-align:center;color:#586069;padding:20px;font-style:italic">Nenhum resultado</td></tr>';
  const cols  = Object.keys(rows[0]);
  const thead = `<thead><tr>${cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${rows.map(row=>`<tr>${cols.map(col=>{
    const val = row[col];
    const cls = colClasses[col] ?? (typeof val === 'number' ? 'num' : '');
    const disp = val === null ? '<span style="color:#586069;font-style:italic">NULL</span>' : esc(String(val));
    return `<td class="${cls}">${disp}</td>`;
  }).join('')}</tr>`).join('')}</tbody>`;
  return thead + tbody;
}

async function shot(browser, html, fn) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 800 });
  await page.setContent(html, { waitUntil: 'networkidle2' });
  const h = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: 1100, height: Math.max(500, h + 40) });
  await page.screenshot({ path: path.join(PRINTS_DIR, fn), fullPage: true });
  await page.close();
}

// ─── Definição dos prints ─────────────────────────────────────────────────────

const TOTAL = 7;

async function main() {
  console.log('\n' + '═'.repeat(58));
  console.log('   🐾  PetVida Tarefa 4 — Functions (demo em SELECTs)');
  console.log('═'.repeat(58));

  const db = require('../src/config/database');
  await db.query('SELECT 1');
  console.log('\n✅ MySQL conectado!\n');

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const now     = new Date().toLocaleString('pt-BR');
  const results = [];

  // helper
  const run = async (sql, params=[]) => { const [r] = await db.query(sql, params); return r; };
  const log = (idx, label, rows) => {
    console.log(`          ✅ Salvo: docs/prints/tarefa4_functions/f0${idx}_fn_${label}.png (${rows} linhas)`);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 1 — functions.sql completo
  // ══════════════════════════════════════════════════════════════════════════
  {
    const idx=1; const fn=`f01_functions_sql.png`;
    process.stdout.write(`  [${idx}/${TOTAL}] 📄  functions.sql — 5 functions              `);
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${css()}</style></head><body>
${topbar(idx,TOTAL,now)}
<div class="panel">
  <div class="ph"><h2>📄 database/functions.sql — 5 Stored Functions</h2><span class="badge bp">10 pts — todas as functions</span></div>
  <pre class="code">${highlightSQL(FUNCTIONS_SQL)}</pre>
</div>
<div class="footer">PetVida — Projeto Acadêmico de Banco de Dados · ${now}</div>
</body></html>`;
    await shot(browser, html, fn);
    console.log(`→ ok`); console.log(`          ✅ Salvo: docs/prints/tarefa4_functions/${fn}`);
    results.push({ idx, ok:true, fn });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2 — fn_idade_animal
  // ══════════════════════════════════════════════════════════════════════════
  {
    const idx=2; const fn=`f02_fn_idade_animal.png`;
    process.stdout.write(`  [${idx}/${TOTAL}] 🎂  fn_idade_animal                          `);
    const sql = `SELECT a.nome AS animal, e.nome AS especie, a.data_nascimento,
  fn_idade_animal(a.data_nascimento) AS idade_formatada
FROM animais a
JOIN especies e ON e.id = a.especie_id
ORDER BY a.data_nascimento
LIMIT 15`;
    const rows = await run(sql);
    console.log(`→ ${rows.length} linhas`);
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${css()}</style></head><body>
${topbar(idx,TOTAL,now)}
<div class="panel">
  <div class="ph">
    <h2>🎂 fn_idade_animal(data_nascimento) → VARCHAR</h2>
    <span class="badge bg">3 pts — fn_idade + fn_total</span>
  </div>
  <div class="info-bar">
    <span class="info-item">Assinatura: <strong>fn_idade_animal(data_nascimento DATE) RETURNS VARCHAR(50)</strong></span>
    <span class="info-item">Usa: <strong>TIMESTAMPDIFF(YEAR) + TIMESTAMPDIFF(MONTH)</strong></span>
    <span class="info-item">Retorno: <strong>"X anos e Y meses"</strong></span>
  </div>
  <div class="sql-exec"><strong>SQL:</strong> ${esc(sql)}</div>
  <table>${tableHTML(rows, { idade_formatada:'fn', data_nascimento:'num' })}</table>
</div>
<div class="footer">PetVida — Projeto Acadêmico de Banco de Dados · ${now}</div>
</body></html>`;
    await shot(browser, html, fn);
    log(idx,'idade_animal', rows.length);
    results.push({ idx, ok:true, fn });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 3 — fn_total_gasto_tutor
  // ══════════════════════════════════════════════════════════════════════════
  {
    const idx=3; const fn=`f03_fn_total_gasto_tutor.png`;
    process.stdout.write(`  [${idx}/${TOTAL}] 💰  fn_total_gasto_tutor                     `);
    const sql = `SELECT t.nome AS tutor, t.email,
  fn_total_gasto_tutor(t.id) AS total_gasto_R$,
  (SELECT COUNT(*) FROM animais a WHERE a.tutor_id = t.id) AS qtd_animais
FROM tutores t
ORDER BY fn_total_gasto_tutor(t.id) DESC
LIMIT 15`;
    const rows = await run(sql);
    console.log(`→ ${rows.length} linhas`);
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${css()}</style></head><body>
${topbar(idx,TOTAL,now)}
<div class="panel">
  <div class="ph">
    <h2>💰 fn_total_gasto_tutor(tutor_id) → DECIMAL(10,2)</h2>
    <span class="badge bg">3 pts — fn_idade + fn_total</span>
  </div>
  <div class="info-bar">
    <span class="info-item">Assinatura: <strong>fn_total_gasto_tutor(tutor_id INT) RETURNS DECIMAL(10,2)</strong></span>
    <span class="info-item">Exclui: <strong>status = 'cancelada'</strong></span>
    <span class="info-item">Usa: <strong>SUM + INNER JOIN + COALESCE</strong></span>
  </div>
  <div class="sql-exec"><strong>SQL:</strong> ${esc(sql)}</div>
  <table>${tableHTML(rows, { 'total_gasto_R$':'fn num', qtd_animais:'num' })}</table>
</div>
<div class="footer">PetVida — Projeto Acadêmico de Banco de Dados · ${now}</div>
</body></html>`;
    await shot(browser, html, fn);
    log(idx,'total_gasto_tutor', rows.length);
    results.push({ idx, ok:true, fn });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 4 — fn_qtd_consultas_animal
  // ══════════════════════════════════════════════════════════════════════════
  {
    const idx=4; const fn=`f04_fn_qtd_consultas_animal.png`;
    process.stdout.write(`  [${idx}/${TOTAL}] 📊  fn_qtd_consultas_animal                  `);
    const sql = `SELECT a.nome AS animal, e.nome AS especie, t.nome AS tutor,
  fn_qtd_consultas_animal(a.id) AS total_consultas,
  fn_idade_animal(a.data_nascimento) AS idade
FROM animais a
JOIN especies e ON e.id = a.especie_id
JOIN tutores  t ON t.id = a.tutor_id
ORDER BY fn_qtd_consultas_animal(a.id) DESC
LIMIT 15`;
    const rows = await run(sql);
    console.log(`→ ${rows.length} linhas`);
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${css()}</style></head><body>
${topbar(idx,TOTAL,now)}
<div class="panel">
  <div class="ph">
    <h2>📊 fn_qtd_consultas_animal(animal_id) → INT</h2>
    <span class="badge bb">3 pts — fn_qtd + fn_emoji</span>
  </div>
  <div class="info-bar">
    <span class="info-item">Assinatura: <strong>fn_qtd_consultas_animal(p_animal_id INT) RETURNS INT</strong></span>
    <span class="info-item">Conta: <strong>todas as consultas independente do status</strong></span>
    <span class="info-item">Bônus: <strong>também usa fn_idade_animal no mesmo SELECT</strong></span>
  </div>
  <div class="sql-exec"><strong>SQL:</strong> ${esc(sql)}</div>
  <table>${tableHTML(rows, { total_consultas:'num fn', idade:'fn' })}</table>
</div>
<div class="footer">PetVida — Projeto Acadêmico de Banco de Dados · ${now}</div>
</body></html>`;
    await shot(browser, html, fn);
    log(idx,'qtd_consultas_animal', rows.length);
    results.push({ idx, ok:true, fn });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 5 — fn_status_emoji
  // ══════════════════════════════════════════════════════════════════════════
  {
    const idx=5; const fn=`f05_fn_status_emoji.png`;
    process.stdout.write(`  [${idx}/${TOTAL}] 📅  fn_status_emoji                          `);
    const sql = `SELECT c.id AS consulta_id,
  a.nome AS animal,
  c.status AS status_raw,
  fn_status_emoji(c.status) AS status_formatado,
  c.data_hora,
  c.valor
FROM consultas c
JOIN animais a ON a.id = c.animal_id
ORDER BY c.data_hora DESC
LIMIT 15`;
    const rows = await run(sql);
    console.log(`→ ${rows.length} linhas`);
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${css()}</style></head><body>
${topbar(idx,TOTAL,now)}
<div class="panel">
  <div class="ph">
    <h2>📅 fn_status_emoji(status) → VARCHAR</h2>
    <span class="badge bb">3 pts — fn_qtd + fn_emoji</span>
  </div>
  <div class="info-bar">
    <span class="info-item">Assinatura: <strong>fn_status_emoji(status VARCHAR(30)) RETURNS VARCHAR(50)</strong></span>
    <span class="info-item">Mapeamento: <strong>agendada→📅 | concluida→✅ | cancelada→❌ | em_atendimento→🏥</strong></span>
    <span class="info-item">Usa: <strong>CASE … WHEN … THEN</strong></span>
  </div>
  <div class="sql-exec"><strong>SQL:</strong> ${esc(sql)}</div>
  <table>${tableHTML(rows, { status_formatado:'emoji fn', valor:'num', consulta_id:'num' })}</table>
</div>
<div class="footer">PetVida — Projeto Acadêmico de Banco de Dados · ${now}</div>
</body></html>`;
    await shot(browser, html, fn);
    log(idx,'status_emoji', rows.length);
    results.push({ idx, ok:true, fn });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 6 — fn_classificar_valor
  // ══════════════════════════════════════════════════════════════════════════
  {
    const idx=6; const fn=`f06_fn_classificar_valor.png`;
    process.stdout.write(`  [${idx}/${TOTAL}] 💲  fn_classificar_valor                     `);
    const sql = `SELECT c.id AS consulta_id,
  a.nome AS animal,
  c.valor,
  fn_classificar_valor(c.valor) AS classificacao,
  fn_status_emoji(c.status)     AS status
FROM consultas c
JOIN animais a ON a.id = c.animal_id
ORDER BY c.valor DESC
LIMIT 15`;
    const rows = await run(sql);
    console.log(`→ ${rows.length} linhas`);
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${css()}</style></head><body>
${topbar(idx,TOTAL,now)}
<div class="panel">
  <div class="ph">
    <h2>💲 fn_classificar_valor(valor) → VARCHAR</h2>
    <span class="badge by">2 pts — fn_classificar</span>
  </div>
  <div class="info-bar">
    <span class="info-item">Assinatura: <strong>fn_classificar_valor(valor DECIMAL(10,2)) RETURNS VARCHAR(50)</strong></span>
    <span class="info-item">&lt;100 → <strong>Consulta Simples</strong></span>
    <span class="info-item">100–300 → <strong>Consulta Padrão</strong></span>
    <span class="info-item">&gt;300 → <strong>Procedimento Especial</strong></span>
  </div>
  <div class="sql-exec"><strong>SQL:</strong> ${esc(sql)}</div>
  <table>${tableHTML(rows, { classificacao:'cls fn', valor:'num', status:'emoji fn', consulta_id:'num' })}</table>
</div>
<div class="footer">PetVida — Projeto Acadêmico de Banco de Dados · ${now}</div>
</body></html>`;
    await shot(browser, html, fn);
    log(idx,'classificar_valor', rows.length);
    results.push({ idx, ok:true, fn });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 7 — Showcase: 4 functions em 1 SELECT
  // ══════════════════════════════════════════════════════════════════════════
  {
    const idx=7; const fn=`f07_showcase_todas_functions.png`;
    process.stdout.write(`  [${idx}/${TOTAL}] 🏆  Showcase — 4 functions em 1 SELECT       `);
    const sql = `SELECT
  a.nome                                   AS animal,
  fn_idade_animal(a.data_nascimento)       AS idade,
  fn_qtd_consultas_animal(a.id)            AS qtd_consultas,
  fn_total_gasto_tutor(a.tutor_id)         AS total_tutor_R$,
  fn_classificar_valor(
    IFNULL((SELECT MAX(c2.valor) FROM consultas c2 WHERE c2.animal_id=a.id),0)
  )                                        AS classificacao_ultima,
  t.nome                                   AS tutor
FROM animais a
JOIN tutores t ON t.id = a.tutor_id
ORDER BY fn_qtd_consultas_animal(a.id) DESC, fn_total_gasto_tutor(a.tutor_id) DESC
LIMIT 12`;
    const rows = await run(sql);
    console.log(`→ ${rows.length} linhas`);
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${css()}</style></head><body>
${topbar(idx,TOTAL,now)}
<div class="panel">
  <div class="ph">
    <h2>🏆 Showcase — 4 Functions em 1 único SELECT</h2>
    <span class="badge bg">2 pts — Prints demonstrativos</span>
  </div>
  <div class="info-bar">
    <span class="info-item">Usado neste SELECT: <strong>fn_idade_animal · fn_qtd_consultas_animal · fn_total_gasto_tutor · fn_classificar_valor</strong></span>
  </div>
  <div class="sql-exec"><strong>SQL:</strong> ${esc(sql)}</div>
  <table>${tableHTML(rows, { idade:'fn', qtd_consultas:'num fn', 'total_tutor_R$':'num fn', classificacao_ultima:'cls' })}</table>
</div>
<div class="footer">PetVida — Projeto Acadêmico de Banco de Dados · ${now}</div>
</body></html>`;
    await shot(browser, html, fn);
    log(idx,'showcase', rows.length);
    results.push({ idx, ok:true, fn });
  }

  await browser.close();
  await db.end();

  // ── Resumo ─────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(58));
  console.log('   📸  Resumo — Tarefa 4');
  console.log('═'.repeat(58));
  results.forEach(r => console.log(`  ${r.ok?'✅':'❌'}  [${r.idx}/${TOTAL}]  docs/prints/tarefa4_functions/${r.fn}`));
  const ok = results.filter(r=>r.ok).length;
  console.log('\n' + '─'.repeat(58));
  console.log(`  Total: ${ok}/${TOTAL} — ${ok===TOTAL?'10/10 pts potenciais 🎉':`${ok}/${TOTAL} ok`}`);
  console.log('  Pasta: docs/prints/tarefa4_functions/');
  console.log('═'.repeat(58) + '\n');
  process.exit(0);
}

main().catch(e => { console.error('\n❌ Erro fatal:', e.message); process.exit(1); });
