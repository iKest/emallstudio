import Scene from '../scene';
import { Board } from '../../objects';
import { BOARD_OFFSET } from '../../config';

export class GameScene extends Scene {
    constructor() {
        super({
            key: 'GameScene'
        });
    }

    create() {
        super.create();
        !this.scene.isActive('HUDScene') && this.scene.run('HUDScene');
        this.board = new Board(
            this,
            9,
            9,
            0,
            (this.cameras.main.height - this.cameras.main.width) * 0.5 + BOARD_OFFSET,
            100,
            100
        );
    }

    awake() {
        this.board.goto('RESET_BOARD');
    }

    restartScene() {
        this.board.goto('RESET');
    }

    shutdown() {
        this.board.destroy();
        this.board = undefined;
        super.shutdown();
    }
}
