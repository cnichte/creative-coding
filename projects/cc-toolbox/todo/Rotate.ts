/**
 * Title    : Rotate
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/animations/Rotate.js
 * Version  : 1.0.0
 * Published: https://gitlab.com/glimpse-of-life
 * 
 ** A basic Animation. Rotate a Shape, best used with Brush.angle.
 *  The animation has two Modes: rotate and weighing.
 *  Supports: Tweakpane, ParamterSet
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

import type { AnimationTimeline_ParameterSet } from "../src/AnimationTimeline";
import { AnimationTimeline_Item } from "../src/AnimationTimeline_Item";
import type { Vector } from "../src/Vector";

// const random = require('canvas-sketch-util/random');
export interface Boundary {
  min:number;
  max:number;
}
export interface Rotate_Properties {
  mode:string; 
  increment: number; 
  boundary:Boundary; // {min:-45,max:45},
  direction:number;
  angle:number;
  timeline: AnimationTimeline_ParameterSet; // { startTime:10.123,duration:0.001}
}

export interface Rotate_Values { // ValueObject / ParameterSet
  rotate: Rotate_Properties;
}



class Rotate extends AnimationTimeline_Item {

  public static TWEAKPANE_PREFIX = "_animation_rotate";
  public static Modes = {
    nothing: "nothing",
    weighing: 'weighing',
    rotate: "rotate"
  };

  /**
   * Rotate a Shape, best used with Brush.angle
   * 
   *
   * @param {Object} animation {rotate:{timeline:{startTime:10.123, duration:0.001}, mode:"weighing", increment:0.001, boundary:{min:-45,max:45}, direction:-1,angle:0 }}
   */
  constructor(animation:Rotate_Values) {
    super();

    this.mode = animation.rotate.mode || "weighing"; // weighing or rotate
    this.increment = animation.rotate.increment || 1;
    this.boundary = {
      min: 0,
      max: 0
    };

    this.boundary.min = animation.rotate.boundary_min || -10;
    this.boundary.max = animation.rotate.boundary_max || 10;

    this.direction = 1;
    this.angle = 0;
  }

  /**
   * Is called from AnimationTimeline.perform_animations_if()
   *
   * @param {Object} parameter 
   * @param {Object} animations 
   */
  perform_animation_if(parameter, animations) {
    if ('animation' in animations) {
      if ('rotate' in animations.animation) {
        super.animate_fast_if(parameter, animations.animation.rotate);
      }
    }
  }

  /**
   * Calculate new/next values for a fast animation.
   * This method is called via AnimationTimeline -> super.animate_fast_if()
   *
   * @param {Object} animation {rotate:{...}}
   * @returns number - Offset to move (n property - as value to add)
   */
  animate_fast(animation) {
    // console.log("rotate: " + this.angle);


    this.mode = animation.mode;
    this.increment = animation.increment;
    this.boundary.min = animation.boundary.min;
    this.boundary.max = animation.boundary.max;

    if (this.mode === Rotate.Modes.weighing) {
      if (this.angle > this.boundary.max) this.angle = this.boundary.max;
      if (this.angle < this.boundary.min) this.angle = this.boundary.min;
    }

    switch (this.mode) {
      case "rotate":
        this.angle = this.angle + this.direction * this.increment;

        if (this.direction > 0 && this.angle >= 360) {
          this.angle = 0;
        } else if (this.direction < 0 && this.angle <= -360) {
          this.angle = 0;
        }

        break;
      case "nothing":
        // stop at the angle, and do nothing.
        break;
      case "weighing":
      default:
        this.angle = this.angle + this.direction * this.increment;

        if (this.direction > 0 && this.angle >= this.boundary.max) {
          this.direction = -1 * this.direction;
        } else if (this.direction < 0 && this.angle <= this.boundary.min) { //  <= -this.boundary
          this.direction = -1 * this.direction;
        }
    }
  }

  /**
   * Call this method, to use the recaluclated Values in your artwork.
   *
   * @param {long} angle 
   * @returns 
   */
  perform(angle) {
    return this.angle + angle;
  }

} // class Rotate

/**
 * Transfers the Tweakpane-Parameters to the Parameter-Set for this Class / Module.
 *
 * @param {Object} parameterset  
 * @param {Object} parameter_tweakpane 
 * @param {String} tweakpane_prefix 
 */
Rotate.transfer_tweakpane_parameter_to = function (parameterset, parameter_tweakpane, tweakpane_prefix = "") {

  tweakpane_prefix = Helper.prepare_tweakpane_prefix(tweakpane_prefix + Rotate.TWEAKPANE_PREFIX);

  parameterset.animation.rotate.mode = parameter_tweakpane[tweakpane_prefix + "mode"];
  parameterset.animation.rotate.boundary.min = parameter_tweakpane[tweakpane_prefix + "boundary"].min;
  parameterset.animation.rotate.boundary.max = parameter_tweakpane[tweakpane_prefix + "boundary"].max;
  parameterset.animation.rotate.increment = parameter_tweakpane[tweakpane_prefix + "increment"];

  AnimationTimeline.transfer_tweakpane_parameter_to(parameterset.animation.rotate, parameter_tweakpane, tweakpane_prefix);
}

/**
 * Provides a Set of Parameters for this Class / Module.
 *
 * @param {Object} parameterset  
 * @param {Object} parameter_tweakpane 
 * @param {String} tweakpane_prefix 
 * @returns 
 */
Rotate.inject_parameterset_to = function (parameterset, parameter_tweakpane, tweakpane_prefix = "") {

  tweakpane_prefix = Helper.prepare_tweakpane_prefix(tweakpane_prefix + Rotate.TWEAKPANE_PREFIX);

  if (!('animation' in parameterset)) {
    Object.assign(parameterset, {
      animation: {}
    });
  }

  Object.assign(parameterset.animation, {
    rotate: {
      mode: "weighing",
      increment: 1.0, // step
      boundary: {
        min: parameter_tweakpane[tweakpane_prefix + "boundary"].min,
        max: parameter_tweakpane[tweakpane_prefix + "boundary"].max
      }
    }
  });

  AnimationTimeline.inject_parameterset_to(parameterset.animation.rotate, parameter_tweakpane, tweakpane_prefix);

  return parameterset;
}


/**
 * Provides a Tweakpane for this Class / Module.
 *
 * @param {Pane} pane 
 * @param {FolderApi} folder 
 * @param {Object} parameter_tweakpane 
 * @param {String} tweakpane_prefix 
 * @returns 
 */
Rotate.provide_tweakpane_to = function (pane, folder, parameter_tweakpane, tweakpane_prefix = "") {

  tweakpane_prefix = Helper.prepare_tweakpane_prefix(tweakpane_prefix + Rotate.TWEAKPANE_PREFIX);

  // Inject Tweakpane parameters
  parameter_tweakpane[tweakpane_prefix + "mode"] = "weighing";
  parameter_tweakpane[tweakpane_prefix + "boundary"] = {
    min: -90,
    max: +90
  };
  parameter_tweakpane[tweakpane_prefix + "increment"] = 1.0;


  // Build Tweakpane
  folder.addBinding(parameter_tweakpane, tweakpane_prefix + 'mode', {
    label: 'Rotate',
    options: Rotate.Modes
  });

  folder.addBinding(parameter_tweakpane, tweakpane_prefix + 'boundary', {
    label: 'Boundary',
    min: -180,
    max: +180,
    step: 0.001,
  });

  folder.addBinding(parameter_tweakpane, tweakpane_prefix + 'increment', {
    label: 'Speed',
    min: 0.00,
    max: 200.00,
    step: 0.00001
  });

  let timeline_defaults = {
    startTime: 0.4,
    endTime: 0.6
  };

  AnimationTimeline.provide_tweakpane_to(pane, folder, parameter_tweakpane, tweakpane_prefix, timeline_defaults);

  return folder;

}

module.exports = Rotate;