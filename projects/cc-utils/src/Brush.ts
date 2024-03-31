/**
 * Title    : Brush
 * Project  : Creative Coding
 * File     : projects/cc-utils/Brush.ts
 * Version  : 1.0.0
 * Published: https://gitlab.com/glimpse-of-life
 *
 * Supports:
 * - ParameterSet   : yes
 * - Tweakpane      : yes
 * is:
 * - Observer       : no
 * - ObserverSubject: no
 * - prefixable:    : yes
 *
 * This is a Brush.
 * It stores all the important Properties to draw something.
 *
 ** POSITION und SIZE nicht in dem Brush übernehmen...
 * Wenn man den Brush als ein Style versteht, den man auf verschiedene
 * Objekte anwenden kann.
 *
 ** POSITION und SIZE in dem Brush übernehmen...
 * Wenn man den Brush auf ein Objekt anwendet.
 * Objekte anwenden kann.
 *
 * Vielleicht sollte ich Brush (style) und (Position und Größe) separat lassen.
 * und die size mit rein. die ist ja wie scale.
 *
 * Erledigtes:
 *  - Position auch in den Brush übernehmen.
 *    Das ist eigentlich auch Brush-Eigenschaften.
 *  - size wird eigentlich immer relativ zur Bildschirmgröße berechnet, und nie in absoluten Werten.
 *    und braucht deshalb nicht als Eigenschaft in den Brush aufgenommen werden.
 *    Die Größe kann dann über scale verändert werden.
 *    Würde den Umgang damit vielleicht nochmals vereinfachen.
 *    Size braucht es im brusch gar nicht, weil scale !
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
// const { Vector } = require('./index.js');

import { Size } from "./Size";
import { Shape } from "./Shape";
import { Vector } from "./Vector";
import {
  TweakpaneSupport,
  type Provide_Tweakpane_To_Props,
  type TweakpaneSupport_Props,
  type Tweakpane_Items,
} from "./TweakpaneSupport";

export interface BrushText {
  content: string;
  fontSize: number;
  fontFamily: string;
}

/**
 * Defines the Brush-Data.
 * @export
 * @interface BrushType
 */
export interface Brush_ParameterSet {
  shape: string;

  angle: number;

  position: Vector;
  scale: number; //! is the size

  border: number;

  fillColor: string;
  borderColor: string;

  fillColorAlpha: any;
  borderColorAlpha: any;

  text: BrushText;
}

// nicht benutzt, da prefixable
export interface Brush_ParameterTweakpane {
  brush_shape: string;
  brush_border: number;
  brush_position_x: number;
  brush_position_y: number;
  brush_scale: number;
  brush_scale_x: number;
  brush_scale_y: number;
  brush_rotate: number;
  brush_borderColor: string;
  brush_fillColor: string;
}

export class Brush implements Brush_ParameterSet {
  public shape: string;

  public angle: number;

  public position: Vector;
  public scale: number;

  public border: number;

  public fillColor: string;
  public borderColor: string;

  public fillColorAlpha: any;
  public borderColorAlpha: any;

  public text: BrushText;

  /**
   * Creates an instance of Brush.
   *
   * A Brush has the following Properties:
   *
   * shape       - Name of a Shape-Object
   * position    - The Position of the Shape
   * scale       - The Scale-Factor may be
   *               scale = 1.5; or
   *               scale = new Vector(1.5, 1.2)
   *               Size is allways a Scale-Factor from canvasSize;
   * angle       - the Rotation Angle
   * border      - reflects to context.lineWidth
   * fillColor   - like "#EFEFEFFF", reflects to context.fillStyle
   * borderColor - like "#000000FF", reflects to context.strokeStyle
   *
   * @param {Brush_ParameterSet} [brush_ps={
   *       shape: "Rect",
   *       position: new Vector(0, 0),
   *       angle: 0.0,
   *       scale: 1.0,
   *       border: 1.0,
   *       borderColor: "#EFEFEFFF",
   *       fillColor: "#000000FF",
   *       fillColorAlpha: undefined,
   *       borderColorAlpha: undefined,
   *       text: ''
   *     }]
   * @memberof Brush
   */
  constructor(
    brush_ps: Brush_ParameterSet = {
      shape: "Rect",
      angle: 0.0,

      position: new Vector(0, 0),
      scale: 1.0,

      border: 1.0,
      borderColor: "#EFEFEFFF",
      fillColor: "#000000FF",
      fillColorAlpha: 0,
      borderColorAlpha: 0,
      text: {
        content: "T",
        fontSize: 100,
        fontFamily: "serif",
      },
    }
  ) {
    this.shape = brush_ps.shape;

    this.angle = brush_ps.angle;

    this.position = brush_ps.position;
    this.scale = brush_ps.scale; //! this is the size!

    this.border = brush_ps.border; // context.lineWidth

    // https://www.farb-tabelle.de/de/farbtabelle.htm
    this.fillColor = brush_ps.fillColor; // context.fillStyle
    this.borderColor = brush_ps.borderColor; // context.strokeStyle

    // Is parsed from this.fillColor and this.borderColor
    // this.fillColorAlpha = 125;
    // this.borderColorAlpha = 125;

    this.fillColorAlpha = Color.parse(this.fillColor).alpha;
    this.borderColorAlpha = Color.parse(this.borderColor).alpha;

    this.text = brush_ps.text;
  } // constructor

  /**
   *
   *
   * @static
   * @param {Brush} brush
   * @return {*}  {Brush}
   * @memberof Brush
   */
  static clone(brush: Brush): Brush {
    let nb = new Brush();
    nb.shape = brush.shape;

    nb.angle = brush.angle;

    nb.position = brush.position;
    nb.scale = brush.scale;

    nb.border = brush.border;
    nb.fillColor = brush.fillColor;
    nb.borderColor = brush.borderColor;
    nb.fillColorAlpha = Color.parse(nb.fillColor).alpha;
    nb.borderColorAlpha = Color.parse(nb.borderColor).alpha;
    nb.text = brush.text;
    return nb;
  } // clone

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
   * @memberof Brush
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
      props: TweakpaneSupport_Props = {
        parameterSetName: "",
      }
    ): void {
      let tp_prefix = TweakpaneSupport.create_tp_prefix(props.parameterSetName);

      let parameterSet: Brush_ParameterSet = {
        shape: parameter.tweakpane[tp_prefix + "brush_shape"],

        angle: 0.0,

        position: new Vector(0, 0),
        scale: 1.0,

        border: 0.0,
        fillColor: "#ffffffFF",
        borderColor: "#000000FF",
        fillColorAlpha: "",
        borderColorAlpha: "",
        text: {
          content: "T",
          fontSize: 100,
          fontFamily: "serif",
        },
      };

      // TODO parameterSetName="" => fehler überall fixen
      if (props.parameterSetName == null || props.parameterSetName === "") {
        Object.assign(parameter, {
          brush: parameterSet,
        });
      } else {
        Object.assign(parameter[props.parameterSetName], {
          brush: parameterSet,
        });
      }
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
      props: TweakpaneSupport_Props = {
        parameterSetName: "",
      }
    ): void {

      let source: any = parameter.tweakpane; // prefixable
      let target: any;

      // parameter[props.parameterSetName]
      if (props.parameterSet != null) {
        target = props.parameterSet;
      } else {
        target = parameter;
      }

      let tp_prefix = TweakpaneSupport.create_tp_prefix(props.parameterSetName);

      // TODO if parameterSetName ==="" überall implementieren
      if (props.parameterSetName != null && props.parameterSetName !== "") {
        target.brush.shape = source[tp_prefix + "brush_shape"];

        target.brush.shape = source[tp_prefix + "brush_shape"];
        
        // console.log(`position: ${pt[tp_prefix + "brush_position_x"]}, ${pt[tp_prefix + "brush_position_y"]}`, parameter[parameterSetName].brush.position)
        target.brush.angle = source[tp_prefix + "brush_rotate"];

        // Die Position ist ein Prozentualer Anteil von von canvas.size
        target.brush.position = new Vector(
            source[tp_prefix + "brush_position_x"],
            source[tp_prefix + "brush_position_y"]
        );

        // TODO rethink scale
        // Beim Kreis wirkt sich scale_x mit auf die Border aus.
        // Beim Rechteck nicht. Das ist also für jedes Shape etwas anders
        // und sollte vielleicht in die jeweilige Shape Klasse rein <--- ist drin !!!
        // TODO: Transparenz geht auch nur bei Rect?

        // TODO Format-Transformation - size bzw. scale
        // let size1:Size = Format.transform_size(size, parameter.format); // this.state.format
        // console.log(`transform ${size.width}, ${size.height} -> ${size1.width}, ${size1.height}`);
        // brush.border = Format.transform( brush.border, parameter.format); 

        // brush.scale und arwork.scale werden berücksichtigt
        target.brush.scale = new Vector(
          source[tp_prefix + "brush_scale_x"] * parameter.artwork.scale,
          source[tp_prefix + "brush_scale_y"] * parameter.artwork.scale,
          source[tp_prefix + "brush_scale_x"] * parameter.artwork.scale * 0.5 // TODO das könnte noch falsch sein
        ).multiply(source[tp_prefix + "brush_scale"]); // .multiply(parameter.format.fak) 

        target.brush.border =
          Size.get_shorter_side(parameter.artwork.canvas.size) * // berücksichtigt Format
          source[tp_prefix + "brush_border"] *
          source[tp_prefix + "brush_scale"] *
          source[tp_prefix + "brush_scale_x"] *
          parameter.artwork.scale;

        target.brush.borderColor = source[tp_prefix + "brush_borderColor"];
        target.brush.fillColor = source[tp_prefix + "brush_fillColor"];
      }
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
      let tp_prefix = TweakpaneSupport.create_tp_prefix(props.parameterSetName);

      let pd:Brush_ParameterTweakpane = props.defaults;

      //! Brush_ParameterTweakpane kann ich hier halt nicht verwenden.
      // der prefix kann beliebig sein. also bleitbt das hier auch any
      // Das ganze nenne ich prefixable.
      let obj: any = {};
      obj[tp_prefix + "brush_shape"] = pd.brush_shape;
      obj[tp_prefix + "brush_border"] = pd.brush_border;
      obj[tp_prefix + "brush_position_x"] = pd.brush_position_x;
      obj[tp_prefix + "brush_position_y"] = pd.brush_position_y;
      obj[tp_prefix + "brush_scale"] = pd.brush_scale;
      obj[tp_prefix + "brush_scale_x"] = pd.brush_scale_x;
      obj[tp_prefix + "brush_scale_y"] = pd.brush_scale_y;
      obj[tp_prefix + "brush_rotate"] = pd.brush_rotate;
      obj[tp_prefix + "brush_borderColor"] = pd.brush_borderColor;
      obj[tp_prefix + "brush_fillColor"] = pd.brush_fillColor;

      parameter.tweakpane = Object.assign(parameter.tweakpane, obj);

      if (props.items.folder == null) {
        props.items.folder = props.items.pane.addFolder({
          title: props.folder_name_prefix + "Brush",
          expanded: false,
        });
      }

      props.items.folder.addBinding(parameter.tweakpane, tp_prefix + "brush_shape", {
        label: "Shape",
        options: Shape.ShapeNames,
      });

      props.items.folder.addBinding(parameter.tweakpane, tp_prefix + "brush_border", {
        label: "Border",
        min: 0,
        max: 1,
        step: 0.0001,
      });

      props.items.folder.addBinding(
        parameter.tweakpane,
        tp_prefix + "brush_position_x",
        {
          label: "Pos X",
          min: 0.0001,
          max: 1.0,
          step: 0.0001,
        }
      );
      props.items.folder.addBinding(
        parameter.tweakpane,
        tp_prefix + "brush_position_y",
        {
          label: "Pos Y",
          min: 0.0001,
          max: 1.0,
          step: 0.0001,
        }
      );

      props.items.folder.addBinding(parameter.tweakpane, tp_prefix + "brush_scale", {
        label: "Scale",
        min: 0,
        max: 1.0,
        step: 0.0001,
      });

      props.items.folder.addBinding(
        parameter.tweakpane,
        tp_prefix + "brush_scale_x",
        {
          label: "Scale X",
          min: 0,
          max: 2.0,
          step: 0.0001,
        }
      );

      props.items.folder.addBinding(
        parameter.tweakpane,
        tp_prefix + "brush_scale_y",
        {
          label: "Scale Y",
          min: 0,
          max: 2.0,
          step: 0.0001,
        }
      );

      props.items.folder.addBinding(parameter.tweakpane, tp_prefix + "brush_rotate", {
        label: "Rotate",
        min: 0,
        max: 360,
        step: 1,
      });

      props.items.folder.addBinding(
        parameter.tweakpane,
        tp_prefix + "brush_fillColor",
        {
          label: "Fill",
        }
      );

      props.items.folder.addBinding(
        parameter.tweakpane,
        tp_prefix + "brush_borderColor",
        {
          label: "Border",
        }
      );

      return props.items;
    },
  };
} // class Brush
