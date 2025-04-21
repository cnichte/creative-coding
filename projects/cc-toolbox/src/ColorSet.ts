/**
 * Title    : ColorSet
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/ColorSet.ts
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
 *
 * Supports:
 * - ParameterSet   : yes
 * - Tweakpane      : yes
 * is:
 * - Observer       : no
 * - ObserverSubject: yes
 * - prefixable:    : no

 ** A tool to organize Colors in Sets and Collections.
 *  Supports: Tweakpane, ParamterSet
 *  Supports: Observer, AnimationTimer
 *
 * In case of using the static methods no observers will be informed;
 * For this I need to have an instance: let cs = new ColorSet();
 * and call the method cs.checkObserverSubject(params: CheckObserverSubject_ColorSet_Parameter)
 *
 * Heavily inspired by
 * https://github.com/kgolid/chromotome
 * https://kgolid.github.io/chromotome-site/
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

// ColorSet.ts
const Color = require("canvas-sketch-util/color");

import { Pane } from "tweakpane";
import { Brush } from "./Brush";
import { ObserverSubject } from "./ObserverPattern";
// import {  Animation } from "./Animation.js";
import { AnimationTimer } from "./AnimationTimer";
import {
  TweakpaneSupport,
  type Provide_Tweakpane_To_Props,
  type Tweakpane_Items,
  type TweakpaneSupport_Props,
} from "./TweakpaneSupport";

// The Collections, with sets of colors
import type ColorSetType from "./ColorSetType";

import cako from "./colorset/cako";
import colourscafe from "./colorset/colourscafe";
import dale from "./colorset/dale";
import ducci from "./colorset/ducci";
import duotone from "./colorset/duotone";
import exposito from "./colorset/exposito";
import flourish from "./colorset/flourish";
import hilda from "./colorset/hilda";
import iivonen from "./colorset/iivonen";
import judson from "./colorset/judson";
import jung from "./colorset/jung";
import kovecses from "./colorset/kovecses";
import mayo from "./colorset/mayo";
import misc from "./colorset/misc";
import orbifold from "./colorset/orbifold";
import ranganath from "./colorset/ranganath";
import rohlfs from "./colorset/rohlfs";
import roygbivs from "./colorset/roygbivs";
import spatial from "./colorset/spatial";
import system from "./colorset/system";
import tsuchimochi from "./colorset/tsuchimochi";
import tundra from "./colorset/tundra";
import type { Size } from "./Size";

//! SyntaxError: Unexpected token: operator (=)
//TODO Ist das immer noch so? The variable must be global so that 'canvas-sketch --build --inline' runs through without errors.
// static colorsets = cako.concat(tundra,...); //! This doesnt work for the canvas-sketch builder

let colorsets = cako.concat(
  colourscafe,
  dale,
  ducci,
  duotone,
  exposito,
  flourish,
  hilda,
  iivonen,
  judson,
  jung,
  kovecses,
  mayo,
  misc,
  orbifold,
  ranganath,
  rohlfs,
  roygbivs,
  spatial,
  system,
  tsuchimochi,
  tundra
);

// here the names get lost.
// TODO use the Names (siehe weiter unten - ColorSet.colorCollection)

/**
 * The Parameter-Set for ColorSet.
 * @export
 * @interface ColorSet_ParameterSet
 */
export interface ColorSet_ParameterSet {
  mode: string; // "custom, colorset, random, chaos"
  groupname: string; // The name of The colorset
  variant: number; // A name could return more then one colorset. This is to choose one of them.
  variant_index: number;

  number: number; // A colorset has more than one color. This is to choose a specific.
  number_index: number;
  cs_object: ColorSetType | null; // The ColorSet-Object

  borderColor: string; // Three default colors with alpha, extracted for easy access
  fillColor: string;
  backgroundColor: string;
}

export interface ColorSet_ParameterTweakpane {
  colorset_mode: string;
  colorset_groupname: string;
  colorset_variante: number;
  colorset_number: number;
  colorset_setname: string;
}

/**
 * - groupname - name of the coloset
 * - [mode="colorset"] - custom, colorset,random,chaos
 * - [variant=-1] - number of colorset variant. default=-1 means: random, or first?
 * - [number=-1] - number of color from the choosen set. default=-1 means: random, or first?
 *
 * @export
 * @interface CheckObserverSubject_ColorSet_Parameter
 */
export interface CheckObserverSubject_ColorSet_Parameter {
  groupname: string;
  mode: string;
  variant: number;
  number: number;
}

export interface CS_Result {
  index: number;
  cs_object: ColorSetType | null;
}

export interface CS_Result_String {
  index: number;
  color: string;
}

export interface CS_ResultColorInfo {
  borderColor: string;
  fillColor: string;
  backgroundColor: string;

  borderColorAlpha: number;
  fillColorAlpha: number;
  backgroundColorAlpha: number;

  borderColorIndex: number;
  fillColorIndex: number;
  backgroundColorIndex: number;

  variant_index: number;
}

/**
 * This reflects the internal state, and is used by ObserverSubject functionality.
 *
 * @interface State
 */
export interface State {
  colorset: ColorSet_ParameterSet;
}

export class ColorSet extends ObserverSubject {
  private parameter: any;
  public animationTimer: AnimationTimer;

  public state: State;
  private state_last: State;

  public static Groups = {
    cako: "cako",
    colourscafe: "colourscafe",
    dale: "dale",
    ducci: "ducci",
    duotone: "duotone",
    exposito: "exposito",
    flourish: "flourish",
    hilda: "hilda",
    iivonen: "iivonen",
    judson: "judson",
    jung: "jung",
    kovecses: "kovecses",
    mayo: "mayo",
    misc: "misc",
    orbifold: "orbifold",
    ranganath: "ranganath",
    rohlfs: "rohlfs",
    roygbivs: "roygbivs",
    spatial: "spatial",
    system: "system",
    tsuchimochi: "tsuchimochi",
    tundra: "tundra",
  };

  /**
   * A static Property for the Class, to bring the names back to the game.
   */
  public static Modes = {
    use_custom_colors: "use_custom_colors", // custom
    animate_from_colorset: "animate_from_colorset", // colorset
    animate_from_group: "animate_from_group", // random
    animate_from_all: "animate_from_all", // chaos
  };

  /**
   * Creates an instance of ColorSet.
   * @param {*} parameter
   * @memberof ColorSet
   */
  constructor(parameter: any) {
    super();
    this.parameter = parameter;

    this.animationTimer = new AnimationTimer(this);

    this.state = {
      colorset: {
        mode: "",

        groupname: "",
        variant: 0,
        variant_index: 0,

        number: 0,
        number_index: 0,

        cs_object: null,

        borderColor: "",
        fillColor: "",
        backgroundColor: "",
      },
    };

    this.state_last = ColorSet.cloneState(this.state);
  }

  public static clone_cs_object(cs: ColorSetType | null): ColorSetType | null {
    let copy: ColorSetType | null = null;

    if (cs != null) {
      copy = {
        name: cs.name,
        colors: cs.colors,
      };
    }
    return copy;
  }

  public static cloneState(state: State): State {
    let copy: State = {
      colorset: {
        mode: state.colorset.mode,
        groupname: state.colorset.groupname,
        variant: state.colorset.variant,
        variant_index: state.colorset.variant_index,
        number: state.colorset.number,
        number_index: state.colorset.number_index,
        cs_object: ColorSet.clone_cs_object(state.colorset.cs_object),
        borderColor: state.colorset.borderColor,
        fillColor: state.colorset.fillColor,
        backgroundColor: state.colorset.backgroundColor,
      },
    };
    return copy;
  }

  /**
   * Sets the state from the selected colorset and notifies all Observers.
   *
   * All Observers get the same color supplied for: borderColor, fillColor, backgroundColor.
   * and the complete ColorSet object with a palette,
   * which can then be used additionally by the user.
   * TODO: Pass on an array with all Colorsets of the group.
   * ? bei variante=-1 und number=-1 ???
   * ? oder abhängig vom mode
   *
   * The mode is only passed through. The user must take care of this himself.
   * @see get_colors_from_mode(...)
   *
   * This color selection completely ignores the mode, so that has to be handled by the user.
   * TODO handle alle modes bis auf custom. Problen: Umgang mit Alpha
   *
   * @param {CheckObserverSubject_ColorSet_Parameter} params
   * @memberof ColorSet
   */
  check_ObserverSubject(params: CheckObserverSubject_ColorSet_Parameter): void {
    let notify = false;

    // Notify only if changes occure
    if (this.state.colorset.mode !== params.mode) {
      // "custom, colorset, random, chaos"
      this.state_last.colorset.mode = this.state.colorset.mode;
      this.state.colorset.mode = params.mode;
      notify = true;
    }

    if (this.state.colorset.groupname !== params.groupname) {
      // We have more then one Colorset with that group
      this.state_last.colorset.groupname = this.state.colorset.groupname;
      this.state.colorset.groupname = params.groupname;
      notify = true;
    }

    if (this.state.colorset.variant !== params.variant) {
      // choose one set out of the group
      this.state_last.colorset.variant = this.state.colorset.variant;
      this.state.colorset.variant = params.variant;
      notify = true;
    }

    if (this.state.colorset.number !== params.number) {
      // We have more than one Color in the Set
      this.state_last.colorset.number = this.state.colorset.number;
      this.state.colorset.number = params.number;
      notify = true;
    }

    if (notify || this.state.colorset.cs_object == null) {
      let cs_result = ColorSet.get(params.groupname, params.variant);

      this.state_last.colorset.cs_object = ColorSet.clone_cs_object(
        this.state.colorset.cs_object
      );
      this.state.colorset.cs_object = cs_result.cs_object;
      this.state.colorset.variant_index = cs_result.index;

      let exclude = new Array();

      // number - eine der Farben im Set sollte per TP-Schieber ausgewählt werden können.
      if (this.state.colorset.cs_object != null) {
        this.state.colorset.fillColor = ColorSet.get_color_from_colorset(
          this.state.colorset.cs_object,
          [],
          params.number
        ).color;

        exclude.push(this.state.colorset.fillColor);

        let color1 = ColorSet.get_color_from_colorset(
          this.state.colorset.cs_object,
          exclude,
          params.number
        ).color;

        if ("stroke" in this.state.colorset.cs_object) {
          if (this.state.colorset.cs_object.stroke != null) {
            this.state.colorset.borderColor =
              this.state.colorset.cs_object.stroke;
          }
        } else {
          this.state.colorset.borderColor = color1;
          exclude.push(color1);
        }

        let color2 = ColorSet.get_color_from_colorset(
          this.state.colorset.cs_object,
          exclude,
          params.number
        ).color;

        if ("background" in this.state.colorset.cs_object) {
          if (this.state.colorset.cs_object.background != null) {
            this.state.colorset.backgroundColor =
              this.state.colorset.cs_object.background;
          }
        } else {
          this.state.colorset.backgroundColor = color2;
        }

        notify = true;
      } //
    }

    // Ausgabe des gewählten ColorSets in der Tweakpane
    if (this.state.colorset.cs_object != null) {
      this.parameter.tweakpane.colorset_setname =
        this.state.colorset.cs_object.name +
        ", " +
        this.state.colorset.number_index;
    }

    // notifyAll(this, new, last)
    if (notify) super.notifyAll(this, this.state.colorset);
  } // checkObserverSubject

  //! static stuff

  /**
   * Get a color from the Colorset.
   * Optional: Exclude some colors.
   *
   * @static
   * @param {ColorSetType} colorset
   * @param {string[]} [exclude=[]] - exclude some colors
   * @param {number} [colornumber=-1] - get number (0-99), or random (-1).
   * @return {*}  {CS_Result_String} - { color:"#ffffffff", index:0 }
   * @memberof ColorSet
   */
  public static get_color_from_colorset(
    colorset: ColorSetType,
    exclude: string[] = [],
    colornumber: number = -1
  ): CS_Result_String {
    let result: CS_Result_String = {
      index: 0,
      color: "",
    };

    const excludeSet = new Set(exclude);

    const color_stock = colorset.colors.filter((color: string) => {
      return !excludeSet.has(color);
    });

    if (colornumber > -1) {
      let pick = colornumber / 100;
      result.index = Math.floor(pick * color_stock.length);

      // TODO: Den tatsächlichen index mit zurückgeben? {color:"#...", index:3}
      // Ich komm darauf weil ich den in der Tweakpane nicht angezeigt bekomme
      result.color = color_stock[result.index];
    } else {
      result.index = Math.floor(Math.random() * color_stock.length);
      result.color = color_stock[result.index];
    }

    return result;
  } // get_color_from_colorset

  /**
   * Creates and bundles some color stuff from colormode, colorset, and brush.
   * Takes the Alpha for all modes from the Brush.
   *
   * custom   - Take the colors from the Tweakpane (from the Brush).
   * colorset - Take only the colors from the set Colorset (Group and Variant).
   * random   - Take the colors from the group.
   * chaos    - Mix the colors from all the color sets.
   *
   * @static
   * @param {ColorSet_ParameterSet} colorset_parameterSet
   * @param {Brush} brush
   * @return {*}  {CS_ResultColorInfo}
   * @memberof ColorSet
   */
  public static get_colors_from_mode(
    colorset_parameterSet: ColorSet_ParameterSet,
    brush: Brush
  ): CS_ResultColorInfo {
    let mode = colorset_parameterSet.mode;
    let groupname = colorset_parameterSet.groupname;
    let cs_object = colorset_parameterSet.cs_object;
    let variant = colorset_parameterSet.variant;
    let number = colorset_parameterSet.number;

    // TODO: Hier auch "colorset:" damit die Struktur einheitlich ist?
    let result: CS_ResultColorInfo = {
      borderColor: "",
      fillColor: "",
      backgroundColor: "",

      borderColorAlpha: 0,
      fillColorAlpha: 0,
      backgroundColorAlpha: 0,

      borderColorIndex: 0,
      fillColorIndex: 0,
      backgroundColorIndex: 0,

      variant_index: 0,
    };

    switch (mode) {
      case ColorSet.Modes.animate_from_colorset: // colorset
        //* Take only the colors from the set Colorset (Group and Variant).
        if (cs_object != null) {
          // The colours provided by the ColorSet are set via update Method.
          // but we get the alpha from the Tweakpane Parameters (out of the brush)
          result.borderColor = ColorSet.get_color_from_colorset(
            cs_object,
            [],
            -1
          ).color;
          result.fillColor = ColorSet.get_color_from_colorset(
            cs_object,
            [],
            -1
          ).color;
          result.backgroundColor = ColorSet.get_color_from_colorset(
            cs_object,
            [],
            -1
          ).color;

          result.borderColorAlpha = Color.parse(brush.borderColor).alpha;
          result.fillColorAlpha = Color.parse(brush.fillColor).alpha;
          result.backgroundColorAlpha = Color.parse(brush.fillColor).alpha;
        } else {
          // TODO
          console.log(
            "ColorSet - ColorSet (cs_object) fehlt im Parameter!",
            colorset_parameterSet
          );
        }

        break;

      case ColorSet.Modes.animate_from_group: // random
        //* Nehme die Farben aus der Gruppe.
        let cs_result = ColorSet.get(groupname, variant);

        cs_object = cs_result.cs_object;
        result.variant_index = cs_result.index;

        if (cs_object != null) {
          result.borderColor = ColorSet.get_color_from_colorset(
            cs_object,
            [],
            -1
          ).color;
          result.fillColor = ColorSet.get_color_from_colorset(
            cs_object,
            [],
            -1
          ).color;
          result.backgroundColor = ColorSet.get_color_from_colorset(
            cs_object,
            [],
            -1
          ).color;

          // but get the alpha from the Tweakpane / Parameters
          result.borderColorAlpha = Color.parse(brush.borderColor).alpha;
          result.fillColorAlpha = Color.parse(brush.fillColor).alpha;
          result.backgroundColorAlpha = Color.parse(brush.fillColor).alpha;
        } else {
          console.log(
            "ColorSet - kein ColorSet gefunden für groupname und variant",
            colorset_parameterSet
          );
          // TODO
        }

        break;
      case ColorSet.Modes.animate_from_all: // "chaos"
        //* Mische aus allen Colorsets die Farben durcheinander.
        result.borderColor = ColorSet.get_random_color_from_random_colorset();
        result.fillColor = ColorSet.get_random_color_from_random_colorset();
        result.backgroundColor =
          ColorSet.get_random_color_from_random_colorset();

        // but get the alpha from the Tweakpane / Parameters
        result.borderColorAlpha = Color.parse(brush.borderColor).alpha;
        result.fillColorAlpha = Color.parse(brush.fillColor).alpha;
        result.backgroundColorAlpha = Color.parse(brush.fillColor).alpha;

        break;
      case ColorSet.Modes.use_custom_colors: // "custom"
      default:
        // Take the colors from the Tweakpane (from the Brush).
        result.borderColor = brush.borderColor;
        result.fillColor = brush.fillColor;
        result.backgroundColor = brush.fillColor;

        result.fillColorAlpha = Color.parse(brush.fillColor).alpha;
        result.borderColorAlpha = Color.parse(brush.borderColor).alpha;
        result.backgroundColorAlpha = Color.parse(brush.fillColor).alpha;
    }

    // Would that make sense? - I think not because...
    // But then the method can't be static anymore.
    //?? super.notifyAll(this, this.state.colorset);

    return result;
  } // get_colors_from_mode

  /**
   * Get a random Set from all the Collections.
   *
   * @static
   * @return {*}  {ColorSetType}
   * @memberof ColorSet
   */
  public static get_random_colorset(): ColorSetType {
    return colorsets[Math.floor(Math.random() * colorsets.length)];
  } // get_random_colorset

  /**
   * Get a random Color from a random chosen Set.
   *
   * @static
   * @param {string[]} [exclude=[]] - optional exclude some colors
   * @return {*}  {string} - #ffffffFF
   * @memberof ColorSet
   */
  static get_random_color_from_random_colorset(exclude: string[] = []): string {
    return this.get_color_from_colorset(this.get_random_colorset(), exclude)
      .color;
  }

  /**
   *
   *
   * @static
   * @param {string} groupname
   * @param {number} [variant=-1] -1 = random one. 0-99 = pick one of all with mapped index
   * @return {*}  {CS_Result} // { index:0, cs_object:Object } or cs_object is Array
   * @memberof ColorSet
   */
  public static get(groupname: string, variant: number = -1): CS_Result {
    // | CS_Result[]

    let result: CS_Result = {
      index: 0,
      cs_object: null,
    };

    // find all matchings, and return an array of sets
    let cs_selection: ColorSetType[] = colorsets.filter(
      (colorset: ColorSetType) => colorset.name.startsWith(groupname)
    );

    // map 0-99 to the actual length of the array
    // zB 5 .... 5/100 = 0.05 per step. But only integers go as index in the array
    // TODO: Ist eigentlich immer ein Array??? + variante
    if (Array.isArray(cs_selection) && variant > -1) {
      let pick = variant / 100;
      result.index = Math.floor(pick * cs_selection.length);

      result.cs_object = cs_selection[result.index];
    } else {
      let pick = Math.random();
      result.index = Math.floor(pick * cs_selection.length);

      result.cs_object = cs_selection[result.index];
    }

    // TODO: This is not allowed to return an array at the moment.
    // Because the rest of the mechanics can't handle it yet.
    return result;
  } // get

  /**
   * Get all Sets.
   *
   * @static
   * @return {*}  {ColorSetType[]} Array of ColorSet Objects
   * @memberof ColorSet
   */
  public static getAll(): ColorSetType[] {
    return colorsets;
  } // getAll

  /**
   * Get an Array of all Names of the Sets.
   *
   * @static
   * @return {*}  {string[]} List of ColorSet Names
   * @memberof ColorSet
   */
  public static getNames(): string[] {
    return colorsets.map((colorset: any) => colorset.name);
  } // getNames

  //* --------------------------------------------------------------------
  //*
  //* Parameter-Set Object + Tweakpane
  //*
  //* --------------------------------------------------------------------

  /**
   * TweakpaneSupport has three Methods:
   *
   * - inject_parameterset_to
   * - transfer_tweakpane_parameter_to
   * - provide_tweakpane_to
   *
   * @static
   * @type {TweakpaneSupport}
   * @memberof ColorSet
   */
  public static tweakpaneSupport: TweakpaneSupport = {
    /**
     ** --------------------------------------------------------------------
     ** Inject
     ** --------------------------------------------------------------------
     * @param parameter
     * @param parameterSetName
     */
    inject_parameterset_to: function (
      parameter: any,
      props: TweakpaneSupport_Props
    ): void {
      let parameterSet: ColorSet_ParameterSet = {
        mode: parameter.tweakpane.colorset_mode,
        groupname: parameter.tweakpane.colorset_groupname,
        variant: parameter.tweakpane.colorset_variante,
        variant_index: 0,
        number: parameter.tweakpane.colorset_number,

        number_index: 0,
        cs_object: null,
        borderColor: "",
        fillColor: "",
        backgroundColor: "",
      };

      Object.assign(parameter, {
        colorset: parameterSet,
      });

      let props1: TweakpaneSupport_Props = {
        parameterSetName: "colorset",
      };

      // TODO AnimationTimer nicht hier sondern in AnimationTimer.provide_tweakpane_to initialisieren?
      // dann ist sie automatisch initialisiert was das handling vereinfacht
      //* Finde, so ist es zumindest in diesem Fall nachvollziehbarer
      AnimationTimer.tweakpaneSupport.inject_parameterset_to(parameter, props1);
    },
    /**
     ** --------------------------------------------------------------------
     ** Transfert
     ** --------------------------------------------------------------------
     * @param parameter
     * @param parameterSetName
     */
    transfer_tweakpane_parameter_to: function (
      parameter: any,
      props: TweakpaneSupport_Props
    ): void {
      let pt: ColorSet_ParameterTweakpane = parameter.tweakpane;
      parameter.colorset.mode = pt.colorset_mode;
      parameter.colorset.groupname = pt.colorset_groupname;
      parameter.colorset.variant = pt.colorset_variante;
      parameter.colorset.number = pt.colorset_number;

      let props1: TweakpaneSupport_Props = {
        parameterSetName: "colorset",
      };

      AnimationTimer.tweakpaneSupport.transfer_tweakpane_parameter_to(
        parameter,
        props1
      );
    },
    /**
     ** --------------------------------------------------------------------
     ** Tweakpane
     ** --------------------------------------------------------------------
     *
     * @abstract
     * @param {*} parameter - The parameter object
     * @param {Provide_Tweakpane_To_Props} props
     * @return {*}  {*}
     * @memberof TweakpaneSupport
     */
    provide_tweakpane_to: function (
      parameter: any,
      props: Provide_Tweakpane_To_Props
    ): Tweakpane_Items {
      let parameterTP: ColorSet_ParameterTweakpane = {
        colorset_mode: "animate_from_all",
        colorset_groupname: "",
        colorset_variante: -1,
        colorset_number: -1,
        colorset_setname: "MonitorColorSet",
      };

      parameter.tweakpane = Object.assign(parameter.tweakpane, parameterTP);

      ColorSet.tweakpaneSupport.inject_parameterset_to(parameter);

      if (props.items.folder == null) {
        props.items.folder = props.items.pane.addFolder({
          title: props.parameterSetName + "Color Palette",
          expanded: false,
        });
      }

      if (props.use_separator) {
        props.items.folder.addBlade({
          view: "separator",
        });
      }

      props.items.folder.addBinding(parameter.tweakpane, "colorset_mode", {
        label: "Mode",
        options: ColorSet.Modes,
      });

      props.items.folder.addBinding(parameter.tweakpane, "colorset_groupname", {
        label: "Group",
        options: ColorSet.Groups,
      });

      // A Monitor
      props.items.folder.addBinding(parameter.tweakpane, "colorset_setname", {
        label: "G.V, C",
        readonly: true,
        multiline: false,
      });

      props.items.folder.addBinding(parameter.tweakpane, "colorset_variante", {
        label: "Variante",
        max: 99,
        min: -1,
        step: 1,
      });

      props.items.folder.addBinding(parameter.tweakpane, "colorset_number", {
        label: "Color",
        max: 99,
        min: -1,
        step: 1,
      });

      props.items.folder.addBlade({
        view: "separator",
      });

      AnimationTimer.tweakpaneSupport.provide_tweakpane_to(parameter, {
        items:{
          pane: props.items.pane,
          folder: props.items.folder,
          tab: null
        },
        folder_name_prefix: "",
        use_separator: false,
        parameterSetName: "colorset",
        excludes: [],
        defaults: {},
      });

      return props.items;
    },
  };
} // class ColorSet
