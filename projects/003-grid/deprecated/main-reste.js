/**
 * Title    : TheGrid
 * Project  : Creative Coding
 * File     : projects/001-thegrid/main.js
 * Version  : 1.7.0
 * Published: https://carsten-nichte.de/art/portfolio/the-grid/
 * 
 * made with 
 * https://github.com/mattdesl/canvas-sketch
 * https://github.com/mattdesl/canvas-sketch-util
 * 
 * Cell-Patterns -> zB. Linie im Grid zeichnen oder einen Buchstaben...
 * also etwas mit dem Grid darstellen.
 * 
 ** In the projects folder open the Terminal, and:
 * Start Server: `npm run server`
 * Build html:   `npm run html`
 * Build release:`npm run release`
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
import canvasSketch from 'canvas-sketch';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const Color = require('canvas-sketch-util/color');
const Tweakpane = require('tweakpane');

const {
  Characters
} = require('@carstennichte/cc-utils');
const {
  JsonManager
} = require('@carstennichte/cc-utils');
const {
  Artwork
} = require('@carstennichte/cc-utils');
const {
  Size
} = require('@carstennichte/cc-utils');
const {
  Vector
} = require('@carstennichte/cc-utils');
const {
  Coordinate
} = require('@carstennichte/cc-utils');
const {
  CoordinateStorage
} = require('@carstennichte/cc-utils');
const {
  Brush
} = require('@carstennichte/cc-utils');
const {
  Shape
} = require('@carstennichte/cc-utils');
const {
  ColorSet
} = require('@carstennichte/cc-utils');
const {
  Animation
  } = require('@carstennichte/cc-utils');
const {
  BackgroundShape
} = require('@carstennichte/cc-utils');
const {
  Grid
} = require('@carstennichte/cc-utils');
const {
  SceneGraph
} = require('@carstennichte/cc-utils');
const {
  Format
} = require('@carstennichte/cc-utils');


const VERSION = process.env.npm_package_version;
const ARTWORK_NAME = "The Grid";
const ARTWORK_VERSION = "1.7.0";

// This Object bundles some global non persistent Variables for runtime stuff.
let global = {
  sketchManager: null,
  artwork:null,
}

/**
 * The Tweakpane Paramters.
 * They have global scope, so i can use them everywhere.
 * They are readonly via Tweakpane.
 */
const parameter_tweakpane = {
  /*
  colorsetMode: "animate_from_all",
  colorsetGroupname: "",
  colorsetVariante: -1,
  colorsetNumber: -1,
  colorsetAnimate: true,
  colorsetAnimateSpeedFactor: 200,
  colorset_setname: "MonitorColorSet",
*/

  canvas_background_color: "#ff00006F",
  canvas_outer_color: "000000FF",

/* old
  canvasColorMode: "random",
  canvasColorSet: "",
  canvasColorSetNumber:0,
  canvasColorsAnimate: true,
  canvasColorsAnimateSpeedFactor: 200,
  canvasColor: "#ffffffff",
  canvasScale: 1.00,
  canvasRotate: 0,
old */

  backgroundShape: 'Rect',
  backgroundBorder: 0.005,
  backgroundScale: 0.80,
  backgroundRotate: 0,
  backgroundFillColor: '#ffffffff',
  backgroundBorderColor: '#efefefff',

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
  accentTextAnimateSpeedFactor: 100,

  filename: "sketch-TheGrid-01",
  jsonString: ""
};

/*
  canvas: {
    colorMode: parameter_tweakpane.canvasColorMode, // custom, random
    colorSet: "", // TODO Name of a selected Colorset
    colorsAnimate: parameter_tweakpane.canvasColorsAnimate, // true
    animateSpeedFactor: parameter_tweakpane.canvasColorsAnimateSpeedFactor, // 200

    scale: parameter_tweakpane.canvasScale, // 1.00
    rotate: parameter_tweakpane.canvasRotate, // 0

    color: parameter_tweakpane.canvasColor // "#ffffffff"
  }
 */

// Pack all the Parameters into a handy package, for use
// and apply the Tweakpaneparameters.
const parameter = {
  // To organize Parameter-Sets in this manner makes them nestable in a Paramter Object. 
canvas: {
    size:null,
    backgroundColor: parameter_tweakpane.canvas_background_color,
    outer_color: parameter_tweakpane.canvas_outer_color,
    brush: {
      shape: "Rect",
      angle: 0,
      scale: 1.0,
      border: 5.0,
      borderColor: "#000000ff",
      fillColor: "#ffffff00"
    }
  },
  format: {
    format_type: parameter_tweakpane.format_type,
    format_aspect_ratio: parameter_tweakpane.format_aspect_ratio,
    format_keep_aspect_ratio: parameter_tweakpane.format_keep_aspect_ratio,
    format_fencing: parameter_tweakpane.format_fencing,
    brush: {
      shape: "Rect",
      angle: 0,
      scale: 1.0,
      border: 0.001,
      borderColor: "#000000ff",
      fillColor: "#ffffff00"
    }
  },
  background: {
    shape: parameter_tweakpane.backgroundShape, // 'Rect'

    size: undefined,
    position: undefined,
    brush: undefined,

    scale: parameter_tweakpane.backgroundScale, // 0.80
    rotate: parameter_tweakpane.backgroundRotate, // 0

    border: parameter_tweakpane.backgroundBorder, // 0.005
    fillColor: parameter_tweakpane.backgroundFillColor, // '#ffffffff'
    borderColor: parameter_tweakpane.backgroundBorderColor, // '#efefefff'

    animation:{timer: undefined}
  },
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

    animation:{timer: undefined}
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
};


// Will be intergrated in the additional Paramters (paramsAD)
// equal for all...
const randomized = {

  canvasColor: "#ffffffff",

  backgroundFillColor: '#ffffffff',
  backgroundBorderColor: '#efefefff',

  gridFillColor: '#ffffffff',
  gridBorderColor: '#2a27ebff',

  cellFillColor: '#ffffffff',
  cellBorderColor: '#000000ff',

  cellContentFillColor: '#ffffffff',
  cellContentBorderColor: '#000000ff',

  accentFillColor: '#ffffffff',
  accentBorderColor: '#ac1325ff'
}

/**
 * The Canvas-Settings.
 * TODO Export has always been 921 x 921 pixels, 72dpi
 */
const settings_CS = {
  dimensions: [6000, 6000], // [4000, 4000], 'A4', 1080x1080 = Instagram
  pixelsPerInch: 300,
  orientation: 'portrait',
  animate: true,
  // Set loop duration to 3 
  // duration: 3,
  // Use either duration, or totalFrames of a loop.
  totalFrames: 1000,
  fps: 30,
  scaleToView: true
  // playbackRate: 'throttle'
}; // settings


class MyArtwork extends Artwork {

  constructor(sketchManager, window, document, canvas, onKeyUp_Callback, openOptionPanes){
    super(sketchManager, window, document, canvas, onKeyUp_Callback, openOptionPanes);

    this.grid=null;
  }
}


/**
 * This displays some Shapes.
 * It is an additional Layer in the Artwork.
 */
class TheBackground extends BackgroundShape {

  /**
   * Contructs the Thing.
   * 
   * @param {Size} canvasSize - The Canvas-Size
   * @param {String} background_color - please in hex Format with alpha: #001122FF 
   */
  constructor(canvasSize, background_color) {
    super(canvasSize, background_color);

    this.canvasSize = canvasSize; // TODO super geht nicht?
    this.background_color = background_color;

    this.randomized = {
      canvasColor: parameter_tweakpane.canvasColor,
      fillColor: parameter_tweakpane.backgroundFillColor,
      borderColor: parameter_tweakpane.backgroundBorderColor
    };
  } // constructor

  /**
   * Fills my Brush with Background stuff.
   * 
   * @param {Brush} brush 
   * @returns Brush
   */
  fill_brush(brush) {

    brush.shape = parameter_tweakpane.backgroundShape;
    brush.scale = parameter_tweakpane.backgroundScale * parameter_tweakpane.canvasScale; // new Vector(paramsTP.shapeScaleFactor_x, paramsTP.shapeScaleFactor_y);
    brush.angle = parameter_tweakpane.backgroundRotate + parameter_tweakpane.canvasRotate;

    brush.border = this.canvasSize.width * parameter_tweakpane.backgroundBorder; // context.lineWidth 

    if (parameter_tweakpane.canvasColorMode === "custom") {
      this.background_color = parameter_tweakpane.canvasColor;
      brush.fillColor = parameter_tweakpane.backgroundFillColor; // context.fillStyle
      brush.borderColor = parameter_tweakpane.backgroundBorderColor; // context.strokeStyle
    } else {
      // random
      this.background_color = this.randomized.canvasColor;
      brush.fillColor = this.randomized.fillColor; // context.fillStyle
      brush.borderColor = this.randomized.borderColor; // context.strokeStyle
    }

    brush.fillColorAlpha = Color.parse(parameter_tweakpane.backgroundFillColor).alpha;
    brush.borderColorAlpha = Color.parse(parameter_tweakpane.backgroundBorderColor).alpha;

    return brush;

  } // fill_brush

  /**
   * Is called by the Backgrounds AnimationTimer.
   * Shuffels only some Brush-Values at the moment.
   *
   * @param {Object} parameter 
   */
  animate_slow(parameter) {
    super.animate_slow(parameter);

    let cs = ColorSet.get_random_colorset(); // in the form #FFFFFFFF

    parameter.canvas.colorSet = cs.name; // I have choosen this palette for the Grid!

    if ('background' in cs) {
      this.randomized.canvasColor = cs.background;
    } else {
      this.randomized.canvasColor = ColorSet.get_random_color_from_colorset(cs);
    }

    if ('stroke' in cs) {
      this.randomized.borderColor = cs.stroke;
    } else {
      this.randomized.borderColor = ColorSet.get_random_color_from_colorset(cs);
    }

    this.randomized.fillColor = ColorSet.get_random_color_from_colorset(cs);

  } // animate_slow
} // class TheBackground


/**
 * The Sketch.
 * https://github.com/mattdesl/canvas-sketch/blob/master/docs/api.md
 * 
 * @returns
 */
const sketch = ({
  canvas,
  width,
  height
}) => {
  // This type/style of declaration in javascript is called 'arrow-function'

  // TODO code here

  // Inject ParameterSets and init with Tweakpane-Parameters
  Artwork.inject_parameterset_to(parameter, parameter_tweakpane);
  Format.inject_parameterset_to(parameter, parameter_tweakpane);
  ColorSet.inject_parameterset_to(parameter, parameter_tweakpane);

  // sketchManager, settings, window, document, canvas, onKeyUp, openOptionPanes
  global.artwork = new MyArtwork(global.sketchManager, window, document,canvas, {}, 3);

  // Store the size in a handy format.
  const canvasSize = new Size(width, height, width * 0.5);

  // This is the centered Background-Shape of the Artwork
  global.artwork.background = new TheBackground(canvasSize, parameter_tweakpane.canvasColor);

  // canvasSize, cols, rows, scale
  global.artwork.grid = new Grid.Manager(canvasSize, parameter_tweakpane.gridCols, parameter_tweakpane.gridRows, parameter_tweakpane.gridScale);

  // Returns Renderer-Objects:
  // render, resize, begin, end, tick, unload, preExport, postExport
  return {
    // Render and re-Render Stuff
    // https://github.com/mattdesl/canvas-sketch/blob/master/docs/api.md#props
    render(props) {
      
      const {
        context,
        canvas,
        width,
        height,
        frame,
        /* Er macht 0 - 88 Frames... */
        duration,
        playhead,
        time,
        deltaTime
      } = props;

      // TODO code there

      parameter.artwork.clearscreen = parameter_tweakpane.artwork_clearscreen;
      global.artwork.clearScreen(context, width, height, parameter_tweakpane.artwork_clearscreen);

      // console.log('Rendering frame #%d', frame);

      // Save them for later use (the export stuff, for example)
      global.artwork.time = time;
      global.artwork.deltaTime = deltaTime;

      // Update some parameters from Tweakpane-Parameters.
      parameter.canvas.colorMode = parameter_tweakpane.canvasColorMode;
      parameter.canvas.colorsAnimate = parameter_tweakpane.canvasColorsAnimate;
      parameter.canvas.animateSpeedFactor = parameter_tweakpane.canvasColorsAnimateSpeedFactor;
      parameter.canvas.scale = parameter_tweakpane.canvasScale; // 1.00
      parameter.canvas.rotate = parameter_tweakpane.canvasRotate; // 0
      parameter.canvas.color = parameter_tweakpane.canvasColor; // "#ffffffff"

      parameter.background.shape = parameter_tweakpane.backgroundShape;
      parameter.background.scale = parameter_tweakpane.backgroundScale;
      parameter.background.rotate = parameter_tweakpane.backgroundRotate;
      parameter.background.border = parameter_tweakpane.backgroundBorder;
      parameter.background.fillColor = parameter_tweakpane.backgroundFillColor;
      parameter.background.borderColor = parameter_tweakpane.backgroundBorderColor;

      parameter.grid.show = parameter_tweakpane.gridShow;
      parameter.grid.rows = parameter_tweakpane.gridRows;
      parameter.grid.cols = parameter_tweakpane.gridCols;
      parameter.grid.scale = parameter_tweakpane.gridScale;
      parameter.grid.rotate = parameter_tweakpane.gridRotate;
      parameter.grid.border = parameter_tweakpane.gridBorder;
      parameter.grid.fillColor = parameter_tweakpane.gridFillColor;
      parameter.grid.borderColor = parameter_tweakpane.gridBorderColor;

      parameter.cell.show = parameter_tweakpane.cellShow;
      parameter.cell.gap = parameter_tweakpane.cellGap;
      parameter.cell.rotate = parameter_tweakpane.cellRotate;
      parameter.cell.border = parameter_tweakpane.cellBorder;
      parameter.cell.fillColor = parameter_tweakpane.cellFillColor;
      parameter.cell.borderColor = parameter_tweakpane.cellBorderColor;

      parameter.cell_content.shape = parameter_tweakpane.cellContentShape;
      parameter.cell_content.scale = parameter_tweakpane.cellContentScale;
      parameter.cell_content.rotate = parameter_tweakpane.cellContentRotate;
      parameter.cell_content.border = parameter_tweakpane.cellContentBorder;
      parameter.cell_content.fillColor = parameter_tweakpane.cellContentFillColor;
      parameter.cell_content.borderColor = parameter_tweakpane.cellContentBorderColor;
      parameter.cell_content.textMode = parameter_tweakpane.cellContentTextMode; // random, nothing, custom
      parameter.cell_content.textTemplate = parameter_tweakpane.cellContentTextTemplate; // choosen Template
      parameter.cell_content.text = parameter_tweakpane.cellContentText; // "✻♬☀☁㋡㋛➊░☷㊊㊟"
      parameter.cell_content.textChoose = parameter_tweakpane.cellContentTextChoose; // 0...x
      parameter.cell_content.textAnimate = parameter_tweakpane.cellContentTextAnimate; // true, false
      parameter.cell_content.textAnimateSpeedFactor = parameter_tweakpane.cellContentTextAnimateSpeedFactor;

      //* Draw the Background
      //* Draw the Background Shape
      const position = new Vector(width * 0.5, height * 0.5);
      const sh_width = width * 0.5;
      const sh_height = height * 0.5;
      const sh_radius = height * 0.25;

      const shapeSize = new Size(sh_width, sh_height, sh_radius);
      const brush = global.artwork.background.fill_brush(new Brush());


      parameter.background.size = shapeSize;
      parameter.background.position = position;
      parameter.background.brush = brush;
      parameter.background.animation.timer = {
        time: time,
        deltaTime: deltaTime,
        do_animate: parameter_tweakpane.canvasColorsAnimate,
        global_animation_halt: global.artwork.animation_halt,
        speedFactor: parameter_tweakpane.canvasColorsAnimateSpeedFactor
      };

      parameter.grid.animation.timer = {
        time: time,
        deltaTime: deltaTime,
        do_animate: parameter_tweakpane.canvasColorsAnimate,
        global_animation_halt: global.artwork.animation_halt,
        speedFactor: parameter_tweakpane.canvasColorsAnimateSpeedFactor
      };

      global.artwork.scene = new SceneGraph();
      global.artwork.scene.push(global.artwork.background);
      global.artwork.scene.push(global.artwork.grid);
      
      global.artwork.scene.draw(context, parameter);


    },
    begin() {
      // First frame of loop
      // console.log('First Frame of Loop');

      // global.artwork.background.animationTimer.reset();
      global.artwork.grid.animationTimerReset();

    },
    end() {
      // Last frame of loop
      // console.log('Last Frame of Loop');
    },
    resize({
      width,
      height
    }) {
      // console.log('Canvas has resized to %d x %d', width, height);
    }







  }; // sketch return
}; // sketch




/**
 * The Options-Pane.
 */
const createOptionsPane = () => {
  // This type/style of declaration in javascript is called 'arrow-function'

  const pane = new Tweakpane.Pane();
  pane.registerPlugin(EssentialsPlugin);

  let folder;


  const tab_main = pane.addTab({
    pages: [{
        title: 'Parameter'
      },
      {
        title: 'Export / Import'
      },
    ],
  });

  // --------------------------------
  // Parameter Tab
  // --------------------------------
  // folder = tab_main.pages[0].addFolder({
  //   title: '1. Canvas '
  // });

  // Inject Tweakpane and Tweakpane-Parameters
  folder = Artwork.provide_tweakpane_to("0. ", tab_main.pages[0], parameter_tweakpane);
  folder = Format.provide_tweakpane_to("1. ", tab_main.pages[0], parameter_tweakpane);
  folder = ColorSet.provide_tweakpane_to("2. ", tab_main.pages[0], parameter_tweakpane);


/*
  folder = tab_main.pages[0].addFolder({
    title: '1. Canvas '
  });
  folder.addInput(parameter_tweakpane, 'canvasColorMode', {
    label: 'ColorMode',
    options: {
      custom: 'custom',
      colorSet: 'colorSet',
      random: 'random',
      chaos: 'chaos',
    }
  });

  folder.addInput(parameter_tweakpane, 'canvasColorSet', {
    label: 'ColorSet',
    options: {
      cako: 'cako',
      colourscafe: 'colourscafe',
      dale: 'dale',
      ducci: 'ducci',
      duotone: 'duotone',
      exposito: 'exposito',
      flourish: 'flourish',
      hilda: 'hilda',
      iivonen: 'iivonen',
      judson: 'judson',
      jung: 'jung',
      kovecses: 'kovecses',
      mayo: 'mayo',
      misc: 'misc',
      ranganath: 'ranganath',
      rohlfs: 'rohlfs',
      roygbivs: 'roygbivs',
      spatial: 'spatial',
      system: 'system',
      tsuchimochi: 'tsuchimochi',
      tundra: 'tundra'
    }
  });

  folder.addInput(parameter_tweakpane, 'canvasColorSetNumber', {
    label: 'ColorSet',
    min: 0,
    min: 20,
    step: 1
  });

  folder.addInput(parameter_tweakpane, 'canvasColorsAnimate', {
    label: 'Animate'
  });

  folder.addInput(parameter_tweakpane, 'canvasColorsAnimateSpeedFactor', {
    label: 'Throttel',
    min: 0,
    step: 0.0001
  });

  folder.addInput(parameter_tweakpane, 'canvasColor', {
    label: 'Custom'
  });

  folder.addSeparator();

  folder.addInput(parameter_tweakpane, 'canvasScale', {
    label: 'Scale',
    min: 0.1,
    max: 1.0,
    step: 0.01
  });
  folder.addInput(parameter_tweakpane, 'canvasRotate', {
    label: 'Rotate',
    min: -90,
    max: +90,
    step: 1
  });

*/

  folder = tab_main.pages[0].addFolder({
    title: '3. Background '
  });

  folder.addInput(parameter_tweakpane, 'backgroundShape', {
    label: 'Shape',
    options: Shape.ShapeNames
  });
  folder.addInput(parameter_tweakpane, 'backgroundRotate', {
    label: 'Rotate',
    min: -90,
    max: +90,
    step: 1
  });
  folder.addInput(parameter_tweakpane, 'backgroundBorder', {
    label: 'Border',
    min: 0,
    max: 1,
    step: 0.001
  });

  folder.addInput(parameter_tweakpane, 'backgroundScale', {
    label: 'Scale',
    min: 0.01,
    max: 3.0,
    step: 0.01
  });

  folder.addInput(parameter_tweakpane, 'backgroundFillColor', {
    label: 'Fill'
  });

  folder.addInput(parameter_tweakpane, 'backgroundBorderColor', {
    label: 'Border'
  });


  folder = tab_main.pages[0].addFolder({
    title: '4. Grid ',
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

  folder = tab_main.pages[0].addFolder({
    title: '5. Cell'
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

  folder = tab_main.pages[0].addFolder({
    title: '6. Cell Content'
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

  folder = tab_main.pages[0].addFolder({
    title: '7. Cell Content - Character'
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



    folder = tab_main.pages[0].addFolder({
      title: '8. Cell Content > Accent'
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

    folder = tab_main.pages[0].addFolder({
      title: '9. Cell Content > Accent - Char'
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


  // --------------------------------
  // Export / Import Tab
  // --------------------------------


  folder = tab_main.pages[1].addFolder({
    title: 'Download Files'
  });

  folder.addInput(parameter_tweakpane, 'filename', {
    label: 'Filename'
  });


  folder.addBlade({
    view: 'buttongrid',
    size: [2, 1],
    cells: (x, y) => ({
      title: [
        ['Artwork', 'Parameter']
      ][y][x],
    }),
    label: 'Download',
  }).on('click', (ev) => {

    const theFilename = JsonManager.build_filename(parameter_tweakpane.filename);

    if (ev.index[0] == 0 & ev.index[1] == 0) {

      // Download Artwork
      if (global.artwork.canvas != null) {

        const a = document.createElement("a");
        a.download = theFilename + ".png";
        a.href = global.artwork.canvas.toDataURL();
        a.click();
      }
    } else if (ev.index[0] == 1 & ev.index[1] == 0) {

      // Download settings.json
      var fileContent = JsonManager.bundle_all_params(pane, parameter);

      var bb = new Blob([fileContent], {
        type: 'text/plain'
      });

      var a = document.createElement('a');
      a.download = theFilename + ".json";
      a.href = window.URL.createObjectURL(bb);
      a.click();

    }
  });

  const btn_download_all_zipped = folder.addButton({
    title: 'Download all zipped',
    label: '', // optional
  });

  btn_download_all_zipped.on('click', () => {

    JsonManager.zip_and_save(pane, global.artwork.canvas, parameter, parameter_tweakpane.filename);

  });

  folder = tab_main.pages[1].addFolder({
    title: 'Parameter Clipboard'
  });

  const btn_export_to_clipboard = folder.addButton({
    title: 'Copy to Clipboard',
    label: '', // optional
  });

  btn_export_to_clipboard.on('click', () => {

    var json = JsonManager.bundle_all_params(pane, parameter);
    window.prompt("Copy to clipboard: Ctrl+C, Enter", json);

  });

  folder.addInput(parameter_tweakpane, 'jsonString', {
    label: 'JSON String'
  }).on('change', (ev) => {
    // console.log(ev.value);
    if (ev.last) {
      // console.log('(last)');
    }
  });


  const btn_import = folder.addButton({
    title: 'Import Parameter',
    label: '', // optional
  });

  btn_import.on('click', () => {

    if (JsonManager.is_json(parameter_tweakpane.jsonString)) {

      // Here i rely on the fact that a proper TheGrid-Json is provided.
      // This should be the case if it was also exported with this.
      parameter = JsonManager.split_all_params(pane, parameter_tweakpane.jsonString);
      // parameter_tweakpane.jsonString = "";

    } else {
      // console.log("Kein JSON: '" + paramsTP.jsonString + "'");
    }

  });

  pane.addSeparator();

  Artwork.provide_nameVersion_for_tweakPane(pane,parameter_tweakpane, ARTWORK_NAME, ARTWORK_VERSION);


}; // createOptionsPane();



createOptionsPane();

// https://github.com/mattdesl/canvas-sketch/blob/master/docs/api.md#sketchmanager
const start = async () => {
  global.sketchManager = await canvasSketch(sketch, settings_CS);
};

start();