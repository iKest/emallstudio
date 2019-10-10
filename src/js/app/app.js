import Phaser from 'phaser';
import Logger from 'js-logger';
import WebFontLoader from 'phaser3-rex-plugins/plugins/webfontloader-plugin';
import ButtonPlugin from 'phaser3-rex-plugins/plugins/button-plugin';
import RoundRectanglePlugin from 'phaser3-rex-plugins/plugins/roundrectangle-plugin';
import BBCodeTextPlugin from 'phaser3-rex-plugins/plugins/bbcodetext-plugin';
import ShakePlugin from 'phaser3-rex-plugins/plugins/shakeposition-plugin';
import { BootScene, BackScene, WinScene, HelloScene, GameScene, HUDScene } from './scenes';
import { gameConfig } from './config';

export function start() {
    Logger.useDefaults();
    const log = Logger.get('main script');

    const plugins = {
        global: [
            {
                key: 'WebFontLoader',
                plugin: WebFontLoader,
                start: true
            },
            {
                key: 'Button',
                plugin: ButtonPlugin,
                mapping: 'Button',
                start: true
            },
            {
                key: 'RoundRectangle',
                plugin: RoundRectanglePlugin,
                start: true
            },
            {
                key: 'BBCodeTextPlugin',
                plugin: BBCodeTextPlugin,
                start: true
            },
            {
                key: 'Shake',
                plugin: ShakePlugin,
                mapping: 'Shake',
                start: true
            }
        ]
    };

    const preBoot = game => {
        log.info('game booting start');
    };

    const postBoot = game => {
        log.info('game booting complete');
    };

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
