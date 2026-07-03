/**
 * scripts/gerar_prints.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Gera automaticamente prints estilo Thunder Client dos 8 endpoints da Tarefa 8.
 * Os prints são salvos em: docs/prints/tarefa8_api/
 *
 * Pré-requisito: MySQL rodando com o banco petvida populado e .env configurado.
 * Uso:           node scripts/gerar_prints.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

require('dotenv').config();

const express    = require('express');
const supertest  = require('supertest');
const puppeteer  = require('puppeteer');
const fs         = require('fs');
const path       = require('path');

// ─── Diretório de saída ───────────────────────────────────────────────────────

const PRINTS_DIR = path.join(__dirname, '..', 'docs', 'prints', 'tarefa8_api');
if (!fs.existsSync(PRINTS_DIR)) fs.mkdirSync(PRINTS_DIR, { recursive: true });

// ─── App Express (sem .listen) ────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use('/', require('../src/app'));
const api = supertest(app);

// ─── Cores dos métodos HTTP ───────────────────────────────────────────────────

const METHOD_COLOR = {
  GET:    '#61affe',
  POST:   '#49cc90',
  PUT:    '#fca130',
  DELETE: '#f93e3e',
};

// ─── Syntax highlighting para JSON ───────────────────────────────────────────

function highlight(json) {
  const safe = String(json)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return safe.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          // chave JSON — remove o ":" final para colorir só a chave
          return `<span class="key">${match.slice(0, -1)}</span>:`;
        }
        return `<span class="string">${match}</span>`;
      }
      if (/true|false/.test(match)) return `<span class="boolean">${match}</span>`;
      if (/null/.test(match))        return `<span class="null_">${match}</span>`;
      return `<span class="number">${match}</span>`;
    }
  );
}

// ─── Gera o HTML do print ─────────────────────────────────────────────────────

function buildHTML({ index, method, url, requestBody, responseBody, statusCode, duration, description }) {
  const statusColor  = statusCode < 300 ? '#4ade80' : statusCode < 500 ? '#fbbf24' : '#f87171';
  const methodColor  = METHOD_COLOR[method] || '#94a3b8';
  const now          = new Date().toLocaleString('pt-BR');
  const reqPretty    = requestBody  ? JSON.stringify(requestBody,  null, 2) : null;
  const resPretty    = JSON.stringify(responseBody, null, 2);

  const requestPanel = reqPretty ? `
    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">📤 Body — application/json</span>
      </div>
      <pre>${highlight(reqPretty)}</pre>
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: #0f1117;
      color: #e2e8f0;
      padding: 28px 32px;
    }

    /* ── Topo ── */
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: #64748b;
    }
    .brand .paw  { font-size: 20px; }
    .brand .name { font-weight: 700; color: #a78bfa; font-size: 14px; }
    .counter {
      font-size: 11px;
      font-weight: 700;
      background: #1e1b4b;
      color: #a78bfa;
      border: 1px solid #4c1d95;
      padding: 3px 10px;
      border-radius: 20px;
    }

    /* ── Descrição ── */
    .desc {
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 14px;
      padding: 8px 12px;
      background: #1e2229;
      border-left: 3px solid #7c3aed;
      border-radius: 0 6px 6px 0;
    }

    /* ── Barra de request ── */
    .request-bar {
      display: flex;
      align-items: center;
      background: #1a1d27;
      border: 1px solid #2d3748;
      border-radius: 10px;
      padding: 10px 14px;
      gap: 12px;
      margin-bottom: 14px;
    }
    .method {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 12px;
      padding: 5px 13px;
      border-radius: 6px;
      color: #fff;
      background: ${methodColor};
      min-width: 58px;
      text-align: center;
      letter-spacing: .04em;
    }
    .url-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      flex: 1;
    }
    .url-base { color: #64748b; }
    .url-path { color: #e2e8f0; }
    .send-btn {
      background: #7c3aed;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 6px 18px;
      font-size: 12px;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
    }

    /* ── Painéis ── */
    .panel {
      background: #1a1d27;
      border: 1px solid #2d3748;
      border-radius: 10px;
      margin-bottom: 12px;
      overflow: hidden;
    }
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 9px 16px;
      border-bottom: 1px solid #2d3748;
      background: #13151d;
    }
    .panel-title {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: .07em;
    }
    .response-meta {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .status-code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 700;
      color: ${statusColor};
    }
    .duration {
      font-size: 11px;
      color: #64748b;
    }

    /* ── Código ── */
    pre {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12.5px;
      line-height: 1.75;
      padding: 16px 18px;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 500px;
      overflow-y: auto;
    }
    .key     { color: #c084fc; }
    .string  { color: #86efac; }
    .number  { color: #93c5fd; }
    .boolean { color: #fb923c; }
    .null_   { color: #94a3b8; }

    /* ── Rodapé ── */
    .footer {
      font-size: 11px;
      color: #374151;
      text-align: center;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="brand">
      <span class="paw">🐾</span>
      <span class="name">PetVida API</span>
      <span style="color:#374151">•</span>
      <span>Thunder Client</span>
      <span style="color:#374151">•</span>
      <span>${now}</span>
    </div>
    <span class="counter">Endpoint ${index} / 8</span>
  </div>

  <p class="desc">${description}</p>

  <div class="request-bar">
    <span class="method">${method}</span>
    <span class="url-text">
      <span class="url-base">http://localhost:3000</span><span class="url-path">${url}</span>
    </span>
    <button class="send-btn">Send</button>
  </div>

  ${requestPanel}

  <div class="panel">
    <div class="panel-header">
      <span class="panel-title">📥 Response Body</span>
      <div class="response-meta">
        <span class="status-code">● ${statusCode} ${httpStatusText(statusCode)}</span>
        <span class="duration">⏱ ${duration} ms</span>
      </div>
    </div>
    <pre>${highlight(resPretty)}</pre>
  </div>

  <div class="footer">
    PetVida — Projeto Acadêmico de Banco de Dados · ${now}
  </div>
</body>
</html>`;
}

function httpStatusText(code) {
  const map = { 200: 'OK', 201: 'Created', 400: 'Bad Request', 404: 'Not Found', 422: 'Unprocessable Entity', 500: 'Internal Server Error' };
  return map[code] || '';
}

// ─── Faz a requisição e mede o tempo ─────────────────────────────────────────

async function request(method, url, body = null) {
  const start = Date.now();
  let req = api[method.toLowerCase()](url).set('Accept', 'application/json');
  if (body) req = req.send(body).set('Content-Type', 'application/json');
  const res = await req;
  return {
    statusCode:   res.status,
    responseBody: res.body,
    duration:     Date.now() - start,
  };
}

// ─── Tira o screenshot do HTML ────────────────────────────────────────────────

async function screenshot(browser, html, filename) {
  const page = await browser.newPage();
  await page.setViewport({ width: 960, height: 800 });
  await page.setContent(html, { waitUntil: 'networkidle2' });
  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: 960, height: Math.max(600, bodyHeight + 40) });
  const outPath = path.join(PRINTS_DIR, filename);
  await page.screenshot({ path: outPath, fullPage: true });
  await page.close();
  return outPath;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n' + '═'.repeat(52));
  console.log('   🐾  PetVida — Gerador Automático de Prints');
  console.log('═'.repeat(52));
  console.log('\nIniciando Puppeteer (pode demorar na 1ª vez)...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // ── Busca IDs reais do banco ──────────────────────────────────────────────
  console.log('Buscando IDs do banco de dados...');
  const db = require('../src/config/database');

  const [[animais], [vets]] = await Promise.all([
    db.query('SELECT id FROM animais LIMIT 1'),
    db.query('SELECT id FROM veterinarios LIMIT 1'),
  ]);

  const animalId = animais[0]?.id;
  const vetId    = vets[0]?.id;

  if (!animalId || !vetId) {
    console.error('❌  Banco sem dados! Execute database/seed.sql primeiro.');
    process.exit(1);
  }
  console.log(`   → animal_id=${animalId}  veterinario_id=${vetId}\n`);

  // Variáveis compartilhadas entre endpoints
  let consultaId = null;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 19).replace('T', ' ');  // 7 dias no futuro

  // ── Definição dos 8 endpoints ──────────────────────────────────────────────
  const endpoints = [
    {
      index:       1,
      method:      'GET',
      url:         '/api/veterinarios',
      description: 'Lista todos os veterinários cadastrados na clínica.',
      filename:    '01_get_veterinarios.png',
    },
    {
      index:       2,
      method:      'GET',
      url:         '/api/animais',
      description: 'Lista animais usando a view vw_animais_detalhados (join com tutor, espécie e total de consultas).',
      filename:    '02_get_animais.png',
    },
    {
      index:       3,
      method:      'GET',
      url:         `/api/agenda/${today}`,
      description: `Retorna a agenda do dia ${today} filtrando vw_consultas_completas por data.`,
      filename:    '03_get_agenda.png',
    },
    {
      index:       4,
      method:      'POST',
      url:         '/api/consultas',
      description: 'Agenda nova consulta via CALL sp_agendar_consulta (valida animal, vet e conflito de horário).',
      filename:    '04_post_consultas.png',
      body: {
        animal_id:      animalId,
        veterinario_id: vetId,
        data_hora:      futureDate,
        valor:          180.00,
      },
      // Captura o ID da consulta criada para usar nos próximos endpoints
      after(result) {
        const data = result.responseBody;
        consultaId = data?.consulta_id ?? data?.id ?? null;
        if (consultaId) {
          console.log(`          → Consulta criada com ID: ${consultaId}`);
        } else {
          console.log(`          ⚠ Não foi possível extrair consulta_id da resposta`);
        }
      },
    },
    {
      index:       5,
      method:      'PUT',
      getUrl:      () => `/api/consultas/${consultaId ?? 1}/concluir`,
      description: 'Conclui a consulta via CALL sp_concluir_consulta (atualiza status e preenche diagnóstico).',
      filename:    '05_put_concluir.png',
      body: {
        diagnostico: 'Animal saudável. Vacinação em dia. Retorno recomendado em 6 meses.',
      },
    },
    {
      index:       6,
      method:      'POST',
      getUrl:      () => `/api/pagamentos/${consultaId ?? 1}`,
      description: 'Registra pagamento via CALL sp_registrar_pagamento e atualiza status para pago.',
      filename:    '06_post_pagamento.png',
      body: {
        forma_pagamento: 'PIX',
      },
    },
    {
      index:       7,
      method:      'GET',
      url:         '/api/relatorios/dashboard',
      description: 'Dashboard financeiro: total de consultas, valor bruto, recebido, pendente e % de inadimplência.',
      filename:    '07_get_dashboard.png',
    },
    {
      index:       8,
      method:      'GET',
      url:         '/api/relatorios/inadimplentes',
      description: 'Lista consultas concluídas com pagamento pendente usando a view vw_inadimplentes.',
      filename:    '08_get_inadimplentes.png',
    },
  ];

  // ── Executa cada endpoint sequencialmente ─────────────────────────────────
  const results = [];

  for (const ep of endpoints) {
    const url = ep.getUrl ? ep.getUrl() : ep.url;
    process.stdout.write(`  [${ep.index}/8] ${ep.method.padEnd(6)} ${url.padEnd(40)} `);

    let result;
    try {
      result = await request(ep.method, url, ep.body ?? null);
      console.log(`→ ${result.statusCode} (${result.duration}ms)`);

      if (ep.after) ep.after(result);

      const html = buildHTML({
        index:        ep.index,
        method:       ep.method,
        url,
        requestBody:  ep.body ?? null,
        responseBody: result.responseBody,
        statusCode:   result.statusCode,
        duration:     result.duration,
        description:  ep.description,
      });

      const outPath = await screenshot(browser, html, ep.filename);
      results.push({ index: ep.index, url, status: result.statusCode, file: ep.filename, ok: true });
      console.log(`          ✅ Salvo: docs/prints/tarefa8_api/${ep.filename}`);

    } catch (err) {
      console.log(`→ ERRO`);
      console.log(`          ❌ ${err.message}`);
      results.push({ index: ep.index, url, status: 'ERRO', file: ep.filename, ok: false });
    }
  }

  await browser.close();

  // ── Resumo final ──────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(52));
  console.log('   📸  Resumo dos Prints Gerados');
  console.log('═'.repeat(52));

  results.forEach(r => {
    const icon  = r.ok ? '✅' : '❌';
    const badge = r.ok ? `HTTP ${r.status}` : r.status;
    console.log(`  ${icon}  [${r.index}/8] ${badge.toString().padEnd(10)} docs/prints/tarefa8_api/${r.file}`);
  });

  const ok      = results.filter(r => r.ok).length;
  const total   = results.length;
  const ptsText = ok === 8 ? '10/10 pts potenciais 🎉' : `${ok}/${total} endpoints ok`;

  console.log('\n' + '─'.repeat(52));
  console.log(`  Total: ${ok}/${total} prints gerados — ${ptsText}`);
  console.log('  Pasta: docs/prints/tarefa8_api/');
  console.log('═'.repeat(52) + '\n');

  // Fecha conexões do MySQL para o processo encerrar limpo
  try {
    const db = require('../src/config/database');
    await db.end();
  } catch (_) { /* ignora se já fechou */ }

  process.exit(ok === total ? 0 : 1);
}

main().catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
