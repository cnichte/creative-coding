import { Animation_Breathe, Brush, ColorSet, Format, Provide_Tweakpane_To_Props, TweakpaneSupport, AnimationTimeline, Vector, Size, Shape } from "@carstennichte/cc-utils";
import { TweakpaneSupport_Props } from "@carstennichte/cc-utils/dist/TweakpaneSupport";

/**
 * Der Accent, ein Kreis, der sich auf die Linie zu bewegen soll.
 *
 * My_Accent implements 
 *  Pattern.Observer (update)
 *  SceneGraph_Item (draw)
 */
class My_Accent { // implements Pattern.Observer

  private parameter: any;
  private animationTimeline: AnimationTimeline;
  private breathe:Animation_Breathe;

  public state:any;


  constructor(parameter: any) {

    this.parameter = parameter;

    // My_Accent.tweakpaneSupport.inject_parameterset_to(this.parameter, this.parameter.tweakpane);

    this.animationTimeline = new AnimationTimeline();

    this.breathe = new Animation_Breathe(this.parameter.accent.animation);
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

      let brush_defaults = {
        shape: "Circle",
        position_x: 0.5,
        position_y: 0.5,
        scale: 1.0,
        scale_x: 1.0,
        scale_y: 1.0,
        angle: 0,
        border: 0.1800,
        borderColor: "#efefef7F",
        fillColor: "#efefef7F"
      };

      // TODO props.folder_name_prefix + "AccentShape:", pane, null, parameter_tweakpane, "accent", [], brush_defaults
      let folder = Brush.tweakpaneSupport.provide_tweakpane_to();

      folder.addBlade({
        view: "separator",
      });

      
      Animation_Breathe.provide_tweakpane_to(pane, folder, parameter.tweakpane, "accent");

      folder.addBlade({
        view: "separator",
      });

      // Animation.Move.provide_tweakpane_to(pane, folder, parameter.tweakpane, "accent");

      folder.addMonitor(parameter.tweakpane, 'accent_monitor_y', {
        label: 'Accent Y',
        multiline: true,
        lineCount: 5,
      });
    },
    inject_parameterset_to: function (parameter: any, props?: TweakpaneSupport_Props | undefined): void {
      Object.assign(parameter, {
        accent: {}
      });

      // TODO Brush.inject_parameterset_to(parameter.accent, parameter_tweakpane, "accent");
      // TODO AnimationTimer.inject_parameterset_to(parameter.colorset, parameter_tweakpane, "colorset");
      // TODO Animation.Breathe.inject_parameterset_to(parameter.accent, parameter.tweakpane, "accent");
      // TODO Animation.Move.inject_parameterset_to(parameter.accent, parameter.tweakpane, "accent");
    },
    transfer_tweakpane_parameter_to: function (parameter: any, props?: TweakpaneSupport_Props | undefined): void {

      // TODO Brush.tweakpaneSupport.transfer_tweakpane_parameter_to(parameter, parameter.accent, "accent");
      // TODO Animation.Breathe.transfer_tweakpane_parameter_to(parameter.accent, parameter.tweakpane, "accent");
      // TODO Animation.Move.transfer_tweakpane_parameter_to(parameter, parameter.accent, parameter.tweakpane, "accent");

    }
  }

} // class MyAccent


module.exports = My_Accent;
