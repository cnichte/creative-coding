/**
 * Title    : Grid
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/Grid.js
 * Version  : 1.0.0
 * Published: https://gitlab.com/glimpse-of-life
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

import { v4 as uuidv4 } from 'uuid';

import { Brush, type Brush_ParameterSet, type Brush_ParameterTweakpane } from './Brush';
import { ColorSet } from './ColorSet';
import type ColorSetType from './ColorSetType';
import { Coordinate } from './Coordinate';
import { Format } from './Format';
import { ObserverSubject, type Observer } from './ObserverPattern';
import { SceneGraph, type Drawable } from './SceneGraph';
import { Shape } from './Shape';
import { Size } from './Size';
import type { Provide_Tweakpane_To_Props, TweakpaneSupport, TweakpaneSupport_Props, Tweakpane_Items } from './TweakpaneSupport';
import { Vector } from './Vector';

export class Grid_Manager extends ObserverSubject {

  check_ObserverSubject(params: any): void {
    throw new Error('Method not implemented.');
  }

  private parameter: any;
  private randomized: any;
  private sceneGraph: SceneGraph;

  public state: any;

  /**
   * Creates a scaled Grid, with cols, rows.
   * The Cell size depends on the Canvas size.
   * 
   * @param {Size} parameter
   */
  constructor(parameter: any) {
    super();

    this.parameter = parameter;

    this.state = {
      grid: {
        cols: -1, // forces the grid to be drawn
        rows: -1
      }
    };

    // Store for randomized stuff.
    this.randomized = {
      fillColor: "#efefefFF", // parameter.grid.fillColor
      borderColor: "000000FF" // parameter.grid.borderColor
    };

    this.sceneGraph = new SceneGraph();
  }

  reset() {
    this.sceneGraph.clear();
    super.clear();
    this.state.grid.cols = -1;
    this.state.grid.rows = -1;
  }



  add_some() {

    if (this.sceneGraph.getColsCount(0) < this.parameter.grid.cols) {
      this.add_some_cols();
    }
    if (this.sceneGraph.getCount() < this.parameter.grid.rows) {
      // Displaying fewer cells is not a problem, since they have already been created and added.
      // More cells have to be added to the SceneGraph and connected to the observers.
      this.add_some_rows();
    }
  }

  /**
   * Add some cells to the Scene Graph.
   * first add some cols to the existing rows - fill them up
   * and then add some full rows.
   *
   * TODO May be we remove some, to free space, if less rows and colums are choosen then before?
   */
  add_some_cols() {

    // first add some cols to the existing rows - fill them up
    for (var count_row = 0; count_row < this.sceneGraph.getCount(); count_row++) {
      // Always look at the SceneGraph.  
      // const test: number | boolean
      for (var count_col = this.sceneGraph.getColsCount(count_row); count_col < this.parameter.grid.cols; (count_col as number)++) {
        let a_cell = new Grid_Cell(this.parameter, new Coordinate(count_row, count_col as number));
        super.addObserver(a_cell); // The cell listens to the GridManager
        // Das Problem: Die neuen Objekte haben das Format etc. noch nicht...
        // Also bekommen sie den aktuellen Stand der Observables rüber kopiert.
        a_cell.state = Object.assign(a_cell.state, this.state);
        this.sceneGraph.push(a_cell, count_row);

        // a_cell.state["colorset"] = {};
        // a_cell.state["colorset"] = Object.assign(a_cell.state.colorset, this.state.colorset);
      }
    }
  }

  /**
   * Add some full rows.
   */
  add_some_rows() {
    for (var count_row = this.sceneGraph.getCount(); count_row < this.parameter.grid.rows; count_row++) {

      for (var count_col = 0; count_col < this.parameter.grid.cols; count_col++) {
        let a_cell = new Grid_Cell(this.parameter, new Coordinate(count_row, count_col));
        a_cell.state = Object.assign(a_cell.state, this.state);
        this.sceneGraph.push(a_cell, count_row);
        super.addObserver(a_cell); // The cell listens to the GridManager
      }
    }
  }

  remove_some() {
    if (this.sceneGraph.getColsCount(0) > this.parameter.grid.cols) {
      this.remove_some_cols();
    }
    if (this.sceneGraph.getCount() > this.parameter.grid.rows) {
      this.remove_some_rows();
    }
  }

  /**
   * Remove some cols from all rows.
   */
  remove_some_cols() {

    let quantity: number = (this.sceneGraph.getColsCount(0) as number) - this.parameter.grid.cols;

    for (var i = 0; i < quantity; i++) {
      let removed: Drawable[] = this.sceneGraph.pop_col(); // always the last column
      super.removeObservers(removed as any);
    }
  }

  /**
   * Remove some Rows (and each col Element)
   */
  remove_some_rows() {

    let quantity = this.sceneGraph.getCount() - this.parameter.grid.rows;

    for (var i = 0; i < quantity; i++) {
      let removed = this.sceneGraph.pop_row(); // always the last row
      super.removeObservers(removed as any);
    }
  }

  /**
   * Is called by the AnimationTimer, for slow animation.
   *
   * @param {Class} source 
   */
  animate_slow(source: any) {
    if (source instanceof ColorSet) {

      // todo: call all scenegraphs > cells Method: animate_slow(source)

      // I assume that all parameters are in place.
      //TODO  make use of this code, or move ist to the cell?
      let cs: ColorSetType | null = null;

      if (this.parameter.colorset !== "") {
        cs = ColorSet.get(this.parameter.colorset).cs_object;
      } else {
        cs = ColorSet.get_random_colorset(); // in the form #FFFFFFFF      
      }
      
      if (cs != null) {
        if ('background' in cs) {
          this.randomized.fillColor = cs.background;
        } else {
          this.randomized.fillColor = ColorSet.get_color_from_colorset(cs);
        }

        if ('stroke' in cs) {
          this.randomized.borderColor = cs.stroke;
        } else {
          this.randomized.borderColor = ColorSet.get_color_from_colorset(cs);
        }

      }


    }
  } // animate_slow

  /**
   * Is called from the ObserverSubject.
   * Grid-Manager listenes to Format changes, ...
   * Notifies all subsequent listeners.
   *
   * @param {Object} source 
   */
  update(source: any) {
    if (source instanceof Format) {
      this.state.format = source.state.format;
      super.notifyAll(this, source); // informiere alle Cells über die Formatänderung!
    }
    if (source instanceof ColorSet) {
      this.state.colorset = source.state.colorset;
      super.notifyAll(this, source); // informiere alle Cells über die Formatänderung!
    }
  }

  /**
   * This is the main draw Method of the grid, which draws the complete grid.
   * It is called by the SceneGraph.
   * 
   * @param {Object} context 
   * @param {Object} parameter 
   */
  draw(context: any, parameter: any) {

    Grid_Manager.tweakpaneSupport.transfer_tweakpane_parameter_to(parameter);

    // update state ans SceneGraph, if col row numbers have changed
    if (this.state.grid.cols != parameter.grid.cols ||
      this.state.grid.rows != parameter.grid.rows) {

      this.add_some(); // if neccessary

      // A strategy to limit the output (and spare som ressources) is, to
      // remove Elements from the SceneGraph, if neccessary:
      this.remove_some();

      this.state.grid.cols = parameter.grid.cols;
      this.state.grid.rows = parameter.grid.rows;

      super.notifyAll(this, this.state.grid); // TODO ??
    }

    // draw - draws all Elements in the SceneGraph
    // A Strategy to limit the output is, to
    // constraine the elements to be drawn to Coordinate(row,col):
    this.sceneGraph.draw(context, parameter, new Coordinate(this.state.grid.rows, this.state.grid.cols));
  }

  public static tweakpaneSupport: TweakpaneSupport = {
    provide_tweakpane_to: function (parameter: any, props: Provide_Tweakpane_To_Props):Tweakpane_Items {

      parameter.tweakpane = Object.assign(parameter.tweakpane, {

        grid_show: true,
        grid_rows: 5,
        grid_cols: 5

      });

      let brush_defaults: Brush_ParameterTweakpane = {
        brush_shape: "Rect",
        brush_position_x: 0.5, // Die initiale Position des Shapes.
        brush_position_y: 0.5,
        brush_scale: 1.0,
        brush_scale_x: 1.0,
        brush_scale_y: 1.0,
        brush_rotate: 0,
        brush_border: 0.0070,
        brush_borderColor: "#efefef7F",
        brush_fillColor: "#efefef7F",
      };

      if (props.items.folder == null) {
        props.items.folder = props.items.pane.addFolder({
          title: 'Grid ',
          expanded: false,
          // view: 'color',
          // alpha: true
        });
      }

      props.items.folder.addBinding(parameter.tweakpane, 'grid_show', {
        label: 'Show',
      });

      props.items.folder.addBinding(parameter.tweakpane, 'grid_cols', {
        label: 'Cols',
        min: 1,
        max: 100,
        step: 1
      });

      props.items.folder.addBinding(parameter.tweakpane, 'grid_rows', {
        label: 'Rows',
        min: 1,
        max: 100,
        step: 1
      });

      props.items.folder.addBlade({
        view: "separator",
      });

      // TODO folder_name_prefix + "Grid:", props.pane, folder, parameter.tweakpane, "grid", [], brush_defaults
      let brush_tp_props: Provide_Tweakpane_To_Props = {
        items:{
          pane: props.items.pane,
          folder: null,
          tab: null
        },
        folder_name_prefix: "Grid ",
        use_separator: false,
        parameterSetName: 'grid',
        excludes: [],
        defaults: brush_defaults,
      };

      Grid_Manager.tweakpaneSupport.inject_parameterset_to(parameter);

      props.items.folder = Brush.tweakpaneSupport.provide_tweakpane_to(parameter, brush_tp_props);

      return props.items;
    },
    inject_parameterset_to: function (parameter: any, props?: TweakpaneSupport_Props | undefined): void {
      return Object.assign(parameter, {
        grid: {
          show: parameter.tweakpane.grid_show, // true
          rows: parameter.tweakpane.grid_rows, // 5
          cols: parameter.tweakpane.grid_cols, // 5
          brush: {
            shape: "Rect",
            angle: 0,
            scale: 1.0,
            border: parameter.tweakpane.cellBorder,
            borderColor: parameter.tweakpane.cellBorderColor,
            fillColor: parameter.tweakpane.cellFillColor
          }
        }
      });
    },
    transfer_tweakpane_parameter_to: function (parameter: any, props?: TweakpaneSupport_Props | undefined): void {
      parameter.grid.show = parameter.tweakpane.grid_show;

      parameter.grid.rows = parameter.tweakpane.grid_rows;
      parameter.grid.cols = parameter.tweakpane.grid_cols;

      parameter.grid.brush.shape = parameter.tweakpane.grid_brush_shape;
      parameter.grid.brush.scale = parameter.tweakpane.grid_brush_scale;
      // parameter.tweakpane.grid_brush_scale_x;
      // parameter.tweakpane.grid_brush_scale_y;
      parameter.grid.brush.angle = parameter.tweakpane.grid_brush_rotate;

      // parameter.tweakpane.grid_brush_position_x;
      // parameter.tweakpane.grid_brush_position_y;

      parameter.grid.brush.border = parameter.artwork.canvas.size.width * parameter.tweakpane.grid_brush_border;
      parameter.grid.brush.fillColor = parameter.tweakpane.grid_brush_fillColor;
      parameter.grid.brush.borderColor = parameter.tweakpane.grid_brush_borderColor;
    }
  }
} // class Manager


/**
 * Our Cell, a sort of Mini-Canvas.
 * Multiple Cells are arranged in a Grid.
 * Each Cell is accessible through a Col- and Row-Index.
 * Each Cell has its own lifecycle.
 */
export class Grid_Cell implements Drawable, Observer {

  private parameter: any;
  private grid_scale: Vector;
  private grid_size: Size;
  private grid_coordinate: Coordinate;

  public state: any;
  public uuid: any;
  equals: (other: Grid_Cell) => boolean;

  /**
   * Contructs a GridCell.
   * 
   * @param {Object} parameter - the Cell parameters
   * @param {Coordinate} grid_coordinate - the Cell coordinate in grid
   */
  constructor(parameter: any, grid_coordinate: Coordinate) {

    this.parameter = parameter;

    // TODO: Scale the grid as whole
    this.grid_scale = new Vector(parameter.artwork.scale, parameter.artwork.scale);

    // parameter.format.left_top
    this.grid_size = parameter.artwork.canvas.size; // TODO: Das muss aus dem Format kommen: parameter.format.size ?
    this.grid_coordinate = grid_coordinate; // The coordinate in grid

    // The Calculated Properties
    // This is the Cells absolute Position in the Canvas. 
    this.state = {
      // colorset:{}
      // format:{},
      // grid: {},
      cell: {
        position: new Vector(0, 0),
        size: new Size(parameter.artwork.canvas.size.width * 0.15, parameter.artwork.canvas.size.height * 0.15),
        center: new Vector(0, 0),
      }
    };

    // To make each element uniquely identifiable I use a uuid,
    // and a corresponding equals method.
    this.uuid = uuidv4();

    this.equals = function (other: Grid_Cell) {
      return this.uuid == other.uuid;
    };
  } // class Cell constructor


  /**
   * Is called by the AnimationTimer, for slow animation.
   *
   * @param {Class} source 
   */
  animate_slow(source: any) {
    if (source instanceof ColorSet) {


    }
  } // class Cell animate_slow

  /**
   * Is called from the ObserverSubject.
   * 
   * 1. Cell listens to changes from Grid.Manager.
   * 2. Cell listenes to other cells.
   *   
   * @param {Object} source 
   */
  update(source: any) {
    if (source instanceof Format) {
      this.state.format = source.state.format;
    }

    if (source instanceof ColorSet) {
      this.state.colorset = source.state.colorset;
    }

    if (source instanceof Grid_Manager) {
      this.state.grid = source.state.grid;

      // Neue Koordinaten übernehmen und position berechnen
      let cols = source.state.grid.cols;
      let rows = source.state.grid.rows;

      // Size of the cell
      // TODO grid_size kann sich durchs format geändert haben... ?? 
      let cell_size = new Size(
        this.grid_size.width / cols,
        this.grid_size.height / rows
      );

      // Position to which the cell is drawn, taking into account the gap.
      this.state.cell.position.x = this.grid_coordinate.col * cell_size.width; // + 0.5 * this.cellSize.width * this.parameter.cell.gap
      this.state.cell.position.y = this.grid_coordinate.row * cell_size.height; // + 0.5 * this.cellSize.height * this.parameter.cell.gap;

      // Size of the cell, taking into account the gap.
      this.state.cell.size.width = cell_size.width; // - this.cellSize.width * parameter.cell.gap;
      this.state.cell.size.height = cell_size.height; // - this.cellSize.height * parameter.cell.gap;
      this.state.cell.size.radius = this.state.cell.size.width * 0.5;

      // Position of Center
      this.state.cell.center.x = this.state.cell.position.x + 0.5 * this.state.cell.size.width;
      this.state.cell.center.y = this.state.cell.position.y + 0.5 * this.state.cell.size.height;
    }
  }

  /**
   * Draws the actual content of the cell into the cell.
   * Is called by the SceneGraph.
   */
  draw(context: any, parameter: any) {

    let brush = new Brush(parameter.grid.brush);

    // Format-Transformation

    if (typeof this.state.format !== 'undefined') {

      let size = Format.transform_size(this.state.cell.size, this.state.format);
      let position = Format.transform_position(this.state.cell.center, this.state.format);
      brush.border = Format.transform(brush.border, this.state.format);
      Shape.draw(context, position, size, brush, true);

    } else {
      Shape.draw(context, this.state.cell.center, this.state.cell.size, brush, true);
    }


    // let left_top = new Vector(this.state.cell.position.x, this.state.cell.position.y);
    // Shape.draw(context, left_top, this.state.cell.size, new Brush(parameter.grid.brush), false);


  } // class Cell draw

} // class Grid_Cell

/**
 * Paints something onto the Grid.
 * This class is to take care of the accents...
 *
 */
export class Grid_Painter {
  constructor() { }
  fill_brush(brush: Brush) {
    return brush;
  }
  animate_slow(source: any, parameter: any) { }
  draw(context: any, parameter: any) { }
}; // class Painter 


// used so:
// Grid_Manager
// Grid_Painter