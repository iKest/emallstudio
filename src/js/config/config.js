export default {
    type: Phaser.AUTO,
    backgroundColor: '#2dab2d',
    scale: {

        parent: document.querySelector('.game-container'),
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 900, // Натуральная ширина игрового поля
        height: 1600 // Натуральная высота игрового поля
    }
};
