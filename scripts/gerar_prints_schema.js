/**
 * scripts/gerar_prints_schema.js
 */
'use strict';
require('dotenv').config();
const puppeteer = require('puppeteer');
const fs        = require('fs');
const path      = require('path');

const PRINTS_DIR = path.join(__dirname, '..', 'docs', 'prints');
if (!fs.existsSync(PRINTS_DIR)) fs.mkdirSync(PRINTS_DIR, { recursive: true });

const SCHEMA_SQL = fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf-8');
const SEED_SQL   = fs.readFileSync(path.join(__dirname, '..', 'database', 'seed.sql'), 'utf-8');

function esc(str) { return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function highlightSQL(code) {
  return esc(code).replace(/--[^\n]*/g, m => `<span class="cm">${m}</span>`)
    .replace(/\b(CREATE|DATABASE|IF|NOT|EXISTS|USE|TABLE|AUTO_INCREMENT|PRIMARY|KEY|UNIQUE|FOREIGN|REFERENCES|INT|VARCHAR|DATE|DATETIME|DECIMAL|TEXT|ENUM|DEFAULT|INDEX|INSERT|INTO|VALUES)\b/gi, m => `<span class="kw">${m.toUpperCase()}</span>`)
    .replace(/'([^']*)'/g, m => `<span class="str">${m}</span>`);
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
  pre.code{font-family:'JetBrains Mono',monospace;font-size:11.5px;line-height:1.7;padding:16px 18px;white-space:pre-wrap;word-break:break-word}
  .kw{color:#ff7b72;font-weight:700}.str{color:#a5d6ff}.cm{color:#8b949e;font-style:italic}
  .sql-exec{font-family:'JetBrains Mono',monospace;font-size:11px;color:#8b949e;padding:10px 18px;border-bottom:1px solid #21262d;background:#0d1117;white-space:pre-wrap}
  table{width:100%;border-collapse:collapse;font-size:12px}
  thead{background:#1c2128}
  thead th{padding:9px 12px;text-align:left;font-weight:700;font-size:10px;color:#8b949e;text-transform:uppercase;letter-spacing:.05em;border-right:1px solid #21262d}
  tbody tr:nth-child(even){background:#0d1117}
  tbody tr:nth-child(odd){background:#111519}
  tbody td{padding:8px 12px;border-right:1px solid #21262d;border-top:1px solid #21262d}
  td.num{color:#79c0ff;font-family:'JetBrains Mono',monospace;text-align:right}
  .footer{font-size:10px;color:#2d333b;text-align:center;margin-top:12px}
  `;
}
function topbar(idx, total, now) {
  return `<div class="topbar">
    <div class="brand">🐾 <strong>PetVida</strong> &nbsp;•&nbsp; Tarefa 1 — DDL e DML &nbsp;•&nbsp; ${now}</div>
    <span class="counter">Print ${idx} / ${total}</span>
  </div>`;
}
function tableHTML(rows) {
  if (!rows?.length) return '<tr><td colspan="10" style="text-align:center;color:#586069;padding:20px;font-style:italic">Nenhum resultado</td></tr>';
  const cols = Object.keys(rows[0]);
  const thead = `<thead><tr>${cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${rows.map(row=>`<tr>${cols.map(col=>{
    const val = row[col];
    const cls = typeof val === 'number' ? 'num' : '';
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
const TOTAL = 6;
async function main() {
  console.log('\n' + '═'.repeat(58));
  console.log('   🐾  PetVida Tarefa 1 — Schema e Seed');
  console.log('═'.repeat(58));
  const db = require('../src/config/database');
  await db.query('SELECT 1');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const now = new Date().toLocaleString('pt-BR');
  const results = [];
  const run = async (sql) => { const [r] = await db.query(sql); return r; };

  {
    const idx = 1; const fn = 's01_schema_sql.png';
    process.stdout.write(`  [${idx}/${TOTAL}] 📄  schema.sql completo                      `);
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${css()}</style></head><body>
${topbar(idx,TOTAL,now)}
<div class="panel">
  <div class="ph"><h2>📄 database/schema.sql — Criação das Tabelas</h2><span class="badge bp">DDL</span></div>
  <pre class="code">${highlightSQL(SCHEMA_SQL)}</pre>
</div><div class="footer">PetVida · ${now}</div></body></html>`;
    await shot(browser, html, fn);
    console.log('→ ok'); results.push(fn);
  }

  {
    const idx = 2; const fn = 's02_seed_sql.png';
    process.stdout.write(`  [${idx}/${TOTAL}] 📄  seed.sql completo                        `);
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${css()}</style></head><body>
${topbar(idx,TOTAL,now)}
<div class="panel">
  <div class="ph"><h2>📄 database/seed.sql — Inserção de Dados de Teste</h2><span class="badge bg">DML</span></div>
  <pre class="code">${highlightSQL(SEED_SQL)}</pre>
</div><div class="footer">PetVida · ${now}</div></body></html>`;
    await shot(browser, html, fn);
    console.log('→ ok'); results.push(fn);
  }

  {
    const idx = 3; const fn = 's03_show_tables.png';
    process.stdout.write(`  [${idx}/${TOTAL}] 🗃️   SHOW TABLES                              `);
    const rows = await run('SHOW TABLES');
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${css()}</style></head><body>
${topbar(idx,TOTAL,now)}
<div class="panel">
  <div class="ph"><h2>🗃️ Tabelas no Banco de Dados</h2><span class="badge bb">SHOW TABLES</span></div>
  <div class="sql-exec">SHOW TABLES;</div>
  <table>${tableHTML(rows)}</table>
</div><div class="footer">PetVida · ${now}</div></body></html>`;
    await shot(browser, html, fn);
    console.log('→ ok'); results.push(fn);
  }

  const counts = [
    { idx: 4, label: 'Especies e Tutores', q1: 'SELECT * FROM especies LIMIT 5', q2: 'SELECT * FROM tutores LIMIT 5' },
    { idx: 5, label: 'Animais e Veterinarios', q1: 'SELECT * FROM animais LIMIT 5', q2: 'SELECT * FROM veterinarios LIMIT 5' },
    { idx: 6, label: 'Consultas e Pagamentos', q1: 'SELECT * FROM consultas LIMIT 5', q2: 'SELECT * FROM pagamentos LIMIT 5' }
  ];
  for (const t of counts) {
    const fn = `s0${t.idx}_${t.label.replace(/\s+/g, '_').toLowerCase()}.png`;
    process.stdout.write(`  [${t.idx}/${TOTAL}] 👁️  ${t.label.padEnd(30)} `);
    try {
      const rows1 = await run(t.q1);
      const rows2 = await run(t.q2);
      const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${css()}</style></head><body>
${topbar(t.idx,TOTAL,now)}
<div class="panel">
  <div class="ph"><h2>👁️ ${t.q1}</h2><span class="badge bg">Amostra de Dados</span></div>
  <table>${tableHTML(rows1)}</table>
</div>
<div class="panel">
  <div class="ph"><h2>👁️ ${t.q2}</h2><span class="badge by">Amostra de Dados</span></div>
  <table>${tableHTML(rows2)}</table>
</div>
<div class="footer">PetVida · ${now}</div></body></html>`;
      await shot(browser, html, fn);
      console.log(`→ ok`); results.push(fn);
    } catch(e) { console.log(`→ ERRO: ${e.message}`); }
  }
  await browser.close();
  await db.end();
  console.log('\n' + '─'.repeat(58));
  console.log(`  Total: ${results.length}/${TOTAL} prints salvos em docs/prints/`);
  console.log('═'.repeat(58) + '\n');
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
