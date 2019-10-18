const path = require("path");

const production = process.env.NODE_ENV === "production";

module.exports = {
  analize: false,
  port: {
    front: 3100 // port for devServer
  },
  entry: {
    front: [path.resolve(__dirname, "../src/index.js")] // entrypoint for front js file
  },
  devtool: production ? false : "eval-cheap-module-source-map",
  componentsPath: path.resolve(__dirname, "..src/components"), // path for components (aliases)
  routesPath: path.resolve(__dirname, "../src/routes"),
  staticPath: path.resolve(__dirname, "../src"), // path for static files (aliases)
  template: path.resolve(__dirname, "../src/index.html"), // path of template
  assetsPath: "assets",
  gameWidth: 900,
  gameHeight: 1600,
  title: "Best Coffee for Friends",
  shornName: "BestCoffee",
  orientation: "portrait",
  version: "1.0.0"
};
