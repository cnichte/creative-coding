const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: "development",
  target: "web",
  entry: {
    index: "./src/index.ts",
    print: "./src/print.ts",
  },
  devtool: 'source-map', //! for debug: statt  inline-source-map -> source-map
//! start debug
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@carstennichte/cc-toolbox": path.resolve(__dirname, "../../cc-toolbox/src"),
    },
  },
//! end debug
  devServer: {
    static: './dist',
  },
  optimization: {
    runtimeChunk: 'single',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Happy Creative Coding',
    }),
  ], 
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: '[name].bundle.js',
    clean: true,
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
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
    ],
  },

};
