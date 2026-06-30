module.exports = {
  testEnvironment: 'node',
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Relatório de Testes - PetVida API',
      outputPath: './test-report.html',
      includeFailureMsg: true,
      includeSuiteFailure: true
    }]
  ]
};
