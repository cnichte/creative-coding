let Artwork = require('./My_Artwork.js');

/**
 * Title    : My Artwork Skeleton
 * Project  : Creative Coding
 * File     : projects/001-thegrid/main.js
 * Version  : 0.1.0
 * Published: -
 * 
 ** This is the Connection-Point between canvas_sketch and my Artworks.
 ** ... 
 * 
 * made with 
 * https://github.com/mattdesl/canvas-sketch
 * https://github.com/mattdesl/canvas-sketch-util
 * 
 * In the projects folder open the Terminal, and:
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

const Tweakpane = require('tweakpane');
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

const canvasSketch = require('canvas-sketch');
const load = require('load-asset');
const Random = require('canvas-sketch-util/random');

// Some global Variables for runtime stuff.
let sketchManager = null;
let artwork = null;

// Canvas-Sketch Settings
const settings = {
  dimensions: [6000, 6000], // [4000, 4000], 'A4', 1080x1080 = Instagram
  pixelsPerInch: 300,
  orientation: 'portrait',
  animate: true,
  // Use either duration, or totalFrames of a loop.
  duration: 30,
  // totalFrames: 1000,
  fps: 30,
  scaleToView: true
  //, playbackRate: 'throttle'
}; // const settings 

// Parameter Object-Skelleton is filled by the artwork.
let parameter = { tweakpane:{ }};

// the sketch
const sketch = ({
  canvas,
  width,
  height
}) => {

  // TODO code here
  // sketchManager, settings, window, document, canvas, onKeyUp, openOptionPanes
  artwork = new Artwork(sketchManager, settings, window, document, canvas, {}, Artwork.OPEN_TWEAK_PANES, parameter);
  artwork.prepare(width, height);

  return ({
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
  }) => {

    // TODO code there
    //* Der SketchManager steht evtl. wegen async await erst später zur Verfügung.
    // Dewegen versuche ich ihn hier immer wieder zu setzten.
    // Das ist aber nicht ordentlich, sondern ein Hack. 
    //? Wie geht das besser?
    artwork.sketchManager = sketchManager;
    artwork.render(context, time, deltaTime)

  }; // anonymous Arrow-Function + return Object
}; // canvasSketch


const createOptionsPane = () => {

  const pane = new Tweakpane.Pane();
  pane.registerPlugin(EssentialsPlugin);

  // TODO code everywhere
  // Inject Tweakpane and Tweakpane-Parameters
  Artwork.provide_tweakpane_to("", pane, parameter.tweakpane);
  
}; // const createOptionsPane()


// -----------------------------------------------------------------------------
// create annd run the stuff
// -----------------------------------------------------------------------------

createOptionsPane();

// Wrapps canvasSketch in an async function
const start = async () => {
  // await makes the function wait for a Promise
  sketchManager = await canvasSketch(sketch, settings);
};

start();