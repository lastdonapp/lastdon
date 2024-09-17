
const path = require('path');

module.exports = {
  resolve: {
    alias: {
      global: path.resolve(__dirname, 'src/polyfills.ts')
    }
  }
};

