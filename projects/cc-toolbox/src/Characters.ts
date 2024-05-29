/**
 * Title    : Characters
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/Characters.ts
 * Version  : 1.0.0
 * Published: https://gitlab.com/glimpse-of-life
 *
 * A tool to organize some Characters.
 *
 ** Licence
 * Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
 * https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode
 * https://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1
 *
 ** Licence in short terms:
 * Do not sell the code, or creative stuff made with this code.
 * You are allowed to make someone happy, and give away the works you have created with it for free.
 * Learn, code, create, and have fun.
 *
 * @author Carsten Nichte - 2022
 */

const random = require('canvas-sketch-util/random');

export class Characters {
  /**
   *
   * @param {String} template_name
   * @param {number} index
   * @returns String - the pick
   */
  public static choose_from_template_name(template_name:string, index:number = -1):string {
    let content_array = Characters.SetTemplates[template_name].split("");

    if (index > -1) {
      return Characters.choose_from_template_content(content_array, index);
    } else {
      return random.pick(content_array);
    }
  }

  /**
   * TODO: Den index 0...99 mappen auf tatsächliche länge des Array (hab ich irgendwo schon gelöst...)
   * @param {String | Array} template_content
   * @param {number} index (0-99 oder 1-100?)
   * @returns String - the pick
   */
  public static choose_from_template_content(template_content:string | string[], index:number):string {
    let content_array = template_content;

    if (!Array.isArray(template_content)) {
      content_array = template_content.split("");
    }

    let i = index < content_array.length ? index : content_array.length - 1;
    return content_array[i];
  }

  public static SetTemplates:any = {
    stars1: "★☆✡✦✧✩✪✫✬✭✮✯✰⁂⁎⁑✢✣✤✥✱✲✳✴✵✶✷✸✹✺✻✼✽✾✿❀❁❂❃❇❈❉❊❋❄❆❅⋆≛ᕯ✲࿏꙰۞⭒⍟",
    stars2: "⭐✨",
    chess: "♔♕♖♗♘♙♚♛♜♝♞♟",
    cards: "♤♠♧♣♡♥♢♦",
    notes: "♩♪♫♬♭♮♯°ø؂≠≭",
    weather: "☀☁☂☃☉☼☽☾♁♨❄❅❆☇☈☄",
    smilies: "☹☺☻ヅツ㋡웃유シッ㋛",
    numbers: "➊➋➌➍➎➏➐➑➒➓",
    triangles: "◄▲▼►◀◣◥◤◢▶◂▴▾▸◁△▽▷∆∇⊳⊲⊴⊵◅▻▵▿◃▹◭◮⫷⫸⋖⋗⋪⋫⋬⋭⊿◬≜⑅",
  };
  
  public static SetNames:any = {
    nothing: "nothing",
    custom: "custom",
    random: "random",
    stars1: "stars1",
    stars2: "stars2",
    chess: "chess",
    cards: "cards",
    notes: "notes",
    weather: "weather",
    smilies: "smilies",
    numbers: "numbers",
    triangles: "triangles",
  };
  
}
