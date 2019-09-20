import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import terser from 'rollup-plugin-terser';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import cleaner from 'rollup-plugin-cleaner';
import copy from 'rollup-plugin-copy';
import html from 'rollup-plugin-bundle-html';

const production = !process.env.ROLLUP_WATCH;

export default {
    input: 'src/js/main.js',
    output: {
        file: `public/js/bundle-${new Date().getTime()}.js`,
        format: 'iife',
        sourcemap: !production
    },
    plugins: [
        cleaner({
            targets: ['./public/js', './public/css', './public/index.html']
        }),
        copy({
            targets: [{
                    src: 'src/css/*',
                    dest: 'public/css/',
                    rename: (name, extension) => `${name}-${new Date().getTime()}.${extension}`
                },
                {
                    src: 'node_modules/normalize.css/normalize.css',
                    dest: 'public/css/',
                    rename: (name, extension) => `${name}-${new Date().getTime()}.${extension}`
                }
            ]
        }),
        replace({
            CANVAS_RENDERER: JSON.stringify(true),
            WEBGL_RENDERER: JSON.stringify(true)
        }),
        commonjs(),
        globals(),
        builtins(),
        resolve({
            browser: true
        }),
        production &&
        terser({
            sourcemap: true,
            compress: true,
            ecma: 5
        }),
        html({
            template: 'src/html/template.html',
            dest: 'public/',
            filename: 'index.html',
            inject: 'body'
        })
    ]
};
