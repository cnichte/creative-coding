/**
 * Title    : Animation Timer
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/AnimationTimer.ts
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
 *
 * Supports:
 * - ParameterSet   : yes
 * - Tweakpane      : yes
 * is:
 * - Observer       : no
 * - ObserverSubject: yes
 * - prefixable:    : yes
 *
 * A Timer for throttled Animation.
 * Follows the Observer-Pattern in form of Listeners.
 * Listeners register themself via addListener(),
 * Calls Listeners animate_slow() Method periodically.
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
  type Tweakpane_Items,
} from "./TweakpaneSupport";

// TODO Was ist die Source für ein Objekt?

export interface Animable {
  animate_slow(source: any, parameter: any): void;
}

/**
 * The Parameter-Set for AnimationTimer.
 * @export
 * @interface AnimationTimer_ParameterSet
 */
export interface AnimationTimer_ParameterSet {
  time: number;
  deltaTime: number;
  doAnimate: boolean;
  animation_halt: boolean;
  slowDownFactor: number; // throttel
}

// nicht benutzt, da prefixable
interface AnimationTimer_ParameterTweakpane {
  animation_timer_doAnimate: boolean;
  animation_timer_slowDownFactor: number;
}

/**
 * This reflects the internal state, and is used by ObserverSubject functionality.
 *
 * @interface State
 */
interface State {
  animation: {
    timer: AnimationTimer_ParameterSet;
  };
}

/**
 *
 * @Class - AnimationTimer
 */
export class AnimationTimer {
  private source: any;
  private listeners: Animable[];
  private elapsed: number;

  private state: State;

  /**
   *
   * @param {Class} source
   */
  constructor(source: any) {
    this.source = source;

    this.listeners = [];

    this.elapsed = 0;

    this.state = {
      animation: {
        timer: {
          time: 0,
          deltaTime: 0,
          doAnimate: true,
          animation_halt: false,
          slowDownFactor: 200, // throttel
        },
      },
    };
  }

  /**
   * Check if the timer has reached the limit, and if so
   * call all listeners animate_slow() Methods.
   *
   * @param {number} time
   * @param {number} deltaTime
   * @param {boolean} animation_halt
   * @param {*} parameterset - needs a animationTimer Object
   * @memberof AnimationTimer
   */
  check_AnimationTimer(
    time: number,
    deltaTime: number,
    animation_halt: boolean,
    parameterset: any
  ): void {
    let doAnimate = true; // defaults
    let slowDownFactor = 200;

    if ("animation" in parameterset) {
      if ("timer" in parameterset.animation) {
        doAnimate = parameterset.animation.timer.doAnimate;
        slowDownFactor = parameterset.animation.timer.slowDownFactor;
      } else {
        console.log("AnimationTimer is missing timer object in parameterset");
      }
    } else {
      console.log(
        "AnimationTimer is missing animation.timer object in parameterset"
      );
    }

    if (doAnimate && !animation_halt) {
      let target_time = deltaTime * slowDownFactor;
      this.elapsed = this.elapsed + deltaTime;

      if (this.elapsed > target_time) {
        // console.log("AnimationTimer targetTime reached? - yes", { elapsed:this.elapsed, target: target_time});
        this.elapsed = 0;
        // update the state
        this.state.animation.timer.time = time;
        this.state.animation.timer.deltaTime = deltaTime;
        this.state.animation.timer.doAnimate = doAnimate;
        this.state.animation.timer.animation_halt = animation_halt;
        this.state.animation.timer.slowDownFactor = slowDownFactor;

        // TODO This is not very performant because I call the object twice:
        //? once with SceneGraph.draw(), and once with Timer.animate_slow() - so in two loops?

        this.notifyAll(this.source, this.state.animation.timer);
      } else {
        // console.log("AnimationTimer targetTime reached? - no", { elapsed:this.elapsed, target: target_time});
      }
    }
  }

  /**
   * Add a Listerner to the Timer.
   * Must have an animate_slow Method.
   *
   * @param {Object} observer
   */
  addListener(listener: Animable) {
    if ("animate_slow" in listener) {
      this.listeners.push(listener);
    } else {
      console.log("listener has no animate_slow() Method.");
    }
  }

  /**
   * Remove a Listerner from the Timer.
   *
   * @param {Object} listener
   */
  removeListener(listener: Animable) {
    const removeIndex = this.listeners.findIndex((obs) => {
      return listener === obs;
    });

    if (removeIndex !== -1) {
      this.listeners = this.listeners.slice(removeIndex, 1);
    }
  }

  /**
   * Notifies all registered Observers, by calling theire animate_slow method.
   *
   * @param {Object} source
   * @param {Object} parameter
   */
  notifyAll(source: any, parameter: any) {
    if (this.listeners.length > 0) {
      // Jeder Observer könnte seine eigenen animationTimer:{} Properties haben.
      // Die müsste ich überprüfen, und dann erst ggfs. die Methode aufrufen ...
      this.listeners.forEach((listener) =>
        listener.animate_slow(source, parameter)
      );
    }
  }

  /**
   * Reset the timer.
   */
  reset() {
    this.elapsed = 0;
  }

  // TODO Einsetzen bei Colorset! - brauch ich das irgendwo?
  /*
  public static provide_parameterset_to(parameter: any): any {
    return Object.assign(parameter, {
      timer: {
        doAnimate: true,
        slowDownFactor: 200, // throttel
      },
    });
  }
*/

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
      let tp_prefix = TweakpaneSupport.create_tp_prefix(
        props.parameterSetName
      );

      let _parameterSet: AnimationTimer_ParameterSet = {
        time: 0,
        deltaTime: 0,
        doAnimate:
          parameter.tweakpane[tp_prefix + "animation_timer_doAnimate"],
        animation_halt: false,
        slowDownFactor:
          parameter.tweakpane[tp_prefix + "animation_timer_slowDownFactor"],
      };

      if (props.parameterSetName != null) {
        // animation.timer
        if (!("animation" in parameter[props.parameterSetName])) {
          Object.assign(parameter[props.parameterSetName], {
            animation: {},
          });
        }

        Object.assign(parameter[props.parameterSetName].animation, {
          timer: _parameterSet,
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
      let pt: any = parameter.tweakpane; // prefixable

      let tp_prefix = TweakpaneSupport.create_tp_prefix(props.parameterSetName);

      if (props.parameterSetName != null) {
        parameter[props.parameterSetName].animation.timer.doAnimate =
          pt[tp_prefix + "animation_timer_doAnimate"];

        parameter[props.parameterSetName].animation.timer.slowDownFactor =
          pt[tp_prefix + "animation_timer_slowDownFactor"];
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

      //! AnimationTimer_ParameterTweakpane kann ich hier nicht verwenden, weil prefixable.
      // der prefix kann beliebig sein. also bleitbt das hier auch any
      // Das ganze nenne ich prefixable.
      let obj: any = new Object(); //  = {};
      obj[tp_prefix + "animation_timer_doAnimate"] = true;
      obj[tp_prefix + "animation_timer_slowDownFactor"] = 200;

      Object.assign(pt, obj);

      props.items.folder.addBinding(pt, tp_prefix + "animation_timer_doAnimate", {
        label: "Animate",
      });

      props.items.folder.addBinding(
        pt,
        tp_prefix + "animation_timer_slowDownFactor",
        {
          label: "Throttel",
          min: 0,
          step: 0.0001,
        }
      );

      return props.items;
    },
  };

  //* --------------------------------------------------------------------
  //* Tweakpane
  //* --------------------------------------------------------------------
} // class AnimationTimer
