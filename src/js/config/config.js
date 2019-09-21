import Phaser from 'phaser';

export default {
    type: Phaser.AUTO,
    backgroundColor: '#2dab2d',
    scale: {
        parent: document.querySelector('.game-container'),
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        resolution: window.devicePixelRatio || 1,
        width: 900, // Натуральная ширина игрового поля
        height: 1600,
        disableContextMenu: true // Натуральная высота игрового поля
    }
};
