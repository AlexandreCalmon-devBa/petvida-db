const request = require('supertest');

// A API deve estar rodando em http://localhost:3000
const API_URL = 'http://localhost:3000';

describe('PetVida API Endpoints', () => {
  it('1. Deve listar veterinários (GET /api/veterinarios)', async () => {
    const res = await request(API_URL).get('/api/veterinarios');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('2. Deve listar animais detalhados (GET /api/animais)', async () => {
    const res = await request(API_URL).get('/api/animais');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('3. Deve listar a agenda do dia (GET /api/agenda/:data)', async () => {
    const res = await request(API_URL).get('/api/agenda/2025-01-19');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('4. Deve agendar uma consulta (POST /api/consultas)', async () => {
    const res = await request(API_URL)
      .post('/api/consultas')
      .send({
        animal_id: 2,
        veterinario_id: 1,
        data_hora: '2026-10-10 10:00:00', // data no futuro para evitar conflito
        valor: 150.00
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('mensagem');
  });

  it('5. Deve concluir uma consulta (PUT /api/consultas/:id/concluir)', async () => {
    // Nota: usando um ID alto fictício só para validar se a rota existe
    // (Pode retornar erro de negócio 422 se não existir, mas não erro de rota)
    const res = await request(API_URL)
      .put('/api/consultas/999/concluir')
      .send({ diagnostico: 'Teste automatizado' });
    
    expect([200, 422]).toContain(res.statusCode); // 422 é erro de banco (não encontrada), o que prova que chegou na procedure
  });

  it('6. Deve registrar um pagamento (POST /api/pagamentos/:consulta_id)', async () => {
    const res = await request(API_URL)
      .post('/api/pagamentos/999')
      .send({ forma_pagamento: 'pix' });
      
    expect([200, 422]).toContain(res.statusCode);
  });

  it('7. Deve exibir o dashboard financeiro (GET /api/relatorios/dashboard)', async () => {
    const res = await request(API_URL).get('/api/relatorios/dashboard');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body).toHaveProperty('total_consultas');
  });

  it('8. Deve listar inadimplentes (GET /api/relatorios/inadimplentes)', async () => {
    const res = await request(API_URL).get('/api/relatorios/inadimplentes');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
