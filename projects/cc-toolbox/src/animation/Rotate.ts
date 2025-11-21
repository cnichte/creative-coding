import {
  AnimationTimeline,
  type AnimationTimeline_ParameterSet,
} from "../core/AnimationTimeline";
import { AnimationTimeline_Item } from "../core/AnimationTimeline_Item";
import { ParameterManager } from "../core/ParameterManager";
import {
  TweakpaneManager,
  type TweakpaneContainer,
} from "../core/TweakpaneManager";

export enum RotateMode {
  nothing = "nothing",
  weighing = "weighing",
  rotate = "rotate",
}

export interface Rotate_Values {
  mode: RotateMode;
  increment: number;
  boundary: { min: number; max: number };
  timeline: AnimationTimeline_ParameterSet;
}

export interface Rotate_Property {
  rotate: Rotate_Values;
}

export class Rotate extends AnimationTimeline_Item {
  public static readonly TWEAKPANE_PREFIX = "_animation_rotate";

  private mode: RotateMode;
  private increment: number;
  private boundary: { min: number; max: number };
  private angle: number;
  private direction: 1 | -1;

  constructor(animation: Rotate_Property) {
    super();

    this.mode = animation.rotate.mode;
    this.increment = animation.rotate.increment;
    if (
      !animation.rotate.boundary ||
      animation.rotate.boundary.min === undefined ||
      animation.rotate.boundary.max === undefined
    ) {
      animation.rotate.boundary = { min: -30, max: 30 };
    }

    this.boundary = {
      min: animation.rotate.boundary.min,
      max: animation.rotate.boundary.max,
    };
    this.angle = 0;
    this.direction = 1;
  }

  perform(angle: number): number {
    return angle + this.angle;
  }

  public check_type_and_run(parameter: any, animations: any): void {
    if ("animation" in animations && "rotate" in animations.animation) {
      super.perform_animate_fast_if_in_timeslot(
        parameter,
        animations.animation.rotate
      );
    }
  }

  protected animate_fast(values: Rotate_Values): number {

    this.mode = values.mode;
    this.increment = values.increment;
    if (
      !values.boundary ||
      values.boundary.min === undefined ||
      values.boundary.max === undefined
    ) {
      values.boundary = { min: -30, max: 30 };
    }

    this.boundary = {
      min: values.boundary.min,
      max: values.boundary.max,
    };

    switch (this.mode) {
      case RotateMode.rotate:
        this.angle += this.increment;
        if (this.angle >= 360 || this.angle <= -360) {
          this.angle = 0;
        }
        break;
      case RotateMode.nothing:
        break;
      case RotateMode.weighing:
      default:
        this.angle += this.direction * this.increment;

        if (this.angle >= this.boundary.max || this.angle <= this.boundary.min) {
          this.direction = (this.direction * -1) as 1 | -1;
          this.angle = Math.max(
            this.boundary.min,
            Math.min(this.boundary.max, this.angle)
          );
        }
        break;
    }

    return this.angle;
  }

  public static ensureParameterSet(
    parameter: any,
    path: string | string[] = "animation.rotate"
  ) {
    const manager = ParameterManager.from(parameter);
    const defaults: Rotate_Values = {
      mode: RotateMode.weighing,
      increment: 2,
      boundary: {
        min: -30,
        max: 30,
      },
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
    label = "Rotate",
    parameterPath: string | string[] = "animation.rotate",
    timelinePath: string | string[] = "animation.timeline"
  ) {
    const rotatePath = Array.isArray(parameterPath)
      ? parameterPath.filter((segment) => segment).join(".")
      : parameterPath;
    const timelineTargetPath = Array.isArray(timelinePath)
      ? timelinePath.filter((segment) => segment).join(".")
      : timelinePath;

    const rotate = Rotate.ensureParameterSet(parameter, parameterPath);

    const module = manager.createModule({
      id,
      container,
      stateDefaults: {
        rotate_mode: rotate.mode ?? RotateMode.weighing,
        rotate_increment: rotate.increment ?? 2,
        rotate_boundary_min: rotate.boundary?.min ?? -30,
        rotate_boundary_max: rotate.boundary?.max ?? 30,
      },
      channelId: "tweakpane",
    });

    module.addBinding(
      "rotate_mode",
      {
        label,
        options: RotateMode,
      },
      { target: `${rotatePath}.mode` }
    );

    module.addBinding(
      "rotate_increment",
      {
        label: "Speed",
        min: 0.1,
        max: 20,
        step: 0.1,
      },
      { target: `${rotatePath}.increment` }
    );

    module.addBinding(
      "rotate_boundary_min",
      {
        label: "Boundary Min",
        min: -180,
        max: 0,
        step: 1,
      },
      {
        target: `${rotatePath}.boundary`,
        transform: (value: number, state: any) => ({
          min: value,
          max: (state as any).rotate_boundary_max,
        }),
      }
    );

    module.addBinding(
      "rotate_boundary_max",
      {
        label: "Boundary Max",
        min: 0,
        max: 180,
        step: 1,
      },
      {
        target: `${rotatePath}.boundary`,
        transform: (value: number, state: any) => ({
          min: (state as any).rotate_boundary_min,
          max: value,
        }),
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
