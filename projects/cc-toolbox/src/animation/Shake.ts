import {
  AnimationTimeline,
  type AnimationTimeline_ParameterSet,
} from "../AnimationTimeline";
import { AnimationTimeline_Item } from "../AnimationTimeline_Item";
import { ParameterManager } from "../ParameterManager";
import {
  TweakpaneManager,
  type TweakpaneContainer,
} from "../TweakpaneManager";
import { Vector } from "../Vector";

export enum ShakeMode {
  nothing = "nothing",
  shakeX = "shakeX",
  shakeY = "shakeY",
  shakeBoth = "shakeXY",
}

export interface Shake_Values {
  mode: ShakeMode;
  frequency: number;
  amplitude: number;
  timeline: AnimationTimeline_ParameterSet;
}

export interface Shake_Property {
  shake: Shake_Values;
}

export class Shake extends AnimationTimeline_Item {

  public static readonly TWEAKPANE_PREFIX = "_animation_shake";

  private mode: ShakeMode;
  private frequency: number;
  private amplitude: number;
  private offset: Vector;
  private phase: number;

  constructor(animation: Shake_Property) {
    super();

    this.mode = animation.shake.mode;
    this.frequency = animation.shake.frequency;
    this.amplitude = animation.shake.amplitude;
    this.offset = new Vector(0, 0);
    this.phase = 0;
  }

  perform(position: Vector): Vector {
    const result = position.clone();

    switch (this.mode) {
      case ShakeMode.shakeX:
        result.x += this.offset.x;
        break;
      case ShakeMode.shakeY:
        result.y += this.offset.y;
        break;
      case ShakeMode.shakeBoth:
        result.x += this.offset.x;
        result.y += this.offset.y;
        break;
      case ShakeMode.nothing:
      default:
        break;
    }

    return result;
  }

  public check_type_and_run(parameter: any, animations: any): void {
    if ("animation" in animations && "shake" in animations.animation) {
      super.perform_animate_fast_if_in_timeslot(
        parameter,
        animations.animation.shake
      );
    }
  }

  protected animate_fast(values:Shake_Values): number {
    this.mode = values.mode;
    this.frequency = values.frequency;
    this.amplitude = values.amplitude;

    this.phase += this.frequency;
    const sinValue = Math.sin(this.phase);
    const cosValue = Math.cos(this.phase * 0.5);

    this.offset = new Vector(
      sinValue * this.amplitude,
      cosValue * this.amplitude
    );

    return 0;
  }

  public static ensureParameterSet(
    parameter: any,
    path: string | string[] = "animation.shake"
  ) {
    const manager = ParameterManager.from(parameter);
    const canvas = manager.get("artwork.canvas.size") ?? {
      width: 1,
      height: 1,
    };
    const minDim = Math.min(canvas.width ?? 1, canvas.height ?? 1) || 1;

    const defaults: Shake_Values = {
      mode: ShakeMode.nothing,
      frequency: 0.05,
      amplitude: 0.01 * minDim,
      timeline: {
        startTime: 0,
        endTime: 1,
      },
    };

    return manager.ensure(path, defaults);
  }

  public static registerTweakpane(
    parameter: any,
    manager: TweakpaneManager,
    container: TweakpaneContainer,
    id: string,
    label = "Shake",
    parameterPath: string | string[] = "animation.shake",
    timelinePath: string | string[] = "animation.timeline"
  ) {
    const shakePath = Array.isArray(parameterPath)
      ? parameterPath.filter((segment) => segment).join(".")
      : parameterPath;
    const timelineTargetPath = Array.isArray(timelinePath)
      ? timelinePath.filter((segment) => segment).join(".")
      : timelinePath;

    const shake = Shake.ensureParameterSet(parameter, parameterPath);
    const pm = ParameterManager.from(parameter);
    const canvas = pm.get("artwork.canvas.size") ?? { width: 1, height: 1 };
    const minDim = Math.min(canvas.width ?? 1, canvas.height ?? 1) || 1;

    const module = manager.createModule({
      id,
      container,
      stateDefaults: {
        shake_mode: shake.mode ?? ShakeMode.nothing,
        shake_frequency: shake.frequency ?? 0.05,
        shake_amplitude: (shake.amplitude ?? 0.01 * minDim) / minDim,
      },
      channelId: "tweakpane",
    });

    module.addBinding(
      "shake_mode",
      {
        label,
        options: ShakeMode,
      },
      { target: `${shakePath}.mode` }
    );

    module.addBinding(
      "shake_frequency",
      {
        label: "Frequency",
        min: 0.001,
        max: 0.5,
        step: 0.001,
      },
      { target: `${shakePath}.frequency` }
    );

    module.addBinding(
      "shake_amplitude",
      {
        label: "Amplitude",
        min: 0,
        max: 0.1,
        step: 0.0005,
      },
      {
        target: `${shakePath}.amplitude`,
        transform: (value) => value * minDim,
      }
    );

    AnimationTimeline.registerTweakpane(
      parameter,
      manager,
      container,
      `${id}:timeline`,
      timelineTargetPath
    );
  }
}
