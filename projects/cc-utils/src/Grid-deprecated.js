/**
 * Title    : Grid
 * Project  : Creative Coding
 * File     : projects/cc-utils/Grid.js
 * Version  : 1.0.0
 * Published: https://gitlab.com/glimpse-of-life
 *
 * These are little canvases arranged in a Grid.
 * All the Shapes could be drawn on this Grid.
 * And all the basic Operations like scale and rotate could be performed.
 * 
 * We have three Classes here:
 *
 *  - Manager - Manages the Grid
 *  - Cell - Represents the Cells in the Grid
 *  - GridPainter - Draws something onto the Grid. 
 *
 * 
 * TODO Parameter Object beschreiben. 
 * 
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

const Color = require('canvas-sketch-util/color');
const random = require('canvas-sketch-util/random');

let Animation = require('./Animation.js');
let Brush = require('./Brush.js');
let Characters = require('./Characters.js');
let Coordinate = require('./Coordinate.js');
let ColorSet = require('./ColorSet.js');
let Pattern = require('./Pattern.js');
let SceneGraph = require('./SceneGraph.js');
let Size = require('./Size.js');
let Shape = require('./Shape.js');
let Vector = require('./Vector.js');

class Manager extends Pattern.ObserverSubject {

  /**
   * Creates a scaled Grid, with cols, rows.
   * The Cell size depends on the Canvas size.
   * 
   * @param {Size} canvasSize
   */
  constructor(canvasSize, cols, rows, scale) {
    super();

    this.canvasSize = canvasSize;
    this.animationTimer = new AnimationTimer();

    // The Index
    // TODO Do i really need all that below...?
    this.cols = cols; // parameter.grid.cols;
    this.rows = rows; // parameter.grid.rows;
    this.allCells = this.cols * this.rows;
    // TODO Do i really need all that above...?


    // TODO: This SceneGraph is not connected to to the other/global graph - but should?
    // TODO... add all the stuff to the global scenegraph, and do not use your own
    // Die Aufgabe könnte sein, einen Scenegraph zu einem Scenegraph hinzu zu fügen.

    this.sceneGraph = new SceneGraph(); // The 2D Array that forms the Grid

    // We remember the last values to detect changes, after update
    this.last = {
      artwork: {
        scale: 1
      },
      grid: {
        scale: 1
      },
      cell: {
        gap: 0
      }
    };

    // Store for randomized stuff.
    this.randomized = {
      fillColor: "#efefefFF", // parameter.grid.fillColor
      borderColor: "000000FF" // parameter.grid.borderColor
    };

    // Scale-Factor (0.1 -> 1)
    // parameter.grid.scale
    this.gridSizeScaled = new Size(
      this.canvasSize.width * scale,
      this.canvasSize.height * scale
    );

    this.state = {
      gridmanager: {
        // Center the Grid on the Canvas
        margin: new Vector((this.canvasSize.width - this.gridSizeScaled.width) * 0.5, (this.canvasSize.height - this.gridSizeScaled.height) * 0.5)
      }
    };

    // The Grid Components Center on the Canvas.
    this.center = new Vector(
      this.state.gridmanager.margin.x + this.gridSizeScaled.width * 0.5,
      this.state.gridmanager.margin.y + this.gridSizeScaled.height * 0.5);


    super.notifyAll(this);

  }




  /**
   * 
   * @param {Brush} brush 
   * @param {Cell} cell 
   * @param {Object} parameter
   * @returns Brush
   */
  fill_grid_brush(brush, cell, parameter) {

    brush.shape = parameter.grid.shape;
    brush.scale = 1.0; // parameter.grid.scale; // new Vector(paramsTP.shapeScaleFactor_x, paramsTP.shapeScaleFactor_y);
    brush.angle = 0.0;
    brush.border = parameter.grid.border * cell.cellSize.width; // context.lineWidth 

    if (parameter.canvas.colorMode === "custom") {
      brush.fillColor = parameter.grid.fillColor; // context.fillStyle
      brush.borderColor = parameter.grid.borderColor; // context.strokeStyle
    } else {
      // random
      brush.fillColor = this.randomized.fillColor; // context.fillStyle
      brush.borderColor = this.randomized.borderColor; // context.strokeStyle
    }

    brush.fillColorAlpha = Color.parse(parameter.grid.fillColor).alpha;
    brush.borderColorAlpha = Color.parse(parameter.grid.borderColor).alpha;

    return brush;
  }


  /**
   * Not used so far.
   *
   * @param {Brush} brush 
   * @returns Brush
   */
  fill_cell_brush(brush) {

    return brush;
  }

  /**
   * Draw the Grid-Lines.
   * Because the Grid the Base of the generated Artworks.
   * 
   * Draws the grid-lines not from vertical and horizontal lines,
   * but from squares!
   * 
   * The GridLines are only for testing purpose, 
   * but can also work as an additional Layer in our Artwork.
   * 
   * @param {Object} context 
   * @param {Coordinate} coordinate
   * @param {Object} parameter {canvasRotate, canvasColorSet, gridFillColor, gridBorderColor, gridBorder}
   */
  drawGrid_SingleCell(context, coordinate, parameter) {

    const cell = this.sceneGraph.get(coordinate);

    const x = this.state.gridmanager.margin.x + coordinate.col * cell.cellSize.width; // TODO TypeError: undefined is not an object (evaluating 'cell.cellSize')
    const y = this.state.gridmanager.margin.y + coordinate.row * cell.cellSize.height;
    const w = cell.cellSize.width;
    const h = cell.cellSize.height;

    const position = new Vector(x, y);
    const size = new Size(w, h);

    let brush = this.fill_grid_brush(new Brush(), cell, parameter);

    // context, position, size, brush, do_center
    Shape.draw(context, position, size, brush, false);
  }
  /**
   * Draws the Grid in Complete, before drawing the rest.
   * So,its not drawn in the main loop, like before in Version 1.6.2.
   *
   * @param {Object} context 
   * @param {Object} parameter 
   */
  drawGrid_Complete(context, parameter) {

    for (let i = 0; i < this.allCells; i++) {
      const col = i % this.cols; //  TODO parameter.grid.cols TODO this.cols probieren (wird ja eh übergeben)
      const row = Math.floor(i / this.cols); // TODO this.cols probieren (wird ja eh übergeben)

      let coordinate = new Coordinate(row, col);

      if (parameter.grid.show) {
        this.drawGrid_SingleCell(context, coordinate, parameter);
      }

    }
  }


  /**
   * This is the main draw Method of the grid, which draws the complete grid.
   * Is called by the SceneGraph.
   * 
   * {gridRotate, gridShow, cellShow} ++
   * animation.timer - {time:0.002 ,deltaTime:0.2 ,do_animate:true,global_animation_halt:false, speedFactor:0.01}
   * 
   * @param {Object} context 
   * @param {Object} parameter 
   */
  draw(context, parameter) {

    let parameter_at = parameter.grid.animation.timer;

    let updated = false;

    //? so, this - the detection of chances, that force a recalulation - needs an eleganter solution?
    // where only the parts that have changed are redrawn.

    // Scale the complete Grid thing!
    // We start with 1.0
    if (this.last.artwork.scale !== parameter.artwork.scale ||
      this.last.grid.scale !== parameter.grid.scale) {

      // cv means changed-values
      // scale, size, position, re_position = false
      let cv = Shape.scale(parameter.artwork.scale * parameter.grid.scale, this.canvasSize, this.center, true);

      if (!this.gridSizeScaled.equals(cv.size)) {

        this.gridSizeScaled = cv.size;
        this.state.gridmanager.margin = cv.position;

        super.notifyAll(this);

        updated = true;

        this.last.artwork.scale = parameter.canvas.scale;
        this.last.grid.scale = parameter.grid.scale;

      }
    }

    // gap has changed - force recaluclation 
    if (this.last.cell.gap !== parameter.cell.gap) {
      updated = true;
      this.last.cell.gap = parameter.cell.gap;
    }

    // update fast and realtime things. 
    // || should prevent previous updated state.
    // updated = updated || this.add_or_remove_cells_fom_grid(parameter);
    this.add_or_remove_cells_fom_grid(parameter); //! TEST

    // update slow things.
    if (parameter_at !== undefined) {
      // calls the animation method of this, after a period of time.

      this.animationTimer.check_timer(
        parameter_at.time,
        parameter_at.deltaTime,
        parameter_at.do_animate,
        parameter_at.global_animation_halt,
        parameter_at.speedFactor,
        parameter);

      /*
            this.animationTimer.animate_slow(
              parameter_at.time,
              parameter_at.deltaTime,
              parameter_at.do_animate,
              parameter_at.global_animation_halt,
              parameter_at.speedFactor, [this], parameter);

      */
    }

    // I want to be able to rotate the grid independently. 
    if (parameter.grid.show) {
      Shape.rotate(context, parameter.grid.rotate + parameter.canvas.rotate, this.center);
      this.drawGrid_Complete(context, parameter);
      Shape.rotate(context, -parameter.grid.rotate - parameter.canvas.rotate, this.center);
    }

    // rotate the whole thing
    Shape.rotate(context, parameter.canvas.rotate, this.center);

    // Choose one Cell on the Grid.
    // Draw Cell and the Content
    // Use all cells.
    for (let i = 0; i < this.allCells; i++) {

      // Modulo (Residual value from the division)
      const col = i % this.cols; // parameter.grid.cols
      // 0 % 3 = 0
      // 1 % 3 = 1
      // 2 % 3 = 2
      // 3 % 3 = 0
      // 4 % 3 = 1
      // 5 % 3 = 2
      // 6 % 3 = 0
      // ...

      // round down
      const row = Math.floor(i / this.cols);
      // floor(0 / 3) = 0
      // floor(1 / 3) = 0
      // floor(2 / 3) = 0
      // floor(3 / 3) = 1
      // floor(4 / 3) = 1
      // floor(5 / 3) = 1
      // floor(6 / 3) = 2
      // floor(7 / 3) = 2
      // floor(8 / 3) = 2
      // floor(9 / 3) = 3
      // ...

      let coordinate = new Coordinate(row, col);
      let cell = this.sceneGraph.get(coordinate); // TODO das sollte später nicht mehr nötig sein

      // recalculate only if changed durig update
      // cols, rows, gridSize, coordinate
      if (updated) cell.animate_fast(this.cols, this.rows, this.gridSizeScaled, coordinate, parameter);

      //* Draw the Grid-Lines (the old style)
      // Thats the Base of the generated Artworks
      // All Stuff ist aligned in this Grid
      // if (parameter.grid.show) {
      //   this.drawGrid_SingleCell(context, coordinate, parameter);
      // }

      // This is a Cell inside the Grid
      // The location on the Canvas depends on the choosen col, and row 

      // TODO this drawing methods also should be performed by the scene graph!?
      if (parameter.cell.show) {
        cell.drawCell(context, parameter, parameter_at);
      }

      // CellContent
      // context, brush, parameter, animationTimer
      cell.draw(context, undefined, parameter, parameter_at);

    } // for
  }

  /**
   * Checks if the number of rows or columns of the grid have changed.
   * This method adds or removes cells, if necessary.
   *
   * @param {Object} parameter 
   * @returns boolean - true, if something is updated, false if not
   */
  add_or_remove_cells_fom_grid(parameter) {

    let updated = false;

    this.cols = parameter.grid.cols;
    this.rows = parameter.grid.rows;
    this.allCells = this.cols * this.rows;

    let rows_length_soll = parameter.grid.rows;
    let columns_length_soll = parameter.grid.cols;

    let rows_length_ist = 0; // only applies at the start.
    let columns_length_ist = this.cols; // only applies at the start.
    // Assuming there are already cells, I go by the actual size of the array
    if (this.sceneGraph.getCount() > 0) {
      rows_length_ist = this.sceneGraph.getCount();
      columns_length_ist = this.sceneGraph.getColsCount();
    }

    //* 1. Frage: gibt es was zu löschen?

    if (rows_length_ist > rows_length_soll) {
      // remove anz rows
      let anz_rows = rows_length_ist - rows_length_soll;
      for (var count = 0; count < anz_rows; count++) {
        // TODO super.removeObserver(...)
        this.sceneGraph.pop();
      }
      updated = true;
      rows_length_ist = this.sceneGraph.getCount();
    }

    if (columns_length_soll < columns_length_ist) {
      // remove columns from all rows
      let anz_cols = columns_length_ist - columns_length_soll;

      for (var row_index = 0; row_index < rows_length_ist; row_index++) {
        for (var count = 0; count < anz_cols; count++) {
          // TODO super.removeObserver(...)
          this.sceneGraph.pop(row_index);
        }
      }

      updated = true;
      columns_length_ist = this.sceneGraph.getColsCount();
    }

    //* Frage 2 - gibt es was hinzu zu fügen.

    if (rows_length_ist < rows_length_soll) {

      //* Add anz rows
      // wir bauen komplett neue Zeilen
      let anz_rows = rows_length_soll - rows_length_ist;

      for (var count_row = 0; count_row < anz_rows; count_row++) {
        // check each colums
        // wieviel Spalten muss die Zeile haben?
        for (var col = 0; col < columns_length_soll; col++) {
          // a row is build from columns
          let a_cell = new Cell(this.cols, this.rows, this.gridSizeScaled, parameter);
          this.sceneGraph.push(a_cell, count_row);

          // TODO Zellen sollen aufeinander hören...
          // Das brauch ich im Moment nicht, ist aber für Particles interessant 
          // super.observers.forEach(function (item) {
          //        item.addObserver(a_cell);            
          // });

          // Die Zelle hört auf den GridManager
          super.addObserver(a_cell);
        }
      }

      updated = true;
      rows_length_ist = this.sceneGraph.getCount();
    }

    if (columns_length_ist < columns_length_soll) {
      //* add columns_length_soll
      let anz_cols = columns_length_soll - columns_length_ist;

      for (var row_index = 0; row_index < rows_length_ist; row_index++) {

        for (var count = 0; count < anz_cols; count++) {
          let a_cell = new Cell(this.cols, this.rows, this.gridSizeScaled, parameter);
          this.sceneGraph.push(a_cell, row_index);
          super.addObserver(a_cell);
        }

      }
      updated = true;
    }

    return updated;
  }

  /**
   * Is called by the AnimationTimer, for slow animation.
   *
   * @param {Object} parameter 
   */
  animate_slow(source, parameter) {

    // I assume that all parameters are in place.

    let cs = null;

    if (parameter.canvas.colorSet !== "") {
      cs = ColorSet.getFirst(parameter.canvas.colorSet);
    } else {
      cs = ColorSet.get_random_colorset(); // in the form #FFFFFFFF      
    }

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


  /**
   * Reset all the AnimationTimers in the Artwork.
   */
  animationTimerReset() {

    this.animationTimer.reset();

    let cells = this.sceneGraph.get();

    if (Array.isArray(cells) && cells.length > 0) {
      for (let i = 0; i < cells.length; i++) {
        let row = cells[i];
        if (Array.isArray(row) && row.length > 0) {
          for (let j = 0; j < row.length; j++) {
            // TODO Prüfe ob Methode da
            row[j].animationTimer.reset();
          }
        }
      }
    }

  }

} // class TheGrid


/**
 * Our Cell, a sort of Mini-Canvas.
 * Multiple Cells are arranged in a Grid.
 * Each Cell is accessible through a Col- and Row-Index.
 * Each Cell has its own lifecycle.
 *
 * TODO: Cell visible Property.
 */
class Cell extends Pattern.ObserverSubject {

  /**
   * Contructs a GridAgent Cell.
   *  
   * @param {number} cols 
   * @param {number} rows 
   * @param {Size} gridSize 
   * @param {Object} parameter - the Cell parameters
   */
  constructor(cols, rows, gridSize, parameter) {
    super();

    this.gridSize = gridSize;

    // Größe der Zelle 
    this.cellSize = new Size(
      gridSize.width / cols,
      gridSize.height / rows
    );

    // The Calculated Properties
    // This is the Cells absolute Position in the Canvas. 
    this.position = new Vector(0, 0);
    this.size = new Size(0, 0);
    this.center = new Vector(0, 0);

    this.coordinate = new Coordinate(0, 0);

    // The margin of the Grid. 
    this.state_grid_margin = new Vector(0, 0);

    this.animationTimer = new AnimationTimer();

    this.randomized = {
      cell: {
        fillColor: parameter.grid.fillColor,
        borderColor: parameter.grid.borderColor
      },
      cell_content: {
        fillColor: parameter.grid.fillColor,
        borderColor: parameter.grid.borderColor,
        text: {
          content: "Y"
        }
      }
    };

    // I want the brushes to be saved with the property.
    this.cell_brush = null;
    this.cell_content_brush = null;

    // TODO: AnimationTimer für Text
    this.animationTimer2 = new AnimationTimer();

    this.state = {
      cell: {
        center: this.center
      }
    };

  } // class Cell constructor

  /**
   * Calculates the Position and Boundaries of a single Cell in the Canvas, 
   * dependent on the Column- and the Row-Index.
   * 
   * TODO: Wird im Grid aufgerufen. Das kann aber in die draw methode der cell wandern?!
   *
   * @param {Coordinate} coordinate
   */
  animate_fast(cols, rows, gridSize, coordinate, parameter) {
    this.cols = cols;
    this.rows = rows;

    this.gridSize = gridSize;

    // Size of the cell
    this.cellSize = new Size(
      this.gridSize.width / cols,
      this.gridSize.height / rows
    );

    // The coordinate in grid
    this.coordinate.col = coordinate.col;
    this.coordinate.row = coordinate.row;

    // Position to which the cell is drawn, taking into account the gap.
    this.position.x = this.coordinate.col * this.cellSize.width + 0.5 * this.cellSize.width * parameter.cell.gap;
    this.position.y = this.coordinate.row * this.cellSize.height + 0.5 * this.cellSize.height * parameter.cell.gap;

    // Size of the cell, taking into account the gap.
    this.size.width = this.cellSize.width - this.cellSize.width * parameter.cell.gap;
    this.size.height = this.cellSize.height - this.cellSize.height * parameter.cell.gap;
    this.size.radius = this.size.width * 0.5;

    // Position of Center
    this.center.x = this.position.x + 0.5 * this.size.width;
    this.center.y = this.position.y + 0.5 * this.size.height;

  } // class Cell animate_fast

  /**
   * Get new Coordinates... for this Cell.
   * TODO: Do not generate duplicates
   * TODO: rename this update?
   * ! Not Used
   * 
   * @param {number} cols 
   * @param {number} rows 
   */
  randomize(cols, rows) {
    this.coordinate.col = Math.floor(random.range(cols));
    this.coordinate.row = Math.floor(random.range(rows));

    // cols, rows, gridSize, coordinate
    // this.animate_fast(this.coordinate);

  } // class Cell randomize


  /**
   * Is called by the AnimationTimer, for slow animation.
   * @param {Object} parameter 
   */
  animate_slow(source, parameter) {

    let cs = null;

    if (parameter.canvas.colorSet !== "") {
      cs = ColorSet.getFirst(parameter.canvas.colorSet);
    } else {
      cs = ColorSet.get_random_colorset(); // in the form #FFFFFFFF      
    }


    if ('background' in cs) {
      this.randomized.cell.fillColor = cs.background;
      this.randomized.cell_content.fillColor = cs.background;
    } else {
      this.randomized.cell.fillColor = ColorSet.get_color_from_colorset(cs);
      this.randomized.cell_content.fillColor = ColorSet.get_color_from_colorset(cs);
    }

    if ('stroke' in cs) {
      this.randomized.cell.borderColor = cs.stroke;
      this.randomized.cell_content.borderColor = cs.stroke;
    } else {
      this.randomized.cell.borderColor = ColorSet.get_color_from_colorset(cs);
      this.randomized.cell_content.borderColor = ColorSet.get_color_from_colorset(cs);
    }

    //* pick a random character
    // TODO Auslagern in eigenen AnimationTimer
    if (parameter.cell_content.textMode === "customRandom") {

      //* pick from manual field.
      let text_arr = parameter.cell_content.text.split('');
      this.randomized.cell_content.text.content = random.pick(text_arr);

    } else if (parameter.cell_content.textMode === "templateRandom") {

      //* pick from template
      this.randomized.cell_content.text.content = Characters.choose_from_template_name(parameter.cell_content.textTemplate);
      // let text_arr = parameter.cell_content.textTemplates[parameter.cell_content.textTemplate].split('');
      // this.randomized.cell_content.text.content = random.pick(text_arr);

    }

  } // class Cell animate_slow

  /**
   * 
   * @param {Brush} brush 
   * @param {Object} parameter 
   * @returns Brush
   */
  fill_cell_brush(brush, parameter) {

    brush.shape = parameter.cell.shape;
    brush.scale = parameter.cell.scale; // new Vector(paramsTP.shapeScaleFactor_x, paramsTP.shapeScaleFactor_y);
    brush.angle = parameter.cell.rotate;

    brush.border = parameter.cell.border * this.size.width; // context.lineWidth 

    if (parameter.canvas.colorMode === "custom") {
      brush.fillColor = parameter.cell.fillColor; // context.fillStyle
      brush.borderColor = parameter.cell.borderColor; // context.strokeStyle
    } else {
      // random
      brush.fillColor = this.randomized.cell.fillColor; // context.fillStyle
      brush.borderColor = this.randomized.cell.borderColor; // context.strokeStyle
    }

    brush.fillColorAlpha = Color.parse(parameter.cell.fillColor).alpha;
    brush.borderColorAlpha = Color.parse(parameter.cell.borderColor).alpha;

    this.cell_brush = brush;

    return brush;

  } // class Cell fill_cell_brush

  /**
   * 
   * @param {Brush} brush 
   * @param {Object} parameter 
   * @returns Brush
   */
  fill_cell_content_brush(brush, parameter) {

    brush.shape = parameter.cell_content.shape;
    brush.scale = parameter.cell_content.scale;
    brush.angle = parameter.cell_content.rotate;

    brush.border = parameter.cell_content.border * this.size.width;

    if (parameter.canvas.colorMode === "custom") {
      brush.fillColor = parameter.cell_content.fillColor;
      brush.borderColor = parameter.cell_content.borderColor;

    } else {
      brush.fillColor = this.randomized.cell_content.fillColor;
      brush.borderColor = this.randomized.cell_content.borderColor;
    }

    brush.fillColorAlpha = Color.parse(parameter.cell_content.fillColor).alpha;
    brush.borderColorAlpha = Color.parse(parameter.cell_content.borderColor).alpha;


    // nothing, customPick, customRandom, templatePick, templateRandom
    if (parameter.cell_content.textMode === "customPick") {
      //* A manual or random pick
      // Split text into individual characters, and pick first
      let text_arr = parameter.cell_content.text.split('');
      let i = (parameter.cell_content.textChoose < text_arr.length ? parameter.cell_content.textChoose : text_arr.length - 1);
      brush.text.content = text_arr[i];

    } else if (parameter.cell_content.textMode === "customRandom") {
      // see AnimationTimer -> animate method
      brush.text.content = this.randomized.cell_content.text.content;
      // brush.text.fontSize = 50;
      // brush.text.fontFamily:"serif";


    } else if (parameter.cell_content.textMode === "nothing") {
      // nothing
      brush.text.content = "";

    } else if (parameter.cell_content.textMode === "templatePick") {

      // any of the templates
      brush.text.content = Characters.choose_from_template_name(parameter.cell_content.textTemplate);
      // let text_arr = parameter.cell_content.textTemplates[parameter.cell_content.textTemplate].split('');
      // let i = (parameter.cell_content.textChoose < text_arr.length ? parameter.cell_content.textChoose : text_arr.length - 1);
      // brush.text.content = text_arr[i];

    } else if (parameter.cell_content.textMode === "templateRandom") {
      brush.text.content = this.randomized.cell_content.text.content;
    }

    this.cell_content_brush = brush;

    return brush;

  } // class Cell fill_cell_content_brush

  /**
   * Is called from the ObserverSubject.
   * 
   * 1. Cell listenens to changes from Grid.Manager.
   * 2. Cell listenes to other cells.
   *   
   * @param {Object} source 
   */
  update(source) {
    if (source instanceof Manager) {
      this.state.gridmanager = source.state;
      this.state_grid_margin = source.state.gridmanager.margin;
      // TODO neue Koordinaten übernehmen und position berechnen
    }
  }


  /**
   * Draws the Mini-Cell Canvas.
   * This is usefull to check the Position and Boundaries, 
   * but also an additional feature for creative stuff
   * 
   * @param {Object} context 
   * @param {Object} parameter
   */
  drawCell(context, parameter) {

    // Draw the Cell with Gap (is done in animate_fast)
    // The Gap is a Factor between 0 und 0.5 (50%)

    let brush = this.fill_cell_brush(new Brush(), parameter);

    let position_new = new Vector(
      this.position.x + this.state_grid_margin.x,
      this.position.y + this.state_grid_margin.y
    );

    // context, position, size, brush, do_center
    Shape.draw(context, position_new, this.size, brush, false);

  } // class Cell drawCell

  /**
   * Draws the actual content of the cell into the cell.
   ** Das ist die hauptächliche draw Methode...
   * 
   * TODO: Darf nur die Parameter haben: context, parameter
   * der Rest muss aus parameter kommen.
   *
   * @param {Object} context 
   * @param {Brush} brush
   * @param {Object} parameter
   * @param {Object} animationTimer
   */
  draw(context, brush, parameter, animationTimer) { //  parameter.cell_content.textMode

    let margin = this.state_grid_margin;

    if (brush === undefined) {
      brush = this.fill_cell_content_brush(new Brush(), parameter);
    }

    if (animationTimer !== undefined) {
      // calls the animation method of this, after a period of time.
      this.animationTimer.check_timer(
        parameter.grid.animation.timer.time,
        parameter.grid.animation.timer.deltaTime,
        parameter.grid.animation.timer.do_animate,
        parameter.grid.animation.timer.global_animation_halt,
        parameter.grid.animation.timer.speedFactor,
        parameter);
      /*
            this.animationTimer.animate_slow(
              animationTimer.time,
              animationTimer.deltaTime,
              animationTimer.do_animate,
              animationTimer.global_animation_halt,
              animationTimer.speedFactor, [this], parameter);
      */
    }

    // this.position.x = this.position.x + margin.x;
    // this.position.y = this.position.y + margin.y;
    //* bis zu dieser Stelle ist es gleich mit drawCell()
    //* Ich will aber das der Inhalt zentriert dargestellt wird.

    // Scale it from the center
    const size = new Size(this.size.width * brush.scale, this.size.height * brush.scale);
    const position = new Vector(margin.x + this.position.x + 0.5 * this.size.width, margin.y + this.position.y + 0.5 * this.size.height);

    // Scale is a factor from 0.1 up to 5 (1% > 500%)
    size.radius = this.size.width * 0.5 * brush.scale;

    // context, position, size, brush, do_center
    Shape.draw(context, position, size, brush, true);

  } // class Cell draw

} // class Cell




/**
 * Fills a ParamterSet into the Parameter-Object.
 *
 * @param {Object} parameter 
 * @param {Object} parameter_tweakpane 
 *
 * @returns 
 */
Manager.inject_parameterset_to = function (parameter, parameter_tweakpane) {
  return Object.assign(parameter, {
    grid: {
      show: parameter_tweakpane.gridShow, // true

      shape: "Rect", // These are fix
      scale: 1.0,
      angle: 0,

      rows: parameter_tweakpane.gridRows, // 5
      cols: parameter_tweakpane.gridCols, // 5

      scale: parameter_tweakpane.gridScale, // 1.00
      rotate: parameter_tweakpane.gridRotate, // 0

      border: parameter_tweakpane.gridBorder, // 0.003
      fillColor: parameter_tweakpane.gridFillColor, // '#ffffff00'
      borderColor: parameter_tweakpane.gridBorderColor, // '#2a27ebff'

      animation: {
        timer: undefined
      }
    },
    cell: {
      show: parameter_tweakpane.cellShow, // false
      shape: "Rect",
      scale: 1.0,
      gap: parameter_tweakpane.cellGap, // 0.326
      rotate: parameter_tweakpane.cellRotate, // 0

      colorSet: "",
      border: parameter_tweakpane.cellBorder, // 0.011
      fillColor: parameter_tweakpane.cellFillColor, // '#ffffffff'
      borderColor: parameter_tweakpane.cellBorderColor, // '#000000ff'
      text: "", // noch nicht
    },
    cell_content: {
      shape: parameter_tweakpane.cellContentShape, // 'Rect

      scale: parameter_tweakpane.cellContentScale, // 0.686
      rotate: parameter_tweakpane.cellContentRotate, // 0

      border: parameter_tweakpane.cellContentBorder, // 0.022
      fillColor: parameter_tweakpane.cellContentFillColor, // '#ffffffff'
      borderColor: parameter_tweakpane.cellContentBorderColor, // '#000000ff'

      textMode: parameter_tweakpane.cellContentTextMode, // random, nothing, custom
      textTemplate: parameter_tweakpane.cellContentTextTemplate, // choosen Template
      textTemplates: Characters.SetTemplates, // TODO das brauch ich hier nicht mehr....
      text: parameter_tweakpane.cellContentText, // "✻♬☀☁㋡㋛➊░☷㊊㊟"
      textChoose: parameter_tweakpane.cellContentTextChoose, // 0...x
      textAnimate: parameter_tweakpane.cellContentTextAnimate, // true, false
      textAnimateSpeedFactor: parameter_tweakpane.cellContentTextAnimateSpeedFactor // 200
    }
  });
}

/**
 * Swaps Parameter from Tweakpane-ParameterSet to Modules-ParameterSet.
 *
 * @param {Object} parameter 
 */
Manager.transfer_tweakpane_parameter_to = function (parameter) {

  parameter.grid.show = parameter.tweakpane.gridShow;
  parameter.grid.rows = parameter.tweakpane.gridRows;
  parameter.grid.cols = parameter.tweakpane.gridCols;
  parameter.grid.scale = parameter.tweakpane.gridScale;
  parameter.grid.rotate = parameter.tweakpane.gridRotate;
  parameter.grid.border = parameter.tweakpane.gridBorder;
  parameter.grid.fillColor = parameter.tweakpane.gridFillColor;
  parameter.grid.borderColor = parameter.tweakpane.gridBorderColor;

  parameter.cell.show = parameter.tweakpane.cellShow;
  parameter.cell.gap = parameter.tweakpane.cellGap;
  parameter.cell.rotate = parameter.tweakpane.cellRotate;
  parameter.cell.border = parameter.tweakpane.cellBorder;
  parameter.cell.fillColor = parameter.tweakpane.cellFillColor;
  parameter.cell.borderColor = parameter.tweakpane.cellBorderColor;

  parameter.cell_content.shape = parameter.tweakpane.cellContentShape;
  parameter.cell_content.scale = parameter.tweakpane.cellContentScale;
  parameter.cell_content.rotate = parameter.tweakpane.cellContentRotate;
  parameter.cell_content.border = parameter.tweakpane.cellContentBorder;
  parameter.cell_content.fillColor = parameter.tweakpane.cellContentFillColor;
  parameter.cell_content.borderColor = parameter.tweakpane.cellContentBorderColor;
  parameter.cell_content.textMode = parameter.tweakpane.cellContentTextMode; // random, nothing, custom
  parameter.cell_content.textTemplate = parameter.tweakpane.cellContentTextTemplate; // choosen Template
  parameter.cell_content.text = parameter.tweakpane.cellContentText; // "✻♬☀☁㋡㋛➊░☷㊊㊟"
  parameter.cell_content.textChoose = parameter.tweakpane.cellContentTextChoose; // 0...x
  parameter.cell_content.textAnimate = parameter.tweakpane.cellContentTextAnimate; // true, false
  parameter.cell_content.textAnimateSpeedFactor = parameter.tweakpane.cellContentTextAnimateSpeedFactor;

}


Manager.provide_tweakpane_to = function (folder_name_prefix = "", pane, parameter_tweakpane) {

  parameter_tweakpane = Object.assign(parameter_tweakpane, {

    gridShow: true,
    gridBorder: 0.003,
    gridRows: 5,
    gridCols: 5,

    gridScale: 1.00,
    gridRotate: 0,
    gridFillColor: '#efefef00',
    gridBorderColor: '#2a27ebff',

    cellShow: true,
    cellBorder: 0.011,
    cellGap: 0, // 0.326
    cellRotate: 0,
    cellFillColor: '#ffffffff',
    cellBorderColor: '#000000ff',

    cellContentShape: 'Character', // Character,
    cellContentBorder: 0.022,
    cellContentScale: 0.686, // 0.686
    cellContentRotate: 0,
    cellContentFillColor: '#ffffffff',
    cellContentBorderColor: '#000000ff',

    cellContentTextMode: "customPick", // nothing, customPick, customRandom, templatePick, templateRandom
    cellContentTextTemplate: "stars1",
    cellContentText: "✻♬☀☁㋡㋛➊░☷㊊㊟",
    cellContentTextChoose: 0,
    cellContentTextAnimate: true,
    cellContentTextAnimateSpeedFactor: 100,

    accentShape: 'Rect',
    accentCount: 0.174,
    accentBorder: 0.120,
    accentScale: 0.686,
    accentRotate: 0,
    accentFillColor: '#ffffffff',
    accentBorderColor: '#ac1325ff',
    accentPositionAnimate: true,
    accentPositionAnimateSpeedFactor: 20,

    accentTextTemplates: "random",
    accentText: "★✻♬☀☁㋡㋛➊░☷㊊㊟",
    accentTextChoose: 0,
    accentTextAnimate: true,
    accentTextAnimateSpeedFactor: 100
  });




  folder = pane.addFolder({
    title: '5. Grid ',
    view: 'color',
    alpha: true
  });

  folder.addInput(parameter_tweakpane, 'gridShow', {
    label: 'Show',
  });
  folder.addInput(parameter_tweakpane, 'gridScale', {
    label: 'Scale',
    min: 0.1,
    max: 1.0,
    step: 0.01
  });
  folder.addInput(parameter_tweakpane, 'gridRotate', {
    label: 'Rotate',
    min: -90,
    max: +90,
    step: 1
  });
  folder.addInput(parameter_tweakpane, 'gridBorder', {
    label: 'Border',
    min: 0.0,
    max: 1.0,
    step: 0.001
  });

  folder.addInput(parameter_tweakpane, 'gridCols', {
    label: 'Cols',
    min: 1,
    max: 100,
    step: 1
  });

  folder.addInput(parameter_tweakpane, 'gridRows', {
    label: 'Rows',
    min: 1,
    max: 100,
    step: 1
  });

  folder.addInput(parameter_tweakpane, 'gridFillColor', {
    label: 'Fill'
  });

  folder.addInput(parameter_tweakpane, 'gridBorderColor', {
    label: 'Border'
  });

  folder = pane.addFolder({
    title: '6. Cell'
  });

  folder.addInput(parameter_tweakpane, 'cellShow', {
    label: 'Show',
  });
  folder.addInput(parameter_tweakpane, 'cellRotate', {
    label: 'Rotate',
    min: -90,
    max: +90,
    step: 1
  });
  folder.addInput(parameter_tweakpane, 'cellBorder', {
    label: 'Border',
    min: 0.0,
    max: 1.0,
    step: 0.001
  });

  folder.addInput(parameter_tweakpane, 'cellGap', {
    label: 'Gap',
    min: 0.0,
    max: 0.999,
    step: 0.001
  });

  folder.addInput(parameter_tweakpane, 'cellFillColor', {
    label: 'Fill'
  });

  folder.addInput(parameter_tweakpane, 'cellBorderColor', {
    label: 'Border'
  });

  folder = pane.addFolder({
    title: '7. Cell Content'
  });

  folder.addInput(parameter_tweakpane, 'cellContentShape', {
    label: 'Shape',
    options: Shape.ShapeNames
  });

  folder.addInput(parameter_tweakpane, 'cellContentRotate', {
    label: 'Rotate',
    min: -90,
    max: +90,
    step: 1
  });
  folder.addInput(parameter_tweakpane, 'cellContentBorder', {
    label: 'Border',
    min: 0.0,
    max: 1.0,
    step: 0.001
  });

  // 10% up to 500%
  folder.addInput(parameter_tweakpane, 'cellContentScale', {
    label: 'Scale',
    min: 0.1,
    max: 5.0,
    step: 0.001
  });

  folder.addInput(parameter_tweakpane, 'cellContentFillColor', {
    label: 'Fill'
  });

  folder.addInput(parameter_tweakpane, 'cellContentBorderColor', {
    label: 'Border'
  });

  folder = pane.addFolder({
    title: '8. Cell Content - Character'
  });

  folder.addInput(parameter_tweakpane, 'cellContentTextMode', {
    label: 'Mode',
    options: {
      nothing: "nothing",
      customPick: "customPick",
      customRandom: "customRandom",
      templatePick: "templatePick",
      templateRandom: "templateRandom"
    }
  });

  folder.addInput(parameter_tweakpane, 'cellContentTextTemplate', {
    label: 'Template',
    options: Characters.SetNames
  });

  folder.addInput(parameter_tweakpane, 'cellContentText', {
    label: 'Custom'
  });
  folder.addInput(parameter_tweakpane, 'cellContentTextChoose', {
    label: 'Pick one',
    min: 0,
    step: 1
  });

  folder.addInput(parameter_tweakpane, 'cellContentTextAnimate', {
    label: 'Animate'
  });

  folder.addInput(parameter_tweakpane, 'cellContentTextAnimateSpeedFactor', {
    label: 'Throttel',
    min: 0,
    step: 0.0001
  });

  folder = pane.addFolder({
    title: '9. Cell Content > Accent'
  });

  folder.addInput(parameter_tweakpane, 'accentShape', {
    label: 'Shape',
    options: Shape.ShapeNames
  });

  folder.addInput(parameter_tweakpane, 'accentRotate', {
    label: 'Rotate',
    min: -90,
    max: +90,
    step: 1
  });

  folder.addInput(parameter_tweakpane, 'accentCount', {
    label: 'Anzahl',
    min: 0,
    max: 1,
    step: 0.001
  });

  folder.addInput(parameter_tweakpane, 'accentBorder', {
    label: 'Border',
    min: 0.0,
    max: 1.0,
    step: 0.001
  });
  folder.addInput(parameter_tweakpane, 'accentScale', {
    label: 'Scale',
    min: 0.1,
    max: 5.0,
    step: 0.001
  });

  folder.addInput(parameter_tweakpane, 'accentFillColor', {
    label: 'Fill'
  });

  folder.addInput(parameter_tweakpane, 'accentBorderColor', {
    label: 'Border'
  });

  folder.addInput(parameter_tweakpane, 'accentPositionAnimate', {
    label: 'Animate'
  });

  folder.addInput(parameter_tweakpane, 'accentPositionAnimateSpeedFactor', {
    label: 'Throttel',
    min: 0,
    step: 0.0001
  });

  folder = pane.addFolder({
    title: '10. Cell Content > Accent - Char'
  });


  folder.addInput(parameter_tweakpane, 'accentTextTemplates', {
    label: 'Text',
    options: Characters.SetNames
  });


  folder.addInput(parameter_tweakpane, 'accentText', {
    label: 'Custom'
  });
  folder.addInput(parameter_tweakpane, 'accentTextChoose', {
    label: 'Pick one',
    min: 0,
    step: 1
  });

  folder.addInput(parameter_tweakpane, 'accentTextAnimate', {
    label: 'Animate'
  });

  folder.addInput(parameter_tweakpane, 'accentTextAnimateSpeedFactor', {
    label: 'Throttel',
    min: 0,
    step: 0.0001
  });

  return folder;
}


module.exports = {
  Manager,
  Painter
};

// used so:
// Grid.Manager
// Grid.Painter