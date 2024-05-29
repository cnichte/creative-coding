/**
 * Title    : Artwork No. 5 - Punktstunde
 * Project  : Creative Coding
 * File     : projects/004-entities/index.js
 * Version  : 0.1.0
 * Published: https://carsten-nichte.de/art/portfolio/entities/
 * 
 * made with 
 * https://github.com/mattdesl/canvas-sketch
 * https://github.com/mattdesl/canvas-sketch-util
 * 
 * Cell-Patterns -> zB. Linie im Grid zeichnen oder einen Buchstaben...
 * also etwas mit dem Grid darstellen.
 * 
 ** In the projects folder open the Terminal, and:
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
  Artwork_Animation, 
  Artwork_Canvas, 
  Artwork_Canvas_HTML, 
  Artwork_ParameterSet,
  BackgroundShape,
  ColorSet,
  Format,
  SceneGraph,
  Sketch,
  Size,
  Vector,
  Tweakpane_Items,
} from "@carstennichte/cc-toolbox";
import { My_Accent } from "./my-accent";

interface RandomizedColors {
  canvasColor: string;

  backgroundFillColor: string;
  backgroundBorderColor: string;

  gridFillColor: string;
  gridBorderColor: string;

  cellFillColor: string;
  cellBorderColor: string;

  cellContentFillColor: string;
  cellContentBorderColor: string;

  accentFillColor: string;
  accentBorderColor: string;
}

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

  private background: BackgroundShape|null;
  private format: Format|null;
  private colorSet: ColorSet|null;

  private animation_halt: boolean;

  private scene: SceneGraph|null;

  private parameter: any = {};
  
  private my_accent:My_Accent|null;

  private randomized: RandomizedColors = {
    canvasColor: "#ffffffff",

    backgroundFillColor: '#ffffffff',
    backgroundBorderColor: '#efefefff',

    gridFillColor: '#ffffffff',
    gridBorderColor: '#2a27ebff',

    cellFillColor: '#ffffffff',
    cellBorderColor: '#000000ff',

    cellContentFillColor: '#ffffffff',
    cellContentBorderColor: '#000000ff',

    accentFillColor: '#ffffffff',
    accentBorderColor: '#ac1325ff'
  }

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

    this.my_accent = null;
    // this.parameter = Object.assign(this.parameter, parameter);

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

    // this.parameter = Object.assign(this.parameter, parameter); // ?? nötig? vgl. 002-shape

    ColorSet.tweakpaneSupport.provide_tweakpane_to(parameter, {
      items: tweakpane_items,
      folder_name_prefix: "",
      use_separator: false,
      parameterSetName: "",
      excludes: [],
      defaults: {},
    });

    // Inject ParameterSets and init with Tweakpane-Parameters
    BackgroundShape.tweakpaneSupport.provide_tweakpane_to(parameter, {
      items: tweakpane_items,
      folder_name_prefix: "Background ",
      use_separator: false,
      parameterSetName: "",
      excludes: [],
      defaults: {},
    });

    My_Accent.tweakpaneSupport.provide_tweakpane_to(parameter,{
      items: {
        pane: tweakpane_items.pane,
        folder: null,
        tab: null
      },
      folder_name_prefix: "Accent ",
      use_separator: false,
      parameterSetName: "accent"
    });

    // TODO My_Target + My_Accent

    // create my Artwork-Objects
    this.background = new BackgroundShape(parameter);
    
    this.my_accent = new My_Accent(parameter);

    // Background listens to Format changes
    format.addObserver(this.background);
    format.addObserver(this.my_accent);

    // Quadrat listens to ColorSet changes
    this.colorSet = new ColorSet(parameter);
    this.colorSet.addObserver(this.background);
    this.colorSet.addObserver(this.my_accent);
    this.colorSet.animationTimer.addListener(this.background);
    this.colorSet.animationTimer.addListener(this.my_accent);

    // Lets set up the Scene
    this.scene = new SceneGraph();
    this.scene.push(this.background);
    this.scene.push(this.my_accent);
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
    BackgroundShape.tweakpaneSupport.transfer_tweakpane_parameter_to(parameter);
    ColorSet.tweakpaneSupport.transfer_tweakpane_parameter_to(parameter);

    My_Accent.tweakpaneSupport.transfer_tweakpane_parameter_to(parameter);

    // check the colorSets animation-timer.
    // calls all Listeners animate_slow Method when time is up.
    // TODO anbinden: this.animation_halt = parameter.artwork...
    if (this.colorSet != null)
      this.colorSet.animationTimer.check_AnimationTimer(
        timeStamp,
        deltaTime,
        this.animation_halt,
        parameter.colorset
      );

    // pick color and inform Observers
    if (this.colorSet != null)
      this.colorSet.check_ObserverSubject({
        groupname: parameter.tweakpane.colorset_groupname,
        mode: parameter.tweakpane.colorset_mode,
        variant: parameter.tweakpane.colorset_variante,
        number: parameter.tweakpane.colorset_number,
      });

    // update, animate, draw
    if (this.scene != null) this.scene.draw(ctx, parameter);
  } // animate
} // class MySketch

/* when all site content is loaded */
window.onload = function () {

  const artwork_meta: Artwork_Meta = {
    title: "005 Punktstunde",
    description: "Basic Animations",
    author: "Carsten Nichte",
    version: "0.9.0",
    year: "2022",
  };

  const artwork_canvas_html:Artwork_Canvas_HTML = {
    id: "theCanvas",
    parent_container_id: "theCanvasContainer",
    parent_container_class: "canvas_parent_css_class",
    tweakpane_container_id: "theTweakpaneContainer",
  }

  const artwork_canvas: Artwork_Canvas = {
    html: artwork_canvas_html,
    size: new Size(800,800),
    center: new Vector(400,400),
    clearscreen: false,
    mouse: new Vector(0, 0),
  }

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

  // TODO: Ich würde hier auch gern ein Format und ne Größe übergeben wollen.

  const artwork = new Artwork(window, document, parameter);
  artwork.run(new MySketch());
}; /* document.onload */
