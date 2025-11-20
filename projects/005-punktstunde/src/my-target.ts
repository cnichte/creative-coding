import {
  AnimationTimeline,
  Breathe,
  Brush,
  Brush_ParameterTweakpane,
  ColorSet,
  Format,
  Rotate,
  Shake,
  Shape,
  Size,
  Vector,
  ObserverSubject,
  ParameterManager,
} from "@carstennichte/cc-toolbox";
import {
  TweakpaneManager,
  type Tweakpane_Items,
  type TweakpaneContainer,
} from "@carstennichte/cc-toolbox";

export class My_Target extends ObserverSubject {
  private parameter: any;
  private animationTimeline: AnimationTimeline;
  private breathe: Breathe;
  //! private rotate: Rotate;
  //! private shake: Shake;

  public state: any;

  public static ensureParameterSet(parameter: any) {
    const manager = ParameterManager.from(parameter);
    const canvas =
      manager.get("artwork.canvas.size") ??
      new Size(1, 1, 1);

    const targetDefaults = {
      brush: {
        shape: "Rect",
        position: new Vector(0.5, 0.5),
        angle: 0,
        scale: new Vector(1, 0.1),
        border: Math.min(canvas.width, canvas.height) * 0.08,
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

    manager.ensure("target", targetDefaults);

    AnimationTimeline.ensureParameterSet(parameter, "target.animation.timeline");
    Breathe.ensureParameterSet(parameter, "target.animation.breathe");
    Rotate.ensureParameterSet(parameter, "target.animation.rotate");
    Shake.ensureParameterSet(parameter, "target.animation.shake");
  }

  constructor(parameter: any) {
    super();

    this.parameter = parameter;
    My_Target.ensureParameterSet(this.parameter);

    this.animationTimeline = new AnimationTimeline();
    this.breathe = new Breathe({
      breathe: ParameterManager.from(this.parameter).get(
        "target.animation.breathe"
      ),
    });
    //! this.rotate = new Rotate({ rotate: ParameterManager.from(this.parameter).get("target.animation.rotate") });
    //! this.shake = new Shake({ shake: ParameterManager.from(this.parameter).get("target.animation.shake") });

    this.animationTimeline.push(this.breathe);
    //! this.animationTimeline.push(this.rotate);
    //! this.animationTimeline.push(this.shake);

    this.state = {
      colorset: {
        mode: parameter.colorset.mode,
        groupname: parameter.colorset.group,
        variant: -1,
        number: -1,
        cs_object: null,
        borderColor: "#EFEFEFFF",
        fillColor: "#EFEFEFFF",
      },
      format: {
        position_lefttop: new Vector(0, 0),
        size: parameter.artwork.canvas.size.clone(),
        fak: new Vector(1, 1),
        fencing: true,
        preserveAspectRatio: true,
      },
    };
  }

  check_ObserverSubject(): void {
    // not needed
  }

  notify(data = {}) {
    this.state = Object.assign(this.state, data);
    this.notifyAll(this, this.state);
  }

  update(source: any) {
    if (source instanceof Format) {
      this.state.format = source.state.format;
    }
    if (source instanceof ColorSet) {
      this.state.colorset = source.state.colorset;
    }
  }

  animate_slow(): void {
    // not used yet
  }

  draw(context: any, parameter: any) {
    this.animationTimeline.perform_animations_if(parameter, {
      animation: parameter.target?.animation ?? {},
    });

    const brush = new Brush(parameter.target.brush);
    brush.border = Format.transform(brush.border, this.state.format);
    brush.fillColor = this.state.colorset.fillColor;
    brush.borderColor = this.state.colorset.borderColor;
    //! brush.angle = this.rotate.perform(brush.angle);

    const canvasSize = parameter.artwork.canvas.size;
    const canvasVector = new Vector(canvasSize.width, canvasSize.height);

    let position_px = canvasVector.multiply(brush.position);
    //! position_px = this.shake.perform(position_px);

    const size_base = new Size(
      canvasSize.width * 0.8,
      canvasSize.height * 0.02,
      Math.min(canvasSize.width, canvasSize.height) * 0.01
    );
    let size_px = this.breathe.perform(size_base);

    const formatted_position = Format.transform_position(
      position_px,
      this.state.format
    );
    size_px = Format.transform_size(size_px, this.state.format);

    if (parameter.tweakpane) {
      parameter.tweakpane.target_monitor_y = `x: ${position_px.x.toFixed(
        2
      )}\ny: ${position_px.y.toFixed(2)}`;
    }

    Shape.draw(context, formatted_position, size_px, brush, true);
  }

  public static registerTweakpane(
    parameter: any,
    manager: TweakpaneManager,
    container: TweakpaneContainer,
    id = "target"
  ) {
    if (!manager) return null;
    My_Target.ensureParameterSet(parameter);

    const folder =
      (container as any) ??
      manager.getPane().addFolder({
        title: "Target",
        expanded: false,
      });

    const brush_defaults: Brush_ParameterTweakpane = {
      brush_shape: "Rect",
      brush_position_x: 0.5,
      brush_position_y: 0.5,
      brush_scale: 1.0,
      brush_scale_x: 1.0,
      brush_scale_y: 0.1,
      brush_rotate: 0,
      brush_border: 0.08,
      brush_borderColor: "#efefef7F",
      brush_fillColor: "#efefef7F",
    };

    Brush.registerTweakpane(parameter, {
      manager,
      container: folder,
      parameterPath: ["target"],
      statePath: ["target", "brush"],
      defaults: brush_defaults,
      id: `${id}:brush`,
    });

    Breathe.registerTweakpane(
      parameter,
      manager,
      folder,
      `${id}:breathe`,
      "Breathe",
      "target.animation.breathe",
      "target.animation.timeline"
    );

    Rotate.registerTweakpane(
      parameter,
      manager,
      folder,
      `${id}:rotate`,
      "Rotate",
      "target.animation.rotate",
      "target.animation.timeline"
    );

    Shake.registerTweakpane(
      parameter,
      manager,
      folder,
      `${id}:shake`,
      "Shake",
      "target.animation.shake",
      "target.animation.timeline"
    );

    const monitorModule = manager.createModule({
      id: `${id}:monitor`,
      container: folder,
      stateDefaults: {
        target_monitor_y: "",
      },
      channelId: "tweakpane",
    });

    monitorModule.addBinding("target_monitor_y", {
      label: "Target",
      readonly: true,
      multiline: true,
      rows: 3,
    });

    return folder;
  }
}
