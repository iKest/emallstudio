import Scene from '../scene';

export class HelloScene extends Scene {
    constructor() {
        super({
            key: 'HelloScene'
        });
    }

    create() {
        // Уничтожаем загрузочную сцену
        this.scene.remove('BootScene');

        // Добавляем фоновое изображение на сцену
        const texture = this.textures.get('atlas3');
        this.cache.json.get('atlas_data').helloScene.forEach(frameKey => {
            const { spriteSourceSize } = texture.get(frameKey).customData;
            this.make
                .image({ key: 'atlas3', frame: frameKey, add: true })
                .setOrigin(0)
                .setPosition(spriteSourceSize.x, spriteSourceSize.y);
        });
        const text = this.add.text(100, 100, 'ИГРАТЬ', {
            fontFamily: 'Komika Title - Axis RUS-LAT',
            fontSize: 64,
            color: '#fff'
        });
    }
}
