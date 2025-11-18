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
    throw new Error("Method not implemented.");
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

  public static tweakpaneSupport: TweakpaneSupport = {
    provide_tweakpane_to(parameter: any, props: Provide_Tweakpane_To_Props) {
      const tp_prefix = TweakpaneSupport.create_tp_prefix(
        props.parameterSetName + Rotate.TWEAKPANE_PREFIX
      );

      parameter.tweakpane[tp_prefix + "mode"] = RotateMode.weighing;
      parameter.tweakpane[tp_prefix + "increment"] = 2;
      parameter.tweakpane[tp_prefix + "boundary"] = {
        min: -30,
        max: 30,
      };

      props.items.folder.addBinding(parameter.tweakpane, tp_prefix + "mode", {
        label: "Rotate",
        options: RotateMode,
      });

      props.items.folder.addBinding(
        parameter.tweakpane,
        tp_prefix + "increment",
        {
          label: "Speed",
          min: 0.1,
          max: 20,
          step: 0.1,
        }
      );

      props.items.folder.addBinding(
        parameter.tweakpane,
        tp_prefix + "boundary",
        {
          label: "Boundary",
          min: -180,
          max: 180,
          step: 1,
        }
      );

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
      const targetSet = TweakpaneSupport.ensureParameterSet(parameter, props);
      if (!("animation" in targetSet)) {
        Object.assign(targetSet, { animation: {} });
      }

      const tp_prefix = TweakpaneSupport.create_tp_prefix(
        props.parameterSetName + Rotate.TWEAKPANE_PREFIX
      );

      if (!(tp_prefix + "mode" in parameter.tweakpane)) {
        parameter.tweakpane[tp_prefix + "mode"] = RotateMode.weighing;
      }
      if (!(tp_prefix + "increment" in parameter.tweakpane)) {
        parameter.tweakpane[tp_prefix + "increment"] = 2;
      }
      if (!(tp_prefix + "boundary" in parameter.tweakpane)) {
        parameter.tweakpane[tp_prefix + "boundary"] = {
          min: -30,
          max: 30,
        };
      }

      const defaults: Rotate_Values = {
        mode: parameter.tweakpane[tp_prefix + "mode"],
        increment: parameter.tweakpane[tp_prefix + "increment"],
        boundary: {
          min: parameter.tweakpane[tp_prefix + "boundary"].min,
          max: parameter.tweakpane[tp_prefix + "boundary"].max,
        },
        timeline: {
          startTime: 0,
          endTime: 1,
        },
      };

      Object.assign(targetSet.animation, {
        rotate: defaults,
      });

      const atl_props: TweakpaneSupport_Props = {
        parameterSetName: tp_prefix,
        parameterSet: targetSet.animation.rotate,
      };

      AnimationTimeline.tweakpaneSupport.inject_parameterset_to(
        parameter,
        atl_props
      );
    },
    transfer_tweakpane_parameter_to(parameter: any, props: TweakpaneSupport_Props) {
      const targetSet = TweakpaneSupport.ensureParameterSet(parameter, props);

      const tp_prefix = TweakpaneSupport.create_tp_prefix(
        props.parameterSetName + Rotate.TWEAKPANE_PREFIX
      );
      const target = targetSet.animation.rotate as Rotate_Values;

      target.mode = parameter.tweakpane[tp_prefix + "mode"];
      target.increment = parameter.tweakpane[tp_prefix + "increment"];
      target.boundary = {
        min: parameter.tweakpane[tp_prefix + "boundary"].min,
        max: parameter.tweakpane[tp_prefix + "boundary"].max,
      };

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
