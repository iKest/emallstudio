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
    this.setPtomo();
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
    super.wake();
    this.setPtomo();
    this.buttons.playAgain.setEnable(true);
  }

  /**
   * description
   */
  setPtomo() {
    const score = this.registry.get("score");
    const [promo] = this.cache.json.get("promocodes").promocodes.filter(promo => promo[1] < score &&  score < promo[2]);
    this.texts.promo3.setText(promo[0]);
  }
}
