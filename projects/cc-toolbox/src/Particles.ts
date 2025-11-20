/**
 * Title    : Particles
 * Project  : Creative Coding
 *
 * Lightweight particle strip as manager + particles.
 * Modernized to use ParameterManager and TweakpaneManager.
 */

import { Brush, type Brush_ParameterSet } from "./Brush";
import { ColorSet } from "./ColorSet";
import { Format } from "./Format";
import { ObserverSubject, type Observer } from "./ObserverPattern";
import { ParameterManager } from "./ParameterManager";
import { Size } from "./Size";
import {
  TweakpaneManager,
  type TweakpaneContainer,
  type TweakpaneModule,
} from "./TweakpaneManager";
import { Vector } from "./Vector";
import { Shape } from "./Shape";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export interface ParticleParameters {
  count: number;
  margin: number;
  xOffset: { min: number; max: number };
  yOffset: { min: number; max: number };
  freq: number;
  amp: number;
  animate: boolean;
  frame: number;
  brush: Brush_ParameterSet;
}

export interface ParticleModuleOptions {
  manager: TweakpaneManager;
  container: TweakpaneContainer;
  id?: string;
  statePath?: string | string[];
}

export class ParticleManager extends ObserverSubject {
  private parameter: any;
  private particles: Particle[];

  constructor(parameter: any) {
    super();
    this.parameter = parameter;
    ParticleManager.ensureParameterSet(this.parameter);
    this.particles = [];
  }

  public static ensureParameterSet(
    parameter: any,
    path: string | string[] = "particle"
  ) {
    const manager = ParameterManager.from(parameter);
    const canvasSize = manager.get("artwork.canvas.size") ?? new Size(1, 1, 1);

    const defaults: ParticleParameters = {
      count: 7,
      margin: 0,
      xOffset: { min: 0, max: 0 },
      yOffset: { min: 0, max: 0 },
      freq: 0.001,
      amp: 0.2,
      animate: true,
      frame: 0,
      brush: new Brush({
        shape: "Circle",
        angle: 0,
        position: new Vector(0.5, 0.5),
        scale: 1,
        border: Math.min(canvasSize.width, canvasSize.height) * 0.01,
        borderColor: "#efefef7F",
        fillColor: "#efefef7F",
        fillColorAlpha: undefined,
        borderColorAlpha: undefined,
        text: {
          content: "",
          fontFamily: "Arial",
          fontSize: 12,
        },
      }),
    };

    const result = manager.ensure(path, defaults);
    if (!(result.brush instanceof Brush)) {
      result.brush = new Brush(result.brush);
    }
    return result;
  }

  public static registerTweakpane(
    parameter: any,
    options: ParticleModuleOptions
  ): TweakpaneModule | null {
    if (!options?.manager) return null;
    const particle = ParticleManager.ensureParameterSet(parameter);

    const module = options.manager.createModule({
      id: options.id ?? "particles",
      container: options.container,
      statePath: options.statePath ?? ["particle"],
      stateDefaults: {
        count: particle.count,
        margin: particle.margin,
        xOffset_min: particle.xOffset.min,
        xOffset_max: particle.xOffset.max,
        yOffset_min: particle.yOffset.min,
        yOffset_max: particle.yOffset.max,
        freq: particle.freq,
        amp: particle.amp,
        animate: particle.animate,
        frame: particle.frame,
      },
      parameterPath: ["particle"],
      parameterDefaults: particle,
      channelId: undefined,
    });

    module.addBinding(
      "count",
      { label: "Count", min: 1, max: 300, step: 1 },
      { target: "particle.count", transform: (v) => Math.max(1, Math.round(v)) }
    );

    module.addBinding(
      "margin",
      { label: "Margin", min: 0, max: 0.5, step: 0.001 },
      { target: "particle.margin" }
    );

    module.addBinding(
      "xOffset_min",
      { label: "Offset X Min", min: 0, max: 1, step: 0.0001 },
      {
        target: "particle.xOffset",
        transform: (value, state) => ({
          min: value,
          max: (state as any).xOffset_max,
        }),
      }
    );

    module.addBinding(
      "xOffset_max",
      { label: "Offset X Max", min: 0, max: 1, step: 0.0001 },
      {
        target: "particle.xOffset",
        transform: (value, state) => ({
          min: (state as any).xOffset_min,
          max: value,
        }),
      }
    );

    module.addBinding(
      "yOffset_min",
      { label: "Offset Y Min", min: 0, max: 1, step: 0.0001 },
      {
        target: "particle.yOffset",
        transform: (value, state) => ({
          min: value,
          max: (state as any).yOffset_max,
        }),
      }
    );

    module.addBinding(
      "yOffset_max",
      { label: "Offset Y Max", min: 0, max: 1, step: 0.0001 },
      {
        target: "particle.yOffset",
        transform: (value, state) => ({
          min: (state as any).yOffset_min,
          max: value,
        }),
      }
    );

    module.addBinding(
      "freq",
      { label: "Freq", min: -0.01, max: 0.01, step: 0.0001 },
      { target: "particle.freq" }
    );

    module.addBinding(
      "amp",
      { label: "Amp", min: 0, max: 1, step: 0.001 },
      { target: "particle.amp" }
    );

    module.addBinding(
      "animate",
      { label: "Animate" },
      { target: "particle.animate" }
    );

    module.addBinding(
      "frame",
      { label: "Frame", min: 0, max: 999, step: 1 },
      { target: "particle.frame" }
    );

    Brush.registerTweakpane(parameter, {
      manager: options.manager,
      container: options.container,
      parameterPath: ["particle"],
      statePath: ["particle", "brush"],
      id: `${options.id ?? "particles"}:brush`,
      defaults: {
        brush_shape: "Circle",
        brush_position_x: 0.5,
        brush_position_y: 0.5,
        brush_scale: 0.3,
        brush_scale_x: 1.0,
        brush_scale_y: 1.0,
        brush_rotate: 0,
        brush_border: 0.06,
        brush_borderColor: "#efefef7F",
        brush_fillColor: "#efefef7F",
      },
    });

    return module;
  }

  public check_ObserverSubject(): void {
    // not used; required by base class
  }

  public update(source: ObserverSubject, state_new: any) {
    if (source instanceof Format || source instanceof ColorSet) {
      super.notifyAll(source, state_new);
    }
  }

  // satisfy Animable (AnimationTimer listeners)
  public animate_slow(_source: any, _parameter: any): void {
    // hook for future slow animations; particles are updated in draw()
  }

  public draw(context: CanvasRenderingContext2D, parameter: any) {
    ParticleManager.ensureParameterSet(parameter);

    const countDesired = Math.max(1, Math.round(parameter.particle.count ?? 0));
    while (this.particles.length < countDesired) {
      this.particles.push(new Particle(this.particles.length, parameter));
      super.addObserver(this.particles[this.particles.length - 1]);
    }
    while (this.particles.length > countDesired) {
      const removed = this.particles.pop();
      if (removed) super.removeObserver(removed);
    }

    const mgrState = {
      manager: {
        particle: {
          count: countDesired,
          margin: parameter.particle.margin ?? 0,
        },
      },
    };

    this.particles.forEach((p) => {
      p.update(this, mgrState.manager.particle);
      p.draw(context, parameter);
    });
  }
}

class Particle implements Observer {
  private parameter: any;
  public state: {
    particle: { nr: number; position: Vector; size: Size };
    manager: { particle: any };
    format?: any;
    colorset?: any;
  };

  constructor(nr: number, parameter: any) {
    this.parameter = parameter;
    const canvasSize = parameter?.artwork?.canvas?.size ?? new Size(1, 1, 1);
    this.state = {
      particle: {
        nr,
        position: new Vector(0, 0),
        size: new Size(canvasSize.width, canvasSize.height).multiply(
          parameter?.particle?.brush?.scale ?? 1
        ),
      },
      manager: { particle: {} },
    };
  }

  update(source: any, state_new?: any) {
    if (source instanceof Format) {
      this.state.format = state_new?.format ?? source.state?.format;
    }
    if (source instanceof ColorSet) {
      this.state.colorset = state_new?.colorset ?? source.state?.colorset;
    }
    if (source instanceof ParticleManager) {
      this.state.manager.particle = state_new ?? {};
      const count =
        this.state.manager.particle.count != null
          ? this.state.manager.particle.count
          : 1;
      const margin = this.state.manager.particle.margin ?? 0;
      const t =
        count <= 1 ? 0 : this.state.particle.nr / Math.max(1, count - 1);
      const canvas = this.parameter.artwork.canvas.size;
      const x = canvas.width * 0.5;
      const y = lerp(
        margin,
        canvas.height - margin,
        t + (this.parameter.particle?.yOffset?.min ?? 0)
      );
      this.state.particle.position = new Vector(x, y);
    }
  }

  draw(context: CanvasRenderingContext2D, parameter: any) {
    const brush = new Brush(parameter.particle.brush);
    let size = this.state.particle.size;
    let pos = this.state.particle.position;

    if (this.state.format) {
      size = Format.transform_size(size, this.state.format);
      pos = Format.transform_position(pos, this.state.format);
      brush.border = Format.transform(brush.border, this.state.format);
    }

    brush.borderColor = this.state.colorset?.borderColor ?? brush.borderColor;
    brush.fillColor = this.state.colorset?.fillColor ?? brush.fillColor;

    Shape.draw(context, pos, size, brush, true);
  }
}
