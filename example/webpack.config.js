const path = require("path");

module.exports = {
  mode: "development",
  entry: [
    "regenerator-runtime/runtime",
    path.resolve(__dirname, "src", "index.js"),
  ],
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
};
