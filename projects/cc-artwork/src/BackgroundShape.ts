/**
 * Title    : BackgroundShape
 * Project  : Creative Coding
 * File     : projects/cc-utils/BackgroundShape.js
 * Version  : 1.0.0
 * Published: https://gitlab.com/glimpse-of-life
 *
 * Draws a single Background-Shape centered on our Canvas.
 * It supports all the nice features, like rotate, scale, etc. that come with the Brush Class,
 * and all the Shapes, defined in the Shape Class.
 *
 *? Noch aktuell?
 * TODO: https://github.com/mattdesl/canvas-sketch-util
 * TODO: Border Methods refaktorieren.
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

import { Background } from "./Background";
import { Brush } from "./Brush";
import { ColorSet } from "./ColorSet";
import { Format } from "./Format";
import { Size } from "./Size";
import { Shape } from "./Shape";
import { Vector } from "./Vector";
import type { ObserverSubject } from "./ObserverPattern";

import {
  TweakpaneSupport,
  type Provide_Tweakpane_To_Props, type TweakpaneSupport_Props
} from "./TweakpaneSupport";

export interface BackgroundShape_ParameterSet {
  position: Vector;
  size: Size;
}

/**
 * This reflects the internal state, and is used by Observer functionality.
 *
 * @interface State
 */
interface State {
  background: BackgroundShape_ParameterSet;
}

export class BackgroundShape extends Background {
  private center: Vector;
  private random: any;
  private brush_shape: Brush;

  /**
   * Construct the Thing.
   *
   * @param {Object} parameter - this.parameter.artwork.canvas.size, this.parameter.tweakpane.background_color
   */
  constructor(parameter: any) {
    super(parameter);

    this.center = new Vector(
      parameter.artwork.canvas.size.width * 0.5,
      parameter.artwork.canvas.size.height * 0.5
    );

    this.random = {
      borderColor: "#efefefFF",
      fillColor: "#efefefFF",
    };

    this.brush_shape = new Brush();

    // this.animationTimer = new AnimationTimer();
  }

  /**
   * Is called from the ObserverSubject.
   * Background listenes to colorset and format changes.
   *
   * @param {Object}  state.background.color
   */
  update(source: ObserverSubject, data: any) {
    super.update(source, data);
  }

  /**
   * Is called by the AnimationTimer.
   * Best practice is, to overwrite this Method, to do your own stuff.
   */
  animate_slow(source: any) {
    super.animate_slow(source);

    if (source instanceof ColorSet) {
      let random = ColorSet.get_colors_from_mode(
        this.state.colorset,
        this.brush_shape
      );

      this.random.borderColor = random.borderColor;
      this.random.fillColor = random.fillColor;
    }
  }

  /**
   * Draws a single Background-Shape centered on our Canvas.
   * It supports all the nice features, like rotate, scale, etc. that come with the Brush Class,
   * and all the Shapes, defined in the Shape Class.
   * Parameter:
   * parameter.background.position
   * parameter.background.size
   * parameter.background.brush
   * parameter.background.animation.timer - {time:0.002 ,deltaTime:0.2 ,do_animate:true,global_animation_halt:false, speedFactor:0.01}
   *
   * @param {Object} context
   * @param {Object} parameter
   */
  draw(context: any, parameter: any) {
    super.draw(context, parameter);

    BackgroundShape.tweakpaneSupport.transfer_tweakpane_parameter_to(
      parameter,
      "backgroundshape"
    ); // Assign Tweakpane parameter

    let position = parameter.backgroundshape.position;
    let size = parameter.backgroundshape.size;

    this.brush_shape = new Brush(parameter.backgroundshape.brush); // hier wird alpha extrahiert

    if (this.state.colorset.mode !== "use_custom_colors") {
      this.brush_shape.borderColor = this.random.borderColor;
      this.brush_shape.fillColor = this.random.fillColor;
    }

    // Format-Transformation
    size = Format.transform_size(size, this.state.format);
    position = Format.transform_position(position, this.state.format);
    this.brush_shape.border = Format.transform(
      this.brush_shape.border,
      this.state.format
    );

    Shape.draw(context, position, size, this.brush_shape, true);
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
   * @memberof BackgroundShape
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
      Background.tweakpaneSupport.inject_parameterset_to(parameter);

      let _parameterSet: BackgroundShape_ParameterSet = {
        position: new Vector(
          parameter.tweakpane.backgroundShape_brush_position_x,
          parameter.tweakpane.backgroundShape_brush_position_y
        ),
        size: new Size(
          parameter.artwork.canvas.size.width * 0.5,
          parameter.artwork.canvas.size.height * 0.5,
          parameter.artwork.canvas.size.height * 0.25
        ),
      };

      Object.assign(parameter, {
        backgroundshape: _parameterSet,
      });

      Brush.tweakpaneSupport.inject_parameterset_to(
        parameter,
        "backgroundshape"
      );
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
      Brush.tweakpaneSupport.transfer_tweakpane_parameter_to(
        parameter,
        "backgroundshape"
      );

      let tp_prefix =
        TweakpaneSupport.prepare_tweakpane_prefix(parameterSetName);

      // TODO Das sollte ich auf brush.position umstellen (Wird in transfert ja schon gefüllt)
      // TODO Das ist noch nicht sauber...
      //  Position, Size und scale...
      parameter.backgroundshape.position = new Vector(
        parameter.artwork.canvas.size.width *
          parameter.tweakpane[tp_prefix + ".brush_position_x"],
        parameter.artwork.canvas.size.height *
          parameter.tweakpane[tp_prefix + "brush_position_y"]
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
    ) {
      
      // TODO müsste erfolgen nach dem das TP initialisiert ist
      BackgroundShape.tweakpaneSupport.inject_parameterset_to(parameter);

      // TODO Typ: Brush_TP_Defaults?
      let brush_defaults = {
        shape: "Circle",
        position_x: 0.5,
        position_y: 0.5,
        scale: 1.0,
        scale_x: 1.0,
        scale_y: 1.0,
        angle: 0,
        border: 0.18,
        borderColor: "#efefef7F",
        fillColor: "#efefef7F",
      };

      /*
      folder_name_prefix + "BackgroundShape:",
      pane,
      null,
      parameter.tweakpane,
      "backgroundShape",
      [],
      brush_defaults
    */

      props.folder = Brush.tweakpaneSupport.provide_tweakpane_to(parameter, {
        pane: props.pane,
        folder: null,
        folder_name_prefix: props.folder_name_prefix,
        use_separator: false,
        parameterSetName: "backgroundshape",
        excludes: [],
        defaults: brush_defaults,
      });

      // pane, folder, "", false, parameter, folder_name_prefix
      props.folder = Background.tweakpaneSupport.provide_tweakpane_to(
        parameter,
        {
          pane: props.pane,
          folder: null,
          folder_name_prefix: props.folder_name_prefix,
          use_separator: false,
          parameterSetName: "", // TODO not supported
          excludes: [],
          defaults: {},
        }
      );

      return props.folder;
    },
  };
} // class
