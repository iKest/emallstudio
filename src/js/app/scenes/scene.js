import Phaser from 'phaser';
import Logger from 'js-logger';

export default class Scene extends Phaser.Scene {
    constructor(config) {
        super(config);
        this.key = config.key;
        this.log = Logger.get(this.key);
        this.log.info('boot');
    }

    init() {
        this.log.info('init');
        this.events.once('shutdown', this.shutdown, this);
        this.events.once('sleep', this.sleep, this);
        this.events.once('pause', this.pause, this);
        this.events.off('destroy', this.destroy, this);
    }

    create(createData) {
        this.log.info('create');
        const data = this.cache.json.get('atlas_data')[this.key];
        this.buttons = new Map();
        this.texts = new Map();
        if (data) {
            data.bg && this.makeBg(data.bg, createData);
            data.ui && this.makeUI(data.ui, createData);
        }
    }

    shutdown() {
        this.log.info('shutdown');
        this.events.off('sleep', this.sleep, this);
        this.events.off('pause', this.pause, this);
        this.events.once('destroy', this.destroy, this);
    }

    sleep() {
        this.log.info('sleep');
        this.events.off('pause', this.pause, this);
        this.events.once('wake', this.wake, this);
    }

    pause() {
        this.log.info('pause');
        this.events.once('resume', this.resume, this);
    }

    wake() {
        this.log.info('wake');
        this.events.once('sleep', this.sleep, this);
        this.events.once('pause', this.pause, this);
    }

    resume() {
        this.log.info('resume');
        this.events.once('pause', this.pause, this);
    }

    destroy() {
        this.log.info('destroy');
        this.events.off('sleep', this.sleep, this);
        this.events.off('pause', this.pause, this);
        this.events.off('shutdown', this.shutdown, this);
        this.log = undefined;
        this.buttons.clear();
        this.buttons = undefined;
        this.texts.clear();
        this.texts = undefined;
    }

    makeBg(bg) {
        if (bg.atlas) {
            const texture = this.textures.get(bg.atlas);
            bg.frames.forEach(frameKey => {
                const { spriteSourceSize } = texture.get(frameKey).customData;
                this.make
                    .image({ key: bg.atlas, frame: frameKey, add: true })
                    .setOrigin(0)
                    .setPosition(spriteSourceSize.x, spriteSourceSize.y);
            });
        } else {
            bg.frames.forEach(frameKey => {
                this.make.image({ key: frameKey, add: true }).setOrigin(0);
            });
        }
        bg.txt &&
            bg.txt.forEach(text => {
                this.texts.set(
                    text.name,
                    this.add
                        .text(text.x, text.y, text.text[0], {
                            fontFamily: text.font,
                            fontSize: `${text.size}px`,
                            color: text.color,
                            fontStyle: text.style
                        })
                        .setOrigin(text.originX, text.originY)
                );
            });
    }

    makeUI(ui) {
        ui.btn &&
            ui.btn.forEach(button => {
                let buttonImg;
                if (button.img.atlas) {
                    const texture = this.textures.get(button.img.atlas);
                    const { spriteSourceSize } = texture.get(button.img.frame).customData;
                    buttonImg = this.make
                        .image({ key: button.img.atlas, frame: button.img.frame, add: true })
                        .setOrigin(0)
                        .setPosition(spriteSourceSize.x, spriteSourceSize.y);
                    const center = buttonImg.getCenter();
                    button.txt &&
                        this.texts.set(
                            button.txt.name,
                            this.add
                                .text(center.x, center.y, button.txt.text[0], {
                                    fontFamily: button.txt.font,
                                    fontSize: `${button.txt.size}px`,
                                    color: button.txt.color
                                })
                                .setOrigin(0.5, 0.6)
                        );
                } else {
                    buttonImg = this.make
                        .image({ key: button.img.frame, add: true })
                        .setOrigin(0)
                        .setOrigin(0)
                        .setPosition(button.img.x, button.img.y);
                    const center = buttonImg.getCenter();
                    button.txt &&
                        this.texts.set(
                            button.txt.name,
                            this.add
                                .text(center.x, center.y, button.txt.text[0], {
                                    fontFamily: button.txt.font,
                                    fontSize: `${button.txt.size}px`,
                                    color: button.txt.color
                                })
                                .setOrigin(0.5, 0.6)
                        );
                }
                this.buttons.set(
                    button.action,
                    this.Button.add(buttonImg, { mode: 1, enable: false }).on(
                        'click',
                        () => {
                            this.log.info('click');
                            this[button.action](button.target);
                        },
                        this
                    )
                );
            });
    }
}
