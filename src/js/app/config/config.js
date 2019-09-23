import Phaser from 'phaser';

export default {
    type: Phaser.AUTO,
    disableContextMenu: true, // Отключаем отрытие контекстного меню при нажатии правой конпи мыши
    transparent: true, // Устанавливаем прозрачный бэкграунд
    loader: {
        path: ASSETS_PATH // Относительный путь к папке ресурсов
    },
    scale: {
        parent: document.querySelector('.game-container'), // Родительский контрейнер
        mode: Phaser.Scale.FIT, // Растягиваем канвас по по ширине родителя, сохраняя пропорции
        autoCenter: Phaser.Scale.CENTER_BOTH, // Центруем канвас
        resolution: window.devicePixelRatio || 1, // Разрешение (оношение физических пикселей экрана к css пикселям)
        width: GAME_WIDTH, // Натуральная ширина игрового поля
        height: GAME_HEIGHT // Натуральная высота игрового поля
    }
};
