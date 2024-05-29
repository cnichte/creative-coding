/**
 * Title    : Artwork
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/Artwork.js
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
 *
 * Supports:
 * - ParameterSet   : yes
 * - Tweakpane      : yes
 * is:
 * - Observer       : yes
 * - ObserverSubject: yes
 * - prefixable:    : no
 * 
 * Uses:
 * - Format
 * 
 ** Bundles everything that makes up my artwork.
 * It is basically a wrapper around the <canvas /> element,
 * that runs a sketch.
 *
 * Supports: Tweakpane
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
 import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

 // import { SceneGraph } from "./SceneGraph";
 import { Exporter } from "./Exporter";
 import { SketchRunner, type Sketch } from "./Sketch";
 import { Size } from "./Size";
 import { Format } from "./Format";
 import { Vector } from "./Vector";
 import {
  TweakpaneSupport,
  type Provide_Tweakpane_To_Props, type TweakpaneSupport_Props,
  type Tweakpane_Items
} from "./TweakpaneSupport";


export interface Artwork_ParameterSet {
  artwork: Artwork_ParameterSet_Values
}
export interface Artwork_ParameterSet_Values {
  meta: Artwork_Meta;
  canvas: Artwork_Canvas;
  scale: number;
  animation: Artwork_Animation,
}

export interface Artwork_Meta {
  title: string;
  description: string;
  author: string;
  version: string;
  year: string;
}
export interface Artwork_Canvas {
  html: Artwork_Canvas_HTML;
  size: Size;
  center: Vector;
  clearscreen: boolean;
  mouse: Vector;
}
export interface Artwork_Canvas_HTML {
  id: string;
  parent_container_id: string;
  parent_container_class: string;
  tweakpane_container_id: string;
}

export interface Artwork_Animation {
  global_halt: boolean; // animation_halt

  duration: number;

  lastTime: number;
  intervall: number; /* 60 Frames per Second - ca. 60.6ms */

  timeStamp: number;
  deltaTime: number;
}

interface Artwork_ParameterTweakpane {
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
  private tweakpane_items: Tweakpane_Items|null;

  private theCanvas: HTMLCanvasElement;
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

    if (!("artwork" in parameter)) {
      Object.assign(parameter, Artwork.get_default_paramterset() );
    }

    if (!("tweakpane" in parameter)) {
      Object.assign(parameter, { tweakpane: {} });
    }

    //* HTML Content, im wesentlichen das <canvas> Element.

    const parent_container_id = parameter.artwork.canvas.html.parent_container_id.trim();
    const tweakpane_container_id = parameter.artwork.canvas.html.tweakpane_container_id.trim();

    // TODO Try to find the canvas element with ID...
    this.theCanvas = this.document.getElementById(
      this.parameter.artwork.canvas.html.id
    );

    if (this.theCanvas == null) {
      // append one in body, or in the element with id
      const html_props: Artwork_Canvas_HTML = {
        id: this.parameter.artwork.canvas.html.id,
        parent_container_id: parent_container_id,
        parent_container_class: parameter.artwork.canvas.parent_container_class,
        tweakpane_container_id: tweakpane_container_id,
      }

      this.document.body.appendChild(
        Artwork.get_HTML_content(html_props, this.parameter.artwork.meta)
      );

      this.theCanvas = this.document.getElementById(
        this.parameter.artwork.canvas.html.id
      );
    }

    //* The Tweakpane
    const pc = document.getElementById(parent_container_id);
    console.log(`#### found canvas Parent-Container ${parent_container_id}?`, pc);

    const tpc = document.getElementById(tweakpane_container_id);
    console.log(`#### found canvas Tweakpane-Container ${tweakpane_container_id}?`, tpc);

    if (tweakpane_container_id.length > 0 && tpc) {
      console.log(`put tweakpane in id ${tweakpane_container_id}`);
      this.tweakpane = new Pane({
        title: `Artwork '${parameter.artwork.meta.title}'`,
        expanded: false,
        container: document.getElementById(tweakpane_container_id),
      });
    } else {
      if (parent_container_id.length > 0 && pc) {
        console.log(`put tweakpane in id ${parent_container_id}`);
        this.tweakpane = new Pane({
          title: `Artwork '${parameter.artwork.meta.title}'`,
          expanded: false,
          container: document.getElementById(parent_container_id),
        });
      } else {
        console.log(`put tweakpane in body`);
        this.tweakpane = new Pane({
          title: `Artwork '${parameter.artwork.meta.title}'`,
          expanded: false
        });
      }
    }

    this.tweakpane_items = null;
    this.tweakpane.registerPlugin(EssentialsPlugin);

    Artwork.provide_meta_to_tweakpane(
      this.tweakpane,
      this.parameter.artwork.meta
    );

    //* init Parameter-Object...
    // setup gui, and bring the modules parameters into settings.tweakpane.
    this.tweakpane_items =
      Artwork.tweakpaneSupport.provide_tweakpane_to(this.parameter, {
        items: {
          pane: this.tweakpane,
          folder: null,
          tab: null
        },
        folder_name_prefix: "",
        use_separator: false,
        parameterSetName: "",
        excludes: [],
        defaults: {},
      }); // Artwork.OPEN_TWEAK_PANES

    this.format = new Format(this.parameter);

    this.ctx = this.theCanvas.getContext("2d"); // TODO Type: CanvasRenderingContext2D | null

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
      this.tweakpane_items
    );
    this.sketchRunner.sketch = sketch;
    this.sketchRunner.animation_loop(0); //* starts the endless loop
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
    this.sketchRunner.animation_loop(this.sketchRunner.animationFrame);
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
   * @param props 
   * @param meta 
   * @returns {*} div Element with <canvas id="theCanvas" />
   * @memberof Artwork
   */
  private static get_HTML_content(props: Artwork_Canvas_HTML, meta: Artwork_Meta): any {

    const elm_wrapper = document.createElement("div");
    elm_wrapper.classList.add(props.parent_container_class); // CSS Style: class="canvasWrap" Attribute
    if (props.parent_container_id.length > 0) {
      elm_wrapper.setAttribute("id", props.parent_container_id);
    }

    const elm_tweakpane = document.createElement("div");
    if (props.tweakpane_container_id.length > 0) {
      elm_tweakpane.setAttribute("id", props.tweakpane_container_id);
    }

    const elm_canvas = document.createElement("canvas"); // theCanvas Element
    elm_canvas.setAttribute("id", props.id); //  id Attribute

    elm_wrapper.appendChild(elm_tweakpane);
    elm_wrapper.appendChild(elm_canvas);

    return elm_wrapper;
  } // getHTMLContent


  //* --------------------------------------------------------------------
  //* Provide Default Parameter-Set
  //* --------------------------------------------------------------------

  public static get_default_paramterset(parameter?:any): any {

    const artwork_meta_default: Artwork_Meta = {
      title: "My Artwork",
      description: "Description oft the Artwork",
      author: "Carsten Nichte",
      version: "0.0.1",
      year: "2024",
    };
  
    const artwork_canvas_html_default:Artwork_Canvas_HTML = {
      id: "theCanvas",
      parent_container_id: "theCanvasContainer",
      parent_container_class: "canvas_parent_css_class",
      tweakpane_container_id: "theTweakpaneContainer",
    }
  
    const artwork_canvas: Artwork_Canvas = {
      html: artwork_canvas_html_default,
      size: new Size(800,800),
      center: new Vector(400,400),
      clearscreen: false,
      mouse: new Vector(0, 0),
    }
  
    const artwork_animation_default: Artwork_Animation = {
      global_halt: false,
      duration: 60,
      lastTime: 0,
      intervall: 0,
      timeStamp: 0,
      deltaTime: 0
    }
  
    const parameter_default:Artwork_ParameterSet = {
      artwork: {
        meta: artwork_meta_default,
        canvas: artwork_canvas,
        scale: 1.0,
        animation: artwork_animation_default
      }
    }

    return parameter_default;
  } // get_default_paramterset

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

      //* Das ParameterSet wurde im Konstruktor hinzugefügt.
      // Da hier nix prefixable ist, brauch ich hier nichts weiter zu tun.
      // Da das aber ne statische Methode ist, 
      // und  der Konstruktor nicht aufgerufen worden sein muss
      // Prüfe ich ob das ParameterSet-Objekt vorhanden ist:
      if (!("artwork" in parameter)) {
        Object.assign(parameter, Artwork.get_default_paramterset() );
      }

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

      // Das erwarte ich hier:
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
    ): Tweakpane_Items {

      //! Entweder, oder: 
      // a.) Tweakpane inits paramterset in inject_parameterset_to
      // b.) paramterset inits tweakpane 
      // Ich will ja ein Objekt übergeben können, also mach ich b.)

      //! 1. Parameter-Set vorhanden?
      // Das muss ich nur machen wenn der konstruktor nicht aufgerufen wurde.
      // Da das hier ne statische Methode ist, weiß ich das aber nicht...
      Artwork.tweakpaneSupport.inject_parameterset_to(parameter);

      //! 2. Startwerte der Tweakpane
      let parameterTP: Artwork_ParameterTweakpane = {
        artwork_canvas_width: parameter.artwork.canvas.size.width,
        artwork_canvas_height: parameter.artwork.canvas.size.height,
        artwork_clearscreen: parameter.artwork.canvas.clearscreen,
        artwork_scale: parameter.artwork.scale,
      };
      parameter.tweakpane = Object.assign(parameter.tweakpane, parameterTP);

      const folder = props.items.pane.addFolder({
        title: props.folder_name_prefix + "Canvas",
        expanded: false,
      });

      props.items.tab = folder.addTab({
        pages: [
          { title: props.folder_name_prefix + "Properties" },
          { title: 'Format' },
          { title: 'Export' },
        ],
      });

      props.items.tab.pages[0].addBinding(parameter.tweakpane, "artwork_canvas_width", {
        label: "Width",
        readonly: true,
      });

      props.items.tab.pages[0].addBinding(parameter.tweakpane, "artwork_canvas_height", {
        label: "Height",
        readonly: true,
      });

      props.items.tab.pages[0].addBlade({
        view: "separator",
      });

      props.items.tab.pages[0].addBinding(parameter.tweakpane, "artwork_scale", {
        label: "Scale",
        min: 0.2,
        max: 2.0,
        step: 0.0001,
      });

      props.items.tab.pages[0].addBinding(parameter.tweakpane, "artwork_clearscreen", {
        label: "ClearScreen",
      });

      Format.tweakpaneSupport.provide_tweakpane_to(parameter, {
        items: {
          pane: props.items.pane,
          folder: props.items.tab.pages[1],
          tab: null
        },
        folder_name_prefix: "",
        use_separator: false,
        parameterSetName: "",
        excludes: [],
        defaults: {},
      });

      Exporter.tweakpaneSupport.provide_tweakpane_to(parameter, {
        items: {
          pane: props.items.pane,
          folder: props.items.tab.pages[2],
          tab: null
        },
        folder_name_prefix: "",
        use_separator: false,
        parameterSetName: ""
      });

      return props.items;
    }, // provide_tweakpane_to
  };
} // class Artwork


