const path = require("path");

module.exports = {
  mode: "development",
  entry: [
    "regenerator-runtime/runtime",
    path.resolve(__dirname, "src", "bundle.js"),
  ],
  output: {
    filename: "rich-markdown-editor.js",
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
  resolve: {
    mainFields: ["browser", "main"],
  },
};
