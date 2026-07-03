const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";
const JS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-bundle.min.js";
const JS_URL2 = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-standalone-preset.min.js";

// Opções de personalização visual do Swagger
const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { background-color: #2c3e50; border-bottom: 3px solid #18bc9c; }
    .swagger-ui .info .title { color: #2c3e50; }
    .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #18bc9c; }
  `,
  customCssUrl: CSS_URL,
  customJs: [JS_URL, JS_URL2],
  customSiteTitle: "API Docs - Clínica PetVida"
};

// Documentação Swagger
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
const db = require('./config/database');

// Importa rotas
const veterinarioRoutes = require('./routes/veterinario.routes');
const animaisRoutes = require('./routes/animais.routes');
const consultaRoutes = require('./routes/consulta.routes');
const pagamentosRoutes = require('./routes/pagamentos.routes');
const relatoriosRoutes = require('./routes/relatorios.routes');

// Rota raiz
router.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API do PetVida!' });
});

// GET /api/agenda/:data — usa vw_consultas_completas filtrada por data
router.get('/api/agenda/:data', async (req, res) => {
  try {
    const { data } = req.params;
    const [rows] = await db.query(
      'SELECT * FROM vw_consultas_completas WHERE DATE(data_hora) = ?',
      [data]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar agenda:', error.message);
    res.status(500).json({ erro: 'Erro ao buscar agenda', detalhes: error.message });
  }
});

// Monta os endpoints sob /api
router.use('/api/veterinarios', veterinarioRoutes);
router.use('/api/animais', animaisRoutes);
router.use('/api/consultas', consultaRoutes);
router.use('/api/pagamentos', pagamentosRoutes);
router.use('/api/relatorios', relatoriosRoutes);

module.exports = router;