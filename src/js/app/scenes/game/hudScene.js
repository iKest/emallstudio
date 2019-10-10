import Scene from '../scene';

export class HUDScene extends Scene {
    constructor() {
        super({
            key: 'HUDScene'
        });
    }

    create() {
        super.create();
        this.registry.events.on('changedata-score', this.updateScore, this);
        this.registry.events.on('changedata-matches', this.updateMatches, this);
        this.buttons.get('restartScene').setEnable(true);
    }

    sleep() {
        super.sleep();
        this.buttons.get('restartScene').setEnable(false);
        this.registry.events.off('changedata-score', this.updateScore, this);
        this.registry.events.off('changedata-matches', this.updateMatches, this);
        this.scene.sleep('GameScene');
    }

    wake() {
        super.wake();
        this.buttons.get('restartScene').setEnable(true);
        this.registry.events.on('changedata-score', this.updateScore, this);
        this.registry.events.on('changedata-matches', this.updateMatches, this);
    }

    restartScene() {
        this.scene.get('GameScene').restartScene();
    }

    updateMatches(...args) {
        this.log.info('update matches', args);
    }

    updateScore(...args) {
        this.log.info('update score', args);
    }
}
