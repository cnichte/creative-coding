/**
 * Title    : Move
 * Project  : Creative Coding
 * File     : projects/cc-utils/animations/Move.js
 * Version  : 1.0.0
 * Published: https://gitlab.com/glimpse-of-life
 * 
 ** A basic Animation. Takes the shortest path between two points.
 *  Supports: Tweakpane, ParamterSet
 *
 * TODO: Move To [{x1,y1}, {x2,y2},…]
 * Quasi geradlinig einen path entlang bewegen.
 * Oder entlang einer spline Kurve … das wäre dann ein weiterer Mode.
 * Art: geradlinig, spline, …
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

import type { AnimationTimeline_ParameterSet } from "../AnimationTimeline";
import { Vector } from "../Vector";

export enum Animation_Move_Mode {
  flipflop,
  stop,
  beam
}

 export interface Animation_Move_Properties { 
  from:Vector;
  to: Vector;
  step: Vector;
  mode:Animation_Move_Mode;
  timeline: AnimationTimeline_ParameterSet; // ??? startTime:10.123,duration:0.001}}
 }

// const random = require('canvas-sketch-util/random');

class Move extends AnimationTimeline_Item {

  /**
   * Takes the shortest path between two points.
   * The Parameters are Vectors.
   *
   *  move:{mode:"stop"}
   *  "stop"     - Stop, if there.
   *  "flipflop" - Go back, if there.
   *  "beam"     - if end reached, set to start
   * 
   *  default is "stop"
   *
   * @link joplin://x-callback-url/openNote?id=63a5888626d04d4194d0e02bb96233bd
   *
   * @param {Object} animation {move:{ from:{x:0, y:100} to:{x:0, y:100}, step:{x:.0.01, y:0.01}, mode:"flipflop|stop|beam" }, timeline:{startTime:10.123, duration:0.001}}
   */
  constructor(animation:Animation_Move_Properties) {
    super();

    this.mode = animation.move.mode || "stop";
    this.state = "flip"; // flop

    //Create real Vectors from the Objects
    this.start = null; // Der die erste Position wird zum Startwert!
    this.now = null;
    this.end = new Vector(-1, -1);


    this.step = new Vector(-1, -1); // force first calculation
    this.direction = new Vector(1, 1); // should be -1 or +1
  }

  /**
   * Is called from AnimationTimeline.perform_animations_if()
   *
   * @param {Object} parameter 
   * @param {Object} animations 
   */
  perform_animation_if(parameter, animations) {
    if ('animation' in animations) {
      if ('move' in animations.animation) {
        super.animate_fast_if(parameter, animations.animation.move);
      }
    }
  }


  /**
   * Calculate new/next values for a fast animation.
   * This method is called via AnimationTimeline -> super.animate_fast_if()
   * 
   * @param {Object} animation {move:{ to:{x:0, y:100}, step:{x:.0.01, y:0.01}, mode:"flipflop|stop|beam" }}
   *
   * {@link joplin://x-callback-url/openNote?id=5c4bf42aea45405e8c61dfd0084ac135|Animation - Move}
   * {@link joplin://x-callback-url/openNote?id=63a5888626d04d4194d0e02bb96233bd|Recherche: Punkte auf einer Linie finden...}
   *
   * @returns Vector - the animated (moved) Position
   */
  animate_fast(animation) {

    // TODO: Neues Verhalten der move Funktion
    // Point verlegen 
    // Wieviel % der Strecke hast du zurück gelegt.
    // An der Stelle auf dem neuen Weg weiter machen. 
    // Der Weg wurde quasi versetzt.

    // this.now = animation.to; //! test move_to range / boundaries

    if (this.now !== null) {

      let new_end = animation.to;

      if (!this.end.equals(new_end)) {
        // The end position has changed
        this.end = new_end;
        // TODO Neue Position und Richtung berechnen
        // this.part = Move.calculate_distance(this.now, this.end, this.step);
        // this.direction = Move.calculate_direction(this.now,this.end);
      }


/*
      let new_step = new Vector(animation.step.x, animation.step.y);
      if (!this.step.equals(new_step)) {
        // the speed has changed
        this.step = new_step;
        this.part = Move.calculate_distance(this.now, this.end, this.step);
        this.direction = Move.calculate_direction(this.now,this.end);
      }

      this.mode = animation.mode;

      switch (this.mode) {
        case "flipflop":

          switch (this.state) {
            case "flip":
              // go from start to end
              this.now = this.now.add(this.part); // .part.multiply(this.direction)
              this.now = Mathematics.lerp_vector(this.start, this.end, this.now.x); 

              if (this.now.x > this.end.x || this.now.y > this.end.y) {
                // Switch direction to `go from end to start` and calculate
                this.part = Move.calculate_distance(this.now, this.start, this.step);
                this.direction = Move.calculate_direction(this.now, this.start);
                this.state = "flop";
              }

              break;
            case "flop":
              // Switch direction and calculate
              // go from end to start
              this.now = this.now.add(this.part); // .part.multiply(this.direction)
              // this.now = this.now.subtract(this.part).multiply(this.direction);

              if (this.now.x < this.start.x || this.now.y < this.start.y) {
                // Switch direction to `go from start to end` and calculate
                this.part = Move.calculate_distance(this.now, this.end, this.step);
                this.direction = Move.calculate_direction(this.now, this.end);
                this.state = "flip";
              }
              break;
            default:
          }

          break;
        case "beam":
          this.now = this.now.add(this.part); // .part.multiply(this.direction)

          // Beam nur, wenn Position eindeutig erreicht ist...
          // je nach Bewegungsrichtung ist die Abfrage eine andere 
          if (this.direction.equals(new Vector(+1, -1))) {
            // 0-90
            if (this.now.x >= this.end.x && this.now.y <= this.end.y) {
              this.now = this.start.clone();
            }

          } else if (this.direction.equals(new Vector(-1, -1))) {
            // 90-180
            if (this.now.x <= this.end.x && this.now.y <= this.end.y) {
              this.now = this.start.clone();
            }

          } else if (this.direction.equals(new Vector(-1, +1))) {
            // 180-270
            if (this.now.x <= this.end.x && this.now.y >= this.end.y) {
              this.now = this.start.clone();
            }

          } else if (this.direction.equals(new Vector(+1, +1))) {
            if (this.now.x >= this.end.x && this.now.y >= this.end.y) {
              this.now = this.start.clone();
            }
          }

          break;
        case "stop":
        default:
          this.now = this.now.add(this.part); // .part.multiply(this.direction)

          if (this.now.x >= this.end.x && this.now.y >= this.end.y) {
            this.now = this.end.clone();
          }
      } // switch mode
*/
    } // now!==null

  } // animate_fast


  /**
   * TODO: Call this method, to use the recaluclated Values in your artwork.
   *
   * @param {Vector} position 
   * @returns 
   */
  perform(position) {

    // The first position indicates the Start-Value and starts the Animation
    if (this.start === null) {
      this.start = position.clone();
      this.now = this.start.clone();
    }

    if (position instanceof Vector) {

    }

    return this.now;
  }

  /**
   * Calculate the Path along the Line, in Vector Style.
   * This are the little steps we go along in the animation.
   * The sign is eliminated - mal gucken ob das sinnvoll ist.
   *
   * Damit die Distanz richtig berechnet wird, muss ich von der aktuellen Position aus neu rechnen.
   * und dann muss ich mir noch überlegen ob ich die Strecke in konstanter Zeit zurücklegen will?
   * TODO use Mathematics.lerp_vector
   *
   * @param {Vector} start 
   * @param {Vector} end 
   * @param {number} step 
   * @returns Vector - the litte parts we must add up to move
   */
  static calculate_distance(start:Vector, end:Vector, step:number) {
    return end.subtract(start).normalize().multiply(step);
  }


  /**
   ** which direction to go?
   *
   * Vier Fälle für vier Richtungen (in den 4 Quadranten)... 
   * (1) now.x < end.x && now.y > end.y -> x+ y- (Richtung zwischen 0 und 90 Grad)
   * (2) now.x > end.x && now.y > end.y -> x- y- (Richtung zwischen 90 und 180 Grad)
   * (3) now.x > end.x && now.y < end.y -> x- y+ (Richtung zwischen 180 und 270 Grad)
   * (4) now.x < end.x && now.y < end.y -> x+ y+ (Richtung zwischen 270 und 360 Grad)
   *
   * @param {Vector} now 
   * @param {Vector} target 
   * @returns Vector
   */
  static calculate_direction(now:Vector, target:Vector) {

    if (now.x < target.x && now.y > target.y) {
      return new Vector(+1, -1);
    } else if (now.x > target.x && now.y > target.y) {
      return new Vector(-1, -1);
    } else if (now.x > target.x && now.y < target.y) {
      return new Vector(-1, +1);
    } else if (now.x < target.x && now.y < target.y) {
      return new Vector(+1, +1);
    }

    //? Was ist mit 0, 90, 180 & 270 Grad?
    /*
    if (this.start.x == this.end.x){ // 90 oder 180
        this.direction.x = 0; 
    }
    if (this.start.y == this.end.y){ // 0, 180, 360
        this.direction.y = 0; 
    }
*/
    //   console.log("start(" + this.start.x + " , " + this.start.y + ") now(" + this.now.x + " , " + this.now.y + ") end(" + this.end.x + " , " + this.end.y + ") part(" + this.part.x + " , " + this.part.y + ") dir(" + this.direction.x + " , " + this.direction.y + ")");
  }
} // class Move


Move.TWEAKPANE_PREFIX = "_animation_move";
Move.Modes = {
  nothing: "nothing",
  flipflop: "flipflop",
  beam: "beam",
  stop: "stop"
};

/**
 * Transfers the Tweakpane-Parameters to the Parameter-Set for this Class / Module.
 *
 * @param {Object} parameter 
 * @param {Object} parameterset 
 * @param {Object} parameter_tweakpane 
 * @param {String} tweakpane_prefix 
 */
Move.transfer_tweakpane_parameter_to = function (parameter, parameterset, parameter_tweakpane, tweakpane_prefix = "") {

  tweakpane_prefix = Helper.prepare_tweakpane_prefix(tweakpane_prefix + Move.TWEAKPANE_PREFIX);

  parameterset.animation.move.mode = parameter_tweakpane[tweakpane_prefix + "mode"];

  // Transform Range from Tweakpane [-1 to +1] to [0 to +1], what means [0% to 100%] of the Canvas-Size
  parameterset.animation.move.to = new Vector(
    Mathematics.map_range(parameter_tweakpane[tweakpane_prefix + "to"].x, -1, +1, 0, +1) * parameter.artwork.canvas.size.width,
    Mathematics.map_range(parameter_tweakpane[tweakpane_prefix + "to"].y, -1, +1, 0, +1) * parameter.artwork.canvas.size.height);

  parameterset.animation.move.step.x = parameter_tweakpane[tweakpane_prefix + "step"];
  parameterset.animation.move.step.y = parameter_tweakpane[tweakpane_prefix + "step"];

  AnimationTimeline.transfer_tweakpane_parameter_to(parameterset.animation.move, parameter_tweakpane, tweakpane_prefix);
}

/**
 * Provides a Set of Parameters for this Class / Module.
 *
 * @param {Object} parameterset  
 * @param {Object} parameter_tweakpane 
 * @param {String} tweakpane_prefix 
 * @returns parameterset
 */
Move.inject_parameterset_to = function (parameterset, parameter_tweakpane, tweakpane_prefix = "") {

  tweakpane_prefix = Helper.prepare_tweakpane_prefix(tweakpane_prefix + Move.TWEAKPANE_PREFIX);

  if (!('animation' in parameterset)) {
    Object.assign(parameterset, {
      animation: {}
    });
  }

  // {move:{ to:{x:0, y:100}, step:{x:0.01, y:0.01}, mode:"flipflop|stop|beam" }}
  Object.assign(parameterset.animation, {
    move: {
      mode: Move.Modes.flipflop,
      step: {
        x: parameter_tweakpane[tweakpane_prefix + "step"], // TODO maxe it x,y too
        y: parameter_tweakpane[tweakpane_prefix + "step"]
      }, // increment
      to: {
        x: parameter_tweakpane[tweakpane_prefix + "to"].x,
        y: parameter_tweakpane[tweakpane_prefix + "to"].y
      }
    }
  });

  AnimationTimeline.inject_parameterset_to(parameterset.animation.move, parameter_tweakpane, tweakpane_prefix);

  return parameterset;
}


/**
 * Provides a Tweakpane for this Class / Module.
 *
 * @param {Pane} pane 
 * @param {FolderApi} folder 
 * @param {Object} parameter_tweakpane 
 * @param {String} tweakpane_prefix 
 * @returns folder
 */
Move.provide_tweakpane_to = function (pane, folder, parameter_tweakpane, tweakpane_prefix = "") {

  tweakpane_prefix = Helper.prepare_tweakpane_prefix(tweakpane_prefix + Move.TWEAKPANE_PREFIX);

  // Inject Tweakpane parameters
  parameter_tweakpane[tweakpane_prefix + "mode"] = Move.Modes.flipflop;
  parameter_tweakpane[tweakpane_prefix + "to"] = {
    x: 0.75,
    y: 0.80
  };
  parameter_tweakpane[tweakpane_prefix + "step"] = 0.01;


  // Build Tweakpane
  folder.addInput(parameter_tweakpane, tweakpane_prefix + 'mode', {
    label: 'Move',
    options: Move.Modes
  });

  folder.addInput(parameter_tweakpane, tweakpane_prefix + 'to', {
    label: 'to',
    x: {
      min: -1,
      max: 1
    },
    y: {
      min: -1,
      max: 1
    }
  });

  /*
    folder.addInput(parameter_tweakpane, tweakpane_prefix + 'animation_move_boundary', {
      label: 'Boundary',
      min: -180,
      max: +180,
      step: 0.001,
    });
  */

  folder.addInput(parameter_tweakpane, tweakpane_prefix + 'step', {
    label: 'Speed',
    min: 0.00,
    max: 200.00,
    step: 0.00001
  });


  AnimationTimeline.provide_tweakpane_to(pane, folder, parameter_tweakpane, tweakpane_prefix);

  return folder;

}


module.exports = Move;