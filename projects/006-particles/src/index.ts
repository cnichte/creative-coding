/**
 * Title    : Artwork No. 6 - Particles (modernized)
 * Project  : Creative Coding
 */

import { Pane } from "tweakpane";

import "./css/artwork.css";
import "./css/tweakpane.css";

import {
  Artwork,
  Artwork_Meta,
  Artwork_Animation,
  Artwork_Canvas,
  Artwork_Canvas_HTML,
  Artwork_ParameterSet,
  BackgroundShape,
  ColorSet,
  Format,
  SceneGraph,
  Sketch,
  Tweakpane_Items,
  Size,
  Vector,
  ParticleManager,
} from "@carstennichte/cc-toolbox";

class MySketch implements Sketch {
  private ctx: any;
  private background: BackgroundShape | null = null;
  private format: Format | null = null;
  private colorSet: ColorSet | null = null;
  private particleManager: ParticleManager | null = null;
  public scene: SceneGraph | null = null;
  public useSceneGraph = true;
  private animation_halt = false;

  prepare(
    ctx: any,
    parameter: any,
    format: Format,
    tweakpane: Pane,
    tweakpane_items: Tweakpane_Items
  ) {
    if (this.ctx == null) {
      this.ctx = ctx;
    }

    if (tweakpane_items?.manager) {
      ColorSet.registerTweakpane(parameter, tweakpane_items.manager, {
        container: tweakpane_items.pane,
        title: "Color Palette",
      });
      BackgroundShape.registerTweakpane(parameter, {
        manager: tweakpane_items.manager,
        container: tweakpane_items.pane,
      });
      const particlesFolder = tweakpane_items.pane.addFolder({
        title: "Particles",
        expanded: false,
      });
      ParticleManager.registerTweakpane(parameter, {
        manager: tweakpane_items.manager,
        container: particlesFolder,
      });
    }

    this.background = new BackgroundShape(parameter);
    this.particleManager = new ParticleManager(parameter);

    this.colorSet = new ColorSet(parameter);

    this.scene = new SceneGraph();
    this.scene.push(this.background);
    this.scene.push(this.particleManager);
  }

  tickScene(ctx: any, parameter: any, timeStamp: number, deltaTime: number) {
    if (this.colorSet) {
      this.colorSet.animationTimer.check_AnimationTimer(
        timeStamp,
        deltaTime,
        this.animation_halt,
        parameter.colorset
      );
      this.colorSet.check_ObserverSubject({
        groupname: parameter.colorset.groupname,
        mode: parameter.colorset.mode,
        variant: parameter.colorset.variant,
        number: parameter.colorset.number,
      });
    }

    this.scene?.tick(ctx, parameter, deltaTime);
  }
}

window.onload = function () {
  const artwork_meta: Artwork_Meta = {
    title: "006 Particles",
    description: "Particles along a line with tweakable offsets.",
    author: "Carsten Nichte",
    version: "0.9.0",
    year: "2024",
  };

  const artwork_canvas_html: Artwork_Canvas_HTML = {
    id: "theCanvas",
    parent_container_id: "theCanvasContainer",
    parent_container_class: "canvas_parent_css_class",
    tweakpane_container_id: "theTweakpaneContainer",
  };

  const artwork_canvas: Artwork_Canvas = {
    html: artwork_canvas_html,
    size: new Size(1200, 1600),
    center: new Vector(600, 800),
    clearscreen: true,
    mouse: new Vector(0, 0),
  };

  const artwork_animation: Artwork_Animation = {
    global_halt: false,
    duration: 60,
    lastTime: 0,
    intervall: 0,
    timeStamp: 0,
    deltaTime: 0,
  };

  const parameter: Artwork_ParameterSet = {
    artwork: {
      meta: artwork_meta,
      canvas: artwork_canvas,
      scale: 1.0,
      animation: artwork_animation,
    },
  };

  const artwork = new Artwork(window, document, parameter);
  artwork.run(new MySketch());
};
