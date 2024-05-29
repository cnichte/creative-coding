/**
 * Title    : SceneGraph
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/SceneGraph.ts
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
 *
 * The SceneGraph is (at least) a sort of Group, or Memory, or Buffer.
 * It is a one dimensional Storage based on number,
 * or a two dimensional Storage based on Coordinate.col and Coordinate.row
 * 
 * TODO make it 3D.
 * 
 * It holds a copy of all Objects in the Scene for persistence during runtime.
 *
 ** SceneGraph draws all stuff that is drawable -  what means, it has a Method: draw(context, parameter)
 *
 * TODO: could there be nesting? ...add a SceneGraph to a SceneGraph?
 * TODO: It should also use/support the AnimationTimer
 * TODO: and the AnimationTimeline class to calculate all the animation stuff?
 * 
 ** so it must not be done explicite in the users classes? - is that usefull?
 *
 * TODO do some parameter testing: typeof (this.sceneGraph.graph) !== 'undefined' && Array.isArray(this.sceneGraph.graph) &&
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

import { Coordinate } from "./Coordinate";
import { AnimationTimer } from "./AnimationTimer";

export interface Drawable {
  draw(context: any, parameter: any): void;
}

export class SceneGraph {

  public graph: Drawable[][]; // Its a 2D Storage by default.
  public animation_timeline = new AnimationTimeline();
  public animation_timer = new AnimationTimer();
  
  /**
   * Creates an instance of SceneGraph.
   *
   * @memberof SceneGraph
   */
  constructor() {
    // Initialize one Row for the 1D support.
    this.graph = [];
    this.graph[0] = [];
  }

  /**
   *
   *
   * @memberof SceneGraph
   */
  public clear(): void {
    this.graph = [];
  }

  /**
   * Calls all the draw methods in the Graph.
   * It naturally draws all the Elements in the SceneGraph,
   * but you can set a limit to Elements drawn.
   *
   * @param {*} context
   * @param {*} parameter
   * @param {(number|Coordinate)} [limit=0]
   * @memberof SceneGraph
   */
  public draw(
    context: any,
    parameter: any,
    limit: number | Coordinate = 0
  ): void {
    let _limit: Coordinate;
    if (typeof limit === "number") {
      _limit = new Coordinate(limit, 0);
    } else {
      _limit = limit;
    }

    let _count = new Coordinate(1, 1);

    this.graph.forEach((item_row) => {
      _count.row = _count.row + 1;

      // console.log('SceneGraph: limit, count, item_row', {limit, count, item_row} );

      // TODO Exception if (limit.row > 0 && count.row > limit.row + 1) return;

      if (Array.isArray(item_row)) {
        // console.log('SceneGraph -> 2D');
        _count.col = 1;

        item_row.forEach((item_col) => {
          _count.col = _count.col + 1;

          if (_limit.col > 0 && _count.col > _limit.col + 1) return;

          // console.log('SceneGraph 2D -> draw col');
          item_col.draw(context, parameter);
        });
      }
    });
  }

  /**
   * Gets something from the Graph:
   *
   * get()  - returns the Array graph
   * get(5) - returns graph[5] -
   * get(new Coordinate(1,2)) - returns graph[1][2]
   * get(new Coordinate(1,2),5) - returns graph[1][2], 5 is ignored
   * get(2,3) - graph[2][3]
   *
   * @param {(Coordinate|number|undefined)} coordinate
   * @param {number} [index=-1] - optional, default=-1
   * @return {Drawable}
   * @memberof SceneGraph
   */
  public get(
    coordinate: Coordinate | number | undefined,
    index: number = -1
  ): Drawable[] | Drawable {
    if (coordinate === undefined) {
      if (index > -1) {
        return this.graph[index];
      } else {
        return this.graph[0];
      }
    }

    if (typeof coordinate === "number") {
      if (index > -1) {
        return this.graph[coordinate][index];
      } else {
        return this.graph[coordinate];
      }
    } else if (coordinate instanceof Coordinate) {
      return this.graph[coordinate.row][coordinate.col];
    } else {
      // Fallback for a
      return this.graph[coordinate];
    }
  }

  /**
   * Number of elements in the graph.
   *
   * @return {*}  {number}
   * @memberof SceneGraph
   */
  public getCount(): number {
    return this.graph.length;
  }

  /**
   * Number of elements in the graph.
   *
   * @param {number} [index=-1] - optional, default=-1
   * @return {*}  {(number | boolean)}
   * @memberof SceneGraph
   */
  public getColsCount(index: number = -1): number | boolean {
    if (index > -1) {
      if (this.graph.length > 0) {
        if (Array.isArray(this.graph[index])) {
          return this.graph[index].length;
        }
      }
    } else {
      if (this.graph.length > 0) {
        if (Array.isArray(this.graph[0])) {
          return this.graph[0].length;
        }
      }
    }
    return false;
  }

  /**
   * Adds all the something drawables to the scene.
   * Replaces all stuff with something.
   *
   * @param {Drawable[][]} something
   * @memberof SceneGraph
   */
  public set(something: Drawable[][]): void {
    this.graph = something;
  }

  /**
   ** Add something drawable to the Scene.
   *
   * Appends something to the SceneGraph if has a 'draw' Method.
   *
   * graph[row_index].push(a_cell);
   *
   * TODO: Custom Timer? - is in something...
   *
   * @param {Drawable} something
   * @param {number} [index=-1]
   * @param {(AnimationTimer | null)} [animationTimer=null]
   * @memberof SceneGraph
   */
  public push(
    something: Drawable,
    index: number = -1,
    animationTimer: AnimationTimer | null = null
  ): void {
    if (index > -1) {
      if ("draw" in something) {
        if (this.graph[index] === undefined) {
          this.graph.push(new Array<Drawable>());
        }

        // Das ist jetzt eigentlich immer der Fall
        if (Array.isArray(this.graph[index])) {
          this.graph[index].push(something);
        }
      }
    } else {
      if ("draw" in something) {
        if (this.graph[0] === undefined) {
          this.graph[0] = new Array<Drawable>();
        }

        this.graph[0].push(something);
        // console.log('SceneGraph: pushed something to: ', this.graph);
      }
    }
  }

  /**
   * Adds a Scenegraph to the SceneGraph.
   * TODO Ungetestet mit den 2 Dimensionen.
   *
   * @param {Drawable[][]} the_graph
   * @memberof SceneGraph
   */
  public push_a_SceneGraph(the_graph: Drawable[][]): void {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    this.graph.push(...the_graph);
  }

  /**
   * graph[last] - Remove the last Element, or row of Elements
   *
   * @return {*}  {Drawable[]} Array of removed Elements
   * @memberof SceneGraph
   */
  public pop_row(): Drawable[] {
    var removed: Drawable[] = [];

    let last = this.graph.length - 1;

    if (Array.isArray(this.graph[last])) {
      // remove all the elements (cols) from the last row
      for (var i = 0; i < this.graph[last].length; i++) {
        let cell = this.graph[last].pop();
        if (cell !== undefined) {
          // this.animationTimer.removeObserver(cell);
          removed.push(cell);
        }
      }

      this.graph.pop(); // remove the row itself
    }

    return removed;
  }

  /**
   *
   *
   * @return {*}  {Drawable[]} - Array of removed Elements
   * @memberof SceneGraph
   */
  public pop_col(): Drawable[] {
    var removed: Drawable[] = [];

    for (var i = 0; i < this.graph.length; i++) {
      if (Array.isArray(this.graph[i])) {
        let cell = this.graph[i].pop();
        // this.animationTimer.removeObserver(cell);
        if (cell !== undefined) {
          removed.push(cell);
        }
      }
    }

    return removed;
  }

  /**
   * Removes the last drawable, and animable thing from the scene.
   *
   * graph[last] - Remove the last Element
   * graph[index][last] - Remove the last Element from the Row
   *
   * @param {number} [index=-1] - optional, default=-1
   * @memberof SceneGraph
   */
  public pop(index: number = -1): void {
    if (index > -1) {
      let last = this.graph[index].length - 1;
      // this.animationTimer.removeObserver(this.graph[index][last]);
      this.graph[index].pop();
    } else {
      //
      this.pop_row();
    }
  }

  /**
   * removes something drawable from the scene.
   * https://stackoverflow.com/questions/5767325/how-can-i-remove-a-specific-item-from-an-array
   * TODO: untested
   *
   * [] - Remove the Element something
   * [index][] - Remove the Element something from the Row
   * @deprecated - not uesed???
   *
   * @param {*} something
   * @param {number} [index=-1]
   * @return {*}  {any[]} Array of removed Elements
   * @memberof SceneGraph
   */
  public pop2(something: Drawable, index: number = -1): Drawable[] {
    var removed: Drawable[] = [];

    if (index > -1) {
      for (var i = 0; i < this.graph[index].length; i++) {
        while (this.graph[index][i] === something) {
          removed.push(this.graph[index].splice(i, 1)[0]);
        }
      }
    } else {
      for (var i = 0; i < this.graph.length; i++) {
        while (this.graph[0][i] === something) {
          removed.push(this.graph[0].splice(i, 1)[0]);
        }
      }
    }

    return removed;
  }
} // class SceneGraph

/*

TODO: refactore SceneGraph.js to Scene.js ????

File: "Scene.js" 
module.exports = {
    Graph,
    Graph_Drawable
};

*/
