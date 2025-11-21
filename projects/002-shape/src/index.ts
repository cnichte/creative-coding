/**
 * Title    : Example Artwork No. 2 - Shapes
 * Project  : Creative Coding
 * File     : projects/002-shapes/index.js
 * Version  : 0.1.0
 * Published: -
 *
 * Erweiterung von 001-bit um ein Shape.
 * Dieses Shape gehört zum Background und wir in allen folgenden Artworks genutzt.
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
  BackgroundShape,
  ColorSet,
  Format,
  SceneGraph,
  Sketch,
  Size,
  Vector,
  Tweakpane_Items,
  Artwork_Canvas_HTML,
  Artwork_Animation,
  Artwork_Canvas,
  Artwork_ParameterSet,
} from "@carstennichte/cc-toolbox";

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

  private background: BackgroundShape | null;
  private format: Format | null;
  private colorSet: ColorSet | null;

  private animation_halt: boolean;
  public scene: SceneGraph | null;
  public useSceneGraph = true;

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

    if (tweakpane_items?.manager) {
      ColorSet.registerTweakpane(parameter, tweakpane_items.manager, {
        container: tweakpane_items.pane,
        title: "Color Palette",
      });

      const folder =
        tweakpane_items.folder ??
        tweakpane_items.pane.addFolder({
          title: "Background Shape",
          expanded: false,
        });

      BackgroundShape.registerTweakpane(parameter, {
        manager: tweakpane_items.manager,
        container: folder,
      });
    }

    // create my artwork objects
    this.background = new BackgroundShape(parameter);

    // use some colors
    this.colorSet = new ColorSet(parameter);

    // lets set up the scene
    this.scene = new SceneGraph();
    this.scene.push(this.background);
  } // prepare

  tickScene(ctx: any, parameter: any, timeStamp: number, deltaTime: number) {

    // console.log('time deltaTime', { time:timeStamp, delta:deltaTime} );

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
        groupname: parameter.colorset.groupname,
        mode: parameter.colorset.mode,
        variant: parameter.colorset.variant,
        number: parameter.colorset.number,
      });

    // update, animate, draw
    this.scene?.tick(ctx, parameter, deltaTime);
  }
} // class MySketch

/* when all site content is loaded */
window.onload = function () {

  //* Aufbau des Parameter Objektes.
  // TODO Ein dezentes Problem ist, das auch interne Werte mit angegeben werden müssen.
  //? Theoretisch hab für die Trennung das state objekt ???
  //? Ich könnte auch ein erweitertes internals Objekt machen... ???
  
  const artwork_meta: Artwork_Meta = {
    title: "002 Shape",
    description: "Basic shape, centered on the canvas.",
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
    size: new Size(2000,2000),
    center: new Vector(1000,1000),
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
      scale: 0.7,
      animation: artwork_animation
    }
  }

  const artwork = new Artwork(window, document, parameter);
  artwork.run(new MySketch());
}; /* document.onload */
