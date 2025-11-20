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

export enum MoveMode {
  stop = "stop",
  flipflop = "flipflop",
  beam = "beam",
}

export interface Move_Values {
  mode: MoveMode;
  step: number;
  to: Vector;
  timeline: AnimationTimeline_ParameterSet;
}

export interface Move_Property {
  move: Move_Values;
}

export class Move extends AnimationTimeline_Item {
  public static readonly TWEAKPANE_PREFIX = "_animation_move";

  private start: Vector | null;
  private current: Vector | null;
  private target: Vector;
  private mode: MoveMode;
  private speed: number;
  private direction: 1 | -1;

  constructor(animation: Move_Property) {
    super();

    if (
      !animation.move.to ||
      typeof animation.move.to.x !== "number" ||
      typeof animation.move.to.y !== "number"
    ) {
      animation.move.to = new Vector(0.5, 0.5);
    }

    this.mode = animation.move.mode;
    this.speed = animation.move.step;
    this.target = animation.move.to.clone();

    this.start = null;
    this.current = null;
    this.direction = 1;
  }

  perform(position: Vector): Vector {
    if (this.start === null) {
      this.start = position.clone();
    }

    if (this.current === null) {
      this.current = this.start.clone();
    }

    if (
      this.start !== null &&
      (position.x !== this.start.x || position.y !== this.start.y)
    ) {
      // brush position changed via tweakpane -> reset animation
      this.start = position.clone();
      this.current = position.clone();
      this.direction = 1;
    }

    return (this.current ?? position).clone();
  }

  public check_type_and_run(parameter: any, animations: any): void {
    if ("animation" in animations && "move" in animations.animation) {
      super.perform_animate_fast_if_in_timeslot(
        parameter,
        animations.animation.move
      );
    }
  }

  protected animate_fast(values: Move_Values): number {
    if (
      !values.to ||
      typeof values.to.x !== "number" ||
      typeof values.to.y !== "number"
    ) {
      values.to = new Vector(0.5, 0.5);
    }

    this.mode = values.mode;
    this.speed = values.step;
    this.target = values.to.clone();

    if (this.current == null) {
      return 0;
    }
    if (this.start == null) {
      this.start = this.current.clone();
    }

    const destination = this.direction > 0 ? this.target : this.start;
    const delta = destination.subtract(this.current);
    const distance = delta.length();

    if (distance <= this.speed || distance === 0) {
      this.current = destination.clone();
      this.handleArrival();
    } else {
      const stepVector = delta.divide(distance).multiply(this.speed);
      this.current = this.current.add(stepVector);
    }

    return 0;
  }

  private handleArrival(): void {
    switch (this.mode) {
      case MoveMode.flipflop:
        this.direction = (this.direction * -1) as 1 | -1;
        break;
      case MoveMode.beam:
        if (this.start) {
          this.current = this.start.clone();
        }
        this.direction = 1;
        break;
      case MoveMode.stop:
      default:
        this.direction = 1;
        break;
    }
  }

  public static ensureParameterSet(
    parameter: any,
    path: string | string[] = "animation.move"
  ) {
    const manager = ParameterManager.from(parameter);
    const canvas = manager.get("artwork.canvas.size") ?? {
      width: 1,
      height: 1,
    };
    const minDim = Math.min(canvas.width ?? 1, canvas.height ?? 1) || 1;

    const defaults: Move_Values = {
      mode: MoveMode.flipflop,
      step: 0.005 * minDim,
      to: new Vector(canvas.width * 0.75, canvas.height * 0.8),
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
    label = "Move",
    parameterPath: string | string[] = "animation.move",
    timelinePath: string | string[] = "animation.timeline"
  ) {
    const movePath = Array.isArray(parameterPath)
      ? parameterPath.filter((segment) => segment).join(".")
      : parameterPath;
    const timelineTargetPath = Array.isArray(timelinePath)
      ? timelinePath.filter((segment) => segment).join(".")
      : timelinePath;

    const move = Move.ensureParameterSet(parameter, parameterPath);
    const pm = ParameterManager.from(parameter);
    const canvas = pm.get("artwork.canvas.size") ?? { width: 1, height: 1 };
    const minDim = Math.min(canvas.width ?? 1, canvas.height ?? 1) || 1;

    const module = manager.createModule({
      id,
      container,
      stateDefaults: {
        move_mode: move.mode ?? MoveMode.flipflop,
        move_to_x: (move.to?.x ?? canvas.width * 0.75) / (canvas.width || 1),
        move_to_y: (move.to?.y ?? canvas.height * 0.8) /
          (canvas.height || 1),
        move_speed: (move.step ?? 0.005 * minDim) / minDim,
      },
      channelId: "tweakpane",
    });

    module.addBinding(
      "move_mode",
      {
        label,
        options: MoveMode,
      },
      { target: `${movePath}.mode` }
    );

    module.addBinding(
      "move_to_x",
      {
        label: "to X",
        min: 0,
        max: 1,
        step: 0.0005,
      },
      {
        target: `${movePath}.to`,
        transform: (value, state) =>
          new Vector(
            value * (canvas.width || 1),
            (state as any).move_to_y * (canvas.height || 1)
          ),
      }
    );

    module.addBinding(
      "move_to_y",
      {
        label: "to Y",
        min: 0,
        max: 1,
        step: 0.0005,
      },
      {
        target: `${movePath}.to`,
        transform: (value, state) =>
          new Vector(
            (state as any).move_to_x * (canvas.width || 1),
            value * (canvas.height || 1)
          ),
      }
    );

    module.addBinding(
      "move_speed",
      {
        label: "Speed",
        min: 0.0005,
        max: 0.05,
        step: 0.0005,
      },
      {
        target: `${movePath}.step`,
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
