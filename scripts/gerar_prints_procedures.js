/**
 * scripts/gerar_prints_procedures.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Gera prints da Tarefa 3: demonstração das 5 stored procedures com validações,
 * testes de sucesso e testes de erro (SIGNAL SQLSTATE).
 *
 * Uso: node scripts/gerar_prints_procedures.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

require('dotenv').config();

const puppeteer = require('puppeteer');
const fs        = require('fs');
const path      = require('path');

const PRINTS_DIR = path.join(__dirname, '..', 'docs', 'prints', 'tarefa3_procedures');
if (!fs.existsSync(PRINTS_DIR)) fs.mkdirSync(PRINTS_DIR, { recursive: true });

const PROCEDURES_SQL = fs.readFileSync(
  path.join(__dirname, '..', 'database', 'procedures.sql'), 'utf-8'
);

function esc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function highlightSQL(code) {
  return esc(code)
    .replace(/--[^\n]*/g, m => `<span class="cm">${m}</span>`)
    .replace(/\b(CREATE|PROCEDURE|BEGIN|END|DECLARE|SET|INTO|IF|THEN|ELSE|ELSEIF|SIGNAL|SQLSTATE|MESSAGE_TEXT|START|TRANSACTION|COMMIT|ROLLBACK|INSERT|UPDATE|DELETE|SELECT|FROM|WHERE|AND|OR|NOT|IN|VALUES|CALL|DELIMITER|DROP|EXISTS|INT|DECIMAL|VARCHAR|DATETIME|DATE|TEXT|NOW|LAST_INSERT_ID|COUNT|ABS|TIMESTAMPDIFF|MINUTE|IN|OUT|INOUT)\b/gi,
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
  .result-box{padding:14px 18px}
  .result-ok{border-left:3px solid #4ade80;background:#0a1a0a}
  .result-err{border-left:3px solid #f87171;background:#1a0a0a}
  .result-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px}
  .result-ok .result-label{color:#4ade80}
  .result-err .result-label{color:#f87171}
  .result-msg{font-family:'JetBrains Mono',monospace;font-size:12px;color:#c9d1d9}
  table{width:100%;border-collapse:collapse;font-size:12px}
  thead{background:#1c2128}
  thead th{padding:9px 12px;text-align:left;font-weight:700;font-size:10px;color:#8b949e;text-transform:uppercase;letter-spacing:.05em;border-right:1px solid #21262d}
  tbody tr:nth-child(even){background:#0d1117}
  tbody tr:nth-child(odd){background:#111519}
  tbody td{padding:8px 12px;border-right:1px solid #21262d;border-top:1px solid #21262d;font-family:'JetBrains Mono',monospace}
  .footer{font-size:10px;color:#2d333b;text-align:center;margin-top:12px}
  `;
}

function topbar(idx, total, now) {
  return `<div class="topbar">
    <div class="brand">🐾 <strong>PetVida</strong> &nbsp;•&nbsp; Tarefa 3 — Procedures &nbsp;•&nbsp; ${now}</div>
    <span class="counter">Print ${idx} / ${total}</span>
  </div>`;
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

const TOTAL = 6;

async function main() {
  console.log('\n' + '═'.repeat(58));
  console.log('   🐾  PetVida Tarefa 3 — Procedures (Demo)');
  console.log('═'.repeat(58));

  const db = require('../src/config/database');
  await db.query('SELECT 1');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const now = new Date().toLocaleString('pt-BR');
  const results = [];

  // Pega IDs válidos
  const [[{ id: aId }]] = await db.query('SELECT id FROM animais LIMIT 1');
  const [[{ id: vId }]] = await db.query('SELECT id FROM veterinarios LIMIT 1');
  const [[{ id: tId }]] = await db.query('SELECT id FROM tutores LIMIT 1');
  const [[{ id: eId }]] = await db.query('SELECT id FROM especies LIMIT 1');
  
  let consultaId = null;
  const fDate = new Date(Date.now() + 10*24*60*60*1000).toISOString().slice(0,19).replace('T',' ');

  // 1. procedures.sql
  {
    const idx = 1; const fn = 'p01_procedures_sql.png';
    process.stdout.write(`  [${idx}/${TOTAL}] 📄  procedures.sql completo                  `);
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${css()}</style></head><body>
${topbar(idx,TOTAL,now)}
<div class="panel">
  <div class="ph"><h2>📄 database/procedures.sql — 5 Stored Procedures</h2><span class="badge bp">Transações e Validações</span></div>
  <pre class="code">${highlightSQL(PROCEDURES_SQL)}</pre>
</div><div class="footer">PetVida · ${now}</div></body></html>`;
    await shot(browser, html, fn);
    console.log('→ ok'); results.push(fn);
  }

  // 2. sp_agendar_consulta
  {
    const idx = 2; const fn = 'p02_sp_agendar_consulta.png';
    process.stdout.write(`  [${idx}/${TOTAL}] 📅  sp_agendar_consulta                      `);
    let sql1 = `CALL sp_agendar_consulta(${aId}, ${vId}, '${fDate}', 150.00);`;
    let sql2 = `CALL sp_agendar_consulta(9999, ${vId}, '${fDate}', 150.00);`;
    let res1, err2;
    try {
      const [rows] = await db.query(sql1);
      res1 = rows[0][0];
      consultaId = res1.consulta_id;
    } catch(e) {}
    try { await db.query(sql2); } catch(e) { err2 = e.message; }
    
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${css()}</style></head><body>
${topbar(idx,TOTAL,now)}
<div class="panel">
  <div class="ph"><h2>📅 sp_agendar_consulta (Sucesso)</h2><span class="badge bg">Transação: Insere Consulta + Pagamento</span></div>
  <div class="sql-exec">${esc(sql1)}</div>
  <div class="result-box result-ok"><div class="result-label">✅ Sucesso</div><div class="result-msg">${esc(JSON.stringify(res1))}</div></div>
</div>
<div class="panel">
  <div class="ph"><h2>🚨 sp_agendar_consulta (Erro - Animal Inexistente)</h2><span class="badge br">Validação SIGNAL SQLSTATE</span></div>
  <div class="sql-exec">${esc(sql2)}</div>
  <div class="result-box result-err"><div class="result-label">❌ Erro Capturado</div><div class="result-msg">${esc(err2)}</div></div>
</div><div class="footer">PetVida · ${now}</div></body></html>`;
    await shot(browser, html, fn);
    console.log('→ ok'); results.push(fn);
  }

  // 3. sp_concluir_consulta
  {
    const idx = 3; const fn = 'p03_sp_concluir_consulta.png';
    process.stdout.write(`  [${idx}/${TOTAL}] ✅  sp_concluir_consulta                     `);
    let sql1 = `CALL sp_concluir_consulta(${consultaId}, 'Tudo ótimo!');`;
    let res1, err2;
    try { const [rows] = await db.query(sql1); res1 = rows[0][0]; } catch(e) {}
    try { await db.query(sql1); } catch(e) { err2 = e.message; } // Tenta concluir de novo
    
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${css()}</style></head><body>
${topbar(idx,TOTAL,now)}
<div class="panel">
  <div class="ph"><h2>✅ sp_concluir_consulta (Sucesso)</h2><span class="badge bg">UPDATE status</span></div>
  <div class="sql-exec">${esc(sql1)}</div>
  <div class="result-box result-ok"><div class="result-label">✅ Sucesso</div><div class="result-msg">${esc(JSON.stringify(res1))}</div></div>
</div>
<div class="panel">
  <div class="ph"><h2>🚨 sp_concluir_consulta (Erro - Já Concluída)</h2><span class="badge br">Validação de Estado</span></div>
  <div class="sql-exec">${esc(sql1)}</div>
  <div class="result-box result-err"><div class="result-label">❌ Erro Capturado</div><div class="result-msg">${esc(err2)}</div></div>
</div><div class="footer">PetVida · ${now}</div></body></html>`;
    await shot(browser, html, fn);
    console.log('→ ok'); results.push(fn);
  }

  // 4. sp_registrar_pagamento
  {
    const idx = 4; const fn = 'p04_sp_registrar_pagamento.png';
    process.stdout.write(`  [${idx}/${TOTAL}] 💳  sp_registrar_pagamento                   `);
    let sql1 = `CALL sp_registrar_pagamento(${consultaId}, 'pix');`;
    let res1, err2;
    try { const [rows] = await db.query(sql1); res1 = rows[0][0]; } catch(e) {}
    try { await db.query(sql1); } catch(e) { err2 = e.message; }
    
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${css()}</style></head><body>
${topbar(idx,TOTAL,now)}
<div class="panel">
  <div class="ph"><h2>💳 sp_registrar_pagamento (Sucesso)</h2><span class="badge bg">UPDATE pagamentos</span></div>
  <div class="sql-exec">${esc(sql1)}</div>
  <div class="result-box result-ok"><div class="result-label">✅ Sucesso</div><div class="result-msg">${esc(JSON.stringify(res1))}</div></div>
</div>
<div class="panel">
  <div class="ph"><h2>🚨 sp_registrar_pagamento (Erro - Já Pago)</h2><span class="badge br">Validação Duplicidade</span></div>
  <div class="sql-exec">${esc(sql1)}</div>
  <div class="result-box result-err"><div class="result-label">❌ Erro Capturado</div><div class="result-msg">${esc(err2)}</div></div>
</div><div class="footer">PetVida · ${now}</div></body></html>`;
    await shot(browser, html, fn);
    console.log('→ ok'); results.push(fn);
  }

  // 5. sp_cancelar_consulta
  {
    const idx = 5; const fn = 'p05_sp_cancelar_consulta.png';
    process.stdout.write(`  [${idx}/${TOTAL}] ❌  sp_cancelar_consulta                     `);
    // Cria uma nova só pra cancelar
    const [rows2] = await db.query(`CALL sp_agendar_consulta(${aId}, ${vId}, '${new Date(Date.now() + 15*86400000).toISOString().slice(0,19).replace('T',' ')}', 100);`);
    const cId2 = rows2[0][0].consulta_id;
    let sql1 = `CALL sp_cancelar_consulta(${cId2});`;
    let res1, err2;
    try { const [rows] = await db.query(sql1); res1 = rows[0][0]; } catch(e) {}
    try { await db.query(`CALL sp_cancelar_consulta(${consultaId});`); } catch(e) { err2 = e.message; } // Tenta cancelar a concluida
    
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${css()}</style></head><body>
${topbar(idx,TOTAL,now)}
<div class="panel">
  <div class="ph"><h2>❌ sp_cancelar_consulta (Sucesso)</h2><span class="badge bg">Transação: Cancela Consulta e Pagamento</span></div>
  <div class="sql-exec">${esc(sql1)}</div>
  <div class="result-box result-ok"><div class="result-label">✅ Sucesso</div><div class="result-msg">${esc(JSON.stringify(res1))}</div></div>
</div>
<div class="panel">
  <div class="ph"><h2>🚨 sp_cancelar_consulta (Erro - Já Concluída)</h2><span class="badge br">Validação de Estado</span></div>
  <div class="sql-exec">CALL sp_cancelar_consulta(${consultaId});</div>
  <div class="result-box result-err"><div class="result-label">❌ Erro Capturado</div><div class="result-msg">${esc(err2)}</div></div>
</div><div class="footer">PetVida · ${now}</div></body></html>`;
    await shot(browser, html, fn);
    console.log('→ ok'); results.push(fn);
  }

  // 6. sp_cadastrar_animal
  {
    const idx = 6; const fn = 'p06_sp_cadastrar_animal.png';
    process.stdout.write(`  [${idx}/${TOTAL}] 🐾  sp_cadastrar_animal                      `);
    let sql1 = `CALL sp_cadastrar_animal('Rex Jr', ${eId}, 'SRD', '2023-01-01', ${tId});`;
    let sql2 = `CALL sp_cadastrar_animal('Rex Jr', ${eId}, 'SRD', '2023-01-01', 9999);`;
    let res1, err2;
    try { const [rows] = await db.query(sql1); res1 = rows[0][0]; } catch(e) {}
    try { await db.query(sql2); } catch(e) { err2 = e.message; }
    
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${css()}</style></head><body>
${topbar(idx,TOTAL,now)}
<div class="panel">
  <div class="ph"><h2>🐾 sp_cadastrar_animal (Sucesso)</h2><span class="badge bg">Validação e INSERT</span></div>
  <div class="sql-exec">${esc(sql1)}</div>
  <div class="result-box result-ok"><div class="result-label">✅ Sucesso</div><div class="result-msg">${esc(JSON.stringify(res1))}</div></div>
</div>
<div class="panel">
  <div class="ph"><h2>🚨 sp_cadastrar_animal (Erro - Tutor Inexistente)</h2><span class="badge br">Validação Chave Estrangeira (Lógica)</span></div>
  <div class="sql-exec">${esc(sql2)}</div>
  <div class="result-box result-err"><div class="result-label">❌ Erro Capturado</div><div class="result-msg">${esc(err2)}</div></div>
</div><div class="footer">PetVida · ${now}</div></body></html>`;
    await shot(browser, html, fn);
    console.log('→ ok'); results.push(fn);
  }

  await browser.close();
  await db.end();

  console.log('\n' + '─'.repeat(58));
  console.log(`  Total: ${results.length}/${TOTAL} prints salvos em docs/prints/tarefa3_procedures/`);
  console.log('═'.repeat(58) + '\n');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
