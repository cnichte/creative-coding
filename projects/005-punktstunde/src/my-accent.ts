import {
  AnimationTimeline,
  Breathe,
  Brush,
  Brush_ParameterTweakpane,
  ColorSet,
  Format,
  Move,
  Shape,
  Size,
  Vector,
  ParameterManager,
} from "@carstennichte/cc-toolbox";
import {
  TweakpaneManager,
  type TweakpaneContainer,
} from "@carstennichte/cc-toolbox";

/**
 * Der Accent, ein Kreis, der sich auf die Linie zu bewegen soll.
 *
 * My_Accent implements
 *  Pattern.Observer (update)
 *  SceneGraph_Item (draw)
 */
export class My_Accent {
  private parameter: any;
  private animationTimeline: AnimationTimeline;
  private breathe: Breathe;
  private move: Move;

  public state: any;

  public static ensureParameterSet(parameter: any) {
    const manager = ParameterManager.from(parameter);
    const canvas = manager.get("artwork.canvas.size") ?? new Size(1, 1, 1);

    const defaults = {
      brush: {
        shape: "Circle",
        position: new Vector(0.5, 0.5),
        angle: 0,
        scale: new Vector(1, 1),
        border: Math.min(canvas.width, canvas.height) * 0.18,
        borderColor: "#efefef7F",
        fillColor: "#efefef7F",
        fillColorAlpha: undefined,
        borderColorAlpha: undefined,
        text: {
          content: "",
          fontFamily: "Arial",
          fontSize: 12,
        },
      },
    };

    manager.ensure("accent", defaults);
    AnimationTimeline.ensureParameterSet(parameter, "accent.animation.timeline");
    Breathe.ensureParameterSet(parameter, "accent.animation.breathe");
    Move.ensureParameterSet(parameter, "accent.animation.move");
  }

  constructor(parameter: any) {
    this.parameter = parameter;
    My_Accent.ensureParameterSet(this.parameter);

    this.animationTimeline = new AnimationTimeline();

    const pm = ParameterManager.from(this.parameter);
    this.breathe = new Breathe({
      breathe: pm.get("accent.animation.breathe"),
    });
    this.move = new Move({
      move: pm.get("accent.animation.move"),
    });

    this.animationTimeline.items.push(this.breathe);
    this.animationTimeline.items.push(this.move);

    this.state = {
      colorset: {
        mode: parameter.colorset.mode, // "custom, colorset, random, chaos"

        groupname: parameter.colorset.group, // The name of The colorset
        variant: -1, // A name could return more then one colorset. This is to choose one of them.
        number: -1, // A colorset has more than one color. This is to choose a specific.

        cs_object: null, // The ColorSet-Object

        borderColor: "#EFEFEFFF", // Three default colors, extracted for easy access
        fillColor: "#EFEFEFFF",
      },
      format: {
        position_lefttop: new Vector(0, 0),
        size: parameter.artwork.canvas.size.clone(),
        fak: new Vector(1, 1),
        fencing: true,
        preserveAspectRatio: true,
      },
      animations: {},
    };
  } // method constructor

  animate_slow(source: any) {
    if (source instanceof ColorSet) {
      // hook for future color animations
    }
  }

  update(source: any) {
    if (source instanceof Format) {
      this.state.format = source.state.format;
    }
    if (source instanceof ColorSet) {
      this.state.colorset = source.state.colorset;
    }
  }

  draw(context: any, parameter: any) {
    this.animationTimeline.perform_animations_if(parameter, {
      animation: parameter.accent?.animation ?? {},
    });

    const brush = new Brush(parameter.accent.brush);
    brush.border = Format.transform(brush.border, this.state.format);
    brush.borderColor = this.state.colorset.borderColor;
    brush.fillColor = this.state.colorset.fillColor;

    const canvasSize = parameter.artwork.canvas.size;
    const canvasVector = new Vector(canvasSize.width, canvasSize.height);

    let position_px = canvasVector.multiply(brush.position);
    position_px = this.move.perform(position_px);

    const size_base = new Size(
      canvasSize.width * 0.12,
      canvasSize.height * 0.12,
      Math.min(canvasSize.width, canvasSize.height) * 0.02
    );

    let size_px = this.breathe.perform(size_base);

    const formatted_position = Format.transform_position(
      position_px,
      this.state.format
    );
    size_px = Format.transform_size(size_px, this.state.format);

    if (parameter.tweakpane) {
      parameter.tweakpane.accent_monitor_y = `x: ${position_px.x.toFixed(
        2
      )}\ny: ${position_px.y.toFixed(2)}`;
    }

    Shape.draw(context, formatted_position, size_px, brush, true);
  } // method draw

  public static registerTweakpane(
    parameter: any,
    manager: TweakpaneManager,
    container: TweakpaneContainer,
    id = "accent"
  ) {
    if (!manager) return null;
    My_Accent.ensureParameterSet(parameter);

    const folder =
      (container as any) ??
      manager.getPane().addFolder({
        title: "Accent",
        expanded: false,
      });

    const brush_defaults: Brush_ParameterTweakpane = {
      brush_shape: "Circle",
      brush_position_x: 0.5,
      brush_position_y: 0.5,
      brush_scale: 1.0,
      brush_scale_x: 1.0,
      brush_scale_y: 1.0,
      brush_rotate: 0,
      brush_border: 0.18,
      brush_borderColor: "#efefef7F",
      brush_fillColor: "#efefef7F",
    };

    Brush.registerTweakpane(parameter, {
      manager,
      container: folder,
      parameterPath: ["accent"],
      statePath: ["accent", "brush"],
      defaults: brush_defaults,
      id: `${id}:brush`,
    });

    Breathe.registerTweakpane(
      parameter,
      manager,
      folder,
      `${id}:breathe`,
      "Breathe",
      "accent.animation.breathe",
      "accent.animation.timeline"
    );

    Move.registerTweakpane(
      parameter,
      manager,
      folder,
      `${id}:move`,
      "Move",
      "accent.animation.move",
      "accent.animation.timeline"
    );

    const monitorModule = manager.createModule({
      id: `${id}:monitor`,
      container: folder,
      stateDefaults: { accent_monitor_y: "" },
      channelId: "tweakpane",
    });

    monitorModule.addBinding("accent_monitor_y", {
      label: "Accent",
      readonly: true,
      multiline: true,
      rows: 3,
    });

    return folder;
  }
}
