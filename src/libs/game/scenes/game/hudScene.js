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
  }

  /**
 * description
 */
  wake() {
    super.wake();
    this.buttons.restart.setEnable(true);
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
   * @param  {...any} args
   */
  updateMatches(...args) {
    this.log.info("update matches", args);
  }
  /**
   * description
   * @param  {...any} args
   */
  updateScore(...args) {
    this.log.info("update score", args);
  }
}
