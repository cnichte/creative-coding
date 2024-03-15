/**
 * Title    : Breathe
 * Project  : Creative Coding
 * File     : projects/cc-utils/animations/Breathe.js
 * Version  : 1.0.0
 * Published: https://gitlab.com/glimpse-of-life
 *
 ** A basic Animation. Breathe is a sort of Pulse Effect, best used on Brush.scale.
 *  Supports: Tweakpane, ParamterSet
 *
 * TODO Mode: inhale+exhale, inhale, exhale
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

import {
  TweakpaneSupport,
  type Provide_Tweakpane_To_Props,
  type TweakpaneSupport_Props,
} from "../TweakpaneSupport";

import { AnimationTimeline } from "../AnimationTimeline";
import { AnimationTimeline_Item } from "../AnimationTimeline_Item";
import { Size } from "../Size";

// const random = require('canvas-sketch-util/random');

/**
 *
 *
 * @export
 * @class Animation_Breathe
 * @extends {AnimationTimeline_Item}
 */
export class Breathe extends AnimationTimeline_Item {
  public static TWEAKPANE_PREFIX: string = "_animation_breathe";

  private min: number;
  private max: number;
  private increment: number;

  private now: number;
  private direction: number;

  /**
   * Animation_Breathe is a sort of Pulse Effect, best used on Brush.scale.
   *
   * @param {Object} animation - {breathe:{ min:1.0, now:2.0 max:3.0, increment:0.001}, timeline:{startTime:10.123, duration:0.001}}
   */
  constructor(animation: any) {
    super();

    this.min = animation.breathe.min;
    this.max = animation.breathe.max;
    this.increment = animation.breathe.increment;

    this.now = animation.breathe.now;
    this.direction = +1;
  }
  /**
   * Is called from AnimationTimeline.perform_animations_if()
   *
   * @param {Object} parameter
   * @param {Object} animations
   */
  perform_animation_if(parameter: any, animations: any): void {
    if ("animation" in animations) {
      if ("breathe" in animations.animation) {
        super.perform_animate_fast_if(parameter, animations.animation.breathe);
      }
    }
  }

  /**
   * Calculate new/next values for a fast animation.
   * This method is called via AnimationTimeline -> super.animate_fast_if()
   *
   * @returns long  breathe.now - the calulated animation value
   */
  animate_fast(animation: any): number {
    this.increment = animation.increment;
    this.min = animation.min;
    this.max = animation.max;
    if (this.now > this.max) this.now = this.max;
    if (this.now < this.min) this.now = this.min;

    // TODO another breathe form based on sinus (use a mode linear|sin|... )

    this.now = this.now + this.direction * this.increment;
    if (this.now > this.max || this.now < this.min)
      this.direction = -1 * this.direction;

    return this.now;
  }

  /**
   * Call this method, to use the recaluclated Values in your artwork.
   *
   * @param {Size} size
   * @returns
   */
  perform(size: Size) {
    // todo sollte eher upate heissen in dem Kontext
    if (size instanceof Size) {
      size.width = size.width * this.now;
      size.height = size.height * this.now;
    }
    return size;
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
   * @memberof AnimationTimer
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
        parameterSetName : "",
      }
    ): void {
      let pt: any = parameter.tweakpane; // prefixable
      let tp_prefix = TweakpaneSupport.create_tp_prefix(
        props.parameterSetName + Breathe.TWEAKPANE_PREFIX
      );

      if (!("animation" in parameter)) {
        Object.assign(parameter, {
          animation: {},
        });
      }

      Object.assign(parameter.animation, {
        breathe: {
          min: pt[tp_prefix + "depth"].min,
          now: 1.25,
          max: pt[tp_prefix + "depth"].max,
          increment: pt[tp_prefix + "increment"],
        },
      });

      let props1: TweakpaneSupport_Props = {
        parameterSetName: "backgroundshape",
        parameterSet: parameter.animation.breathe,
      };

      // TODO das geht so nicht, weil AnimationTimeline auch zugriff auf parameter.tweakpane braucht!
      // Ich brauch sowas: parameter, parameterSet?
      AnimationTimeline.tweakpaneSupport.inject_parameterset_to(
        parameter.animation.breathe,
        props1
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
      props: TweakpaneSupport_Props = {
        parameterSetName : "",
      }
    ): void {
      let tp_prefix = "";
      if (props.parameterSetName != null) {
        tp_prefix = TweakpaneSupport.create_tp_prefix(
          props.parameterSetName + Breathe.TWEAKPANE_PREFIX
        );
      }

      // TODO
      // parameterset.animation.breathe.min = parameter.tweakpane[tp_prefix + "depth"].min;
      // parameterset.animation.breathe.max = parameter.tweakpane[tp_prefix + "depth"].max;
      // parameterset.animation.breathe.increment = parameter.tweakpane[tp_prefix + "increment"];
      let props2: TweakpaneSupport_Props = {
        parameterSet: props.parameterSet.animation.breathe,
        parameterSetName: tp_prefix,
      };

      AnimationTimeline.tweakpaneSupport.transfer_tweakpane_parameter_to(
        parameter,
        props2
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
      let tp_prefix = TweakpaneSupport.create_tp_prefix(
        props.parameterSetName + Breathe.TWEAKPANE_PREFIX
      );

      // Inject Tweakpane parameters
      parameter.tweakpane[tp_prefix + "increment"] = 0.0101;
      parameter.tweakpane[tp_prefix + "depth"] = {
        min: 0.5,
        max: 3.5,
      };

      props.folder.addInput(parameter.tweakpane, tp_prefix + "depth", {
        label: "Breathe",
        min: 0.125,
        max: 5.0,
        step: 0.004,
      });

      props.folder.addInput(parameter.tweakpane, tp_prefix + "increment", {
        label: "Speed",
        min: 0.001,
        max: 0.2,
        step: 0.00001,
      });

      let timeline_defaults = {
        startTime: 0,
        endTime: 0.2,
      };

      let props1: Provide_Tweakpane_To_Props = {
        pane: props.pane,
        folder: props.folder,
        folder_name_prefix: tp_prefix,
        use_separator: true,
        parameterSetName: "",
        excludes: [], // optional
        defaults: timeline_defaults, // optional
      };

      AnimationTimeline.tweakpaneSupport.provide_tweakpane_to(
        parameter,
        props1
      );

      return props.folder;
    },
  };
} // class Animation_Breathe
