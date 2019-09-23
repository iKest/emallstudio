import Scene from '../scene';

export class BootScene extends Scene {
    constructor() {
        super({
            key: 'BootScene'
        });
    }

    preload() {
        this.load.once('complete', this.complete, this);
        this.load.once('loaderror', this.loadError, this);
        this.load.on('filecomplete', this.fileComplete, this);
        this.log.info('начало загрузки ассетов');
        this.load.pack('assets', 'assets.json', 'assets');
    }

    complete() {
        this.load.off('loaderror', this.loadError, this);
        this.load.off('filecomplete', this.fileComplete, this);
        this.log.info('Все ассеты загружены');
        /* Объявление анимаций спрайтов
        const animFrames = this.anims.generateFrameNumbers('tile', {
            start: 0,
            end: 10
        });
        this.anims.create({
            key: 'tile_anim',
            frames: animFrames,
            frameRate: 30,
            repeat: -1,
            showOnStart: false,
            hideOnComplete: false
        });
        */

        // Запускем парралельно сцену с фоновфм изображением
        this.scene.launch('BackScene', 'bg');
        // Переключаемся на сцену приветствия
        this.scene.start('HelloScene');
    }

    loadError(file) {
        this.log.error('ошибка загрузки файла:', file.src);
        this.load.off('complete', this.complete, this);
        this.load.off('loaderror', this.loadError, this);
        this.load.off('load', this.fileComplete, this);
        this.load.reset();
        this.sys.game.destroy(true);
    }

    fileComplete(key) {
        this.log.info(key, 'загружен');
    }
}
