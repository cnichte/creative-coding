import { Breathe, Brush, ColorSet, Format, Provide_Tweakpane_To_Props, TweakpaneSupport, AnimationTimeline, Vector, Size, Shape, Brush_ParameterTweakpane, Utils } from "@carstennichte/cc-toolbox";
import { TweakpaneSupport_Props, Tweakpane_Items } from "@carstennichte/cc-toolbox/dist/TweakpaneSupport";

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

  public state:any;


  constructor(parameter: any) {

    this.parameter = parameter;

    // My_Accent.tweakpaneSupport.inject_parameterset_to(this.parameter, this.parameter.tweakpane);

    this.animationTimeline = new AnimationTimeline();

    this.breathe = new Breathe(this.parameter.accent.animation);
    // this.move = new Animation.Move(this.parameter.accent.animation);

    this.animationTimeline.items.push(this.breathe);
    // this.animationTimeline.items.push(this.move);

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

    this.animationTimeline.perform_animations_if(parameter, parameter.accent);

    // TODO Use: parameter.accent.brush
    let brush = new Brush(parameter.accent.brush);
    brush.border = Format.transform(brush.border, this.state.format);
    brush.borderColor = this.state.colorset.borderColor;
    brush.fillColor = this.state.colorset.fillColor;


    let position_o = brush.position; // = new Vector(parameter.artwork.canvas.size.width * this.parameter.tweakpane.accent_position_x, parameter.artwork.canvas.size.height * this.parameter.tweakpane.accent_position_y);

    // position_o = this.move.perform(position_o);

    let size_o = new Size(parameter.artwork.canvas.size.width * 0.2, parameter.artwork.canvas.size.height * 0.2, parameter.artwork.canvas.size.width * 0.02);
    size_o = this.breathe.perform(size_o);

    // Recalculate Format-Changes...
    // the calculation does not take into account a pontential change of brush.scale.
    // It is set to 1.0 in the parameters
    // object_position, screen_position_lefttop, fak
    let new_position_o = Format.transform_position(position_o, this.state.format);
    let new_size_o = Format.transform_size(size_o, this.state.format);

    Shape.draw(context, new_position_o, new_size_o, brush, true);

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

      Brush.tweakpaneSupport.provide_tweakpane_to(parameter, {
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


      props.items.folder.addBlade({
        view: "separator",
      });

      // pane, folder, parameter.tweakpane, "accent"
      Breathe.tweakpaneSupport.provide_tweakpane_to(parameter, {
        items: {
          pane: props.items.pane,
          folder: props.items.folder,
          tab: null
        },
        folder_name_prefix: "",
        use_separator: false,
        parameterSetName: "accent"
      });

      props.items.folder.addBlade({
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
      
      Object.assign(parameter, {
        accent: {}
      });

      let props_default: TweakpaneSupport_Props = {
        parameterSetName: "accent",
        parameterSet: parameter.accent,
      };

      // Übergebene Props überschreiben die defaults
      // Utils.set_property_if_exist(props_default, props, "parameterSet");
      // Utils.set_property_if_exist(props_default, props, "parameterSetName");

      Brush.tweakpaneSupport.inject_parameterset_to(parameter, props_default);
      
      Breathe.tweakpaneSupport.inject_parameterset_to(parameter, props_default);

      // TODO AnimationTimer.inject_parameterset_to(parameter.colorset, parameter_tweakpane, "colorset");
      // TODO Animation.Move.inject_parameterset_to(parameter.accent, parameter.tweakpane, "accent");
    },
    transfer_tweakpane_parameter_to: function (parameter: any, props?: TweakpaneSupport_Props | undefined): void {

      let props_2: TweakpaneSupport_Props = {
        parameterSetName: "accent",
        parameterSet: parameter.accent,
      };

      Brush.tweakpaneSupport.transfer_tweakpane_parameter_to(parameter, props_2);
      Breathe.tweakpaneSupport.transfer_tweakpane_parameter_to(parameter, props_2);
      // TODO Animation.Move.transfer_tweakpane_parameter_to(parameter, parameter.accent, parameter.tweakpane, "accent");

    }
  }

} // class MyAccent
