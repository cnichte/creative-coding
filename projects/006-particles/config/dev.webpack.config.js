const path = require("path");

module.exports = {
  extends: path.resolve(__dirname, "./base.webpack.config.js"),
  mode: "development",
  output: {
    path: path.resolve(__dirname, "../dist/develop"),
  },
  devtool: "inline-source-map",
  devServer: {
    static: "./dist/develop",
    port: 8086,
  },
  optimization: {
    runtimeChunk: "single",
  },
};
