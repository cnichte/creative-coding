/**
 * Title    : Example Artwork No. 1 - Pixel
 * Project  : Creative Coding
 * File     : projects/001-pixel/index.js
 * Version  : 0.1.0
 * Published: -
 *
 *
 * In the projects folder open the Terminal, and:
 *
 * Start Server: `yarn run start`
 * Build html:   `yarn run build`
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
import { Pane } from "tweakpane";

import "./css/artwork.css";
import "./css/tweakpane.css";

import {
  Artwork,
  Artwork_Meta,
  Background,
  ColorSet,
  Format,
  SceneGraph,
  Sketch,
  ObserverSubject,
  ParameterObject,
  Size,
  Vector,
  Tweakpane_Items,
  Artwork_Animation,
  Artwork_Canvas,
  Artwork_Canvas_HTML,
  Artwork_ParameterSet,
} from "@carstennichte/cc-toolbox";

/*
   Background,
   BackgroundShape,
 */

/**
 * Ein Sketch besteht aus:
 *
 * prepare() - Prepare the artwork before running the animation loop.
 * animate() - This is called by the SketchRunners ainmationLoop Method.
 *
 * TODO: Typescript nutzen und ein Interface draus machen.
 *
 * @class MySketch
 */
class MySketch implements Sketch {

  private ctx: any;

  private background: Background;
  private format: Format;
  private colorSet: ColorSet;

  private animation_halt: boolean;

  private scene: SceneGraph;

  /**
   * Creates an instance of Sketch.
   * @memberof MySketch
   */
  constructor() {

    this.ctx = null;

    this.background = null;
    this.format = null;
    this.colorSet = null;

    this.animation_halt = false;

    // Lets set up the Scene
    this.scene = null;
  } // constructor

  /**
   * Prepare the artwork before running the animation loop.
   *
   * @param {*} ctx
   * @param {Object} parameter
   * @param {Format} format
   * @param {Pane} tweakpane
   * @param {Tweakpane_Items} tweakpane_items
   * @memberof Sketch
   */
  prepare(
    ctx: any,
    parameter: any,
    format: Format,
    tweakpane: Pane,
    tweakpane_items: Tweakpane_Items
  ) {
    if (this.ctx == null) {
      // singleton-pattern
      this.ctx = ctx;
    }

    // tweakpane, null, false, parameter, ""
    ColorSet.tweakpaneSupport.provide_tweakpane_to(parameter, {
      items: tweakpane_items,
      folder_name_prefix: "",
      use_separator: true,
      parameterSetName: "",
      excludes: [],
      defaults: {},
    });

    // provide tweakpanes...
    Background.tweakpaneSupport.provide_tweakpane_to(parameter, {
      items: tweakpane_items,
      folder_name_prefix: "",
      use_separator: false,
      parameterSetName: "",
      excludes: [],
      defaults: {},
    });



    // create my artwork objects
    this.background = new Background(parameter);

    // inform Background about format changes
    format.addObserver(this.background);

    // use some colors
    this.colorSet = new ColorSet(parameter);
    this.colorSet.addObserver(this.background); // calls update
    this.colorSet.animationTimer.addListener(this.background); // calls animate_slow

    // lets set up the scene
    this.scene = new SceneGraph();
    this.scene.push(this.background);
  } // prepare

  /**
   * This is called by the SketchRunners ainmationLoop Method.
   *
   * @param {Object} ctx
   * @param {Object} parameter
   * @param {number} timeStamp
   * @param {number} deltaTime
   * @memberof MySketch
   */
  animate(ctx: any, parameter: any, timeStamp: number, deltaTime: number) {

    // console.log('time deltaTime', { time:timeStamp, delta:deltaTime} );

    // transfert all the tweakpane-parameters to the parameter-sets
    Background.tweakpaneSupport.transfer_tweakpane_parameter_to(parameter);
    ColorSet.tweakpaneSupport.transfer_tweakpane_parameter_to(parameter);

    // check the colorSets animation-timer.
    // calls all Listeners animate_slow Method when time is up.
    // TODO anbinden: this.animation_halt = parameter.artwork...
    this.colorSet.animationTimer.check_AnimationTimer(
      timeStamp,
      deltaTime,
      this.animation_halt,
      parameter.colorset
    );

    // pick color and inform Observers
    this.colorSet.check_ObserverSubject({
      groupname: parameter.tweakpane.colorset_groupname,
      mode: parameter.tweakpane.colorset_mode,
      variant: parameter.tweakpane.colorset_variante,
      number: parameter.tweakpane.colorset_number,
    });

    // update, animate, draw
    this.scene.draw(ctx, parameter);
  } // animate
} // class MySketch

/* when all site content is loaded */
window.onload = function () {
  const artwork_meta: Artwork_Meta = {
    title: "001 Bit",
    description: "Bit is the Base of this CC Project",
    author: "Carsten Nichte",
    version: "1.0.0",
    year: "2022",
  };

  // The HTML related Paramters, to identify and position 
  // the html canvas element
  const artwork_canvas_html:Artwork_Canvas_HTML = {
    id: "theCanvas",
    parent_container_id: "theCanvasContainer",
    parent_container_class: "canvas_parent_css_class",
    tweakpane_container_id: "theTweakpaneContainer",
  }

  const artwork_canvas: Artwork_Canvas = {
    html: artwork_canvas_html,
    size: new Size(1000,1000),
    center: new Vector(500,500),
    clearscreen: true,
    mouse: new Vector(0, 0),
  }

  // TODO Das hat noch keine funktion
  const artwork_animation: Artwork_Animation = {
    global_halt: false,
    duration: 60,
    lastTime: 0,
    intervall: 0,
    timeStamp: 0,
    deltaTime: 0
  }

  const parameter:Artwork_ParameterSet = {
    artwork: {
      meta: artwork_meta,
      canvas: artwork_canvas,
      scale: 1.0,
      animation: artwork_animation
    }
  }

  const artwork = new Artwork(window, document, parameter);
  artwork.run(new MySketch());
}; /* document.onload */
