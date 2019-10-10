/**
 * @description Скрипт загрузки полифилла и игрового клиента
 */
import loadjs from 'loadjs';

const { log } = console;

// Элементарная защита от запуска скрипта с нелегального ресурса и кликджекинга.
// Проверяется url  с которого запущен скрипт и что скрипт запущен не в iFrame
// eslint-disable-next-line no-restricted-globals
if (self === top && top.location.href === APP_URL) {
    const antiClickjack = document.getElementById('antiClickjack');
    antiClickjack.parentNode.removeChild(antiClickjack);
} else {
    // eslint-disable-next-line no-restricted-globals
    top.location.replace(APP_URL);
}

log('[loader]:starting');
document.addEventListener('DOMContentLoaded', start(), { once: true });

/**
 * @description Метод запускает загрузку основных скриптов, после загрузки документа
 */
function start() {
    log('[loader]:DOMContent loaded');
    /**
     * @type {object}
     */
    const complete = {
        bundle: false,
        external: false
    };

    // eslint-disable-next-line no-restricted-globals
    self.loaderStop = () => {
        try {
            document.querySelector('.loader_cogs__top').style.animationPlayState = 'paused';
            document.querySelector('.loader_cogs__left').style.animationPlayState = 'paused';
            document.querySelector('.loader_cogs__bottom').style.animationPlayState = 'paused';
        } catch (e) {
            log(e);
        }
    };
    loadjs(POLYFILL, 'polyfill');
    loadjs(EXTERNAL, 'external');
    loadjs
        .ready('polyfill', {
            success() {
                log('[loader]:polyfill загружен');
                // sendOk('polyfill', '-Загружен-');
                complete.polyfill = true;
                complete.bundle && Bundle.start();
            },
            error(e) {
                loadjs.reset();
                // sendError('polyfill', '-Скрипт не найден-');
                log('[loader]:Ошибка загрузки polyfill', e);
            }
        })
        .ready('external', {
            success() {
                log('[loader]:external загружен');
                // sendOk('bundle', '-Загружен-');
                loadjs(BUNDLE, 'bundle');
                loadjs.ready('bundle', {
                    success() {
                        log('[loader]:bundle загружен');
                        // sendOk('bundle', '-Загружен-');
                        complete.bundle = true;
                        complete.polyfill && Bundle.start();
                    },
                    error(e) {
                        loadjs.reset();
                        // sendError('bundle', '-Скрипт не найден-');
                        log('[loader]:Ошибка загрузки bundle', e);
                    }
                });
            },
            error(e) {
                loadjs.reset();
                // sendError('bundle', '-Скрипт не найден-');
                log('[loader]:Ошибка загрузки external', e);
            }
        });
    /**
     * @description Метод инициирует сообщение об ошибке загрузки скрипта
     * @param {string} sc Имя скрипта
     * @param {string} m Сообщение, описывающее ошибку
     */
    /* function sendError(sc, e) {
        try {
            loader.style.animationPlayState="paused"
            const m = document.querySelector('.loader_message');
            const t = document.querySelector('.target');
            const s = document.querySelector('.status');
            m.style = 'color: #ff0000';
            m.innerHTML = 'ERROR!';
            t.innerHTML = sc;
            s.style = 'color: #ff0000';
            s.innerHTML = e;
        } catch (err) {
            log(err);
        }
    } */
    /**
     * @description Метод инициирует сообщение об успешной загрузке скрипта
     * @param {string} sc Имя скрипта
     * @param {string} m Сообщение описывающее успешную загрузку
     */
    /* function sendOk(sc, m) {
        try {
            const t = document.querySelector('.target');
            const s = document.querySelector('.status');
            s.style = 'color: #00ff00';
            t.innerHTML = sc;
            s.innerHTML = m;
        } catch (err) {
            log(err);
        }
    } */
}
/** @memberof module:loader */
