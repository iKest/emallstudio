import BaseScene from "../scene";

/**
 * Класс интерфейса игровой сцены
 * @extends {BaseScene}
 */
export default class HUDScene extends BaseScene {

  /**
 * description
 */
  constructor() {
    super({
      key: "HUDScene"
    });
  }

  /**
 * description
 */
  create() {
    super.create();
    this.texts.scoreText.setText(this.registry.get("score"));
    this.texts.movesText.setText(this.registry.get("moves"));
    this.registry.events.on("changedata-score", this.updateScore, this);
    this.registry.events.on("changedata-moves", this.updateMatches, this);
    this.buttons.restart.setEnable(true);
  }

  /**
 * description
 */
  sleep() {
    this.buttons.restart.setEnable(false);
    this.registry.events.off("changedata-score", this.updateScore, this);
    this.registry.events.off("changedata-moves", this.updateMatches, this);
    super.sleep();
  }

  /**
 * description
 */
  wake() {
    super.wake();
    this.buttons.restart.setEnable(true);
    this.texts.scoreText.setText(this.registry.get("score"));
    this.texts.movesText.setText(this.registry.get("moves"));
    this.registry.events.on("changedata-score", this.updateScore, this);
    this.registry.events.on("changedata-moves", this.updateMatches, this);
  }

  /**
 * description
 * @param {*} target
 */
  restartScene(target) {
    this.scene.get("GameScene").restartScene();
  }

  /**
  * description
  *
  * @param {*} instance
  * @param {*} current
  * @param {*} prev
  */
  updateMatches(instance, current, prev) {
    this.texts.movesText.setText(current);
  }
  /**
  * description
  *
  * @param {*} instance
  * @param {*} current
  * @param {*} prev
  */
  updateScore(instance, current, prev) {
    this.texts.scoreText.setText(current);
  }
}
