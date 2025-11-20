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
    animate(ctx: any, parameter: any, timeStamp: number, deltaTime: number): void;
  }

//* --------------------------------------------------------------------
//*
//* SketchRunner
//*
//* --------------------------------------------------------------------

import { Format, type Check_ObserverSubject_Format_Parameter } from "./Format";
import type { Observer, ObserverSubject } from "./ObserverPattern";
import { IOManager } from "./IOManager";

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
 export class SketchRunner implements Observer {
    private ctx: CanvasRenderingContext2D;
    private parameter: any;
    private theCanvas: any;
    private tweakpane: Pane;
    private format: Format;
    private ioManager: IOManager;
  
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
      this.ioManager = IOManager.from(parameter);
  
      this.format.addObserver(this);
  
      this.animationFrame = 0;
  
      /* Die Animation soll auf unterschiedlich schnellen Rechnern gleich schnell ablaufen */
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
        this.parameter.artwork.canvas.size = state_new.size; // ---> doppelt
        this.parameter.artwork.canvas.center = state_new.center;
  
        this.parameter.artwork.canvas.width = state_new.size.width; // TODO doppelt
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
      this.parameter.artwork.animation.timeStamp = timestampSeconds;
      this.parameter.artwork.animation.deltaTime = deltaTimeSeconds;
  
      if (this.sketch != null && "animate" in this.sketch) {
        // timeStamp und deltaTime werden von Millisekunden in Sekunden umgerechnet.
        // bevor sie übergeben werden.
        this.sketch.animate(
          this.ctx,
          this.parameter,
          timestampSeconds,
          deltaTimeSeconds
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
        this.animation_loop.bind(this)
      ); /* Endless loop */
  
      // console.log("animate", this.animationFrame);
    } // animationLoop
  } // class SketchRunner
