import TextArea from "phaser3-rex-plugins/templates/ui/textarea/TextArea";
import BaseScene from "../scene";

const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x4c4643;

/**
 * Класс начальной сцены
 * @extends {BaseScene}
 */
export default class HelloScene extends BaseScene {

  /**
 * description
 */
  constructor() {
    super({
      key: "HelloScene"
    });
  }

  /**
 * description
 */
  create() {
    super.create();
    this.cameras.main.alpha = 0;
    this.textArea = new TextArea(this, {
      x: this.cameras.main.width * 0.5 + 10,
      y: this.cameras.main.height * 0.5 + 30,
      width: 600,
      height: 750,
      text: this.make.rexBBCodeText({
        style: {
          fontFamily: "Antikvar",
          fontSize: "60px",
          color: "#793C1D",
          halign: "center"
        },
        add: true
      }),
      slider: {
        track: this.add.rexRoundRectangle(0, 0, 10, 10, 5, COLOR_DARK),
        thumb: this.add.rexRoundRectangle(0, 0, 16, 20, 8, COLOR_LIGHT)
      },
      content: "[b][color=#D6000C]О[/color][/b]сенью, когда на улице проморзгло и сыро так приятно выпить [b][color=#D6000C]горячего кофе[/color][/b] в хорошей компании. А ещё приятнее, когда кофе достаётся тебе [b][color=#D6000C]бесплатно[/color][/b]. Мы предлагаем тебе скоротать время за интересной игрой и, к тому-же, в очень уютном месте. Чем больше очнов ты наберёш, тем болле вкусным кофе мы тебя угостим.\nПравила очень простые - тебе нужно убирать с поля группы из двух и более фишек, просто тапнув по любой фишке в группе. Чем больше фишек будет в группе, тем больше очков ты получишь.\nВ случае когда в группе уничтоженных фишек 2 фишки - за каждую начисляется по одному очку, то есть за комбинацию из [color=#488C7B]двух фишек - 2 очка\nза 3 фишки - 6 очков\nза 4 фишки - 12 очков\nза 5 фишек - 20 очков[/color]\nдалее прогрессия продолжается: [color=#488C7B]6-30, 7-42, 8-56...[/color]\nИгра заканчивается, когда не останется ходов или, когда с поля будут убраны все фишки.\n*\n[b][color=#D6000C]Ароматный кофе ждёт тебя![/color][/b]\n\n\n\n",
      name: "helloText"
    })
      .setDepth(-1)
      .layout();
  }

}
