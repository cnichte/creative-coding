const {
  Animation,
  AnimationTimer,
  AnimationTimeline,
  Brush,
  ColorSet,
  Format,
  Shape,
  Size,
  Vector
} = require('@carstennichte/cc-utils');


/**
 * Der Accent, ein Kreis, der sich auf die Linie zu bewegen soll.
 *
 * My_Accent implements 
 *  Pattern.Observer (update)
 *  SceneGraph_Item (draw)
 */
class My_Accent { // implements Pattern.Observer

  constructor(parameter) {

    this.parameter = parameter;

    My_Accent.inject_parameterset_to(this.parameter, this.parameter.tweakpane);

    this.animationTimeline = new AnimationTimeline();

    this.breathe = new Animation.Breathe(this.parameter.accent.animation);
    this.move = new Animation.Move(this.parameter.accent.animation);

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
      animations:{
        // TODO die Animation Classes hier rein?
      }
    }

  } // method constructor


  /**
   * This is called by the AnimationTimer.
   *
   * @param {Class} source 
   */
  animate_slow(source) {
    if (source instanceof ColorSet) {

    }
  }

  /**
   * Is called from the ObserverSubject.
   * to update the accent...
   * 
   * @param {Object} state
   */
  update(source) {
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
  draw(context, parameter) {

    My_Accent.transfer_tweakpane_parameter_to(parameter);

    this.animationTimeline.perform_animations_if(parameter, parameter.accent);
    
    // TODO Use: parameter.accent.brush
    let brush = new Brush(parameter.accent.brush);
    brush.border = Format.transform(brush.border, this.state.format);
    brush.borderColor = this.state.colorset.borderColor;
    brush.fillColor = this.state.colorset.fillColor;


    let position_o = brush.position; // = new Vector(parameter.artwork.canvas.size.width * this.parameter.tweakpane.accent_position_x, parameter.artwork.canvas.size.height * this.parameter.tweakpane.accent_position_y);
    
    position_o = this.move.perform(position_o);

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
} // class MyAccent


/**
 * Transfers the Tweakpane-Parameters to the Parameter-Set for this Class / Module.
 *
 * @param {Object} parameter 
 */
My_Accent.transfer_tweakpane_parameter_to = function (parameter) {

  Brush.transfer_tweakpane_parameter_to(parameter, parameter.accent, "accent");
  Animation.Breathe.transfer_tweakpane_parameter_to(parameter.accent, parameter.tweakpane, "accent");
  Animation.Move.transfer_tweakpane_parameter_to(parameter, parameter.accent, parameter.tweakpane, "accent");

}

/**
 * Provides a Set of Parameters for this Class / Module.
 *
 * @param {Object} parameter 
 * @param {Object} parameter_tweakpane 
 */
My_Accent.inject_parameterset_to = function (parameter, parameter_tweakpane) {

  Object.assign(parameter, {
    accent: {}
  });

  Brush.inject_parameterset_to(parameter.accent, parameter_tweakpane, "accent");
  AnimationTimer.inject_parameterset_to(parameter.colorset, parameter_tweakpane, "colorset");

  Animation.Breathe.inject_parameterset_to(parameter.accent, parameter.tweakpane, "accent");
  Animation.Move.inject_parameterset_to(parameter.accent, parameter.tweakpane, "accent");
}

/**
 * Provides a Tweakpane for this Class / Module.
 *
 * @param {String} folder_name_prefix 
 * @param {Pane} pane 
 * @param {Object} parameter_tweakpane 
 * @returns 
 */
My_Accent.provide_tweakpane_to = function (folder_name_prefix = "", pane, parameter_tweakpane) {

  // Inject Tweakpane parameters
  parameter_tweakpane = Object.assign(parameter_tweakpane, {
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

  let folder = Brush.provide_tweakpane_to(folder_name_prefix + "AccentShape:", pane, null, parameter_tweakpane, "accent", [], brush_defaults);

  folder.addBlade({
    view: "separator",
  });

  Animation.Breathe.provide_tweakpane_to(pane, folder, parameter_tweakpane, "accent");

  folder.addBlade({
    view: "separator",
  });

  Animation.Move.provide_tweakpane_to(pane, folder, parameter_tweakpane, "accent");

  folder.addMonitor(parameter_tweakpane, 'accent_monitor_y', {
    label: 'Accent Y',
    multiline: true,
    lineCount: 5,
  });

  return folder;
};

module.exports = My_Accent;
