/**
 * Title    : Animation_Breathe
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/animation/Breathe.js
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
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

// Animation_Breathe.ts
import { ParameterManager } from "../ParameterManager";
import { AnimationTimeline } from "../AnimationTimeline";
import { AnimationTimeline_Item } from "../AnimationTimeline_Item";
import { Size } from "../Size";
import type { TweakpaneContainer, TweakpaneManager } from "../TweakpaneManager";

// const random = require('canvas-sketch-util/random');

// export namespace Animation {

export interface Breathe_Values {
  min: number;
  now: number;
  max: number;
  increment: number;
}

export interface Breathe_Property { // ValueObject / ParameterSet
  breathe: Breathe_Values;
  timeline?: any;
}

// {breathe:{ min:1.0, now:2.0 max:3.0, increment:0.001}, timeline:{startTime:10.123, duration:0.001}}

/**
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
  constructor(animation: Breathe_Property) {
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
   * Prüft ob der Typ der Animation
   * im Parameterset vor kommt führt die Animation aus.
   * 
   * @param {Object} parameter
   * @param {Object} animations
   */
  check_type_and_run(parameter: any, animations: any): void {
    if ("animation" in animations) {
      if ("breathe" in animations.animation) {
    super.perform_animate_fast_if_in_timeslot(parameter, animations.animation.breathe);
      }
    }
  }

  /**
   * Calculate new/next values for a fast animation.
   * This method is called via AnimationTimeline -> super.animate_fast_if()
   *
   * @returns long  breathe.now - the calulated animation value
   */
  animate_fast(values: Breathe_Values): number {

    this.increment = values.increment;
    this.min = values.min;
    this.max = values.max;
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
  public static ensureParameterSet(parameter: any, path: string | string[] = "animation.breathe") {
    const manager = ParameterManager.from(parameter);
    return manager.ensure(path, {
      min: 0,
      now: 1.25,
      max: 2,
      increment: 0.01,
    });
  }

  public static registerTweakpane(
    parameter: any,
    manager: TweakpaneManager,
    container: TweakpaneContainer,
    id: string,
    label = "Breathe",
    parameterPath: string | string[] = "animation.breathe",
    timelinePath: string | string[] = "animation.timeline"
  ) {
    const breathePath = Array.isArray(parameterPath)
      ? parameterPath.filter((segment) => segment).join(".")
      : parameterPath;
    const timelineTargetPath = Array.isArray(timelinePath)
      ? timelinePath.filter((segment) => segment).join(".")
      : timelinePath;

    const breathe = Breathe.ensureParameterSet(parameter, parameterPath);

    const module = manager.createModule({
      id,
      container,
      stateDefaults: {
        depth_min: breathe.min,
        depth_max: breathe.max,
        increment: breathe.increment,
      },
      channelId: "tweakpane",
    });

    module.addBinding(
      "depth_min",
      {
        label,
        min: 0.125,
        max: 5.0,
        step: 0.004,
      },
      { target: `${breathePath}.min` }
    );

    module.addBinding(
      "depth_max",
      {
        label: `${label} Max`,
        min: 0.125,
        max: 5.0,
        step: 0.004,
      },
      { target: `${breathePath}.max` }
    );

    module.addBinding(
      "increment",
      {
        label: "Speed",
        min: 0.001,
        max: 0.2,
        step: 0.00001,
      },
      { target: `${breathePath}.increment` }
    );

    AnimationTimeline.registerTweakpane(
      parameter,
      manager,
      container,
      `${id}:timeline`,
      timelineTargetPath
    );
  }
} // class Animation_Breathe

// } // namespace Animation
