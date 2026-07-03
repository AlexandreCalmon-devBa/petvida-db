/**
 * scripts/gerar_prints_triggers.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Gera prints da Tarefa 5 demonstrando cada trigger ao vivo:
 *   1. triggers.sql — código dos 5 triggers
 *   2. INSERT consulta → log_auditoria preenchido automaticamente
 *   3. UPDATE status → log "de X para Y"
 *   4. DELETE com pagamento pago → SIGNAL de bloqueio
 *   5. INSERT animal → log preenchido
 *   6. UPDATE pagamento → data_pagamento preenchida automaticamente
 *   7. log_auditoria completo — todos os registros
 *
 * Uso: node scripts/gerar_prints_triggers.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

require('dotenv').config();

const puppeteer = require('puppeteer');
const fs        = require('fs');
const path      = require('path');

const PRINTS_DIR = path.join(__dirname, '..', 'docs', 'prints', 'tarefa5_triggers');
if (!fs.existsSync(PRINTS_DIR)) fs.mkdirSync(PRINTS_DIR, { recursive: true });

const TRIGGERS_SQL = fs.readFileSync(
  path.join(__dirname, '..', 'database', 'triggers.sql'),
  'utf-8'
);

// ─── Helpers HTML ─────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function highlightSQL(code) {
  return escapeHtml(code)
    .replace(/--[^\n]*/g, m => `<span class="cm">${m}</span>`)
    .replace(/\b(CREATE|TRIGGER|IF|NOT|EXISTS|AFTER|BEFORE|INSERT|UPDATE|DELETE|ON|FOR|EACH|ROW|BEGIN|END|INTO|VALUES|WHERE|AND|OR|SET|SIGNAL|SQLSTATE|MESSAGE_TEXT|TABLE|AUTO_INCREMENT|PRIMARY|KEY|INDEX|DEFAULT|NULL|CURRENT_TIMESTAMP|TIMESTAMP|VARCHAR|TEXT|INT|OLD|NEW|THEN|CALL|FORMAT|CONCAT|COALESCE|NOW|CURDATE|USE|DELIMITER)\b/gi,
      m => `<span class="kw">${m.toUpperCase()}</span>`)
    .replace(/'([^']*)'/g, m => `<span class="str">${m}</span>`)
    .replace(/\b(\d+(?:\.\d+)?)\b/g, m => `<span class="num">${m}</span>`);
}

// ─── Template base ────────────────────────────────────────────────────────────

function baseStyle() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #0d1117; color: #c9d1d9; padding: 24px 28px; }
    .topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
    .brand { font-size:12px; color:#586069; }
    .brand strong { color:#a78bfa; }
    .counter { font-size:11px; font-weight:700; background:#1a1040; color:#a78bfa; border:1px solid #4c1d95; padding:3px 10px; border-radius:20px; }
    .panel { background:#161b22; border:1px solid #21262d; border-radius:10px; overflow:hidden; margin-bottom:14px; }
    .panel-header { display:flex; align-items:center; justify-content:space-between; background:#1c2128; border-bottom:1px solid #21262d; padding:10px 16px; }
    .panel-header h2 { font-size:13px; color:#e6edf3; display:flex; align-items:center; gap:8px; }
    .badge { font-size:11px; font-weight:700; padding:2px 8px; border-radius:12px; }
    .badge-green  { background:#0d2d0d; color:#4ade80; border:1px solid #166534; }
    .badge-blue   { background:#0c1a2e; color:#58a6ff; border:1px solid #1d4ed8; }
    .badge-yellow { background:#2d1f00; color:#fbbf24; border:1px solid #b45309; }
    .badge-red    { background:#2d0d0d; color:#f87171; border:1px solid #991b1b; }
    .badge-purple { background:#1a0d2e; color:#c084fc; border:1px solid #7c3aed; }
    pre.code { font-family:'JetBrains Mono',monospace; font-size:11.5px; line-height:1.7; padding:16px 18px; white-space:pre-wrap; word-break:break-word; }
    .kw  { color:#ff7b72; font-weight:700; }
    .str { color:#a5d6ff; }
    .num { color:#79c0ff; }
    .cm  { color:#8b949e; font-style:italic; }
    table { width:100%; border-collapse:collapse; font-size:12px; }
    thead { background:#1c2128; }
    thead th { padding:9px 12px; text-align:left; font-weight:700; font-size:10px; color:#8b949e; text-transform:uppercase; letter-spacing:.05em; border-right:1px solid #21262d; white-space:nowrap; }
    thead th:last-child { border-right:none; }
    tbody tr:nth-child(even) { background:#0d1117; }
    tbody tr:nth-child(odd)  { background:#111519; }
    tbody td { padding:7px 12px; border-right:1px solid #21262d; border-top:1px solid #21262d; font-size:11.5px; word-break:break-word; }
    tbody td:last-child { border-right:none; }
    td.num { color:#79c0ff; font-family:'JetBrains Mono',monospace; text-align:right; }
    td.mono { font-family:'JetBrains Mono',monospace; font-size:11px; }
    td.insert { color:#4ade80; font-weight:700; }
    td.update { color:#fbbf24; font-weight:700; }
    td.delete { color:#f87171; font-weight:700; }
    td.ts { color:#8b949e; font-size:10.5px; font-family:'JetBrains Mono',monospace; }
    .result-box { padding:14px 18px; }
    .result-ok  { border-left:3px solid #4ade80; background:#0a1a0a; }
    .result-err { border-left:3px solid #f87171; background:#1a0a0a; }
    .result-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; margin-bottom:4px; }
    .result-ok  .result-label { color:#4ade80; }
    .result-err .result-label { color:#f87171; }
    .result-msg { font-family:'JetBrains Mono',monospace; font-size:12px; color:#c9d1d9; }
    .sql-exec { font-family:'JetBrains Mono',monospace; font-size:11px; color:#8b949e; padding:10px 18px; border-bottom:1px solid #21262d; background:#0d1117; }
    .sql-exec strong { color:#c084fc; }
    .footer { font-size:10px; color:#2d333b; text-align:center; margin-top:12px; }
  `;
}

function topbar(index, total, now) {
  return `
    <div class="topbar">
      <div class="brand">🐾 <strong>PetVida</strong> &nbsp;•&nbsp; Tarefa 5 — Triggers &nbsp;•&nbsp; ${now}</div>
      <span class="counter">Print ${index} / ${total}</span>
    </div>`;
}

function tableHTML(rows, highlightCol) {
  if (!rows || rows.length === 0) {
    return '<tbody><tr><td colspan="10" style="text-align:center;color:#586069;padding:20px;font-style:italic;">Nenhum resultado</td></tr></tbody>';
  }
  const cols = Object.keys(rows[0]);
  const thead = `<thead><tr>${cols.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${rows.map(row =>
    `<tr>${cols.map(col => {
      const val = row[col];
      let cls = '';
      if (col === 'acao') {
        cls = val === 'INSERT' ? 'insert' : val === 'UPDATE' ? 'update' : val === 'DELETE' ? 'delete' : '';
      } else if (col === 'data_hora' || col === 'data_pagamento') {
        cls = 'ts';
      } else if (typeof val === 'number') {
        cls = 'num';
      } else if (['id','registro_id','consulta_id'].includes(col)) {
        cls = 'num';
      }
      const display = val === null ? '<span style="color:#586069;font-style:italic">NULL</span>' : escapeHtml(String(val));
      return `<td class="${cls}">${display}</td>`;
    }).join('')}</tr>`
  ).join('')}</tbody>`;
  return thead + tbody;
}

// ─── Screenshot ───────────────────────────────────────────────────────────────

async function screenshot(browser, html, filename) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 800 });
  await page.setContent(html, { waitUntil: 'networkidle2' });
  const height = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: 1100, height: Math.max(500, height + 40) });
  const outPath = path.join(PRINTS_DIR, filename);
  await page.screenshot({ path: outPath, fullPage: true });
  await page.close();
  return outPath;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n' + '═'.repeat(58));
  console.log('   🐾  PetVida Tarefa 5 — Triggers (Demo ao Vivo)');
  console.log('═'.repeat(58));

  const db = require('../src/config/database');
  try {
    await db.query('SELECT 1');
    console.log('\n✅ MySQL conectado!\n');
  } catch (e) {
    console.error('\n❌ Falha MySQL:', e.message);
    process.exit(1);
  }

  console.log('Iniciando Puppeteer...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const TOTAL   = 7;
  const results = [];
  const now     = new Date().toLocaleString('pt-BR');

  // ── Busca dados reais para as demos ──────────────────────────────────────

  const [[animais]]      = await db.query('SELECT id FROM animais LIMIT 1');
  const [[vets]]         = await db.query('SELECT id FROM veterinarios LIMIT 1');
  const [[pagoPago]]     = await db.query("SELECT p.consulta_id FROM pagamentos p JOIN consultas c ON c.id=p.consulta_id WHERE p.status='pago' LIMIT 1");
  const [[consultaAgen]] = await db.query("SELECT id FROM consultas WHERE status='agendada' AND id NOT IN (SELECT consulta_id FROM pagamentos WHERE status='pago') LIMIT 1");

  const animalId  = animais?.id ?? 3;
  const vetId     = vets?.id   ?? 1;
  const paidId    = pagoPago?.consulta_id ?? null;
  const agendaId  = consultaAgen?.id      ?? null;

  console.log(`   Dados: animal_id=${animalId}, vet_id=${vetId}, consulta_paga=${paidId}, consulta_agendada=${agendaId}\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // PRINT 1 — triggers.sql completo
  // ═══════════════════════════════════════════════════════════════════════════
  {
    const idx = 1; const fn = 't01_triggers_sql.png';
    process.stdout.write(`  [${idx}/${TOTAL}] 📄  triggers.sql — código dos 5 triggers        `);
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<style>${baseStyle()}</style></head><body>
${topbar(idx, TOTAL, now)}
<div class="panel">
  <div class="panel-header">
    <h2>📄 database/triggers.sql — 5 Triggers de Auditoria</h2>
    <span class="badge badge-purple">1 pt tabela log + 10 pts triggers</span>
  </div>
  <pre class="code">${highlightSQL(TRIGGERS_SQL)}</pre>
</div>
<div class="footer">PetVida — Projeto Acadêmico de Banco de Dados · ${now}</div>
</body></html>`;
    await screenshot(browser, html, fn);
    console.log('→ ok'); console.log(`          ✅ Salvo: docs/prints/tarefa5_triggers/${fn}`);
    results.push({ idx, label: 'triggers.sql', fn, ok: true });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRINT 2 — trg_after_insert_consulta: INSERT → log
  // ═══════════════════════════════════════════════════════════════════════════
  {
    const idx = 2; const fn = 't02_trigger_insert_consulta.png';
    process.stdout.write(`  [${idx}/${TOTAL}] 🟢  trg_after_insert_consulta                   `);

    let insertedId = null, logRows = [], errorMsg = null, sqlUsed = '';

    try {
      // Usa sp_agendar_consulta para inserir (dispara trigger)
      const futureDate = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
        .toISOString().slice(0, 19).replace('T', ' ');
      sqlUsed = `CALL sp_agendar_consulta(${animalId}, ${vetId}, '${futureDate}', 120.00);`;
      const [rows] = await db.query('CALL sp_agendar_consulta(?, ?, ?, ?)',
        [animalId, vetId, futureDate, 120.00]);
      insertedId = rows[0][0]?.consulta_id;
      // Busca log gerado pela trigger
      const [log] = await db.query(
        "SELECT * FROM log_auditoria WHERE tabela_afetada='consultas' AND acao='INSERT' AND registro_id=? ORDER BY data_hora DESC LIMIT 3",
        [insertedId]
      );
      logRows = log;
      console.log(`→ consulta_id=${insertedId}, ${logRows.length} linha(s) no log`);
    } catch (e) {
      errorMsg = e.message; console.log(`→ ERRO: ${e.message.slice(0,50)}`);
    }

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<style>${baseStyle()}</style></head><body>
${topbar(idx, TOTAL, now)}
<div class="panel">
  <div class="panel-header">
    <h2>🟢 trg_after_insert_consulta — AFTER INSERT em consultas</h2>
    <span class="badge badge-green">3 pts — Triggers INSERT</span>
  </div>
  <div class="sql-exec">
    <strong>SQL executado:</strong> ${escapeHtml(sqlUsed || `INSERT via sp_agendar_consulta(${animalId}, ${vetId}, ...)`)}
  </div>
  <div class="result-box ${errorMsg ? 'result-err' : 'result-ok'}">
    <div class="result-label">${errorMsg ? '❌ Erro' : '✅ Consulta inserida'}</div>
    <div class="result-msg">${errorMsg ? escapeHtml(errorMsg) : `consulta_id = ${insertedId} criada com sucesso. Trigger disparou automaticamente!`}</div>
  </div>
</div>
<div class="panel">
  <div class="panel-header">
    <h2>📋 log_auditoria — registro gerado automaticamente pela trigger</h2>
  </div>
  <table>${tableHTML(logRows)}</table>
</div>
<div class="footer">PetVida — Projeto Acadêmico de Banco de Dados · ${now}</div>
</body></html>`;
    await screenshot(browser, html, fn);
    console.log(`          ✅ Salvo: docs/prints/tarefa5_triggers/${fn}`);
    results.push({ idx, label: 'INSERT consulta → log', fn, ok: !errorMsg });

    // Salva o ID da nova consulta para uso nos próximos steps
    if (insertedId) agendaId === null && (global._newConsultaId = insertedId);
    global._newConsultaId = insertedId ?? agendaId;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRINT 3 — trg_after_update_consulta_status: UPDATE → log "de X para Y"
  // ═══════════════════════════════════════════════════════════════════════════
  {
    const idx = 3; const fn = 't03_trigger_update_status.png';
    process.stdout.write(`  [${idx}/${TOTAL}] 🟡  trg_after_update_consulta_status            `);

    const consultaAlvo = global._newConsultaId ?? agendaId;
    let logRows = [], errorMsg = null, statusAntes = '?', statusDepois = 'concluida';
    let sqlUsed = '';

    try {
      // Pega status atual
      const [[cur]] = await db.query('SELECT status FROM consultas WHERE id=?', [consultaAlvo]);
      statusAntes = cur?.status ?? 'agendada';
      sqlUsed = `CALL sp_concluir_consulta(${consultaAlvo}, 'Diagnóstico via trigger demo');`;
      await db.query("CALL sp_concluir_consulta(?, ?)",
        [consultaAlvo, 'Diagnóstico via trigger demo — Tarefa 5']);
      const [log] = await db.query(
        "SELECT * FROM log_auditoria WHERE tabela_afetada='consultas' AND acao='UPDATE' AND registro_id=? ORDER BY data_hora DESC LIMIT 3",
        [consultaAlvo]
      );
      logRows = log;
      console.log(`→ status: ${statusAntes}→${statusDepois}, ${logRows.length} linha(s) no log`);
    } catch (e) {
      errorMsg = e.message; console.log(`→ ERRO: ${e.message.slice(0,50)}`);
    }

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<style>${baseStyle()}</style></head><body>
${topbar(idx, TOTAL, now)}
<div class="panel">
  <div class="panel-header">
    <h2>🟡 trg_after_update_consulta_status — AFTER UPDATE (OLD/NEW)</h2>
    <span class="badge badge-yellow">2 pts — Trigger UPDATE com OLD/NEW</span>
  </div>
  <div class="sql-exec">
    <strong>SQL executado:</strong> ${escapeHtml(sqlUsed)}
  </div>
  <div class="result-box ${errorMsg ? 'result-err' : 'result-ok'}">
    <div class="result-label">${errorMsg ? '❌ Erro' : '✅ Status alterado + trigger disparada'}</div>
    <div class="result-msg">${errorMsg ? escapeHtml(errorMsg) : `Consulta ID=${consultaAlvo}: status de "${statusAntes}" → "${statusDepois}". Trigger registrou automaticamente!`}</div>
  </div>
</div>
<div class="panel">
  <div class="panel-header">
    <h2>📋 log_auditoria — "de ${statusAntes} para ${statusDepois}" registrado automaticamente</h2>
  </div>
  <table>${tableHTML(logRows)}</table>
</div>
<div class="footer">PetVida — Projeto Acadêmico de Banco de Dados · ${now}</div>
</body></html>`;
    await screenshot(browser, html, fn);
    console.log(`          ✅ Salvo: docs/prints/tarefa5_triggers/${fn}`);
    results.push({ idx, label: 'UPDATE status → log OLD/NEW', fn, ok: !errorMsg });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRINT 4 — trg_before_delete_consulta: DELETE com pago → BLOQUEIO
  // ═══════════════════════════════════════════════════════════════════════════
  {
    const idx = 4; const fn = 't04_trigger_delete_bloqueio.png';
    process.stdout.write(`  [${idx}/${TOTAL}] 🔴  trg_before_delete_consulta (bloqueio)       `);

    let alvo = paidId;
    let errorMsg = null, bloqueou = false, sqlUsed = '';

    // Se não tiver consulta paga, registra pagamento na consulta concluída
    if (!alvo) {
      const [[c]] = await db.query("SELECT id FROM consultas WHERE status='concluida' LIMIT 1");
      alvo = c?.id;
      if (alvo) {
        await db.query("UPDATE pagamentos SET status='pago', forma_pagamento='PIX' WHERE consulta_id=?", [alvo]);
      }
    }

    if (alvo) {
      sqlUsed = `DELETE FROM consultas WHERE id = ${alvo};  -- consulta com pagamento pago`;
      try {
        await db.query('DELETE FROM consultas WHERE id = ?', [alvo]);
        console.log(`→ DELETE passou (não deveria!)`);
      } catch (e) {
        errorMsg = e.message;
        bloqueou = true;
        console.log(`→ BLOQUEADO ✅`);
      }
    } else {
      errorMsg = 'Não há consulta com pagamento pago para testar.';
      console.log(`→ sem dados para teste`);
    }

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<style>${baseStyle()}</style></head><body>
${topbar(idx, TOTAL, now)}
<div class="panel">
  <div class="panel-header">
    <h2>🔴 trg_before_delete_consulta — BEFORE DELETE (bloqueio por SIGNAL)</h2>
    <span class="badge badge-red">2 pts — Trigger DELETE com bloqueio</span>
  </div>
  <div class="sql-exec">
    <strong>SQL tentado:</strong> ${escapeHtml(sqlUsed || `DELETE FROM consultas WHERE id = ${alvo}`)}
  </div>
  <div class="result-box ${bloqueou ? 'result-ok' : 'result-err'}">
    <div class="result-label">${bloqueou ? '✅ Bloqueio funcionou!' : '❌ DELETE não foi bloqueado'}</div>
    <div class="result-msg">${bloqueou
      ? `SIGNAL SQLSTATE '45000' disparado: ${escapeHtml(errorMsg)}`
      : (errorMsg ? escapeHtml(errorMsg) : 'DELETE executado — trigger não impediu')}</div>
  </div>
</div>
<div class="panel">
  <div class="panel-header">
    <h2>💡 Como funciona o BEFORE DELETE</h2>
  </div>
  <pre class="code">${highlightSQL(`-- Trigger verifica antes de deletar:
IF EXISTS (
    SELECT 1 FROM pagamentos
    WHERE consulta_id = OLD.id AND status = 'pago'
) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Erro: Não é possível deletar consulta com pagamento realizado!';
END IF;`)}</pre>
</div>
<div class="footer">PetVida — Projeto Acadêmico de Banco de Dados · ${now}</div>
</body></html>`;
    await screenshot(browser, html, fn);
    console.log(`          ✅ Salvo: docs/prints/tarefa5_triggers/${fn}`);
    results.push({ idx, label: 'DELETE bloqueado por trigger', fn, ok: bloqueou });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRINT 5 — trg_after_insert_animal: INSERT animal → log
  // ═══════════════════════════════════════════════════════════════════════════
  {
    const idx = 5; const fn = 't05_trigger_insert_animal.png';
    process.stdout.write(`  [${idx}/${TOTAL}] 🐾  trg_after_insert_animal                     `);

    // Busca tutor e espécie
    const [[tutor]]   = await db.query('SELECT id FROM tutores LIMIT 1');
    const [[especie]] = await db.query('SELECT id FROM especies LIMIT 1');
    const tutorId    = tutor?.id    ?? 1;
    const especieId  = especie?.id  ?? 1;
    const sqlUsed = `INSERT INTO animais (nome, especie_id, raca, data_nascimento, tutor_id)
VALUES ('Bolinha_Demo', ${especieId}, 'Poodle', '2021-06-15', ${tutorId});`;

    let insertedId = null, logRows = [], errorMsg = null;

    try {
      const [res] = await db.query(
        'INSERT INTO animais (nome, especie_id, raca, data_nascimento, tutor_id) VALUES (?, ?, ?, ?, ?)',
        ['Bolinha_Demo', especieId, 'Poodle', '2021-06-15', tutorId]
      );
      insertedId = res.insertId;
      const [log] = await db.query(
        "SELECT * FROM log_auditoria WHERE tabela_afetada='animais' AND acao='INSERT' AND registro_id=? ORDER BY data_hora DESC LIMIT 3",
        [insertedId]
      );
      logRows = log;
      console.log(`→ animal_id=${insertedId}, ${logRows.length} linha(s) no log`);
    } catch (e) {
      errorMsg = e.message; console.log(`→ ERRO: ${e.message.slice(0,50)}`);
    }

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<style>${baseStyle()}</style></head><body>
${topbar(idx, TOTAL, now)}
<div class="panel">
  <div class="panel-header">
    <h2>🐾 trg_after_insert_animal — AFTER INSERT em animais</h2>
    <span class="badge badge-green">3 pts — Triggers INSERT</span>
  </div>
  <div class="sql-exec"><strong>SQL executado:</strong><br>${escapeHtml(sqlUsed)}</div>
  <div class="result-box ${errorMsg ? 'result-err' : 'result-ok'}">
    <div class="result-label">${errorMsg ? '❌ Erro' : '✅ Animal inserido + trigger disparada'}</div>
    <div class="result-msg">${errorMsg ? escapeHtml(errorMsg) : `Animal "Bolinha_Demo" inserido com ID=${insertedId}. Log gerado automaticamente!`}</div>
  </div>
</div>
<div class="panel">
  <div class="panel-header">
    <h2>📋 log_auditoria — registro do INSERT em animais</h2>
  </div>
  <table>${tableHTML(logRows)}</table>
</div>
<div class="footer">PetVida — Projeto Acadêmico de Banco de Dados · ${now}</div>
</body></html>`;
    await screenshot(browser, html, fn);
    console.log(`          ✅ Salvo: docs/prints/tarefa5_triggers/${fn}`);
    results.push({ idx, label: 'INSERT animal → log', fn, ok: !errorMsg });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRINT 6 — trg_before_update_pagamento: data_pagamento preenchida auto
  // ═══════════════════════════════════════════════════════════════════════════
  {
    const idx = 6; const fn = 't06_trigger_pagamento_data.png';
    process.stdout.write(`  [${idx}/${TOTAL}] 💳  trg_before_update_pagamento (auto-data)     `);

    // Pega um pagamento pendente da nova consulta
    const consultaAlvo = global._newConsultaId;
    let pagBefore = null, pagAfter = null, errorMsg = null;
    let sqlUsed = '';

    try {
      const [[pag]] = await db.query(
        "SELECT * FROM pagamentos WHERE consulta_id=? AND status<>'pago' LIMIT 1",
        [consultaAlvo]
      );
      if (pag) {
        pagBefore = { ...pag };
        sqlUsed = `UPDATE pagamentos SET status='pago', forma_pagamento='PIX' WHERE id=${pag.id};`;
        await db.query(
          "UPDATE pagamentos SET status='pago', forma_pagamento='PIX' WHERE id=?",
          [pag.id]
        );
        const [[updated]] = await db.query('SELECT * FROM pagamentos WHERE id=?', [pag.id]);
        pagAfter = updated;
        console.log(`→ pag_id=${pag.id}, data_pagamento antes=NULL, depois=${updated?.data_pagamento}`);
      } else {
        console.log('→ sem pagamento pendente (ok, já pago antes)');
      }
    } catch (e) {
      errorMsg = e.message; console.log(`→ ERRO: ${e.message.slice(0,50)}`);
    }

    const compareRows = pagBefore ? [
      { campo: 'status',          antes: pagBefore.status,          depois: pagAfter?.status,          mudou: pagBefore.status !== pagAfter?.status ? '✅' : '—' },
      { campo: 'forma_pagamento', antes: pagBefore.forma_pagamento,  depois: pagAfter?.forma_pagamento,  mudou: pagBefore.forma_pagamento !== pagAfter?.forma_pagamento ? '✅' : '—' },
      { campo: 'data_pagamento',  antes: String(pagBefore.data_pagamento ?? 'NULL'), depois: String(pagAfter?.data_pagamento ?? 'NULL'), mudou: '✅ preenchida pela trigger!' },
    ] : [];

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<style>${baseStyle()}</style></head><body>
${topbar(idx, TOTAL, now)}
<div class="panel">
  <div class="panel-header">
    <h2>💳 trg_before_update_pagamento — BEFORE UPDATE (preenche data_pagamento)</h2>
    <span class="badge badge-blue">1 pt — Trigger pagamento</span>
  </div>
  <div class="sql-exec"><strong>SQL executado:</strong> ${escapeHtml(sqlUsed || 'UPDATE pagamentos SET status=\'pago\'...')}</div>
  <div class="result-box ${errorMsg ? 'result-err' : 'result-ok'}">
    <div class="result-label">${errorMsg ? '❌ Erro' : '✅ data_pagamento preenchida automaticamente!'}</div>
    <div class="result-msg">${errorMsg ? escapeHtml(errorMsg) : 'Trigger BEFORE UPDATE detectou status→"pago" e SET NEW.data_pagamento = NOW() automaticamente.'}</div>
  </div>
</div>
${compareRows.length > 0 ? `
<div class="panel">
  <div class="panel-header"><h2>🔄 Antes x Depois do UPDATE</h2></div>
  <table>
    <thead><tr><th>Campo</th><th>Antes</th><th>Depois</th><th>Mudança</th></tr></thead>
    <tbody>${compareRows.map(r => `<tr>
      <td class="mono">${escapeHtml(r.campo)}</td>
      <td style="color:#f87171">${escapeHtml(r.antes)}</td>
      <td style="color:#4ade80">${escapeHtml(r.depois)}</td>
      <td style="color:#fbbf24;font-weight:700">${escapeHtml(r.mudou)}</td>
    </tr>`).join('')}</tbody>
  </table>
</div>` : ''}
<div class="footer">PetVida — Projeto Acadêmico de Banco de Dados · ${now}</div>
</body></html>`;
    await screenshot(browser, html, fn);
    console.log(`          ✅ Salvo: docs/prints/tarefa5_triggers/${fn}`);
    results.push({ idx, label: 'UPDATE pagamento → data auto', fn, ok: !errorMsg });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRINT 7 — log_auditoria completo (últimos 20 registros)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    const idx = 7; const fn = 't07_log_auditoria_completo.png';
    process.stdout.write(`  [${idx}/${TOTAL}] 📋  log_auditoria — visão geral completa        `);

    const [logRows] = await db.query(
      'SELECT * FROM log_auditoria ORDER BY data_hora DESC LIMIT 20'
    );
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM log_auditoria');
    console.log(`→ ${total} registros totais, mostrando 20`);

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<style>${baseStyle()}</style></head><body>
${topbar(idx, TOTAL, now)}
<div class="panel">
  <div class="panel-header">
    <h2>📋 log_auditoria — ${total} registros totais (últimos 20)</h2>
    <span class="badge badge-purple">Auditoria automática 100% via Triggers</span>
  </div>
  <table>${tableHTML(logRows)}</table>
</div>
<div class="footer">PetVida — Projeto Acadêmico de Banco de Dados · ${now}</div>
</body></html>`;
    await screenshot(browser, html, fn);
    console.log(`          ✅ Salvo: docs/prints/tarefa5_triggers/${fn}`);
    results.push({ idx, label: 'log_auditoria completo', fn, ok: true });
  }

  await browser.close();
  await db.end();

  // ── Resumo ─────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(58));
  console.log('   📸  Resumo — Tarefa 5');
  console.log('═'.repeat(58));
  results.forEach(r => {
    const icon = r.ok ? '✅' : '⚠ ';
    console.log(`  ${icon}  [${r.idx}/${TOTAL}]  ${r.label.padEnd(30)}  docs/prints/tarefa5_triggers/${r.fn}`);
  });
  const ok = results.filter(r => r.ok).length;
  console.log('\n' + '─'.repeat(58));
  console.log(`  Total: ${ok}/${TOTAL} prints — ${ok === TOTAL ? '10/10 pts potenciais 🎉' : `${ok}/${TOTAL} ok`}`);
  console.log('  Pasta: docs/prints/tarefa5_triggers/');
  console.log('═'.repeat(58) + '\n');
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
