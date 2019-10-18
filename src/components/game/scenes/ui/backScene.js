import BaseScene from "../scene";

/**
 * Класс сцены фона игры
 * @extends {BaseScene}
 */
export default class BackScene extends BaseScene {

  /**
 * description
 */
  constructor() {
    super({
      key: "BackScene"
    });
  }

  /**
 * description
 */
  create() {
    super.create();
    this.events.once("transitionstart", this.transitionStart, this);
    this.cameras.main.alpha = 0;
  }

  /**
 * description
 * @param {string} fromScene
 * @param {number} duration
 */
  transitionStart(fromScene, duration) {
    this.log.info("transition start");
    this.events.once("transitioncomplete", this.transitionComplete, this);
    this.tweens.add({
      targets: this.cameras.main,
      alpha: 1.0,
      duration
    });
    this.scene.launch("HelloScene");
    const helloCam = this.scene.get("HelloScene").cameras.main;
    this.tweens.add({
      targets: helloCam,
      alpha: 1,
      duration
    });
  }

  /**
 * description
 */
  transitionComplete() {
    this.log.info("transition complete");
    this.log.info(this);
    this.scene.get("HelloScene").buttons.play.setEnable(true);
  }
}
