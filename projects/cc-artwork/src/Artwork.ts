/**
 * Title    : Artwork
 * Project  : Creative Coding
 * File     : projects/cc-utils/Artwork.js
 * Version  : 1.0.0
 * Published: https://gitlab.com/glimpse-of-life
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
import { Format, type Format_ParameterSet } from "./Format";
import { Vector } from "./Vector";
import type { Observer, ObserverSubject } from "./ObserverPattern";
import {
  TweakpaneSupport,
  type Provide_Tweakpane_To_Props,
  type TweakpaneSupport_Props,
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
 * Das ParamterSet des Moduls.
 *
 * @export
 * @interface Artwork_ParameterSet
 */
export interface Artwork_ParameterSet {
  id: string;
  size: Size;
  clearscreen: boolean;
  scale: number;
  mouse: Vector;
}

/**
 * This reflects the internal state, and is used by Observer functionality.
 *
 * @interface State
 */
interface State {
  format: Format_ParameterSet;
}

export class Artwork {
  // implements TweakpaneSupport_Interface
  private window: any;
  private document: any;
  private artwork_meta: any;

  private parameter: any;
  private tweakpane: Pane;
  private tweakpane_folder_artwork: any;

  private format: Format;
  private theCanvas: any;
  private ctx: any;

  private width: number;
  private height: number;

  private animation_halt: boolean;
  private sketchRunner: SketchRunner;

  /**
   * Bundles everything that makes up my artwork.
   *
   * @param {Object} window
   * @param {Object} document
   * @param {string} artwork_meta - { title:'' ,description:'', author:'', version:'', year:'' }
   *
   * @param {Object} onKeyUp_Callback - userdefined callback Method
   * @param {number} openOptionPanes - number of OptionPanes to keep open (default=0)
   * @memberof Artwork
   */
  constructor(
    window: any,
    document: any,
    artwork_meta: any,
    onKeyUp_Callback: any = null,
    openOptionPanes: number = 2
  ) {
    this.window = window;
    this.document = document;
    this.artwork_meta = artwork_meta;

    // We build up the Parameter-Objekt...
    this.parameter = { tweakpane: {} }; // The Parameter-Object

    //* The Tweakpane
    this.tweakpane = new Pane({
      title: `Artwork '${artwork_meta.title}'`,
      expanded: true,
    });

    this.tweakpane_folder_artwork = null;

    // this.tweakpane.registerPlugin(EssentialsPlugin); // TODO: registerPlugin

    Artwork.provide_meta_to_tweakpane(this.tweakpane, this.artwork_meta);

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

    // HTML Content, im wesentlichen das <canvas> Element.
    this.document.body.appendChild(
      Artwork.getHTMLContent(this.parameter.artwork.canvas.id, artwork_meta)
    );

    this.theCanvas = this.document.getElementById(
      this.parameter.artwork.canvas.id
    );

    this.ctx = this.theCanvas.getContext("2d");

    // shorthands
    this.width = this.parameter.artwork.canvas.size.width;
    this.height = this.parameter.artwork.canvas.size.height;

    // canvas should have the desired size
    this.theCanvas.width = this.width;
    this.theCanvas.height = this.height;

    // defined by user
    // this.colorSet = null;
    // this.background = null;

    this.animation_halt = false;

    // Close all the Tweakpane-Tabs
    // TODO das funktioniert nicht mehr. Es gibt dafür aber jetzt auch ein property.
    this.window.onload = function () {
      var elements = document.querySelectorAll(".tp-fldv");
      for (var i = 0; i < elements.length - openOptionPanes; i++) {
        elements[i].classList.remove("tp-fldv-expanded");
      }
    };

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
  private doFetchMouseMove(e: { x: any; y: any }) {
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
    this.animation_halt = !this.animation_halt;
    if (this.animation_halt) {
      this.cancel();
    } else {
      this.continue();
    }
  } // onKeyUp_Callback

  //* --------------------------------------------------------------------
  //* Tweakpane Meta
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
    artwork_meta: any
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
  private static getHTMLContent(
    id: string = "theCanvas",
    artwork_meta: any
  ): any {
    const element_div = document.createElement("div");
    element_div.classList.add("canvasWrap"); // CSS Style: class="canvasWrap" Attribute

    const element_canvas = document.createElement("canvas"); // theCanvas Element
    element_canvas.setAttribute("id", id); //  id Attribute

    element_div.appendChild(element_canvas);

    return element_div;
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
      parameterSetName: string = ""
    ): void {
      // Das Parameterset
      let _artwork_ps: Artwork_ParameterSet = {
        id: "theCanvas",
        size: new Size(
          parameter.tweakpane.artwork_canvas_width,
          parameter.tweakpane.artwork_canvas_height
        ),
        scale: parameter.tweakpane.artwork_scale,
        clearscreen: parameter.tweakpane.artwork_clearscreen,
        mouse: new Vector(0, 0),
      };

      // Das ist ein wenig special, da 'artwork.canvas' statt nur 'artwork'
      // Erhöht die lesbarkeit bei der Benutzung.
      Object.assign(parameter, {
        artwork: {
          canvas: _artwork_ps,
        },
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
      parameterSetName: string = ""
    ): void {
      let source: any = parameter.tweakpane; // prefixable
      let target: any = parameter.artwork;

      target.canvas.clearscreen = source.artwork_clearscreen;
      target.canvas.size = new Size(
        source.artwork_canvas_width,
        source.artwork_canvas_height
      );
      target.scale = source.artwork_scale;
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
      // Inject Tweakpane parameters
      // Tweakpane unterstützt nur eine'flache' Struktur von Membern.
      parameter.tweakpane = Object.assign(parameter.tweakpane, {
        artwork_canvas_width: 500,
        artwork_canvas_height: 500,
        artwork_clearscreen: true,
        artwork_scale: 1.0,
      });

      // creates the paramter-set and transferts the tweakpane-setting into.
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
//* SketchRunner
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
  private ctx: any;
  private parameter: any;
  private theCanvas: any;
  private tweakpane: Pane;
  private format: Format;

  private width: number;
  private height: number;

  public animationFrame: number;
  private lastTime: number;
  private intervall: number;
  private timer: number;

  private state: State;

  public sketch: Sketch | null;

  /**
   * Creates an instance of SketchRunner.
   * @param {*} ctx
   * @param {*} parameter
   * @param {*} theCanvas
   * @param {Pane} tweakpane
   * @param {Format} format
   * @memberof SketchRunner
   */
  constructor(
    ctx: any,
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

    // shorthands
    this.width = parameter.artwork.canvas.size.width;
    this.height = parameter.artwork.canvas.size.height;

    this.animationFrame = 0;

    /* Die Animation soll auf unterschiedlich schnellen Rechnern 
       gleich schnell ablaufen */
    this.lastTime = 0;
    this.intervall = 1000 / 60; /* 60 Frames per Second - ca. 60.6ms */
    this.timer = 0;

    // Den state nutze ich hier nicht, sondern verarbeite die DAten direkt in der Update Methode...
    // TODO Format in den state?
    this.state = {
      format: {
        type: "",
        aspect_ratio: 0,
        keep_aspect_ratio: false,
        fencing: false,
        position_lefttop: new Vector(0, 0),
        size: new Size(10, 10),
        center: new Vector(0, 0),
        fak: new Vector(0, 0),
      },
    };

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
  update(source: ObserverSubject, data: any) {
    // console.log('Artwork SketchRunner.update(source, ...)', source);
    // console.log('Artwork SketchRunner.update(..., data)', data);

    if (source instanceof Format) {
      console.log("Artwork SketchRunner -> Format geändert...");

      //! Das geht leider nicht: if(data instanceof Format_ParameterSet){ ... }
      // Ich gehe einfach davon aus das die Daten da sind wenn die Klasse stimmt.

      this.width = data.size.width;
      this.height = data.size.height;

      this.theCanvas.width = this.width;
      this.theCanvas.height = this.height;

      //? was ist das? this.tweakpane.format.size = this.state.format.size;

      //TODO Tweakpane inputs aktualisieren? das funktioniert so nicht, und ergibt eine Art Rückkopplung.
      // this.parameter.tweakpane.artwork_canvas_width = this.width;
      // this.parameter.tweakpane.artwork_canvas_height = this.height;
      // this.tweakpane.refresh();
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
    Artwork.tweakpaneSupport.transfer_tweakpane_parameter_to(
      this.parameter,
      ""
    );
    Format.tweakpaneSupport.transfer_tweakpane_parameter_to(this.parameter, "");

    // TODO das gehört in eine Format.transfer_tweakpane_parameter_to Methode?
    // if changed, recalculate and inform oberservers
    this.format.setFormat(
      this.parameter.tweakpane.format_type,
      this.parameter.tweakpane.format_aspect_ratio,
      new Size(
        this.parameter.tweakpane.artwork_canvas_width,
        this.parameter.tweakpane.artwork_canvas_height
      )
    );
    this.format.useFencing(this.parameter.tweakpane.format_fencing);
    this.format.setPreserveAspectRatio(
      this.parameter.tweakpane.format_keep_aspect_ratio
    );

    let deltaTime = timeStamp - this.lastTime; // milliseconds
    // Move forward in time with a maximum amount
    // https://spicyyoghurt.com/tutorials/html5-javascript-game-development/create-a-smooth-canvas-animation
    deltaTime = Math.min(deltaTime, 0.1);
    this.lastTime = timeStamp;
    // const fps = Math.round(1000/deltaTime);
    // console.log(`fps: ${fps}`)

    if (this.parameter.artwork.canvas.clearscreen) {
      this.ctx.clearRect(0, 0, this.width, this.height); /* clear Canvas */
    }

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
      console.log("Kein Sketch!");
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
