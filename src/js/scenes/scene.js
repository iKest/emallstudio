import Phaser from 'phaser';
import Logger from 'js-logger';

export default class Scene extends Phaser.Scene {
    constructor(config) {
        super(config);
        this.key = config.key;
        this.log = Logger.get(this.key);
        this.log.info('create');
    }

    init() {
        this.log.info('start');
        this.events.on('shutdown', this.shutdown, this);
        this.events.on('sleep', this.sleep, this);
        this.events.on('pause', this.pause, this);
    }

    shutdown() {
        this.log.info('sutdown');
        this.events.off('sleep', this.sleep, this);
        this.events.off('pause', this.pause, this);
        this.events.off('shutdown', this.shutdown, this);
    }

    sleep() {
        this.log.info('sleep');
        this.events.off('sleep', this.sleep, this);
        this.events.off('pause', this.pause, this);
        this.events.on('wake', this.wake, this);
    }

    pause() {
        this.log.info('pause');
        this.events.off('pause', this.pause, this);
        this.events.on('resume', this.resume, this);
    }

    wake() {
        this.log.info('wake');
        this.events.off('wake', this.wake, this);
        this.events.on('sleep', this.ready, this);
        this.events.on('pause', this.pause, this);
    }

    resume() {
        this.log.info('resume');
        this.events.off('resume', this.resume, this);
        this.events.on('pause', this.pause, this);
    }
}
