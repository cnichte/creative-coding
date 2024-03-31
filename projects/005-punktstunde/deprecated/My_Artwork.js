/**
 * Title    : Punktstunde
 * Project  : Creative Coding
 * File     : projects/004-punktstunde/My_Artwork.js
 * Version  : 0.1.0
 * Published: -
 *
 * Based on the point lesson during my photography studies.
 * Exploring some more basic concepts - introducing the timeline.
 *
 ** Aufgabe 1: Der Akzent soll im Prinzip der Linie folgen, egal wo sie ist.
 * 
 * 
 * made with 
 * https://github.com/mattdesl/canvas-sketch
 * https://github.com/mattdesl/canvas-sketch-util
 * 
 * In the projects folder open the Terminal, and:
 * Start Server: `npm run server`
 * Build html:   `npm run html`
 * Build release:`npm run release`
 *
 ** Licence
 * Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
 * https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode
 * https://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1
 * 
 * In short:
 * Do not sell the code, or creative stuff made with this code.
 * You are allowed to make someone happy, and give away the works you have created for free.
 * learn, code, and have fun.
 * 
 * @author Carsten Nichte - 2022
 * 
 */

// const Random = require('canvas-sketch-util/random');
// const {lerp} = require('canvas-sketch-util/math');
// const { pingPong } = require('canvas-sketch-util/math');

const {
  Artwork,
  Animation,
  AnimationTimer,
  AnimationTimeline,
  Background,
  ColorSet,
  Format,
  SceneGraph,
  Size
} = require('@carstennichte/cc-utils');

let My_Target = require('./My_Target.js');
let My_Accent = require('./My_Accent.js');


class My_Artwork extends Artwork {

  constructor(sketchManager, settings, window, document, canvas, onKeyUp_Callback, openOptionPanes, parameter) {
    super(sketchManager, settings, window, document, canvas, onKeyUp_Callback, openOptionPanes);

    this.accent = null;
    this.target = null;

    this.parameter = Object.assign(this.parameter, parameter);
  }

  /**
   * Prepares the Artwork.
   * @param {*} canvas_width 
   * @param {*} canvas_height 
   */
  prepare(canvas_width, canvas_height) {

    // Inject ParameterSets and init with Tweakpane-Parameters
    Artwork.inject_parameterset_to(this.parameter, this.parameter.tweakpane);
    Artwork.set_canvas_size(this.parameter, canvas_width, canvas_height);
    Background.inject_parameterset_to(this.parameter, this.parameter.tweakpane);
    Format.inject_parameterset_to(this.parameter, this.parameter.tweakpane);
    ColorSet.inject_parameterset_to(this.parameter, this.parameter.tweakpane);
    
    this.background = new Background(this.parameter);
    this.format = new Format(this.parameter);
    this.accent = new My_Accent(this.parameter);
    this.target = new My_Target(this.parameter);

    this.format.addObserver(this.background);
    this.format.addObserver(this.accent);
    this.format.addObserver(this.target);

    // Der Akzent beobachtet den Horizont, und ändert sein Verhalten, je nach Position.
    this.target.addObserver(this.accent);

    this.colorSet = new ColorSet();
    this.colorSet.addObserver(this.background);
    this.colorSet.addObserver(this.accent);
    this.colorSet.addObserver(this.target);
    this.colorSet.animationTimer.addListener(this.background);
    this.colorSet.animationTimer.addListener(this.accent);
    this.colorSet.animationTimer.addListener(this.target);

    // Lets set up the Scene:
    this.scene = new SceneGraph();
    this.scene.push(this.background);
    this.scene.push(this.format); // draws nothing
    this.scene.push(this.accent);
    this.scene.push(this.target);
  }

  /**
   * Renders the artwork.
   *
   * @param {*} context 
   * @param {*} time 
   * @param {*} deltaTime 
   */
  render(context, time, deltaTime) {
    
    Artwork.transfer_tweakpane_parameter_to(this.parameter);
    ColorSet.transfer_tweakpane_parameter_to(this.parameter);

    this.parameter.artwork.animation.time = time;
    this.parameter.artwork.animation.deltaTime = deltaTime;
    this.parameter.artwork.animation.global_halt = this.animation_halt;

    // TODO Das funktioniert so nicht
    this.parameter.artwork.clearscreen = this.parameter.tweakpane.artwork_clearscreen;
    this.clearScreen(context, this.parameter.artwork.canvas.size.width, this.parameter.artwork.canvas.size.height, this.parameter.tweakpane.artwork_clearscreen);

    this.background.setBackgroundColor(this.parameter.tweakpane.background_color);
    // set a new Format and notify all Observers
    this.format.setFormat(this.parameter.tweakpane.format_type, this.parameter.tweakpane.format_aspect_ratio);
    this.format.useFencing(this.parameter.tweakpane.format_fencing);
    this.format.setPreserveAspectRatio(this.parameter.tweakpane.format_keep_aspect_ratio);

    this.colorSet.set_colorset_by_name(
      this.parameter.tweakpane.colorset_groupname,
      this.parameter.tweakpane.colorset_mode,
      this.parameter.tweakpane.colorset_variante,
      this.parameter.tweakpane.colorset_number);

    this.colorSet.animationTimer.check_timer(time, deltaTime, this.animation_halt, this.parameter.colorset);

    // TODO scale fürs gesamte Artwork wirkt sich an der Stelle auf alles aus... auch aufs Format...
    // das ist natürlich "falsch". Es soll sich nur auf die "Inhalte" beziehen...
    // context.scale(this.parameter.artwork.scale,this.parameter.artwork.scale); //  all future drawings will also be scaled

    // and draw it
    this.scene.draw(context, this.parameter);

  }

}

My_Artwork.ARTWORK_NAME = "Punktstunde";
My_Artwork.ARTWORK_VERSION = "0.4.0";
My_Artwork.OPEN_TWEAK_PANES = 1; // from below, the others are closed

/**
 * Provides a Tweakpane for this Module.
 * Adds the Modules Parameters to the Tweakpane Parameter-Object
 *
 * @param {String} folder_name_prefix 
 * @param {Object} pane 
 * @param {Object} parameter_tweakpane - Tweakpane Parameter-Object
 * @returns 
 */
My_Artwork.provide_tweakpane_to = function (folder_name_prefix = "", pane, parameter_tweakpane) {

  // Inject Tweakpane parameters
  parameter_tweakpane = Object.assign(parameter_tweakpane, {});

  // Inject Tweakpane and Tweakpane-Parameters
  let folder = Artwork.provide_tweakpane_to("0. ", pane, parameter_tweakpane);
  folder = Format.provide_tweakpane_to("1. ", pane, parameter_tweakpane);
  folder = ColorSet.provide_tweakpane_to("2. ", pane, parameter_tweakpane);
  folder = Background.provide_tweakpane_to("3. ", pane, null, false, parameter_tweakpane);
  folder = My_Accent.provide_tweakpane_to("4. ", pane, parameter_tweakpane);
  folder = My_Target.provide_tweakpane_to("5. ", pane, parameter_tweakpane);

  pane.addSeparator();
  Artwork.provide_nameVersion_for_tweakPane(pane, parameter_tweakpane, My_Artwork.ARTWORK_NAME, My_Artwork.ARTWORK_VERSION);

  return folder;
};


module.exports = My_Artwork;
