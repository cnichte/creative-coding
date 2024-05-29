/**
 * Title    : Shake
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/animations/Shake.js
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
 * 
 ** Gives a random created value, to Shake a Shape.
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

import { AnimationTimeline_Item } from "../src/AnimationTimeline_Item";


const random = require('canvas-sketch-util/random');

class Shake extends AnimationTimeline_Item {

  /**
   * Gives a random created value, to Shake a Shape.
   * Best used for example a Position Vector.
   * 
   * The Properties n and k are holding the created Values:
   * use Property n - if the value should be added up
   * use Property k - if the value should be multiplied
   *
   * @param {Object} animation {shake:{frequency:1,amplitude:1}, timeline:{startTime:10.123, duration:0.001}}
   */
  constructor(animation) {
    super();

    this.mode = animation.shake.mode;
    this.frequency = animation.shake.frequency;
    this.amplitude = animation.shake.amplitude;
    this.k = 1; // The start value would have to be 1 at  start, if the value should be multiplied,
    this.n = 0; // and 0 if it is to be added up. I have created both variants.
  }

  /**
   * Is called from AnimationTimeline.perform_animations_if()
   *
   * @param {Object} parameter 
   * @param {Object} animations 
   */
  perform_animation_if(parameter, animations) {
    if ('animation' in animations) {
      if ('shake' in animations.animation) {
        super.animate_fast_if(parameter, animations.animation.shake);
      }
    }
  }

  /**
   * Calculate new/next values for a fast animation.
   * This method is called via AnimationTimeline -> super.animate_fast_if()
   * 
   * @param {Object} animation {shake:{frequency:1,amplitude:1}}
   * @returns number - Offset to move (n property - as value to add)
   */
  animate_fast(animation) {
    // TODO: recalculate the properties, if parameters have changed
    this.mode = animation.mode;
    this.frequency = animation.frequency;
    this.amplitude = animation.amplitude;

    let ruv = this.random_unit_vector();
    this.n = random.noise2D(ruv.x, ruv.y, this.frequency, this.amplitude);
    this.k = this.n;
    return this.n;
  }

  /**
   * Call this method, to use the recaluclated Values in your artwork.
   *
   * @param {Vector} position 
   * @returns 
   */
  perform(position) {
    if (position instanceof Vector) {
      switch (this.mode) {
        case Shake.Modes.shakeBoth:
          position.x = position.x + position.x * this.n;
          position.y = position.y + position.y * this.n;
          break;
        case Shake.Modes.shakeX:
          position.x = position.x + position.x * this.n;
          break;
        case Shake.Modes.shakeY:
          position.y = position.y + position.y * this.n;
          break;
        case Shake.Modes.nothing:
          // stop at the angle, and do nothing.
          break;
        default:
      }
    }
    return position;
  }

  /**
   * https://joeiddon.github.io/projects/javascript/perlin.html
   *
   * @returns Object {x:, y:}
   */
  random_unit_vector() {
    let theta = Math.random() * 2 * Math.PI;
    return {
      x: Math.cos(theta),
      y: Math.sin(theta)
    };
  }

} // class Shake

Shake.TWEAKPANE_PREFIX = "_animation_shake";
Shake.Modes = {
  nothing: 'nothing',
  shakeX: "shake x",
  shakeY: "shake y",
  shakeBoth: "shake xy",
};

/**
 * Transfers the Tweakpane-Parameters to the Parameter-Set for this Class / Module.
 *
 * @param {Object} parameterset 
 * @param {Object} parameter_tweakpane 
 * @param {String} tweakpane_prefix 
 */
Shake.transfer_tweakpane_parameter_to = function (parameterset, parameter_tweakpane, tweakpane_prefix = "") {

  tweakpane_prefix = Helper.prepare_tweakpane_prefix(tweakpane_prefix + Shake.TWEAKPANE_PREFIX);

  parameterset.animation.shake.mode = parameter_tweakpane[tweakpane_prefix + "mode"];
  parameterset.animation.shake.frequency = parameter_tweakpane[tweakpane_prefix + "frequency"];
  parameterset.animation.shake.amplitude = parameter_tweakpane[tweakpane_prefix + "amplitude"];

  AnimationTimeline.transfer_tweakpane_parameter_to(parameterset.animation.shake, parameter_tweakpane, tweakpane_prefix);
}

/**
 * Provides a Set of Parameters for this Class / Module.
 *
 * @param {Object} parameterset 
 * @param {Object} parameter_tweakpane 
 * @param {String} tweakpane_prefix 
 * @returns 
 */
Shake.inject_parameterset_to = function (parameterset, parameter_tweakpane, tweakpane_prefix = "") {

  tweakpane_prefix = Helper.prepare_tweakpane_prefix(tweakpane_prefix + Shake.TWEAKPANE_PREFIX);

  if (!('animation' in parameterset)) {
    Object.assign(parameterset, {
      animation: {}
    });
  }

  Object.assign(parameterset.animation, {
    shake: {
      timeline: {
        startTime: 0,
        duration: 30
      },
      mode: parameter_tweakpane[tweakpane_prefix + "mode"],
      frequency: parameter_tweakpane[tweakpane_prefix + "frequency"],
      amplitude: parameter_tweakpane[tweakpane_prefix + "amplitude"]
    }
  });

  AnimationTimeline.inject_parameterset_to(parameterset.animation.shake, parameter_tweakpane, tweakpane_prefix);

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
Shake.provide_tweakpane_to = function (pane, folder, parameter_tweakpane, tweakpane_prefix = "") {

  tweakpane_prefix = Helper.prepare_tweakpane_prefix(tweakpane_prefix + Shake.TWEAKPANE_PREFIX);

  // Inject Tweakpane parameters
  parameter_tweakpane[tweakpane_prefix + "mode"] = Shake.Modes.shakeX;
  parameter_tweakpane[tweakpane_prefix + "frequency"] = 0.05;
  parameter_tweakpane[tweakpane_prefix + "amplitude"] = 0.03;

  folder.addBinding(parameter_tweakpane, tweakpane_prefix + 'mode', {
    label: 'Shake',
    options: Shake.Modes
  });

  folder.addBinding(parameter_tweakpane, tweakpane_prefix + 'frequency', {
    label: 'Freqenz',
    min: 0.01,
    max: 2.0,
    step: 0.0001,
  });

  folder.addBinding(parameter_tweakpane, tweakpane_prefix + 'amplitude', {
    label: 'Amplitude',
    min: 0.01,
    max: 2.0,
    step: 0.0001
  });

  let timeline_defaults = {
    startTime: 0.8,
    endTime: 0.9
  };

  AnimationTimeline.provide_tweakpane_to(pane, folder, parameter_tweakpane, tweakpane_prefix, timeline_defaults);

  return folder;

}

module.exports = Shake;