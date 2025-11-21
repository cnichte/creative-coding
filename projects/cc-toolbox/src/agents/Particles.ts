/**
 * Title    : Particles
 * Project  : Creative Coding
 *
 * Lightweight particle strip as manager + particles.
 * Modernized to use ParameterManager and TweakpaneManager.
 */

import { Brush, type Brush_ParameterSet } from "./Brush";
import { ColorSet } from "../colors/ColorSet";
import { Format } from "../core/Format";
import { ParameterManager } from "../core/ParameterManager";
import { Size } from "../core/Size";
import {
  TweakpaneManager,
  type TweakpaneContainer,
  type TweakpaneModule,
} from "../core/TweakpaneManager";
import { Vector } from "../core/Vector";
import { Shape } from "../core/Shape";

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

export class ParticleManager {
  private parameter: any;
  private particles: Particle[];

  constructor(parameter: any) {
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

  public draw(context: CanvasRenderingContext2D, parameter: any) {
    ParticleManager.ensureParameterSet(parameter);

    const countDesired = Math.max(1, Math.round(parameter.particle.count ?? 0));
    while (this.particles.length < countDesired) {
      this.particles.push(new Particle(this.particles.length, parameter));
    }
    while (this.particles.length > countDesired) {
      const removed = this.particles.pop();
    }

    this.particles.forEach((p, idx) => {
      p.tick(context, parameter, idx, countDesired);
    });
  }
}

class Particle {
  private parameter: any;
  private nr: number;

  constructor(nr: number, parameter: any) {
    this.parameter = parameter;
    this.nr = nr;
  }

  tick(
    context: CanvasRenderingContext2D,
    parameter: any,
    index: number,
    count: number
  ) {
    const brush = new Brush(parameter.particle.brush);
    const canvas = parameter.artwork.canvas.size;
    const margin = parameter.particle.margin ?? 0;
    const t = count <= 1 ? 0 : index / Math.max(1, count - 1);

    const basePos = new Vector(
      canvas.width * 0.5 +
        lerp(
          parameter.particle.xOffset.min ?? 0,
          parameter.particle.xOffset.max ?? 0,
          t
        ) *
          canvas.width,
      lerp(
        margin,
        canvas.height - margin,
        t +
          (parameter.particle?.yOffset?.min ?? 0) -
          (parameter.particle?.yOffset?.max ?? 0)
      )
    );

    let size = new Size(canvas.width, canvas.height).multiply(
      parameter?.particle?.brush?.scale ?? 1
    );
    let pos = basePos;
    const fmt = parameter.format;

    if (fmt) {
      size = Format.transform_size(size, fmt);
      pos = Format.transform_position(pos, fmt);
      brush.border = Format.transform(brush.border, fmt);
    }

    brush.borderColor =
      parameter.colorset?.borderColor ?? brush.borderColor;
    brush.fillColor = parameter.colorset?.fillColor ?? brush.fillColor;

    Shape.draw(context, pos, size, brush, true);
  }
}
