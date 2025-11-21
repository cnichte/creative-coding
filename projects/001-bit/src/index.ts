/**
 * Title    : Example Artwork No. 1 - Bit
 * Project  : Creative Coding
 * File     : projects/001-bit/index.js
 * Version  : 0.1.0
 * Published: -
 *
 * An simple Example Creative Coding Artwork using the cc-toolbox.
 * Demonstrates ColorSet, Background, and the Binding to Format and Tweakpane
 * Observer and Listener Pattern. 
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
  Size,
  Vector,
  Tweakpane_Items,
  Artwork_Animation,
  Artwork_Canvas,
  Artwork_Canvas_HTML,
  Artwork_ParameterSet,
  Debug,
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
  public scene: SceneGraph | null = null;
  public useSceneGraph = true;

  private animation_halt: boolean;

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

    Debug.enable("colorset.animation.timer");
    Debug.enable("animation.timer");

    if (tweakpane_items?.manager) {
      // ensure base parameter sets before UI wiring
      ColorSet.ensureParameterSet(parameter);
      Background.ensureParameterSet(parameter);

      ColorSet.registerTweakpane(parameter, tweakpane_items.manager, {
        container: tweakpane_items.pane,
        title: "Color Palette",
        expanded: false,
      });

      const backgroundFolder =
        tweakpane_items.folder ??
        tweakpane_items.pane.addFolder({
          title: "Background",
          expanded: false,
        });
      Background.registerTweakpane(parameter, {
        manager: tweakpane_items.manager,
        container: backgroundFolder,
        statePath: ["background"],
        label: "Background",
      });
    }

    // create my artwork objects
    this.background = new Background(parameter);

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
    const globalHalt =
      parameter?.artwork?.animation?.global_halt ?? this.animation_halt;
    const localTimer = parameter?.colorset?.animation?.timer;
    const shouldAnimate =
      (localTimer?.doAnimate ?? true) === true && globalHalt !== true;

    if (shouldAnimate) {
      this.colorSet.animationTimer.check_AnimationTimer(
        timeStamp,
        deltaTime,
        globalHalt,
        parameter.colorset
      );
    } else {
      this.colorSet.animationTimer.reset();
    }

    // pick color and inform Observers
    this.colorSet.check_ObserverSubject({
      groupname: parameter.colorset.groupname,
      mode: parameter.colorset.mode,
      variant: parameter.colorset.variant,
      number: parameter.colorset.number,
    });

    if (parameter?.debug?.colorset_logging) {
      console.log("[001-bit] colorset params", parameter.colorset);
    }

    // update, animate, draw
    this.scene?.tick(ctx, parameter, deltaTime);
  }
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
