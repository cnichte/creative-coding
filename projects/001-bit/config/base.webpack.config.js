const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
// const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin'); // , new HtmlInlineScriptPlugin()

module.exports = {
  target: "web",
  entry: {
    index: "./src/index.ts",
    print: "./src/print.ts",
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Happy Creative Coding',
    })
  ], 
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: '[name].bundle.js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      "@carstennichte/cc-toolbox": path.resolve(__dirname, "../../cc-toolbox/src"),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      }
    ]
  }
};
