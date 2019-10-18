module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        exclude: ["transform-async-to-generator", "transform-regenerator"]
      }
    ]
  ],
  plugins: [
    ["@babel/plugin-transform-modules-commonjs"],
    [
      "@babel/plugin-transform-runtime",
      {
        corejs: 3,
        loose: true
      }
    ],
    [
      "@babel/plugin-proposal-decorators",
      {
        legacy: true
      }
    ],
    [
      "@babel/plugin-proposal-class-properties",
      {
        loose: true
      }
    ],
    [
      "@babel/plugin-transform-react-jsx",
      {
        pragma: "h",
        pragmaFrag: "Fragment",
        throwIfNamespace: false
      }
    ],
    ["transform-react-remove-prop-types"],
    [
      "module:fast-async",
      {
        compiler: {
          promises: true,
          generators: false
        },
        spec: true
      }
    ]
  ]
};
