const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/index.ts",
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
    filename: "cc-artwork.js",
    globalObject: "this",
    library: {
      name: "ccArtwork",
      type: "umd",
    },
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  devtool: "inline-source-map",
};
