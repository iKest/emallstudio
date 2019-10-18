import BaseScene from "../scene";

/**
 * Класс сцены загрузки ресурсов
 * @extends {BaseScene}
 */
export default class BootScene extends BaseScene {
/**
 * description
 */
  constructor() {
    super({
      key: "BootScene"
    });
  }

  /**
 * description
 */
  preload() {
    this.log.info("preload");
    this.load.once("complete", this.complete, this);
    this.load.once("loaderror", this.loadError, this);
    this.load.on("filecomplete", this.fileComplete, this);
    this.log.info("начало загрузки ассетов");
    this.load.pack("assets", "assets.json", "assets");
  }

  /**
 * description
 */
  complete() {
    this.load.off("loaderror", this.loadError, this);
    this.load.off("filecomplete", this.fileComplete, this);
    this.log.info("Все ассеты загружены");
    this.registry.set("score", 0);
    this.registry.set("moves", this.cache.json.get("game").moves);
    this.registry.set(
      "language",
      this.cache.json.get("languages").languages[
        this.cache.json.get("languages").default
      ]
    );
    this.game.events.emit("soure-load-complete");
    /* Объявление анимаций спрайтов
        const animFrames = this.anims.generateFrameNumbers('tile', {
            start: 0,
            end: 10
        });
        this.anims.create({
            key: 'tile_anim',
            frames: animFrames,
            frameRate: 30,
            repeat: -1,
            showOnStart: false,
            hideOnComplete: false
        });
        */
    // Запускем сцену с фоновфм изображением
    this.scene.transition({
      target: "BackScene",
      duration: 500
    });
  }

  /**
 * description
 * @param {Phaser.Loader.Files} file
 */
  loadError(file) {
    this.log.error("ошибка загрузки файла:", file.src);
    this.load.off("complete", this.complete, this);
    this.load.off("loaderror", this.loadError, this);
    this.load.off("load", this.fileComplete, this);
    this.load.reset();
    this.sys.game.destroy(true);
  }

  /**
 * description
 * @param {string} key
 */
  fileComplete(key) {
    this.log.info(key, "загружен");
  }
}
