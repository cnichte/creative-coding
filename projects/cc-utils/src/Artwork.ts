/**
 * Title    : Artwork
 * Project  : Creative Coding
 * File     : projects/cc-utils/Artwork.js
 * Version  : 1.0.0
 * Published: https://gitlab.com/glimpse-of-life
 *
 * Supports:
 * - ParameterSet   : yes
 * - Tweakpane      : yes
 * is:
 * - Observer       : yes
 * - ObserverSubject: yes
 * - prefixable:    : no
 * 
 ** Bundles everything that makes up my artwork.
 * It is basically a wrapper around the <canvas /> element,
 * that runs a sketch.
 *
 * Supports: Tweakpane
 *
 ** class Artwork
 ** class SketchRunner
 *
 ** Licence
 * Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
 * https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode
 * https://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1
 *
 ** Licence in short terms:
 * Do not sell the code, or creative stuff made with this code.
 * You are allowed to make someone happy, and give away the works you have created with it for free.
 * Learn, code, create, and have fun.
 *
 * @author Carsten Nichte - 2022
 */

import { Pane } from "tweakpane";
// import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
// import { SceneGraph } from "./SceneGraph";

import { Size } from "./Size";
import {
  Format,
  type CheckObserverSubject_Format_Parameter,
  type Format_ParameterSet,
} from "./Format";
import { Vector } from "./Vector";
import type { Observer, ObserverSubject } from "./ObserverPattern";
import {
  TweakpaneSupport,
  type Provide_Tweakpane_To_Props, type TweakpaneSupport_Props
} from "./TweakpaneSupport";

/**
 * This is the blueprint for a sketch.
 *
 * @export
 * @interface Sketch
 */
export interface Sketch {
  prepare(
    ctx: any,
    parameter: any,
    format: Format,
    tweakpane: Pane,
    tweakpane_folder_artwork: any
  ): void;
  animate(ctx: any, parameter: any, timeStamp: number, deltaTime: number): void;
}

/**
 * Der ParamterSet Anteil für den Canvas.
 *
 * @export
 * @interface ArtworkCanvas
 */
export interface Artwork_Canvas {
  id: string;
  size: Size;
  center: Vector;
  clearscreen: boolean;
  mouse: Vector;
}

export interface Artwork_Animation {
  global_halt: boolean; // animation_halt
  lastTime: number;
  intervall:number; /* 60 Frames per Second - ca. 60.6ms */

  timeStamp: number;
  deltaTime: number;
}

/**
 * Der ParamterSet Anteil für die Metadaten.
 *
 * @export
 * @interface Artwork_Meta
 */
export interface Artwork_Meta {
  title: string;
  description: string;
  author: string;
  version: string;
  year: string;
}

interface HTML_Content_Props {
  canvas_id: string;
  parent_container_id: string;
  parent_container_class: string;
  tweakpane_container_id:string;
  artwork_meta: any;
}

/**
 * Das ParamterSet für das Modul.
 *
 * @export
 * @interface Artwork_ParameterSet
 */
export interface Artwork_ParameterSet {
  meta: Artwork_Meta;

  scale: number;
  animation: Artwork_Animation,
  canvas: Artwork_Canvas;
}

export interface Artwork_ParameterTweakpane {
  artwork_canvas_width: number;
  artwork_canvas_height: number;
  artwork_clearscreen: boolean;
  artwork_scale: number;
}

export class Artwork {
  // implements TweakpaneSupport_Interface
  private window: any;
  private document: any;
  private parameter: any;

  private format: Format;

  private tweakpane: Pane;
  private tweakpane_folder_artwork: any;

  private theCanvas: any;
  private ctx: any;

  private sketchRunner: SketchRunner;

  /**
   * Bundles everything that makes up my artwork.
   *
   * @param {Object} window
   * @param {Object} document
   * @param {Object} parameter
   *
   * @param {Object} onKeyUp_Callback - userdefined callback Method
   * @param {number} openOptionPanes - number of OptionPanes to keep open (default=0)
   * @memberof Artwork
   */
  constructor(
    window: any,
    document: any,
    parameter: any,
    onKeyUp_Callback: any = null
  ) {
    this.window = window;
    this.document = document;
    this.parameter = parameter;

    // We build up the Parameter-Objekt, and add to it ...
    let artwork_canvas_default: Artwork_Canvas = {
      id: "theCanvas",
      size: new Size(800, 800),
      center: new Vector(400, 400),
      clearscreen: false,
      mouse: new Vector(0, 0),
    };

    let artwork_meta_default: Artwork_Meta = {
      title: "Artwork",
      description: "Description",
      author: "Carsten Nichte",
      version: "0.0.1",
      year: "2023",
    };

    let artwork_default: Artwork_ParameterSet = {
      meta: artwork_meta_default,
      scale: 1,
      canvas: artwork_canvas_default,
      animation: {
        global_halt: false,
        lastTime: 0,
        intervall: 0,
        timeStamp: 0,
        deltaTime: 0
      }
    };

    if (!("artwork" in parameter)) {
      Object.assign(parameter, artwork_default);
    }

    if (!("tweakpane" in parameter)) {
      Object.assign(parameter, { tweakpane: {} });
    }

    //* HTML Content, im wesentlichen das <canvas> Element.

    const parent_container_id = parameter.artwork.canvas.parent_container_id.trim();
    const tweakpane_container_id = parameter.artwork.canvas.tweakpane_container_id.trim();

    // TODO Try to find the canvas element with ID...
    this.theCanvas = this.document.getElementById(
      this.parameter.artwork.canvas.id
    );
    
    if(this.theCanvas==null) {
      // append one in body, or in the element with id
      const html_props:HTML_Content_Props={
        canvas_id: this.parameter.artwork.canvas.id,
        parent_container_id: parent_container_id,
        parent_container_class: parameter.artwork.canvas.parent_container_class,
        tweakpane_container_id: tweakpane_container_id,
        artwork_meta: this.parameter.artwork.meta,
      }

      this.document.body.appendChild(
        Artwork.getHTMLContent(html_props)
      );

      this.theCanvas = this.document.getElementById(
        this.parameter.artwork.canvas.id
      );
    }

    //* The Tweakpane
    const pc = document.getElementById(parent_container_id);
    console.log(`#### found canvas Parent-Container ${parent_container_id}?`, pc);
    
    const tpc = document.getElementById(tweakpane_container_id);
    console.log(`#### found canvas Tweakpane-Container ${tweakpane_container_id}?`, tpc);

    if(tweakpane_container_id.length >0 && tpc){
      console.log(`put tweakpane in id ${tweakpane_container_id}`);
      this.tweakpane = new Pane({
        title: `Artwork '${parameter.artwork.meta.title}'`,
        expanded: false,
        container: document.getElementById(tweakpane_container_id),
      });
    }else{
      if(parent_container_id.length >0 && pc){
        console.log(`put tweakpane in id ${parent_container_id}`);
        this.tweakpane = new Pane({
          title: `Artwork '${parameter.artwork.meta.title}'`,
          expanded: false,
          container: document.getElementById(parent_container_id),
        });
      }else{
        console.log(`put tweakpane in body`);
        this.tweakpane = new Pane({
          title: `Artwork '${parameter.artwork.meta.title}'`,
          expanded: false
        });
      }
    }

    this.tweakpane_folder_artwork = null;

    // this.tweakpane.registerPlugin(EssentialsPlugin); // TODO: registerPlugin

    Artwork.provide_meta_to_tweakpane(
      this.tweakpane,
      this.parameter.artwork.meta
    );

    //* init Parameter-Object...
    // setup gui, and bring the modules parameters into settings.tweakpane.
    this.tweakpane_folder_artwork =
      Artwork.tweakpaneSupport.provide_tweakpane_to(this.parameter, {
        pane: this.tweakpane,
        folder: null,
        folder_name_prefix: "",
        use_separator: false,
        parameterSetName: "",
        excludes: [],
        defaults: {},
      }); // Artwork.OPEN_TWEAK_PANES

    this.format = new Format(this.parameter);

    this.ctx = this.theCanvas.getContext("2d");

    // <canvas/ id="theCanvas"> should have the desired size
    this.theCanvas.width = this.parameter.artwork.canvas.size.width;
    this.theCanvas.height = this.parameter.artwork.canvas.size.height;

    this.document.addEventListener("keyup", onKeyUp_Callback); // additional userdefined callback
    this.document.addEventListener("keyup", this.onKeyUp_Callback.bind(this)); // default callback

    // TODO start / stap animation on click.
    /*
    // https://bencentra.com/code/2014/12/05/html5-canvas-touch-events.html
    this.theCanvas.addEventListener("click", () => {
      // this.sketchManager.play();
      console.log("Artwork.onKeyUp_Callback() -> render start/stop ");
    });
    */

    this.sketchRunner = new SketchRunner(
      this.ctx,
      this.parameter,
      this.theCanvas,
      this.tweakpane,
      this.format
    );

    // https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback
    this.window.addEventListener(
      "resize",
      this.onBrowserWindowResize.bind(this)
    );

    // TODO: use doFetchMouseMove.
    // this is for documentation, how it can also be done...
    var self = this; // Alternative zu .bind(this)
    this.window.addEventListener("mousemove", function (e: { x: any; y: any }) {
      // console.log(e);
      self.parameter.artwork.canvas.mouse.x = e.x;
      self.parameter.artwork.canvas.mouse.y = e.y;
    });
  } // constructor

  /**
   * Uses the SketchRunner to perform the animation.
   *
   * @memberof Artwork
   */
  public run(sketch: Sketch) {
    sketch.prepare(
      this.ctx,
      this.parameter,
      this.format,
      this.tweakpane,
      this.tweakpane_folder_artwork
    );
    this.sketchRunner.sketch = sketch;
    this.sketchRunner.animationLoop(0); // starts the endless loop
  } // run

  /**
   * untested
   *
   * @memberof Artwork
   */
  public cancel() {
    this.window.cancelAnimationFrame(this.sketchRunner.animationFrame);
  } // cancel

  /**
   * untested
   *
   * @memberof Artwork
   */
  public continue() {
    this.sketchRunner.animationLoop(this.sketchRunner.animationFrame);
  } // continue

  /**
   * This callback function is called, when the Mouse was moved in canvas.
   * Sets Parameter-Set: parameter.artwork.canvas.mouse.x and y
   * @memberof Artwork
   */
  private doFetchMouseMove(e: { x: number; y: number }) {
    this.parameter.artwork.canvas.mouse.x = e.x;
    this.parameter.artwork.canvas.mouse.y = e.y;
  } // doFetchMouseMove

  /**
   * This callback function is called, when the Browser window was resized.
   * TODO: Resize Canvas-Viewport dependend of window size
   * https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
   * https://www.quora.com/How-do-I-get-the-canvas-to-scale-with-div-in-HTML-and-Javascript
   *
   * https://stackoverflow.com/questions/10214873/make-canvas-as-wide-and-as-high-as-parent
   * @memberof Artwork
   *
   */
  private onBrowserWindowResize() {
    // console.log("resize - cancel", this.sketch.animationFrame);
    // this.window.cancelAnimationFrame(this.sketchRunner.animationFrame);

    // Die festgelegte Größe soll abhängig vom Fenster skalieren
    // Aber nur wenn Fenster < als canvas.

    if (this.theCanvas.width > this.window.innerWidth) {
      // this.theCanvas.width = this.window.innerWidth - 10;
      // this.theCanvas.style.width = this.window.innerWidth;
      this.theCanvas.style.width = "100%";
    } else {
      this.theCanvas.style.width = this.parameter.artwork.canvas.size.width;
    }

    if (this.theCanvas.style.height > this.window.innerHeight) {
      // this.theCanvas.height = this.window.innerHeight - 10;
      // this.theCanvas.style.height = this.window.innerHeight;
      this.theCanvas.style.height = "100%";
    } else {
      this.theCanvas.style.height = this.parameter.artwork.canvas.size.height;
    }
  } // onBrowserWindowResize

  /**
   * Ein Mausklick in den Canvas mit der linken Maustaste
   * soll den Sketch anhalten, oder weiter rendern lassen.
   *
   * @memberof Artwork
   */
  private onKeyUp_Callback() {
    this.parameter.artwork.animation.global_halt =
      !this.parameter.artwork.animation.global_halt;
    if (this.parameter.artwork.animation.global_halt) {
      this.cancel();
    } else {
      this.continue();
    }
  } // onKeyUp_Callback

  //* --------------------------------------------------------------------
  //* Tweakpane Artwork Meta
  //* --------------------------------------------------------------------

  /**
   *
   * @private
   * @static
   * @param {Pane} tweakpane
   * @param {Object} parameter_tweakpane
   * @param {Object} artwork_meta
   * @return folder
   * @memberof Artwork
   */
  private static provide_meta_to_tweakpane = function (
    tweakpane: any,
    artwork_meta: Artwork_Meta
  ): any {
    let folder = tweakpane.addFolder({
      title: "Meta",
      expanded: false,
    });

    folder.addBinding(artwork_meta, "title", {
      label: "Titel",
      readonly: true,
    });
    folder.addBinding(artwork_meta, "description", {
      label: "Beschreibung",
      readonly: true,
      multiline: true,
      rows: 3,
      wrap: "soft",
    });
    folder.addBinding(artwork_meta, "author", {
      label: "Autor",
      readonly: true,
    });
    folder.addBlade({ view: "separator" });
    folder.addBinding(artwork_meta, "year", { label: "Jahr", readonly: true });
    folder.addBinding(artwork_meta, "version", {
      label: "Version",
      readonly: true,
    });

    return folder;
  }; // provide_meta_to_tweakpane

  //* --------------------------------------------------------------------
  //* HTML-Content for the Website
  //* --------------------------------------------------------------------

  /**
   * Liefert den Content der HTML Seite.
   * das ist im wesentlichen das <canvas id="theCanvas" /> Element.
   *
   * @return {*} div Element with <canvas id="theCanvas" />
   * @memberof Artwork
   */
  private static getHTMLContent(props:HTML_Content_Props): any {

    const elm_wrapper = document.createElement("div");
    elm_wrapper.classList.add(props.parent_container_class); // CSS Style: class="canvasWrap" Attribute
    if(props.parent_container_id.length >0){
      elm_wrapper.setAttribute("id", props.parent_container_id); 
    }

    const elm_tweakpane = document.createElement("div");
    if(props.tweakpane_container_id.length >0){
      elm_tweakpane.setAttribute("id", props.tweakpane_container_id); 
    }

    const elm_canvas = document.createElement("canvas"); // theCanvas Element
    elm_canvas.setAttribute("id", props.canvas_id); //  id Attribute

    elm_wrapper.appendChild(elm_tweakpane);
    elm_wrapper.appendChild(elm_canvas);

    return elm_wrapper;
  } // getHTMLContent

  //* --------------------------------------------------------------------
  //*
  //* Parameter-Set Object + Tweakpane
  //*
  //* --------------------------------------------------------------------

  /**
   * TweakpaneSupport has three Methods:
   *
   * - inject_parameterset_to
   * - transfer_tweakpane_parameter_to
   * - provide_tweakpane_to
   *
   * @static
   * @type {TweakpaneSupport}
   * @memberof Artwork
   */
  public static tweakpaneSupport: TweakpaneSupport = {
    /**
     ** --------------------------------------------------------------------
     ** Inject
     ** --------------------------------------------------------------------
     * @param parameter
     * @param parameterSetName
     */
    inject_parameterset_to: function (
      parameter: any,
      props: TweakpaneSupport_Props
    ): void {

      // Das Artwork ParameterSet zusammen bauen
      // Anteil: artwork.canvas
      let _artwork_canvas_ps: Artwork_Canvas = {
        id: "theCanvas",
        size: new Size(
          parameter.tweakpane.artwork_canvas_width,
          parameter.tweakpane.artwork_canvas_height
        ),
        clearscreen: parameter.tweakpane.artwork_clearscreen,
        mouse: new Vector(0, 0),
        center: new Vector(
          parameter.tweakpane.artwork_canvas_width * 0.5,
          parameter.tweakpane.artwork_canvas_height * 0.5
        ),
      };

      // artwork
      let artwork_ps: Artwork_ParameterSet = {
        meta: {
          title: "Artwork",
          description: "My Artwork",
          author: "Carsten Nichte",
          version: "1.0.0",
          year: "2023",
        },
        scale: 1.0,
        canvas: _artwork_canvas_ps,
        animation: {
          global_halt: false,
          lastTime: 0,
          intervall: 0,
          timeStamp: 0,
          deltaTime: 0
        }
      };

      Object.assign(parameter, {
        artwork: artwork_ps,
      });
    }, // inject_parameterset_to
    /**
     ** --------------------------------------------------------------------
     ** Transfert
     ** --------------------------------------------------------------------
     * @param parameter
     * @param parameterSetName
     */
    transfer_tweakpane_parameter_to: function (
      parameter: any,
      props: TweakpaneSupport_Props
    ): void {
      let pt: Artwork_ParameterTweakpane = parameter.tweakpane;

      // Clear Screen
      parameter.artwork.canvas.clearscreen = pt.artwork_clearscreen;

      parameter.artwork.canvas.size = new Size(
        pt.artwork_canvas_width,
        pt.artwork_canvas_height
      );
      parameter.artwork.scale = pt.artwork_scale;
    }, // transfer_tweakpane_parameter_to
    /**
     ** --------------------------------------------------------------------
     ** Tweakpane
     ** --------------------------------------------------------------------
     *
     * @abstract
     * @param {*} parameter - The parameter object
     * @param {Provide_Tweakpane_To_Props} props
     * @return {*}  {*}
     * @memberof TweakpaneSupport
     */
    provide_tweakpane_to: function (
      parameter: any,
      props: Provide_Tweakpane_To_Props
    ) {
      let parameterTP: Artwork_ParameterTweakpane = {
        artwork_canvas_width: 500,
        artwork_canvas_height: 500,
        artwork_clearscreen: true,
        artwork_scale: 1.0,
      };

      parameter.tweakpane = Object.assign(parameter.tweakpane, parameterTP);

      Artwork.tweakpaneSupport.inject_parameterset_to(parameter);

      // TODO ist das Format hier richtig?
      Format.tweakpaneSupport.provide_tweakpane_to(parameter, {
        pane: props.pane,
        folder: props.folder,
        folder_name_prefix: "",
        use_separator: false,
        parameterSetName: "",
        excludes: [],
        defaults: {},
      });

      props.folder = props.pane.addFolder({
        title: props.folder_name_prefix + "Canvas",
        expanded: true,
      });

      props.folder.addBlade({
        view: "separator",
      });

      props.folder
        .addBinding(parameter.tweakpane, "artwork_canvas_width", {
          label: "Width",
          with: 800,
        })
        .on("change", (ev: any) => {
          console.log(ev.value.toFixed(2));
          if (ev.last) {
            console.log("(last)");
          }
        });

      props.folder
        .addBinding(parameter.tweakpane, "artwork_canvas_height", {
          label: "Height",
          height: 400,
        })
        .on("change", (ev: any) => {
          console.log(ev.value.toFixed(2));
          if (ev.last) {
            console.log("(last)");
          }
        });

      props.folder.addBlade({
        view: "separator",
      });

      props.folder.addBinding(parameter.tweakpane, "artwork_scale", {
        label: "Scale",
        min: 0.2,
        max: 2.0,
        step: 0.0001,
      });

      props.folder.addBinding(parameter.tweakpane, "artwork_clearscreen", {
        label: "ClearScreen",
      });

      return props.folder;
    }, // provide_tweakpane_to
  };
} // class Artwork

//* --------------------------------------------------------------------
//*
//* SketchRunner
//*
//* --------------------------------------------------------------------

/**
 ** Der SketchRunner hat im Grunde nur eine Methode:
 *
 * - animateLoop()
 *
 * und ruft periodisch die animate() Methode des Sketches auf.
 *
 * Der SketchRunner hört aber auch auf Veränderungen am Format, und besitzt
 * deshalb eine update Methode:
 *
 * - update()
 *
 * Der SketchRunner ist eine private Klasse von Artwork.
 *
 * @class SketchRunner
 */
class SketchRunner implements Observer {
  private ctx: CanvasRenderingContext2D;
  private parameter: any;
  private theCanvas: any;
  private tweakpane: Pane;
  private format: Format;

  public animationFrame: number;
  private lastTime: number;
  private intervall: number;
  private timer: number;

  public sketch: Sketch | null;

  /**
   * Creates an instance of SketchRunner.
   * @param {CanvasRenderingContext2D} ctx
   * @param {*} parameter
   * @param {*} theCanvas
   * @param {Pane} tweakpane
   * @param {Format} format
   * @memberof SketchRunner
   */
  constructor(
    ctx: CanvasRenderingContext2D,
    parameter: any,
    theCanvas: any,
    tweakpane: Pane,
    format: Format
  ) {
    this.ctx = ctx;
    this.parameter = parameter;
    this.theCanvas = theCanvas;
    this.tweakpane = tweakpane;
    this.format = format;

    this.format.addObserver(this);

    this.animationFrame = 0;

    /* Die Animation soll auf unterschiedlich schnellen Rechnern 
       gleich schnell ablaufen */
    this.lastTime = 0;
    this.intervall = 1000 / 60; /* 60 Frames per Second - ca. 60.6ms */
    this.timer = 0;

    this.sketch = null;
  } // constructor

  /**
   * Is called from the ObserverSubject.
   * Sketch-Runner listenes to Format-Changes.
   *
   * state ist in source enthalten.
   * ich identifiziere damit die quelle.
   * if ("colorset" in source.state) würde auch gehen.
   *
   * @param {Object} source
   * @param {Object} state
   * @memberof SketchRunner
   */
  update(source: ObserverSubject, state_new: any, state_old: any) {
    if (source instanceof Format) {
      console.log("Artwork SketchRunner -> Format geändert...");
      console.log("Artwork SketchRunner.update(state_old)", state_old);
      console.log("Artwork SketchRunner.update(state_new,)", state_new);

      // update Parameter-Object
      this.parameter.artwork.canvas.size = state_new.size;
      this.parameter.artwork.canvas.center = state_new.center;

      this.parameter.artwork.canvas.width = state_new.size.width;
      this.parameter.artwork.canvas.height = state_new.size.height;

      // Das format hat sich geändert, und damit auch zize
      this.theCanvas.width = state_new.size.width;
      this.theCanvas.height = state_new.size.height;

      // Tweakpane Inputs aktualisieren.
      this.parameter.tweakpane.artwork_canvas_width = state_new.size.width;
      this.parameter.tweakpane.artwork_canvas_height = state_new.size.height;
      this.tweakpane.refresh();
    }
  } // update

  /**
   * timeStamp wird erzeugt, wenn eine funktion (hier 'animationLoop')
   * von requestAnimationFrame aufgerufen wird.
   * requestAnimationFrame fügt diesen Zeitstempel als Parameter in die Animate-Funktion ein.
   * erst die zweite Schleife wird durch requestAnimationFrame ausgelöst
   *
   * @param {*} timeStamp
   * @memberof SketchRunner
   */
  public animationLoop(timeStamp: number) {
    // Transport tweakpane to parameter-object
    Artwork.tweakpaneSupport.transfer_tweakpane_parameter_to(this.parameter);
    Format.tweakpaneSupport.transfer_tweakpane_parameter_to(this.parameter);

    // TODO das gehört in eine Format.transfer_tweakpane_parameter_to Methode?
    // if changed, recalculate and inform oberservers

    // 1. Das format hat sich geändert -> canvas.size anpassen
    let params: CheckObserverSubject_Format_Parameter = {
      pageOrientation: this.parameter.tweakpane.format_page_orientation,
      aspectRatio: this.parameter.tweakpane.format_aspect_ratio,
      canvas_size: this.parameter.artwork.canvas.size,
      fencing: this.parameter.tweakpane.format_fencing,
      keep_aspect_ratio: this.parameter.tweakpane.format_keep_aspect_ratio,
    };

    this.format.check_ObserverSubject(params);
    /*
    // 2. Size.width hat sich geändert -> size.height aus format neu berechnen
    if (
      this.parameter.tweakpane.artwork_canvas_width !==
      this.parameter.artwork.canvas.width
    ) {
      this.parameter.artwork.canvas.height =
        this.parameter.tweakpane.artwork_canvas_height *
        this.parameter.format.fak;
      this.theCanvas.height = this.parameter.artwork.canvas.height;
    } else if (
      // 3. oder Size.height hat sich geändert -> size.width aus format neu berechnen
      this.parameter.tweakpane.artwork_canvas_height !==
      this.parameter.artwork.canvas.height
    ) {
      this.parameter.artwork.canvas.width =
        this.parameter.tweakpane.artwork_canvas_width *
        this.parameter.format.fak;
      this.theCanvas.width = this.parameter.artwork.canvas.width;
    }
*/

    let deltaTime = timeStamp - this.lastTime; // milliseconds
    // Move forward in time with a maximum amount
    // https://spicyyoghurt.com/tutorials/html5-javascript-game-development/create-a-smooth-canvas-animation
    deltaTime = Math.min(deltaTime, 0.1);
    this.lastTime = timeStamp;
    // const fps = Math.round(1000/deltaTime);
    // console.log(`fps: ${fps}`)

    if (this.parameter.artwork.canvas.clearscreen) {
      /* clear Canvas */
      this.ctx.clearRect(
        0,
        0,
        this.parameter.artwork.canvas.size.width,
        this.parameter.artwork.canvas.size.width
      );
    }

    this.parameter.artwork.animation.lastTime = this.lastTime;
    this.parameter.artwork.animation.intervall = this.intervall;
    this.parameter.artwork.animation.timeStamp = timeStamp * 0.001;
    this.parameter.artwork.animation.deltaTime = deltaTime * 0.001;

    if (this.sketch != null && "animate" in this.sketch) {
      // timeStamp und deltaTime werden von Millisekunden in Sekunden umgerechnet.
      // bevor sie übergeben werden.
      this.sketch.animate(
        this.ctx,
        this.parameter,
        timeStamp * 0.001,
        deltaTime * 0.001
      );
    } else {
      console.log(
        "Das ist kein Sketch! Dein Sketch muss das Interface 'Sketch' implementieren!"
      );
    }

    if (this.timer > this.intervall) {
      this.timer = 0;
    } else {
      this.timer += deltaTime;
    }

    // requestAnimationFrame adjusts itself to Screen-Freshrate.
    this.animationFrame = requestAnimationFrame(
      this.animationLoop.bind(this)
    ); /* Endless loop */

    // console.log("animate", this.animationFrame);
  } // animationLoop
} // class SketchRunner
