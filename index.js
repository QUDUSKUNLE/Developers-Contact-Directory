
// Transpile all code following this line with babel and use 'env' (aka ES6) preset.
require('babel-register')({
  presets: [['env', {
    targets: {
      node: '8',
    },
  }]],
});

// Import the rest of our application.
module.exports = require('./server/index.js');
