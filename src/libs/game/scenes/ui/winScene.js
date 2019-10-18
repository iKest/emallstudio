import BaseScene from "../scene";

/**
 * Класс сцены победы
 * @extends {Scene}
 */
export default class WinScene extends BaseScene {

  /**
   * description
   */
  constructor() {
    super({
      key: "WinScene"
    });
  }

  /**
   * description
   */
  create() {
    super.create();
    this.buttons.playAgain.setEnable(true);
  }

  /**
   * description
   */
  sleep() {
    this.buttons.playAgain.setEnable(false);
    super.sleep();
  }

  /**
   * description
   */
  wake() {
    super.awake();
    this.buttons.playAgain.setEnable(true);
  }
}
