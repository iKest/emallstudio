import Phaser from 'phaser';
import Logger from 'js-logger';
import WebFontLoader from 'phaser3-rex-plugins/plugins/webfontloader-plugin';
import { BootScene, BackScene, WinScene, HelloScene, GameScene, HUDScene } from './scenes';
import gameConfig from './config/config';

const { self, top } = window;

// Запрещаем использовать клиент внутри iframe
if (self !== top) {
    top.location.replace(self.location.href);
}

Logger.useDefaults();
const log = Logger.get('main script');

const plugins = {
    global: [
        {
            key: 'WebFontLoader',
            plugin: WebFontLoader,
            start: true
        }
    ]
};

// eslint-disable-next-line no-unused-vars

export function start() {
    return new Phaser.Game({
        ...gameConfig,
        plugins,
        scene: [BootScene, BackScene, HelloScene, WinScene, GameScene, HUDScene],
        callbacks: {
            preBoot,
            postBoot
        }
    });
}

function preBoot() {
    log.info('game booting start');
}

function postBoot() {
    log.info('game booting complete');
}
