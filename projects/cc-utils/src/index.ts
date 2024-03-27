// this is required for monorepo
export { AnimationTimeline } from "./AnimationTimeline";
export { AnimationTimeline_Item } from "./AnimationTimeline_Item";
export { Breathe as Animation_Breathe } from "./animation/Breathe";

export { AnimationTimer, type Animable } from "./AnimationTimer";
export { Artwork, type Sketch, type Artwork_Meta } from "./Artwork";
export { Background } from "./Background";
export { BackgroundShape } from "./BackgroundShape";
export { Brush, type Brush_ParameterTweakpane } from "./Brush";
export { Characters } from "./Characters";
export { ColorSet, type CheckObserverSubject_ColorSet_Parameter } from "./ColorSet";
export { Coordinate } from "./Coordinate";
export { Entity_Manager, Entity } from "./Entities";
export { Format, type CheckObserverSubject_Format_Parameter } from "./Format";
export { Grid_Manager } from "./Grid";
export { Mathematics } from "./Mathematics";
export { ObserverSubject, type Observer } from "./ObserverPattern";
export { ParameterObject } from "./ParameterObject";
export { SceneGraph, type Drawable } from "./SceneGraph";
export { Shape } from "./Shape";
export { Size } from "./Size";
export { TweakpaneSupport, type Provide_Tweakpane_To_Props } from "./TweakpaneSupport";
export { Vector } from "./Vector";

/*
// export { Entities } from "./Entities.js";
export { Manager, Painter } from "./Grid.js";

export { JsonManager } from "./JsonManager.js";

// export { Particles } from "./Particles.js"; // Manager
export { Parameter } from "./Parameter.js";
*/


// Das funktioniert:
// const ccUtils = require('cc-utils');
// console.log(ccUtils.testFunction());
//
// export function testFunction(num) {
//  return " - Grüße von cc-util - ";
// }

/* TODO alte package.json
{
  "name": "@carstennichte/cc-utils",
  "type": "module",
  "description": "Utilities for sketching in HTML Canvas, and make some generative art",
  "version": "1.0.0",
  "private": true,
  "license": "CC-BY-NC-SA-4.0",
  "author": "Carsten Nichte <c.nichte@t-online.de> (https://carsten-nichte.de/index/)",
  "main": "index.js",
  "dependencies": {
    "canvas-sketch-util": "^1.10.0"
  },
  "devDependencies": {
    "symlinked": "^0.5.0",
    "replace": "^1.2.1",
    "cross-var": "^1.1.0",
    "mocha": "^9.2.2",
    "chai": "^4.3.6"
  },
  "keywords": [
    "art",
    "genart",
    "generative",
    "generative-art",
    "creative-coding",
    "canvas",
    "sketch",
    "code",
    "canvas-sketch",
    "geom",
    "geometry",
    "random"
  ],
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}


*/
