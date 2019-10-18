const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const {InjectManifest} = require("workbox-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const config = require("./config/config.js");

const production = process.env.NODE_ENV === "production";
const ENV = process.env.NODE_ENV || "development";

const modify = (buffer, props) => {
  // copy-webpack-plugin passes a buffer
  const manifest = JSON.parse(buffer.toString());
  // make any modifications you like, such as
  Object.assign(manifest, props);
  // pretty print to JSON with two spaces
  return JSON.stringify(manifest, null, 2);
};

const extractSass = new MiniCssExtractPlugin({
  filename: "[name].[hash].css"
});

const sw = path.join(__dirname, "/src/sw.js");

const plugins = [new webpack.ProgressPlugin(), extractSass];

const devServer = {
  contentBase: config.staticPath,
  hotOnly: true,
  historyApiFallback: true,
  port: config.port.front,
  compress: production,
  inline: !production,
  hot: !production,
  stats: {
    assets: true,
    children: false,
    chunks: false,
    hash: true,
    modules: false,
    publicPath: false,
    timings: true,
    version: false,
    warnings: true
  }
};

if (production) {
  plugins.push(
    new webpack.optimize.OccurrenceOrderPlugin(),
    // Compress extracted CSS.
    // Possible duplicated CSS from different components can be deduped.
    new HtmlWebpackPlugin({
      template: config.template,
      minify: {
        removeComments: true
      },
      // make it work consistently with multiple chunks (CommonChunksPlugin)
      chunksSortMode: "dependency"
    }),
    new ScriptExtHtmlWebpackPlugin({
      preload: [
        "runtime~app.bundle.*.js",
        "vendor~app.bundle.*.js",
        "app.bundle.*.js"
      ],
      prefetch: {
        test: /\.js$/,
        chunks: "async"
      }
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, "src/assets"),
        to: path.resolve(__dirname, "dist/assets")
      },
      {
        from: path.resolve(__dirname, "src/browserconfig.xml"),
        to: path.resolve(__dirname, "dist/browserconfig.xml")
      },
      {
        from: path.resolve(__dirname, "src/favicon.ico"),
        to: path.resolve(__dirname, "dist/favicon.ico")
      },
      {
        from: path.resolve(__dirname, "src/favicon-16x16.png"),
        to: path.resolve(__dirname, "dist/favicon-16x16.png")
      },
      {
        from: path.resolve(__dirname, "src/favicon-32x32.png"),
        to: path.resolve(__dirname, "dist/favicon-32x32.png")
      },
      {
        from: path.resolve(__dirname, "src/manifest.json"),
        to: path.resolve(__dirname, "dist/manifest.json"),
        // eslint-disable-next-line no-shadow
        transform(content, path) {
          return modify(content, {
            name: config.title,
            // eslint-disable-next-line babel/camelcase
            short_name: config.shortName,
            orientation: config.orientation,
            version: config.version
          });
        }
      }
    ]),
    new InjectManifest({
      swSrc: sw
    }),
    new TerserPlugin({
      extractComments: true,
      cache: true,
      parallel: true,
      sourceMap: true,
      terserOptions: {
        extractComments: "all",
        compress: {
          // eslint-disable-next-line babel/camelcase
          drop_console: true
        }
      }
    })
  );
  if (config.analize) plugins.push(new BundleAnalyzerPlugin());
} else {
  plugins.push(
    new webpack.HotModuleReplacementPlugin(), // hot reload
    new HtmlWebpackPlugin({
      // generate index.html
      template: config.template
    }),
    new FriendlyErrorsPlugin(),
    new BrowserSyncPlugin(
      // BrowserSync options
      {
        // browse to http://localhost:3000/ during development
        host: "localhost",
        port: 3000,
        // proxy the Webpack Dev Server endpoint
        // (which should be serving on http://localhost:3100/)
        // through BrowserSync
        proxy: `http://localhost:${config.port.front}/`
      },
      // plugin options
      {
        // prevent BrowserSync from reloading the page
        // and let Webpack Dev Server take care of this
        reload: false
      }
    )
  );
}

plugins.push(
  new webpack.DefinePlugin({
    WEBGL_RENDERER: JSON.stringify(true),
    CANVAS_RENDERER: JSON.stringify(true),
    EXPERIMENTAL: JSON.stringify(false),
    FEATURE_SOUND: JSON.stringify(true),
    /* 'typeof CANVAS_RENDERER': JSON.stringify(true),
        'typeof WEBGL_RENDERER': JSON.stringify(true),
        'typeof EXPERIMENTAL': JSON.stringify(true),
        'typeof FEATURE_SOUND': JSON.stringify(true), */
    ASSETS_PATH: JSON.stringify(config.assetsPath),
    GAME_WIDTH: JSON.stringify(config.gameWidth),
    GAME_HEIGHT: JSON.stringify(config.gameHeight),
    "process.env.NODE_ENV": JSON.stringify(ENV)
  })
);

const common = {
  devtool: config.devtool,
  // webpack 4 - optimization auto
  mode: production ? "production" : "development",
  // do not continue build if any errors
  bail: true,
  entry: {
    app: config.entry.front
  },
  output: {
    path: path.resolve("dist"),
    filename: production ? "[name].bundle.[hash].js" : "[name].bundle.js",
    publicPath: "/"
  },
  resolve: {
    extensions: [".js", ".jsx", ".css", ".scss", "json"],
    modules: [
      path.resolve(__dirname, "src/lib"),
      path.resolve(__dirname, "node_modules"),
      "node_modules"
    ],
    alias: {
      // in order to use css-transition-group
      // you have to aliase react and react-dom
      react: "preact/compat",
      "react-dom": "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-addons-css-transition-group": "preact-css-transition-group",
      components: config.componentsPath,
      routes: config.routesPath,
      src: config.staticPath
    }
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [
          production ? MiniCssExtractPlugin.loader : "style-loader",
          {
            loader: "css-loader",
            options: {
              sourceMap: production,
              modules: true,
              importLoaders: 1
            }
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: production,
              ident: "postcss",
              config: {path: "./"}
            }
          },
          {
            loader: "sass-loader",
            options: {sourceMap: production}
          }
        ]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: path.resolve(__dirname, "src"),
        enforce: "pre",
        use: "source-map-loader"
      },
      {
        test: /\.(js|jsx)$/,
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, "node_modules/phaser3-rex-plugins")
        ],
        loader: "babel-loader"
      },
      {
        test: /\.(xml|html|txt|md)$/,
        use: "raw-loader"
      },
      {
        test: /\.(png|jpg|gif|ico|svg|pvr|pkm|static|mp3|webm)$/,
        loader: production ? "file-loader" : "url-loader",
        query: {
          limit: 10000,
          name: "[name]-[hash:7].[ext]"
        }
      }
    ]
  },
  optimization: {
    runtimeChunk: true,
    splitChunks: {
      chunks: "all"
    }
  },
  performance: {
    hints: production ? "warning" : false
  },
  plugins,
  stats: {colors: true},

  node: {
    global: true,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
    setImmediate: false
  },
  devServer
};

module.exports = common;
