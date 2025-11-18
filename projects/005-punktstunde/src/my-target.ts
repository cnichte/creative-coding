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
  TweakpaneSupport,
  type Provide_Tweakpane_To_Props,
  type TweakpaneSupport_Props,
  type Tweakpane_Items,
  Vector,
  ObserverSubject,
} from "@carstennichte/cc-toolbox";

export class My_Target extends ObserverSubject {
  private parameter: any;
  private animationTimeline: AnimationTimeline;
  private breathe: Breathe;
  private rotate: Rotate;
  private shake: Shake;

  public state: any;

  constructor(parameter: any) {
    super();

    this.parameter = parameter;

    this.animationTimeline = new AnimationTimeline();
    this.breathe = new Breathe(this.parameter.target.animation);
    this.rotate = new Rotate(this.parameter.target.animation);
    this.shake = new Shake(this.parameter.target.animation);

    this.animationTimeline.push(this.breathe);
    this.animationTimeline.push(this.rotate);
    this.animationTimeline.push(this.shake);

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
    My_Target.tweakpaneSupport.transfer_tweakpane_parameter_to(parameter);

    this.animationTimeline.perform_animations_if(parameter, parameter.target);

    const brush = new Brush(parameter.target.brush);
    brush.border = Format.transform(brush.border, this.state.format);
    brush.fillColor = this.state.colorset.fillColor;
    brush.borderColor = this.state.colorset.borderColor;
    brush.angle = this.rotate.perform(brush.angle);

    const canvasSize = parameter.artwork.canvas.size;
    const canvasVector = new Vector(canvasSize.width, canvasSize.height);

    let position_px = canvasVector.multiply(brush.position);
    position_px = this.shake.perform(position_px);

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

    parameter.tweakpane.target_monitor_y = `x: ${position_px.x.toFixed(
      2
    )}\ny: ${position_px.y.toFixed(2)}`;

    Shape.draw(context, formatted_position, size_px, brush, true);
  }

  public static tweakpaneSupport: TweakpaneSupport = {
    provide_tweakpane_to(parameter: any, props: Provide_Tweakpane_To_Props) {
      My_Target.tweakpaneSupport.inject_parameterset_to(parameter);

      parameter.tweakpane = Object.assign(parameter.tweakpane, {
        target_monitor_y: "",
      });

      if (props.items.folder == null) {
        props.items.folder = props.items.pane.addFolder({
          title: props.folder_name_prefix + "Target",
          expanded: false,
        });
      }

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

      Brush.tweakpaneSupport.provide_tweakpane_to(parameter, {
        items: {
          pane: props.items.pane,
          folder: props.items.folder,
          tab: null,
        },
        folder_name_prefix: "",
        use_separator: false,
        parameterSetName: "target",
        excludes: [],
        defaults: brush_defaults,
      });

      props.items.folder.addBlade({ view: "separator" });

      Breathe.tweakpaneSupport.provide_tweakpane_to(parameter, {
        items: {
          pane: props.items.pane,
          folder: props.items.folder,
          tab: null,
        },
        folder_name_prefix: "",
        use_separator: false,
        parameterSetName: "target",
      });

      props.items.folder.addBlade({ view: "separator" });

      Rotate.tweakpaneSupport.provide_tweakpane_to(parameter, {
        items: {
          pane: props.items.pane,
          folder: props.items.folder,
          tab: null,
        },
        folder_name_prefix: "",
        use_separator: false,
        parameterSetName: "target",
      });

      props.items.folder.addBlade({ view: "separator" });

      Shake.tweakpaneSupport.provide_tweakpane_to(parameter, {
        items: {
          pane: props.items.pane,
          folder: props.items.folder,
          tab: null,
        },
        folder_name_prefix: "",
        use_separator: false,
        parameterSetName: "target",
      });

      props.items.folder.addBinding(parameter.tweakpane, "target_monitor_y", {
        label: "Target",
        readonly: true,
        multiline: true,
        rows: 3,
      });

      return props.items;
    },
    inject_parameterset_to(parameter: any) {
      if (!("target" in parameter)) {
        Object.assign(parameter, {
          target: {},
        });
      }

      const props_default: TweakpaneSupport_Props = {
        parameterSetName: "target",
        parameterSet: parameter.target,
      };

      Brush.tweakpaneSupport.inject_parameterset_to(parameter, props_default);
      Breathe.tweakpaneSupport.inject_parameterset_to(parameter, props_default);
      Rotate.tweakpaneSupport.inject_parameterset_to(parameter, props_default);
      Shake.tweakpaneSupport.inject_parameterset_to(parameter, props_default);
    },
    transfer_tweakpane_parameter_to(parameter: any) {
      const props_default: TweakpaneSupport_Props = {
        parameterSetName: "target",
        parameterSet: parameter.target,
      };

      Brush.tweakpaneSupport.transfer_tweakpane_parameter_to(
        parameter,
        props_default
      );
      Breathe.tweakpaneSupport.transfer_tweakpane_parameter_to(
        parameter,
        props_default
      );
      Rotate.tweakpaneSupport.transfer_tweakpane_parameter_to(
        parameter,
        props_default
      );
      Shake.tweakpaneSupport.transfer_tweakpane_parameter_to(
        parameter,
        props_default
      );
    },
  };
}
