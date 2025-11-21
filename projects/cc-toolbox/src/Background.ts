/**
 * Title    : Background
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/Background.ts
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
 *
 * Supports:
 * - ParameterSet   : yes
 * - Tweakpane      : yes
 * is:
 * - Observer       : yes
 * - ObserverSubject: no
 * - prefixable:    : no
 *
 ** Draws a rectangular Shape on our Canvas, that represents a coloured Background.
 *
 * Follows the Observer Pattern:
 *  - class Background - is our Background Class
 *  - class Color_ObserverSubject - reacts on changes of the Background color, and notifies all Observers.
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

// Background.ts

import { Brush } from "./Brush";
import { ColorSet, type ColorSet_ParameterSet } from "./ColorSet";
import { Format, type Format_ParameterSet_Values } from "./Format";
import { Shape } from "./Shape";
import { Size } from "./Size";
import { Vector } from "./Vector";

import { ParameterManager } from "./ParameterManager";
import { ColorUtils } from "./ColorUtils";
import {
  TweakpaneManager,
  type TweakpaneContainer,
} from "./TweakpaneManager";

export interface Background_ParameterSet {
  color: string;
}

export interface Background_ParameterTweakpane {
  background_color: string;
}

export interface BackgroundTweakpaneOptions {
  manager: TweakpaneManager;
  container: TweakpaneContainer;
  statePath?: string | string[];
  id?: string;
  label?: string;
  wrapInFolder?: boolean;
  title?: string;
}

/**
 * This reflects the internal state, and is used by Observer functionality.
 *
 * @interface State
 */
interface State {
  background: Background_ParameterSet;
  colorset: ColorSet_ParameterSet;
  format: Format_ParameterSet_Values;
}

export class Background {

  protected parameter: any;
  protected brush: Brush;
  protected state: State;

  /**
   * Construct the Thing.
   *
   * @param {Size} parameter - this.parameter.tweakpane.colorset_setname, this.parameter.tweakpane.background_color
   */
  constructor(parameter: any) {
    // this.parameter.artwork.canvas.size;

    this.parameter = parameter;

    this.brush = new Brush();

    this.state = {
      background: {
        color: "",
      },
      colorset: {
        mode: "use_custom_colors", // "custom, colorset, random, chaos"

        groupname: "", // The name of The colorset
        variant: 0, // A name could return more then one colorset. This is to choose one of them.
        variant_index: 0,

        number: 0, // A colorset has more than one color. This is to choose a specific.
        number_index: 0,

        cs_object: null, // The ColorSet-Object

        borderColor: "", // Three default colors with alpha, extracted for easy access
        fillColor: "",
        backgroundColor: "",
      },
      format: {
        paper: "a4",
        paper_dpi: 300,
        page_orientation: "",
        fencing: true,
        aspect_ratio: 0,
        keep_aspect_ratio: true,
        size: this.parameter.artwork.canvas.size,
        /* center is always the same, instead the case: we move the Format outside the center. */
        center: new Vector(
          this.parameter.artwork.canvas.size.width * 0.5,
          this.parameter.artwork.canvas.size.height * 0.5
        ),
        fak: new Vector(
          1.0,
          1.0
        ) /* A scale Factor, for Objects to fit in the Format. */,
      },
    };
  }

  public static ensureParameterSet(parameter: any) {
    const manager = ParameterManager.from(parameter);
    return manager.ensure("background", {
      color: parameter.background?.color ?? "#efefefFF",
    });
  }

  private syncStateFromParameter() {
    if (this.parameter?.format) {
      this.state.format = this.parameter.format;
    }
    if (this.parameter?.colorset) {
      this.state.colorset = this.parameter.colorset;
    }
    if (this.parameter?.background) {
      this.state.background = this.parameter.background;
    }
  }

  /**
   * Is called by the SceneGraph.
   *
   * @param {Object} context
   * @param {Object} parameter
   */
  draw(context: any, parameter: any) {
    this.syncStateFromParameter();

    // Fill the canvas with Background Color.

    if (this.state.colorset.mode !== "use_custom_colors") {
      this.brush.borderColor = this.state.colorset.backgroundColor;
      this.brush.fillColor = this.state.colorset.backgroundColor;
    } else {
      this.brush.borderColor = this.parameter.background.color;
      this.brush.fillColor = this.parameter.background.color;
    }

    // No matter what color, alpha I take from the tweakpane
    const bgColor = this.parameter.background.color;
    this.brush.fillColorAlpha = ColorUtils.parse(bgColor).alpha;
    this.brush.borderColorAlpha = ColorUtils.parse(bgColor).alpha;

    Shape.draw(
      context,
      new Vector(0, 0),
      this.state.format.size,
      this.brush,
      false
    );
  }

  public static registerTweakpane(
    parameter: any,
    options: BackgroundTweakpaneOptions
  ) {
    const background = Background.ensureParameterSet(parameter);
    let container = options.container;

    const canAddFolder = typeof (container as any)?.addFolder === "function";
    const shouldWrap = options.wrapInFolder !== false && canAddFolder;

    if (shouldWrap) {
      container = (container as any).addFolder({
        title: options.title ?? options.label ?? "Background",
        expanded: false,
      });
    }

    const module = options.manager.createModule({
      id: options.id ?? "background",
      container,
      statePath: options.statePath,
      stateDefaults: {
        background_color: background.color ?? "#efefefFF",
      },
      channelId: "tweakpane",
    });

    module.addBinding(
      "background_color",
      {
        label: options.label ?? "Color",
        color: { type: "float" },
      },
      { target: "background.color" }
    );
  }

} // class Background
