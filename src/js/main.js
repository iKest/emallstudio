import Phaser from 'phaser';
import Logger from 'js-logger';
import * as scene from './scenes';
import gameConfig from './config/config';

Logger.useDefaults();
const log = Logger.get('main script');

let game;
window.onload = event => {
    game = new Phaser.Game({ ...gameConfig, scene: Object.values(scene) });
    log.info('game started');
};
window.addEventListener(
    'resize',
    () => {
        game.scale.setMaxZoom();
    },
    false
);
