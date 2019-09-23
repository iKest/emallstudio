import Scene from '../scene';

export class BackScene extends Scene {
    constructor() {
        super({
            key: 'BackScene'
        });
    }

    create(key) {
        // Добавляем фоновое изображение для игры
        this.make.image({ key, add: true }).setOrigin(0);
    }
}
