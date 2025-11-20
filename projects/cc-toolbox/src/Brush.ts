/**
 * Title    : Brush
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/Brush.ts
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
 *
 * Supports:
 * - ParameterSet   : yes
 * - Tweakpane      : yes
 * is:
 * - Observer       : no
 * - ObserverSubject: no
 * - prefixable:    : yes
 *
 * This is a Brush.
 * It stores all the important Properties to draw something.
 *
 * TODO Was mache ich: Position im Brush oder nicht?
 * TODO Was mache ich: Size im Brush oder nicht?
 * 
 ** POSITION und SIZE nicht in dem Brush übernehmen...
 * Wenn man den Brush als ein Style versteht, den man auf verschiedene
 * Objekte anwenden kann.
 *
 ** POSITION und SIZE in dem Brush übernehmen...
 * Wenn man den Brush auf ein Objekt anwendet.
 * Objekte anwenden kann.
 *
 * Vielleicht sollte ich Brush (style) und (Position und Größe) separat lassen.
 * und die size mit rein. die ist ja wie scale.
 * 
 ** Array von Positionen im Brush:
 ** Ich kann mit ein und dem selben Brush mehrmals auf die Leinwand tippen.
 *
 * 
 * Erledigtes:
 *  - Position auch in den Brush übernehmen.
 *    Das ist eigentlich auch Brush-Eigenschaften.
 *  - size wird eigentlich immer relativ zur Bildschirmgröße berechnet, und nie in absoluten Werten.
 *    und braucht deshalb nicht als Eigenschaft in den Brush aufgenommen werden.
 *    Die Größe kann dann über scale verändert werden.
 *    Würde den Umgang damit vielleicht nochmals vereinfachen.
 *    Size braucht es im brusch gar nicht, weil scale !
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

 // Brush.ts
import { Size } from "./Size";
import { Shape } from "./Shape";
import { Vector } from "./Vector";
import { ParameterManager } from "./ParameterManager";
import { ColorUtils } from "./ColorUtils";
import {
  TweakpaneManager,
  type TweakpaneContainer,
} from "./TweakpaneManager";

export interface BrushText {
  content: string;
  fontSize: number;
  fontFamily: string;
}

/**
 * Defines the Brush-Data.
 * @export
 * @interface BrushType
 */
export interface Brush_ParameterSet {
  shape: string;

  angle: number;

  position: Vector;
  scale: number | Vector; //! is the size

  border: number;

  fillColor: string;
  borderColor: string;

  fillColorAlpha: any;
  borderColorAlpha: any;

  text: BrushText;
}

// nicht benutzt, da prefixable
export interface Brush_ParameterTweakpane {
  brush_shape: string;
  brush_border: number;
  brush_position_x: number;
  brush_position_y: number;
  brush_scale: number;
  brush_scale_x: number;
  brush_scale_y: number;
  brush_rotate: number;
  brush_borderColor: string;
  brush_fillColor: string;
}

interface BrushControlState {
  brush_shape: string;
  brush_border: number;
  brush_position_x: number;
  brush_position_y: number;
  brush_scale: number;
  brush_scale_x: number;
  brush_scale_y: number;
  brush_rotate: number;
  brush_borderColor: string;
  brush_fillColor: string;
}

export interface BrushTweakpaneOptions {
  manager: TweakpaneManager;
  container: TweakpaneContainer;
  parameterPath: string | string[];
  statePath?: string | string[];
  defaults?: Partial<BrushControlState>;
  channelId?: string;
  id?: string;
}

export class Brush implements Brush_ParameterSet {
  public shape: string;

  public angle: number;

  public position: Vector;
  public scale: number | Vector;

  public border: number;

  public fillColor: string;
  public borderColor: string;

  public fillColorAlpha: any;
  public borderColorAlpha: any;

  public text: BrushText;

  /**
   * Creates an instance of Brush.
   *
   * A Brush has the following Properties:
   *
   * shape       - Name of a Shape-Object
   * position    - The Position of the Shape
   * scale       - The Scale-Factor may be
   *               scale = 1.5; or
   *               scale = new Vector(1.5, 1.2)
   *               Size is allways a Scale-Factor from canvasSize;
   * angle       - the Rotation Angle
   * border      - reflects to context.lineWidth
   * fillColor   - like "#EFEFEFFF", reflects to context.fillStyle
   * borderColor - like "#000000FF", reflects to context.strokeStyle
   *
   * @param {Brush_ParameterSet} [brush_ps={
   *       shape: "Rect",
   *       position: new Vector(0, 0),
   *       angle: 0.0,
   *       scale: 1.0,
   *       border: 1.0,
   *       borderColor: "#EFEFEFFF",
   *       fillColor: "#000000FF",
   *       fillColorAlpha: undefined,
   *       borderColorAlpha: undefined,
   *       text: ''
   *     }]
   * @memberof Brush
   */
  constructor(
    brush_ps: Brush_ParameterSet = {
      shape: "Rect",
      angle: 0.0,

      position: new Vector(0, 0),
      scale: 1.0,

      border: 1.0,
      borderColor: "#EFEFEFFF",
      fillColor: "#000000FF",
      fillColorAlpha: 0,
      borderColorAlpha: 0,
      text: {
        content: "T",
        fontSize: 100,
        fontFamily: "serif",
      },
    }
  ) {
    this.shape = brush_ps.shape;

    this.angle = brush_ps.angle;

    this.position = brush_ps.position;
    this.scale = brush_ps.scale; //! this is the size!

    this.border = brush_ps.border; // context.lineWidth

    // https://www.farb-tabelle.de/de/farbtabelle.htm
    this.fillColor = brush_ps.fillColor; // context.fillStyle
    this.borderColor = brush_ps.borderColor; // context.strokeStyle

    // Is parsed from this.fillColor and this.borderColor
    // this.fillColorAlpha = 125;
    // this.borderColorAlpha = 125;

    this.fillColorAlpha = ColorUtils.parse(this.fillColor).alpha;
    this.borderColorAlpha = ColorUtils.parse(this.borderColor).alpha;

    this.text = brush_ps.text;
  } // constructor

  /**
   *
   *
   * @static
   * @param {Brush} brush
   * @return {*}  {Brush}
   * @memberof Brush
   */
  static clone(brush: Brush): Brush {
    let nb = new Brush();
    nb.shape = brush.shape;

    nb.angle = brush.angle;

    nb.position = brush.position;
    nb.scale = brush.scale;

    nb.border = brush.border;
    nb.fillColor = brush.fillColor;
    nb.borderColor = brush.borderColor;
    nb.fillColorAlpha = ColorUtils.parse(nb.fillColor).alpha;
    nb.borderColorAlpha = ColorUtils.parse(nb.borderColor).alpha;
    nb.text = brush.text;
    return nb;
  } // clone

  private static defaultControlState(): BrushControlState {
    return {
      brush_shape: "Circle",
      brush_border: 0.1,
      brush_position_x: 0.5,
      brush_position_y: 0.5,
      brush_scale: 1.0,
      brush_scale_x: 1.0,
      brush_scale_y: 1.0,
      brush_rotate: 0,
      brush_borderColor: "#000000FF",
      brush_fillColor: "#FFFFFFFF",
    };
  }

  public static registerTweakpane(
    parameter: any,
    options: BrushTweakpaneOptions
  ) {
    const defaults = {
      ...Brush.defaultControlState(),
      ...(options.defaults ?? {}),
    };

    const module = options.manager.createModule({
      id: options.id ?? "brush",
      container: options.container,
      statePath: options.statePath,
      stateDefaults: defaults,
      channelId: options.channelId ?? "tweakpane",
    });

    // Ensure color fields are valid to enable color pickers
    const current = module.getState();
    module.setState({
      brush_borderColor:
        typeof current.brush_borderColor === "string"
          ? current.brush_borderColor
          : defaults.brush_borderColor,
      brush_fillColor:
        typeof current.brush_fillColor === "string"
          ? current.brush_fillColor
          : defaults.brush_fillColor,
    });

    module.addBinding("brush_shape", {
      label: "Shape",
      options: Shape.ShapeNames,
    });

    module.addBinding("brush_border", {
      label: "Border",
      min: 0,
      max: 1,
      step: 0.0001,
    });

    module.addBinding("brush_position_x", {
      label: "Pos X",
      min: 0.0001,
      max: 1.0,
      step: 0.0001,
    });

    module.addBinding("brush_position_y", {
      label: "Pos Y",
      min: 0.0001,
      max: 1.0,
      step: 0.0001,
    });

    module.addBinding("brush_scale", {
      label: "Scale",
      min: 0.001,
      max: 10,
      step: 0.0001,
    });

    module.addBinding("brush_scale_x", {
      label: "Scale X",
      min: 0.001,
      max: 10,
      step: 0.0001,
    });

    module.addBinding("brush_scale_y", {
      label: "Scale Y",
      min: 0.001,
      max: 10,
      step: 0.0001,
    });

    module.addBinding("brush_rotate", {
      label: "Rotate",
      min: -360,
      max: 360,
      step: 0.0001,
    });

    module.addBinding("brush_borderColor", {
      label: "BorderColor",
      color: { type: "float" },
    });

    module.addBinding("brush_fillColor", {
      label: "FillColor",
      color: { type: "float" },
    });

    Brush.applyState(parameter, options.parameterPath, module.getState());
    module.onUpdate((state) => {
      Brush.applyState(parameter, options.parameterPath, state);
    });

    return module;
  }

  private static applyState(
    parameter: any,
    path: string | string[],
    state: BrushControlState
  ) {
    const manager = ParameterManager.from(parameter);
    const targetParent = manager.ensure(path);
    if (!targetParent.brush) {
      targetParent.brush = new Brush();
    }

    const brush: Brush_ParameterSet = targetParent.brush;
    brush.shape = state.brush_shape;
    brush.angle = state.brush_rotate;
    brush.position = new Vector(state.brush_position_x, state.brush_position_y);

    const baseScaleX = state.brush_scale_x * parameter.artwork.scale;
    const baseScaleY = state.brush_scale_y * parameter.artwork.scale;
    brush.scale = new Vector(
      baseScaleX,
      baseScaleY,
      baseScaleX * 0.5
    ).multiply(state.brush_scale);

    brush.border =
      Size.get_shorter_side(parameter.artwork.canvas.size) *
      state.brush_border *
      state.brush_scale *
      state.brush_scale_x *
      parameter.artwork.scale;

    brush.borderColor = state.brush_borderColor;
    brush.fillColor = state.brush_fillColor;

    targetParent.brush = brush;
  }

} // class Brush
