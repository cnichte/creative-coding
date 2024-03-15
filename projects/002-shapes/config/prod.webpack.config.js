const path = require("path");

module.exports = {
  extends: path.resolve(__dirname, './base.webpack.config.js'),
  mode: "production",
  output: {
    path: path.resolve(__dirname, "../dist/production"),
    filename: '[name].bundle.js',
    clean: true,
  },
};
