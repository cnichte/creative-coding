import {
  AnimationTimeline,
  Breathe,
  Brush,
  Brush_ParameterTweakpane,
  ColorSet,
  Format,
  Move,
  type Provide_Tweakpane_To_Props,
  Shape,
  Size,
  TweakpaneSupport,
  type TweakpaneSupport_Props,
  type Tweakpane_Items,
  Vector,
  ParameterManager,
} from "@carstennichte/cc-toolbox";

/**
 * Der Accent, ein Kreis, der sich auf die Linie zu bewegen soll.
 *
 * My_Accent implements 
 *  Pattern.Observer (update)
 *  SceneGraph_Item (draw)
 */
export class My_Accent { // implements Pattern.Observer

  private parameter: any;
  private animationTimeline: AnimationTimeline;
  private breathe:Breathe;
  private move: Move;

  public state:any;


  constructor(parameter: any) {

    this.parameter = parameter;

    this.animationTimeline = new AnimationTimeline();

    this.breathe = new Breathe(this.parameter.accent.animation);
    this.move = new Move(this.parameter.accent.animation);

    this.animationTimeline.items.push(this.breathe);
    this.animationTimeline.items.push(this.move);

    this.state = {
      colorset: {
        mode: parameter.colorset.mode, // "custom, colorset, random, chaos"

        groupname: parameter.colorset.group, // The name of The colorset
        variant: -1, // A name could return more then one colorset. This is to choose one of them. 
        number: -1, // A colorset has more than one color. This is to choose a specific.

        cs_object: null, // The ColorSet-Object

        borderColor: "#EFEFEFFF", // parameter.target.brush.borderColor, // Three default colors, extracted for easy access
        fillColor: "#EFEFEFFF" // parameter.target.brush.fillColor
      },
      format: {
        // This is the area "cropped" by the format.
        position_lefttop: new Vector(0, 0), // canvas_position_crop
        size: parameter.artwork.canvas.size.clone(), // canvas_size_crop

        fak: new Vector(1, 1),
        fencing: true,
        preserveAspectRatio: true
      },
      animations: {
        // TODO die Animation Classes hier rein?
      }
    }

  } // method constructor


  /**
   * This is called by the AnimationTimer.
   *
   * @param {Class} source 
   */
  animate_slow(source: any) {
    if (source instanceof ColorSet) {

    }
  }

  /**
   * Is called from the ObserverSubject.
   * to update the accent...
   * 
   * @param {Object} state
   */
  update(source: any) {
    if (source instanceof Format) {
      this.state.format = source.state.format;
    }
    if (source instanceof ColorSet) {
      this.state.colorset = source.state.colorset;
    }
  }


  /**
   * This is called by the SceneCraph.
   *
   * @param {Object} context 
   * @param {Object} parameter 
   */
  draw(context: any, parameter: any) {

    My_Accent.tweakpaneSupport.transfer_tweakpane_parameter_to(parameter);

    const accentParams = ParameterManager.from(parameter).get("accent");
    console.log("accent params", accentParams);

    this.animationTimeline.perform_animations_if(parameter, parameter.accent);

    let brush = new Brush(parameter.accent.brush);
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

    parameter.tweakpane.accent_monitor_y = `x: ${position_px.x.toFixed(
      2
    )}\ny: ${position_px.y.toFixed(2)}`;

    Shape.draw(context, formatted_position, size_px, brush, true);

  } // method draw


  public static tweakpaneSupport: TweakpaneSupport = {
    provide_tweakpane_to: function (parameter: any, props: Provide_Tweakpane_To_Props) {
            
      // Inject Tweakpane parameters
      parameter.tweakpane = Object.assign(parameter.tweakpane, {
        // canvas_background_color: "#ff00006F",
        accent_monitor_y: 100
      });

      // TODO inject_parameterset_to mach ich immer in provide_tweakpane_to - das sollte überall gleich sein.
      // TODO  inject_parameterset_to sollte evtl in den constructor wandern?
      My_Accent.tweakpaneSupport.inject_parameterset_to(parameter);

      if (props.items.folder == null) {
        props.items.folder = props.items.pane.addFolder({
          title: props.folder_name_prefix,
          expanded: false,
        });
      }

      let brush_defaults: Brush_ParameterTweakpane = {
        brush_shape: "Circle",
        brush_position_x: 0.5, // Die initiale Position des Shapes.
        brush_position_y: 0.5,
        brush_scale: 1.0,
        brush_scale_x: 1.0,
        brush_scale_y: 1.0,
        brush_rotate: 0,
        brush_border: 0.18,
        brush_borderColor: "#efefef7F",
        brush_fillColor: "#efefef7F",
      };

      const brushItems = Brush.tweakpaneSupport.provide_tweakpane_to(parameter, {
        items:{
          pane: props.items.pane,
          folder: null,
          tab: null
        },
        folder_name_prefix: props.folder_name_prefix,
        use_separator: false,
        parameterSetName: "accent",
        excludes: [],
        defaults: brush_defaults,
      });


      brushItems.folder?.addBlade({
        view: "separator",
      });

      const breatheItems = Breathe.tweakpaneSupport.provide_tweakpane_to(parameter, {
        items: {
          pane: props.items.pane,
          folder: props.items.folder,
          tab: null,
        },
        folder_name_prefix: "",
        use_separator: false,
        parameterSetName: "accent",
      });

      breatheItems.folder?.addBlade({
        view: "separator",
      });

      Move.tweakpaneSupport.provide_tweakpane_to(parameter, {
        items: {
          pane: props.items.pane,
          folder: props.items.folder,
          tab: null,
        },
        folder_name_prefix: "",
        use_separator: false,
        parameterSetName: "accent",
      });

      props.items.folder?.addBlade({
        view: "separator",
      });

      // Animation.Move.provide_tweakpane_to(pane, folder, parameter.tweakpane, "accent");

      props.items.folder.addBinding(parameter.tweakpane, 'accent_monitor_y', {
        readonly: true,
        label: 'Accent Y',
        multiline: true,
        rows: 5,
      });
    },
    inject_parameterset_to: function (parameter: any, props?: TweakpaneSupport_Props | undefined): void {
      const props_default: TweakpaneSupport_Props = {
        parameterSetName: "accent",
      };
      const accentSet = TweakpaneSupport.ensureParameterSet(parameter, props_default);

      if (!("brush" in accentSet)) accentSet.brush = {};
      if (!("animation" in accentSet)) accentSet.animation = {};

      Brush.tweakpaneSupport.inject_parameterset_to(parameter, {
        parameterSetName: "accent",
        parameterSet: accentSet,
      });
      Breathe.tweakpaneSupport.inject_parameterset_to(parameter, {
        parameterSetName: "accent",
        parameterSet: accentSet,
      });
      Move.tweakpaneSupport.inject_parameterset_to(parameter, {
        parameterSetName: "accent",
        parameterSet: accentSet,
      });
    },
    transfer_tweakpane_parameter_to: function (parameter: any, props?: TweakpaneSupport_Props | undefined): void {
      const props_default: TweakpaneSupport_Props = {
        parameterSetName: "accent",
      };
      const accentSet = TweakpaneSupport.ensureParameterSet(parameter, props_default);

      Brush.tweakpaneSupport.transfer_tweakpane_parameter_to(parameter, {
        parameterSetName: "accent",
        parameterSet: accentSet,
      });
      Breathe.tweakpaneSupport.transfer_tweakpane_parameter_to(parameter, {
        parameterSetName: "accent",
        parameterSet: accentSet,
      });
      Move.tweakpaneSupport.transfer_tweakpane_parameter_to(parameter, {
        parameterSetName: "accent",
        parameterSet: accentSet,
      });
    }
  }

} // class MyAccent
