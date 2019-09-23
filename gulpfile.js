const { parallel, series, src, dest, watch } = require('gulp');
const { rollup } = require('rollup');
const { terser } = require('rollup-plugin-terser');
const replace = require('rollup-plugin-replace');
const resolve = require('rollup-plugin-node-resolve');
const common = require('rollup-plugin-commonjs');
const globals = require('rollup-plugin-node-globals');
const builtins = require('rollup-plugin-node-builtins');
const progress = require('rollup-plugin-progress');
const json = require('rollup-plugin-json');
const babel = require('rollup-plugin-babel');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssImport = require('postcss-import');
const presetEnv = require('postcss-preset-env');
const autoprefixer = require('autoprefixer');
const cleanCss = require('gulp-clean-css');
const gif = require('gulp-if');
const del = require('del');
const browserSync = require('browser-sync').create();
const nunjucksRender = require('gulp-nunjucks-render');
const filesize = require('rollup-plugin-filesize');
const jeditor = require('gulp-json-editor');
const config = require('config');

const production = config.get('production');
const app = config.get('app');
const htmlData = config.get('html_data');

const plugins = [
    json(),
    resolve(),
    common(),
    builtins(),
    globals(),
    replace({
        CANVAS_RENDERER: JSON.stringify(true),
        WEBGL_RENDERER: JSON.stringify(true),
        APP_URL: JSON.stringify(app.APP_URL),
        ASSETS_PATH: JSON.stringify(app.ASSETS_PATH),
        GAME_WIDTH: JSON.stringify(app.GAME_WIDTH),
        GAME_HEIGHT: JSON.stringify(app.GAME_HEIGHT),
        BUNDLE: JSON.stringify(app.bundle),
        POLYFILL: JSON.stringify(app.polyfill)
    })
];

production &&
    plugins.push(
        babel({
            exclude: 'node_modules/**'
        }),
        terser({
            sourcemap: true,
            compress: true,
            ecma: 5
        })
    );

plugins.push(
    progress({
        clearLine: true
    }),
    filesize({
        showMinifiedSize: false
    })
);

const caches = {};

const clean = async () => {
    await del([app.distFolder]);
};

const images = () =>
    src('./src/assets/images/**/*', {
        allowEmpty: true
    }).pipe(dest(`${app.distFolder}/assets/images`));

const atlases = () =>
    src('./src/assets/atlases/**/*', {
        allowEmpty: true
    }).pipe(dest(`${app.distFolder}/assets/atlases`));

const fonts = () =>
    src('./src/assets/fonts/**/*', {
        allowEmpty: true
    }).pipe(dest(`${app.distFolder}/assets/fonts`));

const jsons = () =>
    src('./src/assets/jsons/**/*', {
        allowEmpty: true
    }).pipe(dest(`${app.distFolder}/assets/jsons`));

const spritesheets = () =>
    src('./src/assets/spritesheets/**/*', {
        allowEmpty: true
    }).pipe(dest(`${app.distFolder}/assets/spritesheets`));

const assetsFile = () =>
    src('./src/assets/assets.json', {
        allowEmpty: true
    }).pipe(dest(`${app.distFolder}/assets`));

const browserConfig = () =>
    src('./src/assets/site/browserconfig.xml', {
        allowEmpty: true
    }).pipe(dest(`${app.distFolder}`));

const icons = () =>
    src('./src/assets/icons/**/*', {
        allowEmpty: true
    }).pipe(dest(`./${app.distFolder}/icons`));

const manifest = () =>
    src('./src/assets/site/manifest.json')
        .pipe(
            jeditor({
                name: htmlData.title,
                short_name: htmlData.shortName
            })
        )
        .pipe(dest(`${app.distFolder}`));

const styles = () =>
    src('./src/scss/style.scss', {
        sourcemaps: !production
    })
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([cssImport, autoprefixer, presetEnv()]))
        .pipe(gif(production, cleanCss()))
        .pipe(
            dest(`${app.distFolder}/styles`, {
                sourcemaps: production ? false : '.'
            })
        );

const nunjucks = () =>
    src('src/html/*.+(html|nunjucks|njk)')
        .pipe(
            nunjucksRender({
                path: 'src/html',
                data: htmlData
            })
        )
        .pipe(dest(app.distFolder));

const jsBundle = async () => {
    const bundle = await rollup({
        input: 'src/js/app/app.js',
        cache: caches.bundle,
        plugins
    });
    caches.bundle = bundle.cache;
    return bundle.write({
        file: `${app.distFolder}/js/bundle.js`,
        format: 'umd',
        name: 'Bundle',
        sourcemap: !production
    });
};

const jsLoader = async () => {
    const bundle = await rollup({
        input: 'src/js/loader/loader.js',
        cache: caches.loader,
        plugins
    });
    caches.loader = bundle.cache;
    return bundle.write({
        file: `${app.distFolder}/js/loader.js`,
        format: 'iife',
        sourcemap: !production
    });
};

const serve = async () =>
    browserSync.init({
        port: app.PORT,
        uiPort: app.UI_PORT,
        notify: false,
        reloadOnRestart: true,
        https: false,
        server: [app.distFolder],
        startPath: `/index.html`
    });

const watchSoursce = async () => {
    watch('src/html/**/*', series(nunjucks));
    watch('src/scss/**/*', series(styles));
    watch('src/js/app/**/*.js', series(jsBundle));
    watch('src/js/loader/**/*.js', series(jsLoader));
    watch('src/assets/images/**/*', series(images));
    watch('src/assets/atlases/**/*', series(atlases));
    watch('src/assets/spritesheets/**/*', series(spritesheets));
    watch('src/assets/jsons/**/*', series(jsons));
    watch('src/assets/fonts/**/*', series(fonts));
    watch('src/assets/icons/**/*', series(icons));
    watch('src/assets/site/manifest.json', series(manifest));
    watch('src/assets/images/browserconfig.xml', series(browserConfig));
    watch('src/assets/assets.json', series(assetsFile));
    watch(`${app.distFolder}/**/*`).on('change', browserSync.reload);
};

const build = series(
    clean,
    jsLoader,
    jsBundle,
    parallel(
        styles,
        nunjucks,
        images,
        atlases,
        spritesheets,
        jsons,
        icons,
        assetsFile,
        browserConfig,
        manifest
    )
);

exports.deploy = production ? series(build) : series(build, parallel(serve, watchSoursce));
