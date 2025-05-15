const { defineConfig } = require("cypress");
process.env.NODE_ENV = 'development';
const webpackConfig = require('react-scripts/config/webpack.config')('development');


module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
      webpackConfig,
    },
  },
});
