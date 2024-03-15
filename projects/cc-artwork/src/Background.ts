/**
 * Title    : Background
 * Project  : Creative Coding
 * File     : projects/cc-utils/Background.ts
 * Version  : 1.0.0
 * Published: https://gitlab.com/glimpse-of-life
 *
 ** Draws a rectangular Shape on our Canvas, that represents a coloured Background.
 *
 * Follows the Observer Pattern:
 *  - class Background - is our Background Class
 *  - class Color_ObserverSubject - reacts on changes of the Background color, and notifies all Observers.
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
import { Pane } from "tweakpane";

const Color = require("canvas-sketch-util/color");

import { Brush } from "./Brush";
import { ColorSet, type ColorSet_ParameterSet } from "./ColorSet";
import { Format, type Format_ParameterSet } from "./Format";
import { Shape } from "./Shape";
import { Size } from "./Size";
import { Vector } from "./Vector";
import type { Observer, ObserverSubject } from "./ObserverPattern";

import {
  TweakpaneSupport,
  type Provide_Tweakpane_To_Props, type TweakpaneSupport_Props
} from "./TweakpaneSupport";

/**
 * The Parameter-Set for Background.
 * @export
 * @interface Background_ParameterSet
 */
export interface Background_ParameterSet {
  color : string;
}

/**
 * This reflects the internal state, and is used by Observer functionality.
 *
 * @interface State
 */
interface State {
  background: Background_ParameterSet;
  colorset: ColorSet_ParameterSet;
  format: Format_ParameterSet;
}

export class Background implements Observer {
  // extends / implements Pattern.Observer

  protected parameter: any;
  protected brush: Brush;
  protected state: State;

  /**
   * Construct the Thing.
   *
   * @param {Size} parameter - this.parameter.tweakpane.colorset_setname, this.parameter.tweakpane.background_color
   */
  constructor(parameter: any) {
    // this.parameter.artwork.canvas.size;

    this.parameter = parameter;

    this.brush = new Brush();

    this.state = {
      background:{
        color:"",
      },
      colorset: {
        mode: "use_custom_colors", // "custom, colorset, random, chaos"

        groupname: "", // The name of The colorset
        variant: 0, // A name could return more then one colorset. This is to choose one of them.
        variant_index: 0,

        number: 0, // A colorset has more than one color. This is to choose a specific.
        number_index: 0,

        cs_object: null, // The ColorSet-Object

        borderColor: "", // Three default colors with alpha, extracted for easy access
        fillColor: "",
        backgroundColor: "",
      },
      format: {
        type: "",
        fencing: true,
        aspect_ratio: 0,
        keep_aspect_ratio: true,
        position_lefttop: new Vector(0, 0),
        size: this.parameter.artwork.canvas.size,
        /* center is always the same, instead the case: we move the Format outside the center. */
        center: new Vector(
          this.parameter.artwork.canvas.size.width * 0.5,
          this.parameter.artwork.canvas.size.height * 0.5
        ),
        fak: new Vector(
          1.0,
          1.0
        ) /* A scale Factor, for Objects to fit in the Format. */,
      },
    };
  }

  /**
   * Is called from the ObserverSubject.
   * Background listenes to colorset changes.
   *
   * state ist zwar jetzt redundant, da es in source enthalten ist.
   * aber ich identifiziere damit noch die quelle
   * if ("colorset" in source.state) würde auch gehen, dann könnte state entfallen.
   *
   * @param {Object} source
   * @param {Object} state
   */
  update(source: ObserverSubject, data: any) {
    console.log("Observer data", data);

    if (source instanceof ColorSet) {
      // Die Zuweisung macht nur beim ersten mal Sinn.
      // Es wird ja ein Pointer (eine Refrerenz) zugewiesen,
      // und damit ist der Status sowieso immer auf dem aktuellesten Stand.
      // Jeder weitere Aufruf macht nur Sinn, wenn hier noch was anderes passiert.
      // zB. irgendwelche Berechnungen...
      this.state.colorset = data;
    }

    if (source instanceof Format) {
      this.state.format = data;
    }
  }

  /**
   * This is called by the AnimationTimer.
   *
   * @param {Class} source
   */
  animate_slow(source: any) {
    if (source instanceof ColorSet) {
      let random = ColorSet.get_colors_from_mode(
        this.state.colorset,
        this.brush
      );
      this.state.colorset.borderColor = random.borderColor;
      this.state.colorset.fillColor = random.fillColor;
      this.state.colorset.backgroundColor = random.backgroundColor;
    }
  }

  /**
   * Is called by the SceneGraph.
   *
   * @param {Object} context
   * @param {Object} parameter
   */
  draw(context: any, parameter: any) {
    // this.parameter.background.color;
    // this.parameter.tweakpane.background_color;
    Background.tweakpaneSupport.transfer_tweakpane_parameter_to(parameter);

    // Fill the canvas with Background Color.
    if (this.state.colorset.mode !== "use_custom_colors") {
      this.brush.borderColor = this.state.colorset.backgroundColor;
      this.brush.fillColor = this.state.colorset.backgroundColor;
    } else {
      this.brush.borderColor = this.parameter.background.color;
      this.brush.fillColor = this.parameter.background.color;
    }

    // No matter what color, alpha I take from the tweakpane
    this.brush.fillColorAlpha = Color.parse(
      parameter.tweakpane.background_color
    ).alpha;
    this.brush.borderColorAlpha = Color.parse(
      parameter.tweakpane.background_color
    ).alpha;

    Shape.draw(
      context,
      new Vector(0, 0), // this.state.format.position_lefttop
      this.state.format.size,
      this.brush,
      false
    );
  }

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
   * @memberof Background
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
      parameterSetName: string = ""
    ): void {
      Object.assign(parameter, {
        background: {
          color: parameter.tweakpane.background_color,
        },
      });
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
      parameterSetName: string = ""
    ): void {
      parameter.background.color = parameter.tweakpane.background_color;
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
    provide_tweakpane_to: function (parameter: any, props: Provide_Tweakpane_To_Props) {
      
      Background.tweakpaneSupport.inject_parameterset_to(parameter);

      parameter.tweakpane = Object.assign(parameter.tweakpane, {
        background_color: "#efefefFF",
      });

      if (props.folder == null) {
        props.folder = props.pane.addFolder({
          title: props.folder_name_prefix + "Background",
        });
      }

      if (props.use_separator) {
        props.folder.addBlade({
          view: "separator",
        });
      }

      props.folder.addBinding(parameter.tweakpane, "background_color", {
        label: "Background",
      });

      return props.folder;
    },
  };
} // class Background
