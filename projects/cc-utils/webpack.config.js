const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/index.ts",
// context: path.resolve(__dirname, 'app'),
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "cc-utils.js",
    globalObject: "this",
    library: {
      name: "ccUtils",
      type: "umd",
    },
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  devtool: "inline-source-map",
};
