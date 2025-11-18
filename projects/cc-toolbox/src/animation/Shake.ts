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

  protected animate_fast(animation: Shake_Values): number {
    this.mode = animation.mode;
    this.frequency = animation.frequency;
    this.amplitude = animation.amplitude;

    this.phase += this.frequency;
    const sinValue = Math.sin(this.phase);
    const cosValue = Math.cos(this.phase * 0.5);

    this.offset = new Vector(
      sinValue * this.amplitude,
      cosValue * this.amplitude
    );

    return 0;
  }

  public static tweakpaneSupport: TweakpaneSupport = {
    provide_tweakpane_to(parameter: any, props: Provide_Tweakpane_To_Props) {
      const tp_prefix = TweakpaneSupport.create_tp_prefix(
        props.parameterSetName + Shake.TWEAKPANE_PREFIX
      );

      parameter.tweakpane[tp_prefix + "mode"] = ShakeMode.nothing;
      parameter.tweakpane[tp_prefix + "frequency"] = 0.05;
      parameter.tweakpane[tp_prefix + "amplitude"] = 0.01;

      props.items.folder.addBinding(parameter.tweakpane, tp_prefix + "mode", {
        label: "Shake",
        options: ShakeMode,
      });

      props.items.folder.addBinding(
        parameter.tweakpane,
        tp_prefix + "frequency",
        {
          label: "Frequency",
          min: 0.001,
          max: 0.5,
          step: 0.001,
        }
      );

      props.items.folder.addBinding(
        parameter.tweakpane,
        tp_prefix + "amplitude",
        {
          label: "Amplitude",
          min: 0,
          max: 0.1,
          step: 0.0005,
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
      if (!props.parameterSet) {
        return;
      }

      if (!("animation" in props.parameterSet)) {
        Object.assign(props.parameterSet, { animation: {} });
      }

      const tp_prefix = TweakpaneSupport.create_tp_prefix(
        props.parameterSetName + Shake.TWEAKPANE_PREFIX
      );

      const canvasSize = parameter.artwork.canvas.size;
      const defaults: Shake_Values = {
        mode: parameter.tweakpane[tp_prefix + "mode"],
        frequency: parameter.tweakpane[tp_prefix + "frequency"],
        amplitude:
          parameter.tweakpane[tp_prefix + "amplitude"] *
          Math.min(canvasSize.width, canvasSize.height),
        timeline: {
          startTime: 0,
          endTime: 1,
        },
      };

      Object.assign(props.parameterSet.animation, {
        shake: defaults,
      });

      const atl_props: TweakpaneSupport_Props = {
        parameterSetName: tp_prefix,
        parameterSet: props.parameterSet.animation.shake,
      };

      AnimationTimeline.tweakpaneSupport.inject_parameterset_to(
        parameter,
        atl_props
      );
    },
    transfer_tweakpane_parameter_to(
      parameter: any,
      props: TweakpaneSupport_Props
    ) {
      if (!props.parameterSet) return;

      const tp_prefix = TweakpaneSupport.create_tp_prefix(
        props.parameterSetName + Shake.TWEAKPANE_PREFIX
      );
      const canvasSize = parameter.artwork.canvas.size;
      const target = props.parameterSet.animation.shake as Shake_Values;

      target.mode = parameter.tweakpane[tp_prefix + "mode"];
      target.frequency = parameter.tweakpane[tp_prefix + "frequency"];
      target.amplitude =
        parameter.tweakpane[tp_prefix + "amplitude"] *
        Math.min(canvasSize.width, canvasSize.height);

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
