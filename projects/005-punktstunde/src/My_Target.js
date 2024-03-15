const {
  Animation,
  AnimationTimer,
  AnimationTimeline,
  Brush,
  ColorSet,
  Format,
  ObserverSubject,
  Shape,
  Size,
  Vector
} = require('@carstennichte/cc-utils');

/**
 * Das Ziel (eine Linie), auf das sich der Accent zu bewegen soll.
 * 
 * My_Target implements 
 *  Pattern.Observer (update)
 *  SceneGraph_Item (draw)
 */
class My_Target extends ObserverSubject {

  /**
   * 
   * @param {Object} parameter 
   */
  constructor(parameter) {
    super();

    this.parameter = parameter;

    My_Target.inject_parameterset_to(this.parameter, this.parameter.tweakpane);

    this.animationTimeline = new AnimationTimeline();

    this.breathe = new Animation.Breathe(this.parameter.target.animation);
    this.rotate = new Animation.Rotate(this.parameter.target.animation);
    this.shake = new Animation.Shake(this.parameter.target.animation);

    this.animationTimeline.items.push(this.breathe);
    this.animationTimeline.items.push(this.rotate);
    this.animationTimeline.items.push(this.shake);

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
      }
    }


  } // method constructor

  notify(data = {}) {
    this.state = Object.assign(this.state, data);
    this.notifyAll(this);
  }

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
   * 
   * @param {Object} state
   */
  update(source) {
    if (source instanceof Format) {
      // We look for the format properties
      // because the Quadrat-Object should fit in the new Area.
      this.state.format = source.state.format;
    }
    if (source instanceof ColorSet) {
      this.state.colorset = source.state.colorset;
    }
  }

  /**
   * Zeichnet den Zielpunkt (und ein rotes Kreuz)
   *
   * @param {*} context 
   * @param {*} parameter 
   */
  draw(context, parameter) {

    My_Target.transfer_tweakpane_parameter_to(parameter);

    this.animationTimeline.perform_animations_if(parameter, parameter.target);

    // TODO Use: parameter.target.brush
    let brush = new Brush(parameter.target.brush);

    brush.angle = this.rotate.perform(brush.angle);

    brush.border = Format.transform(brush.border, this.state.format);
    brush.fillColor = this.state.colorset.fillColor;
    brush.borderColor = this.state.colorset.borderColor;

    let position_o = brush.position; // = new Vector(parameter.artwork.canvas.size.width * this.parameter.tweakpane.target_position_x, parameter.artwork.canvas.size.height * this.parameter.tweakpane.target_position_y); // // this.move.now.y    
    position_o = this.shake.perform(position_o);


    let size_o = new Size(400, 400);

    size_o.width = size_o.width * this.breathe.now;
    size_o.height = size_o.height * this.breathe.now;

    //* Recalculate Format-Changes...
    // the calculation does not take into account a pontential change of brush.scale.
    // It is set to 1.0 in the parameters

    let new_op = Format.transform_position(position_o, this.state.format);
    let new_os = Format.transform_size(size_o, this.state.format);

    // Zu verfolgender Punkt
    Shape.draw(context, new_op, new_os, brush, true);


    //! Koordinatensystem zum testen
/*
    // Koordinatensystem zeichnen (Quadranten) 
    let b = new Brush();
    b.shape = "Line";
    b.angle = 0;
    b.scale = 1.0;
    b.border = Format.transform(20, this.state.format);
    b.fillColor = "red";
    b.borderColor = "red";

    // Horizontal
    let position_center = new Vector(parameter.artwork.canvas.size.width * 0.5, parameter.artwork.canvas.size.height * 0.5);

    let size_horizontal = new Size(parameter.artwork.canvas.size.width, 0);

    let new_position_horizontal = Format.transform_position(position_center, this.state.format);
    let new_size_horizontal = Format.transform_size(size_horizontal, this.state.format);

    //    Shape.draw(context, new_position_horizontal, new_size_horizontal, b, true);

    // Vertikal
    let size_vertikal = new Size(0, parameter.artwork.canvas.size.height);

    let new_position_vertikal = Format.transform_position(position_center, this.state.format);
    let new_size_vertikal = Format.transform_size(size_vertikal, this.state.format);

    b.fillColor = "blue";
    b.borderColor = "blue";

    //     Shape.draw(context, new_position_vertikal, new_size_vertikal, b, true);
*/
  } // method draw

}


My_Target.transfer_tweakpane_parameter_to = function (parameter) {

  Brush.transfer_tweakpane_parameter_to(parameter, parameter.target, "target");
  Animation.Breathe.transfer_tweakpane_parameter_to(parameter.target, parameter.tweakpane, "target");
  Animation.Rotate.transfer_tweakpane_parameter_to(parameter.target, parameter.tweakpane, "target");
  Animation.Shake.transfer_tweakpane_parameter_to(parameter.target, parameter.tweakpane, "target");

}


My_Target.inject_parameterset_to = function (parameter, parameter_tweakpane) {

  Object.assign(parameter, {
    target: {}
  });

  Brush.inject_parameterset_to(parameter.target, parameter_tweakpane, "target");
  AnimationTimer.inject_parameterset_to(parameter.colorset, parameter_tweakpane, "colorset");

  Animation.Breathe.inject_parameterset_to(parameter.target, parameter.tweakpane, "target");
  Animation.Rotate.inject_parameterset_to(parameter.target, parameter.tweakpane, "target");
  Animation.Shake.inject_parameterset_to(parameter.target, parameter.tweakpane, "target");

}


My_Target.provide_tweakpane_to = function (folder_name_prefix = "", pane, parameter_tweakpane) {

  // Inject Tweakpane parameters
  parameter_tweakpane = Object.assign(parameter_tweakpane, {
    target_monitor_y: 100,
  });

  let brush_defaults = {
    shape: "Rect",
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

  let folder = Brush.provide_tweakpane_to(folder_name_prefix + "TargetShape:", pane, null, parameter_tweakpane, "target", [], brush_defaults);

  folder.addBlade({
    view: "separator",
  });

  Animation.Breathe.provide_tweakpane_to(pane, folder, parameter_tweakpane, "target");

  folder.addBlade({
    view: "separator",
  });

  Animation.Rotate.provide_tweakpane_to(pane, folder, parameter_tweakpane, "target");

  folder.addBlade({
    view: "separator",
  });

  Animation.Shake.provide_tweakpane_to(pane, folder, parameter_tweakpane, "target");

  folder.addMonitor(parameter_tweakpane, 'target_monitor_y', {
    label: 'Target Y',
    multiline: true,
    lineCount: 5,
  });

  return folder;
};

module.exports = My_Target;
