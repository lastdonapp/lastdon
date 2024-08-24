const { SpecReporter } = require('jasmine-spec-reporter');
const { join } = require('path');

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    join(__dirname, './src/**/*.e2e-spec.ts')
  ],
  capabilities: {
    browserName: 'chrome'
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  onPrepare() {
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayPending: true } }));
  }
};
