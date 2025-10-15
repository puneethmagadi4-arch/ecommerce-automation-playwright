module.exports = {
  default: {
    format: ['progress', 'json:reports/cucumber-report.json'],
    formatOptions: { snippetInterface: 'async-await' },
    requireModule: ['ts-node/register'],
    require: [
      'hooks/hooks.ts',
      'step-definitions/**/*.ts'
    ],
    timeout: 60000
  }
};
