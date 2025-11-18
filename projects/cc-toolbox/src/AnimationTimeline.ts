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
import {
  TweakpaneSupport,
  type Provide_Tweakpane_To_Props,
  type TweakpaneSupport_Props,
  type Tweakpane_Items,
} from "./TweakpaneSupport";


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

  
  public perform_animations_if_new():void {
    console.log("Das wird die neue Logik...");
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
      this.items.forEach((item) => {
        item.perform_animate_fast_if(parameter, animations);
      });
    }
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
        parameterSetName:""
      }
    ): void {
      let tp_prefix = TweakpaneSupport.create_tp_prefix(props.parameterSetName);

      let al_pset: AnimationTimeline_ParameterSet = {
        startTime: 0.0, // TODO parameter.tweakpane[tp_prefix + "timeline"].min
        endTime: 1.0, // parameter.tweakpane[tp_prefix + "timeline"].max
      };

      // animation.timeline
      if (props.parameterSetName != null && props.parameterSetName.length > 0) {
        if (typeof parameter[props.parameterSetName] !== "object") {
          parameter[props.parameterSetName] = {};
        }

        if (!("animation" in parameter[props.parameterSetName])) {
          Object.assign(parameter[props.parameterSetName], {
            animation: {},
          });
        }
      }

      // parameter ist hier in der Regel ein ausgewähltes Parameterset
      // dem eine animation hinzugefügt werden
      // TODO: Support an Array of (not overlapping) Timeslots for this Item.
      // This means that an animation for an item can be executed in several time periods.
      let targetSet = props.parameterSet;
      if (!targetSet) {
        if (
          props.parameterSetName != null &&
          props.parameterSetName.length > 0 &&
          typeof parameter[props.parameterSetName] === "object"
        ) {
          targetSet = parameter[props.parameterSetName];
        } else {
          targetSet = parameter;
        }
      }

      props.parameterSet = targetSet;

      if (!("timeline" in targetSet) || targetSet.timeline == null) {
        Object.assign(targetSet, {
          timeline: al_pset,
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
        parameterSetName:""
      }
    ): void {
      let source: any = parameter.tweakpane; // prefixable
      let target: AnimationTimeline_ParameterSet = props.parameterSet;

      let tp_prefix = TweakpaneSupport.create_tp_prefix(props.parameterSetName);

      const timelineBinding = source[tp_prefix + "timeline"];
      if (
        timelineBinding !== undefined &&
        typeof timelineBinding === "object" &&
        "min" in timelineBinding &&
        "max" in timelineBinding
      ) {
        target.startTime = timelineBinding.min;
        target.endTime = timelineBinding.max;
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
    ):Tweakpane_Items {
      let pt: any = parameter.tweakpane; // prefixable
      let tp_prefix = TweakpaneSupport.create_tp_prefix(props.parameterSetName);

      // Inject Tweakpane parameters
      pt[tp_prefix + "timeline"] = {
        min: 0.0,
        max: 1.0,
      };

      props.items.folder.addBinding(pt, tp_prefix + "timeline", {
        label: "Timeline",
        min: 0.0,
        max: 1.0,
        step: 0.0001,
      });

      return props.items;
    },
  };
} // class AnimationTimeline
