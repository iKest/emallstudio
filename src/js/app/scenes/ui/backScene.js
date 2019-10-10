import Scene from '../scene';

export class BackScene extends Scene {
    constructor() {
        super({
            key: 'BackScene'
        });
    }

    create() {
        super.create();
        this.events.once('transitionstart', this.transitionStart, this);
        this.cameras.main.alpha = 0;
    }

    transitionStart(fromScene, duration) {
        this.log.info('transition start');
        this.events.once('transitioncomplete', this.transitionComplete, this);
        this.tweens.add({
            targets: this.cameras.main,
            alpha: 1.0,
            duration
        });
        this.scene.launch('HelloScene');
        const helloCam = this.scene.get('HelloScene').cameras.main;
        this.tweens.add({
            targets: helloCam,
            alpha: 1,
            duration
        });
    }

    transitionComplete() {
        this.log.info('transition complete');
        this.scene.remove('BootScene');
        this.scene
            .get('HelloScene')
            .buttons.get('switchScene')
            .setEnable(true);
        try {
            document.querySelector('.loader').style.display = 'none';
        } catch (e) {
            this.log.warn(e);
        }
    }
}
