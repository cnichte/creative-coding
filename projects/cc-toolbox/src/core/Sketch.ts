/**
 * Title    : Sketch + SketchRunner
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/Sketch.js
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
 *
 * Supports:
 * - ParameterSet   : no
 * - Tweakpane      : no
 * is:
 * - Observer       : yes
 * - ObserverSubject: no
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

 // Sketch.ts
import { Pane } from "tweakpane";

//* --------------------------------------------------------------------
//*
//* Sketch
//*
//* --------------------------------------------------------------------

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
    animate?(ctx: any, parameter: any, timeStamp: number, deltaTime: number): void;
    /**
     * Optional: if provided, SketchRunner will prefer tickScene over animate.
     */
    tickScene?(
      ctx: any,
      parameter: any,
      timeStamp: number,
      deltaTime: number
    ): void;
    /**
     * Optional: if true and a 'scene' property exists, SketchRunner will call scene.tick().
     */
    useSceneGraph?: boolean;
    /**
     * Optional SceneGraph reference for agent-based rendering.
     */
    scene?: any;
  }

//* --------------------------------------------------------------------
//*
//* SketchRunner
//*
//* --------------------------------------------------------------------

import { Format, type Check_ObserverSubject_Format_Parameter } from "./Format";
import { Vector } from "./Vector";
import { IOManager } from "./IOManager";
import { TimelinePlayer } from "./TimelinePlayer";

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
 export class SketchRunner {
    private ctx: CanvasRenderingContext2D;
    private parameter: any;
    private theCanvas: any;
    private tweakpane: Pane;
    private format: Format;
    private ioManager: IOManager;
    private timelinePlayer: TimelinePlayer | null;
  
    public animationFrame: number;
    private lastTime: number;
    private intervall: number;
    private timer: number;
  
    public sketch: Sketch | null;

    /**
     * Synchronize canvas size/center into parameter and tweakpane from current format state.
     */
    private syncCanvasFromFormat() {
      const fmt = this.parameter.format;
      if (!fmt || !fmt.size) return;

      const width = fmt.size.width;
      const height = fmt.size.height;

      if (
        this.theCanvas.width !== width ||
        this.theCanvas.height !== height
      ) {
        this.theCanvas.width = width;
        this.theCanvas.height = height;
      }

      this.parameter.artwork.canvas.size = fmt.size;
      this.parameter.artwork.canvas.center =
        fmt.center ??
        new Vector(width * 0.5, height * 0.5);

      if (this.parameter.tweakpane) {
        this.parameter.tweakpane.artwork_canvas_width = width;
        this.parameter.tweakpane.artwork_canvas_height = height;
      }
    }
  
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
      this.ioManager = IOManager.from(parameter);
      this.timelinePlayer = parameter?.__timelinePlayer ?? null;

      this.animationFrame = 0;
  
      /* Die Animation soll auf unterschiedlich schnellen Rechnern gleich schnell ablaufen */
      this.lastTime = 0;
      this.intervall = 1000 / 60; /* 60 Frames per Second - ca. 60.6ms */
      this.timer = 0;
  
      this.sketch = null;
    } // constructor
  
    /**
     * timeStamp wird erzeugt, wenn eine funktion (hier 'animation_loop')
     * von requestAnimationFrame aufgerufen wird.
     * requestAnimationFrame fügt diesen Zeitstempel als Parameter in die Animate-Funktion ein.
     * erst die zweite Schleife wird durch requestAnimationFrame ausgelöst
     *
     * @param {*} timeStamp
     * @memberof SketchRunner
     */
    public animation_loop(timeStamp: number) {
      // Transport tweakpane to parameter-object
      let deltaTime = timeStamp - this.lastTime; // milliseconds
      // Move forward in time with a maximum amount
      // https://spicyyoghurt.com/tutorials/html5-javascript-game-development/create-a-smooth-canvas-animation
      deltaTime = Math.min(deltaTime, 0.1);
      this.lastTime = timeStamp;
      const deltaTimeSeconds = deltaTime * 0.001;
      const timestampSeconds = timeStamp * 0.001;

      this.ioManager.update(timestampSeconds, deltaTimeSeconds);

      // 1. Das format hat sich geändert -> canvas.size anpassen
      // if changed, recalculate and inform all the oberservers
      let params: Check_ObserverSubject_Format_Parameter = {
        canvas_size: this.parameter.artwork.canvas.size,
      };
      this.format.check_ObserverSubject(params); 
      // const fps = Math.round(1000/deltaTime);
      // console.log(`fps: ${fps}`)
      this.syncCanvasFromFormat();
  
      if (this.parameter.artwork.canvas.clearscreen) {
        /* clear Canvas */
        this.ctx.clearRect(
          0,
          0,
          this.parameter.artwork.canvas.size.width,
          this.parameter.artwork.canvas.size.height
        );
      }
  
      this.parameter.artwork.animation.lastTime = this.lastTime;
      this.parameter.artwork.animation.intervall = this.intervall;
      this.parameter.artwork.animation.timeStamp = timestampSeconds;
      this.parameter.artwork.animation.deltaTime = deltaTimeSeconds;

      // optional central timeline player
      if (this.timelinePlayer) {
        this.timelinePlayer.tick(deltaTimeSeconds);
      }

      if (this.parameter.artwork.animation.global_halt === true) {
        this.animationFrame = requestAnimationFrame(
          this.animation_loop.bind(this)
        );
        return;
      }

      if (this.sketch != null) {
        if (typeof (this.sketch as any).tickScene === "function") {
          (this.sketch as any).tickScene(
            this.ctx,
            this.parameter,
            timestampSeconds,
            deltaTimeSeconds
          );
        } else if (
          (this.sketch as any).useSceneGraph === true &&
          (this.sketch as any).scene &&
          typeof (this.sketch as any).scene.tick === "function"
        ) {
          (this.sketch as any).scene.tick(
            this.ctx,
            this.parameter,
            deltaTimeSeconds
          );
        } else {
          throw new Error(
            "Sketch must implement tickScene() or provide scene.tick() with useSceneGraph=true."
          );
        }
      }
  
      if (this.timer > this.intervall) {
        this.timer = 0;
      } else {
        this.timer += deltaTime;
      }
  
      // requestAnimationFrame adjusts itself to Screen-Freshrate.
      this.animationFrame = requestAnimationFrame(
        this.animation_loop.bind(this)
      ); /* Endless loop */
  
      // console.log("animate", this.animationFrame);
    } // animationLoop
  } // class SketchRunner
