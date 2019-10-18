import Phaser from "phaser";

export const gameConfig = {
  type: Phaser.AUTO,
  disableContextMenu: true, // Отключаем отрытие контекстного меню при нажатии правой конпи мыши
  transparent: true, // Устанавливаем прозрачный бэкграунд
  loader: {
    path: ASSETS_PATH // Относительный путь к папке ресурсов
  },
  scale: {
    mode: Phaser.Scale.FIT, // Растягиваем канвас по по высоте родителя, сохраняя пропорции
    autoCenter: Phaser.Scale.CENTER_BOTH, // Центруем канвас
    width: GAME_WIDTH, // Натуральная ширина игрового поля
    height: GAME_HEIGHT, // Натуральная высота игрового поля
    expandParent: false
  }
};

export const TILE_SPEED = 3;
export const TILE_RELIVE_DURATION = 300;
export const TILE_KILL_DURATION = 300;
export const TILE_SHAKE_DURATION = 500;
