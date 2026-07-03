/**
 * scripts/gerar_prints_views.js
 */
'use strict';
require('dotenv').config();
const puppeteer = require('puppeteer');
const fs        = require('fs');
const path      = require('path');

const PRINTS_DIR = path.join(__dirname, '..', 'docs', 'prints', 'tarefa2_views');
if (!fs.existsSync(PRINTS_DIR)) fs.mkdirSync(PRINTS_DIR, { recursive: true });

const VIEWS_SQL = fs.readFileSync(path.join(__dirname, '..', 'database', 'views.sql'), 'utf-8');

function esc(str) { return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function highlightSQL(code) {
  return esc(code).replace(/--[^\n]*/g, m => `<span class="cm">${m}</span>`)
    .replace(/\b(CREATE|OR|REPLACE|VIEW|AS|SELECT|FROM|JOIN|LEFT|RIGHT|INNER|ON|WHERE|AND|GROUP|BY|ORDER|DATE|CURDATE|YEAR|MONTH|COUNT|SUM|AS)\b/gi, m => `<span class="kw">${m.toUpperCase()}</span>`)
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
  .br{background:#2d0d0d;color:#f87171;border:1px solid #991b1b}
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
    <div class="brand">🐾 <strong>PetVida</strong> &nbsp;•&nbsp; Tarefa 2 — Views &nbsp;•&nbsp; ${now}</div>
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
  console.log('   🐾  PetVida Tarefa 2 — Views');
  console.log('═'.repeat(58));
  const db = require('../src/config/database');
  await db.query('SELECT 1');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const now = new Date().toLocaleString('pt-BR');
  const results = [];
  const run = async (sql) => { const [r] = await db.query(sql); return r; };

  {
    const idx = 1; const fn = 'v01_views_sql.png';
    process.stdout.write(`  [${idx}/${TOTAL}] 📄  views.sql completo                       `);
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${css()}</style></head><body>
${topbar(idx,TOTAL,now)}
<div class="panel">
  <div class="ph"><h2>📄 database/views.sql — 5 Views</h2><span class="badge bp">Encapsulamento de JOINs complexos</span></div>
  <pre class="code">${highlightSQL(VIEWS_SQL)}</pre>
</div><div class="footer">PetVida · ${now}</div></body></html>`;
    await shot(browser, html, fn);
    console.log('→ ok'); results.push(fn);
  }

  const views = [
    { idx: 2, v: 'vw_consultas_completas', sql: 'SELECT * FROM vw_consultas_completas LIMIT 15', b: 'bg' },
    { idx: 3, v: 'vw_agenda_hoje', sql: 'SELECT * FROM vw_agenda_hoje LIMIT 15', b: 'bb' },
    { idx: 4, v: 'vw_faturamento_mensal', sql: 'SELECT * FROM vw_faturamento_mensal LIMIT 15', b: 'by' },
    { idx: 5, v: 'vw_animais_detalhados', sql: 'SELECT * FROM vw_animais_detalhados LIMIT 15', b: 'bp' },
    { idx: 6, v: 'vw_inadimplentes', sql: 'SELECT * FROM vw_inadimplentes LIMIT 15', b: 'br' }
  ];
  for (const t of views) {
    const fn = `v0${t.idx}_${t.v}.png`;
    process.stdout.write(`  [${t.idx}/${TOTAL}] 👁️  ${t.v.padEnd(30)} `);
    try {
      const rows = await run(t.sql);
      const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>${css()}</style></head><body>
${topbar(t.idx,TOTAL,now)}
<div class="panel">
  <div class="ph"><h2>👁️ SELECT * FROM ${t.v}</h2><span class="badge ${t.b}">View Execution</span></div>
  <div class="sql-exec">${esc(t.sql)}</div>
  <table>${tableHTML(rows)}</table>
</div><div class="footer">PetVida · ${now}</div></body></html>`;
      await shot(browser, html, fn);
      console.log(`→ ${rows.length} linhas`); results.push(fn);
    } catch(e) { console.log(`→ ERRO: ${e.message}`); }
  }
  await browser.close();
  await db.end();
  console.log('\n' + '─'.repeat(58));
  console.log(`  Total: ${results.length}/${TOTAL} prints salvos em docs/prints/tarefa2_views/`);
  console.log('═'.repeat(58) + '\n');
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
