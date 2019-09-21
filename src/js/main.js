import Phaser from 'phaser';
import Logger from 'js-logger';
import * as scene from './scenes';
import gameConfig from './config/config';

const { self, top } = window;

// Запрещаем использовать клиент внутри iframe
if (self !== top) {
    top.location.replace(self.location.href);
}

Logger.useDefaults();
const log = Logger.get('main script');

// eslint-disable-next-line no-unused-vars
let game;

self.addEventListener('DOMContentLoaded', startGame, { once: true });

function startGame() {
    log.info('window content loaded');
    game = new Phaser.Game({
        ...gameConfig,
        scene: Object.values(scene),
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
