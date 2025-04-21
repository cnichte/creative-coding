/**
 * Title    : BackgroundShape
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/BackgroundShape.js
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
 *
 * Supports:
 * - ParameterSet   : yes
 * - Tweakpane      : yes
 * is:
 * - Observer       : yes
 * - ObserverSubject: no
 * - prefixable:    : no
 *
 * Erweitert die Klasse Background.
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

 // BackgroundShape.ts
import { Pane } from "tweakpane";

const Color = require("canvas-sketch-util/color");

import { Background } from "./Background";
import { Brush, type Brush_ParameterTweakpane } from './Brush';
import { ColorSet } from "./ColorSet";
import { Format } from "./Format";
import { Size } from "./Size";
import { Shape } from "./Shape";
import { Vector } from "./Vector";
import type { ObserverSubject } from "./ObserverPattern";

import {
  TweakpaneSupport,
  type Provide_Tweakpane_To_Props,
  type TweakpaneSupport_Props,
  type Tweakpane_Items,
} from "./TweakpaneSupport";

import { AnimationTimeline } from "./AnimationTimeline";
import { Breathe } from './animation/Breathe';

export interface BackgroundShape_ParameterSet {
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

  private random_color: any; // Color

  private animationTimeline: AnimationTimeline|null = null;
  private breathe: Breathe|null = null;
  private hasAnimations:boolean = false;
  
  /**
   * Construct the Thing.
   *
   * @param {Object} parameter - this.parameter.artwork.canvas.size, this.parameter.tweakpane.background_color
   */
  constructor(parameter: any) {
    super(parameter);

  //  this.animationTimeline = new AnimationTimeline();
  //  if(this.parameter.accent.animation !=null || this.parameter.accent.animation !=undefined){
  //    this.breathe = new Breathe(this.parameter.accent.animation);
  //    this.animationTimeline.push(this.breathe);
  //  }

    // Das ist der State....
    this.random_color = {
      borderColor: "#efefefFF",
      fillColor: "#efefefFF",
    };

    // this.size = new Size(100,100);
    // TODO: parameter.canvas.center property anlegen.
    // this.position = new Vector( parameter.canvas.size.width*0.5, parameter.canvas.size.height*0.5 );
    // this.animationTimer = new AnimationTimer();
  }

  /**
   * Is called from the ObserverSubject.
   * Background listenes to colorset and format changes.
   *
   * @param {Object}  state.background.color
   */
  update(source: ObserverSubject, state_new: any, state_old: any) {
    super.update(source, state_new, state_old);

    if (source instanceof Format) {
      // siehe draw Methode
    }
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
        this.brush
      );

      this.random_color.borderColor = random.borderColor;
      this.random_color.fillColor = random.fillColor;
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

    BackgroundShape.tweakpaneSupport.transfer_tweakpane_parameter_to(parameter); // Assign Tweakpane parameter

    let position_brush_percent = parameter.backgroundshape.brush.position;
    let position_px: Vector = new Vector(parameter.artwork.canvas.size.width, parameter.artwork.canvas.size.height).multiply(position_brush_percent);

    let size_px: Size = parameter.backgroundshape.size.clone(); // px
    let scale_percent: Vector = parameter.backgroundshape.brush.scale; // %

    // calculate the real size from scale
    size_px.width = parameter.backgroundshape.size.width * scale_percent.x;
    size_px.height = parameter.backgroundshape.size.height * scale_percent.y;
    size_px.radius = Size.get_shorter_side(parameter.backgroundshape.size) * scale_percent.z;
    
    // resize due to format change
    size_px = size_px.multiply(parameter.format.fak);

    // TODO this.animationTimeline.perform_animations_if(parameter, parameter.accent);
    // TODO size_px = this.breathe.perform(size_px);

    let brush = new Brush(parameter.backgroundshape.brush); // hier wird alpha extrahiert

    if (this.state.colorset.mode !== "use_custom_colors") {
      brush.borderColor = this.random_color.borderColor;
      brush.fillColor = this.random_color.fillColor;
    }

    Shape.draw(context, position_px, size_px, brush, true);
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
      props: TweakpaneSupport_Props = {
        parameterSetName: "",
      }
    ): void {
      Background.tweakpaneSupport.inject_parameterset_to(parameter);

      let pt: any = parameter.tweakpane; // prefixable

      let tp_prefix = TweakpaneSupport.create_tp_prefix(props.parameterSetName);

      // Die initiale Größe des Shapes.
      let _parameterSet: BackgroundShape_ParameterSet = {
        size: new Size(
          parameter.artwork.canvas.size.width * 0.5,
          parameter.artwork.canvas.size.height * 0.5,
          parameter.artwork.canvas.size.height * 0.25
        ),
      };

      Object.assign(parameter, {
        backgroundshape: _parameterSet,
      });

      let props1: TweakpaneSupport_Props = {
        parameterSetName: "backgroundshape",
        parameterSet: parameter.backgroundshape,
      };

      Brush.tweakpaneSupport.inject_parameterset_to(parameter, props1);
      
      // TODO AnimationTimer.tweakpaneSupport.inject_parameterset_to(parameter.colorset, parameter_tweakpane, "colorset");
      // TODO Breathe.tweakpaneSupport.inject_parameterset_to(parameter.accent, parameter.tweakpane, "accent");
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
      let tweakpane_props: TweakpaneSupport_Props = {
        parameterSetName: "backgroundshape",
        parameterSet: parameter.backgroundshape,
      };

      // TODO Breathe.tweakpaneSupport.transfer_tweakpane_parameter_to(parameter.accent, parameter.tweakpane, "accent");

      // im Brush steckt position und scale/size
      Brush.tweakpaneSupport.transfer_tweakpane_parameter_to(parameter, tweakpane_props);
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
    ):Tweakpane_Items {
      let brush_defaults: Brush_ParameterTweakpane = {
        brush_shape: "Circle",
        brush_position_x: 0.5, // Die initiale Position des Shapes.
        brush_position_y: 0.5,
        brush_scale: 1.0,
        brush_scale_x: 1.0,
        brush_scale_y: 1.0,
        brush_rotate: 0,
        brush_border: 0.18,
        brush_borderColor: "#efefef7F",
        brush_fillColor: "#efefef7F",
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

      const tpi_brush: Tweakpane_Items = Brush.tweakpaneSupport.provide_tweakpane_to(parameter, {
        items:{
          pane: props.items.pane,
          folder: null,
          tab: null
        },
        folder_name_prefix: props.folder_name_prefix,
        use_separator: false,
        parameterSetName: "backgroundshape",
        excludes: [],
        defaults: brush_defaults,
      });

      // pane, folder, "", false, parameter, folder_name_prefix
      props.items.folder = Background.tweakpaneSupport.provide_tweakpane_to(
        parameter,
        {
          items:{
            pane: props.items.pane,
            folder: tpi_brush.folder,
            tab: null
          },
          folder_name_prefix: props.folder_name_prefix,
          use_separator: true,
          parameterSetName: "", // TODO not supported
          excludes: [],
          defaults: {},
        }
      );

      // TODO müsste erfolgen nach dem das TP initialisiert ist
      BackgroundShape.tweakpaneSupport.inject_parameterset_to(parameter);

      // TODO folder.addSeparator();
      // TODO Breathe.tweakpaneSupport.provide_tweakpane_to(pane, folder, parameter_tweakpane, "accent");

      return props.items;
    },
  };
} // class
