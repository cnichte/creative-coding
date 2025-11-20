/**
Grid Brush:

Shape: brush_shape - zeichnet ein Shape in die Mini-Canvases des Grids
Border: brush_border - funktioniert
Pos X: brush_position_x  - funktioniert nicht
Pos Y:brush_position_y  - funktioniert nicht
Scale: brush_scale - funktioniert
Scale X: brush_scale_x - funktioniert nicht
Scale Y: brush_scale_y  - funktioniert nicht
Rotate: brush_rotate - funktioniert
Fill: brush_borderColor - funktioniert
Border: brush_fillColor - funktioniert

 */

// Grid.ts - aktualisierte Version
/**
 * Title    : Grid
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/Grid.js
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
 *
 * These are little canvases arranged in a Grid.
 * All the Shapes could be drawn on this Grid.
 * And all the basic Operations like scale and rotate could be performed.
 * 
 * We have three Classes here:
 *
 *  - Grid_Manager - Manages the Grid
 *  - Grid_Cell - Represents the Cells in the Grid
 *  - Grid_Painter - Draws something onto the Grid. 
 *  TODO grid_address = Coordinate() <- grid_coordinate
 * 
 * and the usual support methods:
 * 
 *  - Grid_Manager.tweakpane_support.inject_parameterset_to() - Fills the ParamterSet into the Parameter-Object.
 *  - Grid_Manager.tweakpane_support.provide_tweakpane_to() - Provides a Tweakpane
 *  - Grid_Manager.tweakpane_support.transfer_tweakpane_parameter_to() - Swaps the paramter-Set
 *
 * made with 
 * https://github.com/mattdesl/canvas-sketch
 * https://github.com/mattdesl/canvas-sketch-util
 * 
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

// Grid_Manager.ts
import { v4 as uuidv4 } from 'uuid';
import { Brush } from './Brush';
import { ColorSet } from './ColorSet';
import type ColorSetType from './ColorSetType';
import { Coordinate } from './Coordinate';
import { Format } from './Format';
import { ObserverSubject, type Observer } from './ObserverPattern';
import { SceneGraph, type Drawable } from './SceneGraph';
import { Shape } from './Shape';
import { Size } from './Size';
import { Vector } from './Vector';
import { ParameterManager } from './ParameterManager';
import {
  TweakpaneManager,
  type TweakpaneContainer,
  type TweakpaneModule,
} from './TweakpaneManager';


export class Grid_Manager extends ObserverSubject {
  check_ObserverSubject(params: any): void {
    throw new Error('Method not implemented.');
  }

  private parameter: any;
  private randomized: any;
  private sceneGraph: SceneGraph;
  private sceneGraph_lines: SceneGraph; // new: separates lines layer

  public state: any;

  constructor(parameter: any) {
    super();
    this.parameter = parameter;
    Grid_Manager.ensureParameterSet(this.parameter);
    this.state = {
      grid: {
        cols: -1,
        rows: -1
      }
    };

    this.randomized = {
      fillColor: "#efefefFF",
      borderColor: "000000FF"
    };

    this.sceneGraph = new SceneGraph(); // draws shapes (brush content)
    this.sceneGraph_lines = new SceneGraph(); // draws grid lines only
  }

  reset() {
    this.sceneGraph.clear();
    this.sceneGraph_lines.clear();
    super.clear();
    this.state.grid.cols = -1;
    this.state.grid.rows = -1;
  }

  add_some() {
    if (this.sceneGraph.getColsCount(0) < this.parameter.grid.cols) this.add_some_cols();
    if (this.sceneGraph.getCount() < this.parameter.grid.rows) this.add_some_rows();
  }

  add_some_cols() {
    for (let row: number = 0; row < this.sceneGraph.getCount(); row++) {
      for (let col: number = Number(this.sceneGraph.getColsCount(row)); col < this.parameter.grid.cols; col++) {
        const cell = new Grid_Cell(this.parameter, new Coordinate(row, col));
        super.addObserver(cell);
        cell.state = Object.assign(cell.state, this.state);
        this.sceneGraph.push(cell, row);
        this.sceneGraph_lines.push(cell, row); // draw cell outlines in separate layer
      }
    }
  }

  add_some_rows() {
    for (let row = this.sceneGraph.getCount(); row < this.parameter.grid.rows; row++) {
      for (let col = 0; col < this.parameter.grid.cols; col++) {
        const cell = new Grid_Cell(this.parameter, new Coordinate(row, col));
        cell.state = Object.assign(cell.state, this.state);
        this.sceneGraph.push(cell, row);
        this.sceneGraph_lines.push(cell, row);
        super.addObserver(cell);
      }
    }
  }

  remove_some() {
    if (this.sceneGraph.getColsCount(0) > this.parameter.grid.cols) this.remove_some_cols();
    if (this.sceneGraph.getCount() > this.parameter.grid.rows) this.remove_some_rows();
  }

  remove_some_cols() {
    const quantity = Number(this.sceneGraph.getColsCount(0)) - this.parameter.grid.cols;
    for (let i = 0; i < quantity; i++) {
      const removed = this.sceneGraph.pop_col();
      super.removeObservers(removed.filter((item): item is Observer & Drawable => 'update' in item && 'draw' in item));
    }
  }

  remove_some_rows() {
    const quantity = this.sceneGraph.getCount() - this.parameter.grid.rows;
    for (let i = 0; i < quantity; i++) {
      const removed = this.sceneGraph.pop_row();
      super.removeObservers(removed.filter((item): item is Observer & Drawable => 'update' in item && 'draw' in item));
    }
  }

  animate_slow(source: any) {
    if (source instanceof ColorSet) {
      let cs: ColorSetType | null = this.parameter.colorset
        ? ColorSet.get(this.parameter.colorset).cs_object
        : ColorSet.get_random_colorset();

      if (cs) {
        this.randomized.fillColor = cs.background ?? ColorSet.get_color_from_colorset(cs);
        this.randomized.borderColor = cs.stroke ?? ColorSet.get_color_from_colorset(cs);
      }
    }
  }

  update(source: any) {
    if (source instanceof Format) {
      this.state.format = source.state.format;
      super.notifyAll(this, source);
    }
    if (source instanceof ColorSet) {
      this.state.colorset = source.state.colorset;
      super.notifyAll(this, source);
    }
  }

  draw(context: any, parameter: any) {
    const gridChanged = (
      this.state.grid.cols !== parameter.grid.cols ||
      this.state.grid.rows !== parameter.grid.rows
    );
  
    if (gridChanged) {
      this.add_some();
      this.remove_some();
      this.state.grid.cols = parameter.grid.cols;
      this.state.grid.rows = parameter.grid.rows;
      super.notifyAll(this, this.state.grid);
    }
  
    // 🟥 Linien zeichnen – nur wenn show == true
    if (parameter.grid.show === true) {
      // optional: bei Änderung Lines-Graph syncen
      this.sceneGraph.draw(context, parameter, new Coordinate(this.state.grid.rows, this.state.grid.cols));
    }
  }

  public static ensureParameterSet(parameter: any, path: string | string[] = "grid") {
    const manager = ParameterManager.from(parameter);
    const defaults = {
      show: true,
      rows: 5,
      cols: 5,
      brush: {
        shape: "Rect",
        angle: 0,
        scale: 1.0,
        border: 1,
        borderColor: "#efefef7F",
        fillColor: "#efefef7F",
      },
    };

    return manager.ensure(path, defaults);
  }

  public static registerTweakpane(
    parameter: any,
    options: {
      manager: TweakpaneManager;
      container: TweakpaneContainer;
      id?: string;
      statePath?: string | string[];
    }
  ): TweakpaneModule | null {
    if (!options.manager) return null;

    const grid = Grid_Manager.ensureParameterSet(parameter);

    const module = options.manager.createModule({
      id: options.id ?? "grid",
      container: options.container,
      statePath: options.statePath ?? ["grid"],
      stateDefaults: {
        grid_show: grid.show,
        grid_rows: grid.rows,
        grid_cols: grid.cols,
      },
      parameterPath: "grid",
      parameterDefaults: grid,
      // let the manager create a dedicated channel for this module
    });

    module.addBinding(
      "grid_show",
      { label: "Show" },
      { target: "grid.show" }
    );

    module.addBinding(
      "grid_cols",
      { label: "Cols", min: 1, max: 100, step: 1 },
      {
        target: "grid.cols",
        transform: (value) => Math.max(1, Math.round(value)),
      }
    );

    module.addBinding(
      "grid_rows",
      { label: "Rows", min: 1, max: 100, step: 1 },
      {
        target: "grid.rows",
        transform: (value) => Math.max(1, Math.round(value)),
      }
    );

    module.addBlade?.({ view: "separator" });

    Brush.registerTweakpane(parameter, {
      manager: options.manager,
      container: options.container,
      parameterPath: ["grid"],
      statePath: ["grid", "brush"],
      id: `${options.id ?? "grid"}:brush`,
      defaults: {
        brush_shape: "Rect",
        brush_position_x: 0.5,
        brush_position_y: 0.5,
        brush_scale: 1.0,
        brush_scale_x: 1.0,
        brush_scale_y: 1.0,
        brush_rotate: 0,
        brush_border: 0.007,
        brush_borderColor: "#efefef7F",
        brush_fillColor: "#efefef7F",
      },
    });

    return module;
  }
}

export class Grid_Cell implements Drawable, Observer {
  private parameter: any;
  private grid_scale: Vector;
  private grid_size: Size;
  private grid_coordinate: Coordinate;

  public state: any;
  public uuid: any;
  equals: (other: Grid_Cell) => boolean;

  constructor(parameter: any, grid_coordinate: Coordinate) {
    this.parameter = parameter;
    this.grid_scale = new Vector(parameter.artwork.scale, parameter.artwork.scale);
    this.grid_size = parameter.artwork.canvas.size;
    this.grid_coordinate = grid_coordinate;

    this.state = {
      cell: {
        position: new Vector(0, 0),
        size: new Size(this.grid_size.width * 0.15, this.grid_size.height * 0.15),
        center: new Vector(0, 0)
      }
    };

    this.uuid = uuidv4();
    this.equals = (other: Grid_Cell) => this.uuid === other.uuid;
  }

  animate_slow(source: any) {}

  update(source: any) {
    if (source instanceof Format) this.state.format = source.state.format;
    if (source instanceof ColorSet) this.state.colorset = source.state.colorset;
    if (source instanceof Grid_Manager) {
      this.state.grid = source.state.grid;

      const cols = source.state.grid.cols;
      const rows = source.state.grid.rows;

      const cell_size = new Size(
        this.grid_size.width / cols,
        this.grid_size.height / rows
      );

      this.state.cell.position.x = this.grid_coordinate.col * cell_size.width;
      this.state.cell.position.y = this.grid_coordinate.row * cell_size.height;
      this.state.cell.size.width = cell_size.width;
      this.state.cell.size.height = cell_size.height;
      this.state.cell.size.radius = cell_size.width * 0.5;
      this.state.cell.center.x = this.state.cell.position.x + 0.5 * cell_size.width;
      this.state.cell.center.y = this.state.cell.position.y + 0.5 * cell_size.height;
    }
  }

  draw(context: any, parameter: any) {
    const brush = new Brush(parameter.grid.brush);

    // [FIXED] position, scale_x/y korrekt setzen (Format + Scale)
    const size = Format.transform_size(this.state.cell.size, this.state.format);
    const center = Format.transform_position(this.state.cell.center, this.state.format);
    brush.border = Format.transform(brush.border, this.state.format);

    Shape.draw(context, center, size, brush, true);
  }
}

export class Grid_Painter {
  constructor() {}
  fill_brush(brush: Brush) { return brush; }
  animate_slow(source: any, parameter: any) {}
  draw(context: any, parameter: any) {}
}
