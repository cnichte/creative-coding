/**
 * Title    : Animation Timeline
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/AnimationTimeline.js
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
 *
 * Timeline - Manages various Animations on a Timeline.
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

// AnimationTimeline.ts
import type { AnimationTimeline_Item } from "./AnimationTimeline_Item";
import { ParameterManager } from "./ParameterManager";
import type { TweakpaneContainer, TweakpaneManager } from "./TweakpaneManager";


export interface AnimationTimeline_ParameterSet {
  startTime: number;
  endTime: number;
}

// nicht benutzt, da prefixable
interface AnimationTimeline_ParameterTweakpane {
  min: number;
  max: number;
}

/**
 * This reflects the internal state, and is used by ObserverSubject functionality.
 *
 * @interface State
 */
interface State {
  animation: {
    timeline: AnimationTimeline_ParameterSet;
  };
}

export class AnimationTimeline {
  public items: AnimationTimeline_Item[];

  /**
   ** Manages the life cycle of an agent.
   * With this class I can basically play a movie,
   * and change the behavier of an Shape.
   *
   * Its like the Timer, but on Steroids :-)
   *
   * Actions can also be shifted into each other - hopefully.
   * I can imagine it like the timeline in the video editor,
   * with its different layers.
   *
   ** There are three basic Questions to answer here:
   *
   * what:    Animations: FadeIn, FadeOut, aber auch: enter & leave the scene!
   * when:    StartTime
   * howLong: Duration (or endTime)
   *
   * Basicaly Actions are my Animations, but...
   * "enter" is like a create & "leave" like a destroy?
   */
  constructor() {
    this.items = [];
  }

  public push(item:AnimationTimeline_Item){
    this.items.push(item);
  }

  public static ensureParameterSet(
    parameter: any,
    path: string | string[] = "animation.timeline"
  ) {
    const manager = ParameterManager.from(parameter);
    const defaults: AnimationTimeline_ParameterSet = { startTime: 0, endTime: 1 };
    return manager.ensure(path, defaults);
  }

  public static registerTweakpane(
    parameter: any,
    manager: TweakpaneManager,
    container: TweakpaneContainer,
    id: string,
    path: string | string[] = "animation.timeline"
  ) {
    AnimationTimeline.ensureParameterSet(parameter, path);
    const timelinePath = Array.isArray(path)
      ? path.filter((segment) => segment).join(".")
      : path;

    const module = manager.createModule({
      id,
      container,
      stateDefaults: {
        timeline_min: 0.0,
        timeline_max: 1.0,
      },
      channelId: "tweakpane",
    });

    module.addBinding(
      "timeline_min",
      {
        label: "Start",
        min: 0.0,
        max: 1.0,
        step: 0.0001,
      },
      { target: `${timelinePath}.startTime` }
    );

    module.addBinding(
      "timeline_max",
      {
        label: "End",
        min: 0.0,
        max: 1.0,
        step: 0.0001,
      },
      { target: `${timelinePath}.endTime` }
    );

    return module;
  }

  /**
   * Performs all registered Animation-Items in theire timeslot.
   *
   * Needs Parameter-Object with: ...
   *
   * @param {Object} parameter  - {artwork:{animation:{time:10.123, deltaTime:0.001, duration:30, do_animate:true, global_animation_halt}}}
   * @param {Object} animations - {animation:{ breathe:{}, move:{} ...}}
   */
  public perform_animations_if(parameter: any, animations: any) {
    if (!parameter.artwork.animation.global_halt) {
      this.items.forEach((item:AnimationTimeline_Item) => {
        item.check_type_and_run(parameter, animations); // abstrakte Methode in AnimationTimeline_Item, impelentiert jede Method selber
      });
    }
  }

} // class AnimationTimeline
