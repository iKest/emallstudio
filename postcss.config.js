const postcssImport = require("postcss-import");
const postcssColourFunctions = require("postcss-colour-functions");
const precss = require('precss');
const cssnano = require("cssnano");
const mqpacker = require('css-mqpacker');

module.exports = {
        plugins: [
            postcssImport,
            postcssColourFunctions,
            mqpacker,
            precss,
            cssnano({
                preset: [
                    'default', {
                        discardComments: {
                        removeAll: true,
                        }
                    }
                ]
            })
        ]
}
