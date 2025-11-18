import {
  AnimationTimeline,
  type AnimationTimeline_ParameterSet,
} from "../AnimationTimeline";
import { AnimationTimeline_Item } from "../AnimationTimeline_Item";
import {
  TweakpaneSupport,
  type Provide_Tweakpane_To_Props,
  type TweakpaneSupport_Props,
} from "../TweakpaneSupport";
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

  protected animate_fast(animation: Move_Values): number {
    if (
      !animation.to ||
      typeof animation.to.x !== "number" ||
      typeof animation.to.y !== "number"
    ) {
      animation.to = new Vector(0.5, 0.5);
    }

    this.mode = animation.mode;
    this.speed = animation.step;
    this.target = animation.to.clone();

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

  public static tweakpaneSupport: TweakpaneSupport = {
    provide_tweakpane_to(parameter: any, props: Provide_Tweakpane_To_Props) {
      const tp_prefix = TweakpaneSupport.create_tp_prefix(
        props.parameterSetName + Move.TWEAKPANE_PREFIX
      );

      parameter.tweakpane[tp_prefix + "mode"] = MoveMode.flipflop;
      parameter.tweakpane[tp_prefix + "to"] = {
        x: 0.75,
        y: 0.8,
      };
      parameter.tweakpane[tp_prefix + "step"] = 0.005;

      props.items.folder.addBinding(parameter.tweakpane, tp_prefix + "mode", {
        label: "Move",
        options: MoveMode,
      });

      props.items.folder.addBinding(parameter.tweakpane, tp_prefix + "to", {
        label: "to",
        x: { min: 0, max: 1 },
        y: { min: 0, max: 1 },
      });

      props.items.folder.addBinding(parameter.tweakpane, tp_prefix + "step", {
        label: "Speed",
        min: 0.0005,
        max: 0.05,
        step: 0.0005,
      });

      const timeline_defaults: AnimationTimeline_ParameterSet = {
        startTime: 0,
        endTime: 1,
      };

      const atl_props: Provide_Tweakpane_To_Props = {
        items: props.items,
        folder_name_prefix: "",
        use_separator: true,
        parameterSetName: tp_prefix,
        defaults: timeline_defaults,
      };

      AnimationTimeline.tweakpaneSupport.provide_tweakpane_to(
        parameter,
        atl_props
      );
    },
    inject_parameterset_to(parameter: any, props: TweakpaneSupport_Props) {
      if (!props.parameterSet) {
        return;
      }

      if (!("animation" in props.parameterSet)) {
        Object.assign(props.parameterSet, { animation: {} });
      }

      const tp_prefix = TweakpaneSupport.create_tp_prefix(
        props.parameterSetName + Move.TWEAKPANE_PREFIX
      );

      if (!(tp_prefix + "to" in parameter.tweakpane)) {
        parameter.tweakpane[tp_prefix + "to"] = { x: 0.5, y: 0.5 };
      }
      if (!(tp_prefix + "step" in parameter.tweakpane)) {
        parameter.tweakpane[tp_prefix + "step"] = 0.005;
      }
      if (!(tp_prefix + "mode" in parameter.tweakpane)) {
        parameter.tweakpane[tp_prefix + "mode"] = MoveMode.flipflop;
      }

      const canvasSize = parameter.artwork.canvas.size;
      const toValue = parameter.tweakpane[tp_prefix + "to"];

      const defaults: Move_Values = {
        mode: parameter.tweakpane[tp_prefix + "mode"],
        step:
          parameter.tweakpane[tp_prefix + "step"] *
          Math.min(canvasSize.width, canvasSize.height),
        to: new Vector(
          toValue.x * canvasSize.width,
          toValue.y * canvasSize.height
        ),
        timeline: {
          startTime: 0,
          endTime: 1,
        },
      };

      Object.assign(props.parameterSet.animation, {
        move: defaults,
      });

      const atl_props: TweakpaneSupport_Props = {
        parameterSetName: tp_prefix,
        parameterSet: props.parameterSet.animation.move,
      };

      AnimationTimeline.tweakpaneSupport.inject_parameterset_to(
        parameter,
        atl_props
      );
    },
    transfer_tweakpane_parameter_to(parameter: any, props: TweakpaneSupport_Props) {
      if (!props.parameterSet) return;

      const tp_prefix = TweakpaneSupport.create_tp_prefix(
        props.parameterSetName + Move.TWEAKPANE_PREFIX
      );

      const canvasSize = parameter.artwork.canvas.size;
      const target = props.parameterSet.animation.move as Move_Values;
      target.mode = parameter.tweakpane[tp_prefix + "mode"];
      target.step =
        parameter.tweakpane[tp_prefix + "step"] *
        Math.min(canvasSize.width, canvasSize.height);
      target.to = new Vector(
        parameter.tweakpane[tp_prefix + "to"].x * canvasSize.width,
        parameter.tweakpane[tp_prefix + "to"].y * canvasSize.height
      );

      const atl_props: TweakpaneSupport_Props = {
        parameterSetName: tp_prefix,
        parameterSet: target,
      };

      AnimationTimeline.tweakpaneSupport.transfer_tweakpane_parameter_to(
        parameter,
        atl_props
      );
    },
  };
}
