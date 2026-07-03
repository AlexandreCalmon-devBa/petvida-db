/**
 * scripts/gerar_prints_security.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Gera prints da Tarefa 6: verificação dos GRANTs dos 4 perfis de usuário,
 * exibindo as permissões concedidas no MySQL e o conteúdo do security.sql.
 *
 * Pré-requisito: MySQL rodando com o banco petvida e security.sql executado.
 * Uso:           node scripts/gerar_prints_security.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

require('dotenv').config();

const puppeteer = require('puppeteer');
const fs        = require('fs');
const path      = require('path');

const PRINTS_DIR = path.join(__dirname, '..', 'docs', 'prints');
if (!fs.existsSync(PRINTS_DIR)) fs.mkdirSync(PRINTS_DIR, { recursive: true });

// ── Lê o conteúdo do security.sql ─────────────────────────────────────────

const SECURITY_SQL_PATH = path.join(__dirname, '..', 'database', 'security.sql');
const securitySqlContent = fs.readFileSync(SECURITY_SQL_PATH, 'utf-8');

// ── Definição das verificações dos 4 perfis ───────────────────────────────

const PROFILES = [
  {
    user:   'recepcionista',
    icon:   '🧾',
    color:  '#3b82f6',
    desc:   'SELECT/INSERT em tutores, animais, consultas, especies. EXECUTE em sp_agendar e sp_cadastrar. SEM DELETE, SEM pagamentos.',
    badge:  '4 pts — GRANTs dos Perfis',
  },
  {
    user:   'veterinario',
    icon:   '🩺',
    color:  '#10b981',
    desc:   'SELECT em tudo. UPDATE(diagnostico, status) em consultas. EXECUTE em sp_concluir. SEM INSERT/DELETE.',
    badge:  '4 pts — GRANTs dos Perfis',
  },
  {
    user:   'gerente',
    icon:   '📋',
    color:  '#f59e0b',
    desc:   'SELECT/INSERT/UPDATE em tudo. DELETE apenas em consultas. EXECUTE em todas as procedures.',
    badge:  '2 pts — Menor Privilégio',
  },
  {
    user:   'admin',
    icon:   '🔑',
    color:  '#ef4444',
    desc:   'ALL PRIVILEGES em petvida.* WITH GRANT OPTION. Acesso total ao banco.',
    badge:  '2 pts — Menor Privilégio',
  },
];

// ── Seções do security.sql ─────────────────────────────────────────────────

const SECTIONS = [
  {
    index:    5,
    title:    'security.sql — GRANTs Completos e REVOKE',
    icon:     '📄',
    badge:    '1 pt — REVOKE',
    filename: 's05_security_sql_grants.png',
    content:  securitySqlContent,
  },
];

// ── HTML do print de perfil ───────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function highlightSQL(sql) {
  return escapeHtml(sql)
    .replace(/\b(GRANT|REVOKE|CREATE|DROP|USE|FLUSH|DELIMITER|BEGIN|END|CALL|SELECT|INSERT|UPDATE|DELETE|FROM|TO|ON|ALL|PRIVILEGES|EXECUTE|PROCEDURE|WITH|OPTION|IF|NOT|EXISTS|IDENTIFIED|BY|USAGE|INTO|VALUES|WHERE|AND|OR|START|TRANSACTION|COMMIT)\b/gi,
      m => `<span class="kw">${m.toUpperCase()}</span>`)
    .replace(/\b(ON|FROM|TO)\b/gi, m => `<span class="kw">${m.toUpperCase()}</span>`)
    .replace(/'([^']*)'/g, m => `<span class="str">${m}</span>`)
    .replace(/--[^\n]*/g, m => `<span class="cm">${m}</span>`)
    .replace(/\/\*[\s\S]*?\*\//g, m => `<span class="cm">${m}</span>`)
    .replace(/\b(\d+(?:\.\d+)?)\b/g, m => `<span class="num">${m}</span>`);
}

function buildProfileHTML({ index, total, user, icon, color, desc, badge, grants, rowCount, duration }) {
  const now = new Date().toLocaleString('pt-BR');

  const thCells = grants.length > 0
    ? Object.keys(grants[0]).map(k => `<th>${escapeHtml(k)}</th>`).join('')
    : '';

  const trRows = grants.length > 0
    ? grants.map((row, i) => {
        const cols = Object.keys(row);
        const tds  = cols.map(col => {
          const val = row[col];
          const cls = val === null ? 'null' : /^\d/.test(String(val)) ? 'num' : '';
          return `<td class="${cls}">${escapeHtml(val === null ? 'NULL' : String(val))}</td>`;
        }).join('');
        return `<tr class="${i % 2 === 0 ? 'even' : 'odd'}">${tds}</tr>`;
      }).join('\n')
    : '<tr><td colspan="10" class="empty">Nenhuma permissão encontrada — execute security.sql primeiro.</td></tr>';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #0d1117; color: #c9d1d9; padding: 24px 28px; }

    .topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .brand { font-size: 12px; color: #586069; }
    .brand strong { color: #a78bfa; }
    .counter { font-size: 11px; font-weight: 700; background: #1a1040; color: #a78bfa; border: 1px solid #4c1d95; padding: 3px 10px; border-radius: 20px; }

    .profile-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      background: #161b22; border: 1px solid #21262d; border-radius: 10px 10px 0 0;
      padding: 16px 20px; border-bottom: 2px solid ${color};
    }
    .profile-title { display: flex; align-items: center; gap: 12px; }
    .icon { font-size: 28px; }
    .title-text h2 { font-size: 16px; font-weight: 700; color: #e6edf3; margin-bottom: 4px; }
    .user-badge {
      font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700;
      background: #0d2d0d; color: ${color}; border: 1px solid ${color};
      padding: 2px 10px; border-radius: 6px;
    }
    .desc-text { font-size: 12px; color: #8b949e; margin-top: 6px; max-width: 600px; line-height: 1.5; }
    .exec-meta { text-align: right; font-size: 11px; color: #586069; line-height: 1.8; }
    .exec-meta .hl { font-weight: 700; color: #58a6ff; }

    .criteria-bar {
      background: #111519; border: 1px solid #21262d; border-top: none;
      padding: 8px 20px; display: flex; align-items: center; gap: 8px;
    }
    .crit-badge {
      font-size: 11px; font-weight: 700; background: #0d2d0d; color: #4ade80;
      border: 1px solid #166534; padding: 2px 8px; border-radius: 12px;
    }

    .table-wrapper { border: 1px solid #21262d; border-top: none; border-radius: 0 0 10px 10px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
    thead { background: #1c2128; }
    thead th { padding: 9px 12px; text-align: left; font-weight: 700; font-size: 10px; color: #8b949e; text-transform: uppercase; letter-spacing: .05em; border-right: 1px solid #21262d; white-space: nowrap; }
    thead th:last-child { border-right: none; }
    tbody tr.even { background: #0d1117; }
    tbody tr.odd  { background: #111519; }
    tbody td { padding: 7px 12px; border-right: 1px solid #21262d; border-top: 1px solid #21262d; color: #c9d1d9; font-family: 'JetBrains Mono', monospace; font-size: 11px; word-break: break-word; max-width: 300px; }
    tbody td:last-child { border-right: none; }
    tbody td.null { color: #586069; font-style: italic; font-family: 'Inter', sans-serif; }
    tbody td.empty { text-align: center; color: #586069; font-style: italic; padding: 20px; font-family: 'Inter', sans-serif; }

    .footer { font-size: 10px; color: #2d333b; text-align: center; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="brand">🐾 <strong>PetVida</strong> &nbsp;•&nbsp; Tarefa 6 — Segurança e Backups &nbsp;•&nbsp; ${now}</div>
    <span class="counter">Perfil ${index} / ${total}</span>
  </div>

  <div class="profile-header">
    <div class="profile-title">
      <span class="icon">${icon}</span>
      <div class="title-text">
        <h2>Perfil: ${escapeHtml(user)}</h2>
        <span class="user-badge">'${escapeHtml(user)}'@'localhost'</span>
        <p class="desc-text">${escapeHtml(desc)}</p>
      </div>
    </div>
    <div class="exec-meta">
      <div><span class="hl">${rowCount} permissão${rowCount !== 1 ? 'ões' : ''}</span> concedida${rowCount !== 1 ? 's' : ''}</div>
      <div>Tempo: <span class="hl">${duration} ms</span></div>
      <div>${now}</div>
    </div>
  </div>

  <div class="criteria-bar">
    <span style="font-size:11px;color:#8b949e;">SHOW GRANTS FOR '${escapeHtml(user)}'@'localhost';</span>
    &nbsp;•&nbsp;
    <span class="crit-badge">${escapeHtml(badge)}</span>
  </div>

  <div class="table-wrapper">
    <table>
      <thead><tr>${thCells || '<th>Grants</th>'}</tr></thead>
      <tbody>${trRows}</tbody>
    </table>
  </div>
  <div class="footer">PetVida — Projeto Acadêmico de Banco de Dados · ${now}</div>
</body>
</html>`;
}

function buildSQLHTML({ index, total, title, icon, badge, content }) {
  const now = new Date().toLocaleString('pt-BR');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #0d1117; color: #c9d1d9; padding: 24px 28px; }
    .topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .brand { font-size: 12px; color: #586069; }
    .brand strong { color: #a78bfa; }
    .counter { font-size: 11px; font-weight: 700; background: #1a1040; color: #a78bfa; border: 1px solid #4c1d95; padding: 3px 10px; border-radius: 20px; }
    .panel { background: #161b22; border: 1px solid #21262d; border-radius: 10px; overflow: hidden; }
    .panel-header { display: flex; align-items: center; justify-content: space-between; background: #1c2128; border-bottom: 1px solid #21262d; padding: 12px 18px; }
    .panel-header h2 { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #e6edf3; }
    .badge { font-size: 11px; font-weight: 700; background: #0d2d0d; color: #4ade80; border: 1px solid #166534; padding: 2px 8px; border-radius: 12px; }
    pre { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; line-height: 1.7; padding: 18px 20px; white-space: pre-wrap; word-break: break-word; }
    .kw  { color: #ff7b72; font-weight: 700; }
    .str { color: #a5d6ff; }
    .num { color: #79c0ff; }
    .cm  { color: #8b949e; font-style: italic; }
    .footer { font-size: 10px; color: #2d333b; text-align: center; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="brand">🐾 <strong>PetVida</strong> &nbsp;•&nbsp; Tarefa 6 — Segurança &nbsp;•&nbsp; ${now}</div>
    <span class="counter">Print ${index} / ${total}</span>
  </div>
  <div class="panel">
    <div class="panel-header">
      <h2>${icon} ${escapeHtml(title)}</h2>
      <span class="badge">${escapeHtml(badge)}</span>
    </div>
    <pre>${highlightSQL(content)}</pre>
  </div>
  <div class="footer">PetVida — Projeto Acadêmico de Banco de Dados · ${now}</div>
</body>
</html>`;
}

function buildBackupHTML({ index, total, backupFiles }) {
  const now = new Date().toLocaleString('pt-BR');
  const fileRows = backupFiles.map((f, i) => {
    const sizeKB = (f.size / 1024).toFixed(1);
    return `<tr class="${i % 2 === 0 ? 'even' : 'odd'}">
      <td>${escapeHtml(f.name)}</td>
      <td class="num">${sizeKB} KB</td>
      <td>${escapeHtml(f.date)}</td>
    </tr>`;
  }).join('\n');

  const backupSh = fs.readFileSync(path.join(__dirname, '..', 'database', 'backup.sh'), 'utf-8');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #0d1117; color: #c9d1d9; padding: 24px 28px; }
    .topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .brand { font-size: 12px; color: #586069; }
    .brand strong { color: #a78bfa; }
    .counter { font-size: 11px; font-weight: 700; background: #1a1040; color: #a78bfa; border: 1px solid #4c1d95; padding: 3px 10px; border-radius: 20px; }

    .panel { background: #161b22; border: 1px solid #21262d; border-radius: 10px; overflow: hidden; margin-bottom: 14px; }
    .panel-header { display: flex; align-items: center; justify-content: space-between; background: #1c2128; border-bottom: 1px solid #21262d; padding: 10px 16px; }
    .panel-header h2 { font-size: 13px; color: #e6edf3; display: flex; align-items: center; gap: 8px; }
    .badge { font-size: 11px; font-weight: 700; background: #0d2d0d; color: #4ade80; border: 1px solid #166534; padding: 2px 8px; border-radius: 12px; }

    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    thead { background: #1c2128; }
    thead th { padding: 9px 14px; text-align: left; font-weight: 700; font-size: 10px; color: #8b949e; text-transform: uppercase; letter-spacing: .05em; border-right: 1px solid #21262d; }
    thead th:last-child { border-right: none; }
    tbody tr.even { background: #0d1117; }
    tbody tr.odd  { background: #111519; }
    tbody td { padding: 8px 14px; border-right: 1px solid #21262d; border-top: 1px solid #21262d; font-family: 'JetBrains Mono', monospace; font-size: 11px; }
    tbody td:last-child { border-right: none; }
    tbody td.num { color: #79c0ff; text-align: right; }

    pre { font-family: 'JetBrains Mono', monospace; font-size: 11px; line-height: 1.65; padding: 16px 18px; white-space: pre-wrap; color: #c9d1d9; }
    .sh-kw { color: #ff7b72; font-weight: 700; }
    .sh-str { color: #a5d6ff; }
    .sh-cm  { color: #8b949e; font-style: italic; }
    .sh-var { color: #d2a8ff; }

    .footer { font-size: 10px; color: #2d333b; text-align: center; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="brand">🐾 <strong>PetVida</strong> &nbsp;•&nbsp; Tarefa 6 — Backup &nbsp;•&nbsp; ${now}</div>
    <span class="counter">Print ${index} / ${total}</span>
  </div>

  <div class="panel">
    <div class="panel-header">
      <h2>💾 Arquivos de Backup Gerados — backups/</h2>
      <span class="badge">3 pts — Backup Script + Arquivo</span>
    </div>
    <table>
      <thead><tr><th>Arquivo</th><th>Tamanho</th><th>Data/Hora</th></tr></thead>
      <tbody>${fileRows || '<tr><td colspan="3" style="text-align:center;color:#586069;padding:16px;">Nenhum arquivo encontrado</td></tr>'}</tbody>
    </table>
  </div>

  <div class="panel">
    <div class="panel-header">
      <h2>📜 database/backup.sh — Script de Backup Automático</h2>
    </div>
    <pre>${highlightBash(backupSh)}</pre>
  </div>

  <div class="footer">PetVida — Projeto Acadêmico de Banco de Dados · ${now}</div>
</body>
</html>`;
}

function highlightBash(code) {
  return escapeHtml(code)
    .replace(/#[^\n]*/g, m => `<span class="sh-cm">${m}</span>`)
    .replace(/\b(if|then|else|fi|while|do|done|for|in|case|esac|function|return|exit|echo|mkdir|rm|cd|shift|set)\b/g,
      m => `<span class="sh-kw">${m}</span>`)
    .replace(/\b(mysqldump|date|du|cut)\b/g, m => `<span class="sh-kw">${m}</span>`)
    .replace(/\$\{?[\w]+\}?/g, m => `<span class="sh-var">${m}</span>`)
    .replace(/"([^"]*)"/g, m => `<span class="sh-str">${m}</span>`)
    .replace(/'([^']*)'/g, m => `<span class="sh-str">${m}</span>`);
}

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
  console.log('   🐾  PetVida Tarefa 6 — Segurança e Backups');
  console.log('═'.repeat(56));

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

  const TOTAL = PROFILES.length + 1 + 1; // 4 perfis + security.sql + backup
  const results = [];

  // ── 1–4: Prints dos perfis via SHOW GRANTS ─────────────────────────────

  for (let i = 0; i < PROFILES.length; i++) {
    const profile = PROFILES[i];
    const index   = i + 1;
    const filename = `s0${index}_perfil_${profile.user}.png`;

    process.stdout.write(`  [${index}/${TOTAL}] ${profile.icon}  Perfil: ${profile.user.padEnd(18)} `);
    const start = Date.now();

    let grants = [];
    try {
      const [rows] = await db.query(`SHOW GRANTS FOR '${profile.user}'@'localhost'`);
      grants = rows.map(row => {
        const key = Object.keys(row)[0];
        return { Grants: row[key] };
      });
      const duration = Date.now() - start;
      console.log(`→ ${grants.length} grant${grants.length !== 1 ? 's' : ''} (${duration}ms)`);

      const html = buildProfileHTML({
        index, total: TOTAL,
        ...profile,
        grants,
        rowCount: grants.length,
        duration,
      });

      await screenshot(browser, html, filename);
      console.log(`          ✅ Salvo: docs/prints/${filename}`);
      results.push({ index, label: `Perfil ${profile.user}`, file: filename, ok: true });
    } catch (err) {
      const duration = Date.now() - start;
      console.log(`→ ERRO (${duration}ms) — ${err.message.slice(0, 60)}`);

      // Gera print de erro informando que o usuário não existe
      const html = buildProfileHTML({
        index, total: TOTAL,
        ...profile,
        grants: [],
        rowCount: 0,
        duration: Date.now() - start,
      });
      await screenshot(browser, html, filename);
      console.log(`          ⚠  Salvo com aviso: docs/prints/${filename}`);
      results.push({ index, label: `Perfil ${profile.user}`, file: filename, ok: false, warn: true });
    }
  }

  // ── 5: Print do security.sql completo ─────────────────────────────────

  {
    const index    = PROFILES.length + 1;
    const filename = 's05_security_sql.png';
    process.stdout.write(`  [${index}/${TOTAL}] 📄  security.sql completo              `);

    const html = buildSQLHTML({
      index, total: TOTAL,
      title:   'database/security.sql — GRANT/REVOKE por Perfil',
      icon:    '📄',
      badge:   '1 pt — REVOKE da recepcionista',
      content: securitySqlContent,
    });
    await screenshot(browser, html, filename);
    console.log(`→ ok`);
    console.log(`          ✅ Salvo: docs/prints/${filename}`);
    results.push({ index, label: 'security.sql', file: filename, ok: true });
  }

  // ── 6: Print do backup ─────────────────────────────────────────────────

  {
    const index    = PROFILES.length + 2;
    const filename = 's06_backup.png';
    process.stdout.write(`  [${index}/${TOTAL}] 💾  Backup + backup.sh                  `);

    const backupDir = path.join(__dirname, '..', 'backups');
    const backupFiles = fs.existsSync(backupDir)
      ? fs.readdirSync(backupDir)
          .filter(f => f.endsWith('.sql'))
          .map(f => {
            const stat = fs.statSync(path.join(backupDir, f));
            return {
              name: f,
              size: stat.size,
              date: stat.mtime.toLocaleString('pt-BR'),
            };
          })
          .sort((a, b) => b.date.localeCompare(a.date))
      : [];

    const html = buildBackupHTML({ index, total: TOTAL, backupFiles });
    await screenshot(browser, html, filename);
    console.log(`→ ${backupFiles.length} arquivo${backupFiles.length !== 1 ? 's' : ''}`);
    console.log(`          ✅ Salvo: docs/prints/${filename}`);
    results.push({ index, label: 'Backup', file: filename, ok: true });
  }

  await browser.close();
  await db.end();

  // ── Resumo ─────────────────────────────────────────────────────────────

  console.log('\n' + '═'.repeat(56));
  console.log('   📸  Resumo — Tarefa 6');
  console.log('═'.repeat(56));
  results.forEach(r => {
    const icon = r.ok ? '✅' : r.warn ? '⚠ ' : '❌';
    console.log(`  ${icon}  [${r.index}/${TOTAL}]  ${r.label.padEnd(20)}  docs/prints/${r.file}`);
  });
  const ok = results.filter(r => r.ok || r.warn).length;
  console.log('\n' + '─'.repeat(56));
  console.log(`  Total: ${ok}/${TOTAL} prints gerados`);
  console.log('  Pasta: docs/prints/');
  console.log('═'.repeat(56) + '\n');

  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
