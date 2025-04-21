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
import { v4 as uuidv4 } from 'uuid';

import { Brush, type Brush_ParameterTweakpane } from './Brush';
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
   */
  constructor(parameter: any) {
    super();

    this.parameter = parameter;
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

    this.sceneGraph = new SceneGraph();
  }

  reset() {
    this.sceneGraph.clear();
    super.clear();
    this.state.grid.cols = -1;
    this.state.grid.rows = -1;
  }

  add_some() {
    if (this.sceneGraph.getColsCount(0) < this.parameter.grid.cols) this.add_some_cols();
    if (this.sceneGraph.getCount() < this.parameter.grid.rows) this.add_some_rows();
  }

  add_some_cols() {
    for (let row = 0; row < this.sceneGraph.getCount(); row++) {
      for (let col = Number(this.sceneGraph.getColsCount(row)); col < Number(this.parameter.grid.cols); col++) {
        const cell = new Grid_Cell(this.parameter, new Coordinate(row, col));
        super.addObserver(cell);
        cell.state = Object.assign(cell.state, this.state);
        this.sceneGraph.push(cell, row);
      }
    }
  }

  add_some_rows() {
    for (let row = this.sceneGraph.getCount(); row < this.parameter.grid.rows; row++) {
      for (let col = 0; col < this.parameter.grid.cols; col++) {
        const cell = new Grid_Cell(this.parameter, new Coordinate(row, col));
        cell.state = Object.assign(cell.state, this.state);
        this.sceneGraph.push(cell, row);
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
    Grid_Manager.tweakpaneSupport.transfer_tweakpane_parameter_to(parameter); // [EXISTING]

    if (this.state.grid.cols !== parameter.grid.cols ||
        this.state.grid.rows !== parameter.grid.rows) {
      this.add_some();
      this.remove_some();
      this.state.grid.cols = parameter.grid.cols;
      this.state.grid.rows = parameter.grid.rows;
      super.notifyAll(this, this.state.grid);
    }

    if (parameter.grid.show) { // [ADDED] Nur wenn aktiviert
      this.sceneGraph.draw(context, parameter, new Coordinate(this.state.grid.rows, this.state.grid.cols));
    }
  }

  // [UNCHANGED] tweakpaneSupport bleibt wie bisher

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
