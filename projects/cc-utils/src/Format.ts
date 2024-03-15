/**
 * Title    : Format
 * Project  : Creative Coding
 * File     : projects/cc-utils/Format.ts
 * Version  : 1.0.0
 * Published: https://gitlab.com/glimpse-of-life
 *
 * Supports :
 * - ParameterSet   : yes
 * - Tweakpane      : yes
 * is:
 * - Observer       : no
 * - ObserverSubject: yes
 * - prefixable:    : no
 *
 ** Displays the canvas in various Formats
 * Supports Portrait and Landscape
 * Defined AspectRatio Values from 1.0 to 3.555555555
 * I divide them 1/n so i can multiply later instead of divide for better usage.
 *
 * "1:1 - Square": 1.0,
 * "4:3 - Monitor": 1.333333333 -> 0.75
 * "3:2 - Phone": 1.5 -> 0.66666666666
 * "16:10 - Widesceeen WXGA": 1.6 -> 0.625
 * "5:3 - 16mm Film": 1.666666666 -> 0.6
 * "16:9 - Widescreen TV": 1.777777777 -> 0.5625
 * "2:1 - Dominoes": 2.0 -> 0.5
 * "64:27 - Ultra Widescreen": 2.370370370 -> 0.421875
 * "32:9 - Super Ultra Widescreen": 3.555555555 -> 0.28125
 *
 * However, any other formats are possible.
 *
 * ...
 *
 ** This is a observable thing
 * See Pattern.Observer, or example implementations for reference
 *
 * myFormat.addObserver(new MyObject);
 * MyObject should implement a update(source) Method
 *
 ** It provides a Tweakpane UI, the neccessary Tweakpane-Parameters and a ParameterSet-Object.
 *
 * TODO: A property to not draw, or fill or outline the thing.
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

const Color = require("canvas-sketch-util/color");
import { Pane } from "tweakpane";


import { ObserverSubject } from "./ObserverPattern";
import { Shape } from "./Shape";
import { Size } from "./Size";
import {
  TweakpaneSupport,
  type Provide_Tweakpane_To_Props,
  type TweakpaneSupport_Props,
} from "./TweakpaneSupport";
import { Vector } from "./Vector";

export interface Format_ParameterSet {
  page_orientation: string;
  aspect_ratio: number;
  keep_aspect_ratio: boolean;
  fencing: boolean;

  size: Size;
  center: Vector;

  fak: Vector;
}

export interface Format_ParameterTweakpane {
  format_page_orientation: string;
  format_aspect_ratio: number;
  format_keep_aspect_ratio: boolean;
  format_fencing: boolean;
}

export interface CheckObserverSubject_Format_Parameter {
  pageOrientation: string;
  aspectRatio: number;
  canvas_size: Size;
  fencing: boolean;
  keep_aspect_ratio: boolean;
}

/**
 * This reflects the internal state, and is used by Observer functionality.
 *
 * @interface State
 */
interface State {
  format: Format_ParameterSet;
}

export class Format extends ObserverSubject {
  private parameter: any;

  private state: State;
  private state_last: State;

  public static AspectRatios = {
    "1:1 - Square": 1.0,
    "4:3 - Monitor": 0.75,
    "3:2 - Phone": 0.66666666666,
    "16:10 - Widesceeen WXGA": 0.625,
    "5:3 - 16mm Film": 0.6,
    "16:9 - Widescreen TV": 0.5625,
    "2:1 - Dominoes": 0.5,
    "64:27 - Ultra Widescreen": 0.421875,
    "32:9 - Super Ultra Widescreen": 0.28125,
    "custom width & height": 0,
  };

  public static PageOrientation = {
    Landscape: "Landscape",
    Portrait: "Portrait",
  };

  /**
   * deprecated: Source should always be a square Canvas from which Landscape and Portrait Format is "cut".
   *
   * uses parameter.artwork.canvas.size;
   *
   * @param {Object} parameter
   */
  constructor(parameter: any) {
    super();

    this.parameter = parameter;

    this.state = {
      // for the Observer-Pattern: observerSubject_Item
      format: {
        page_orientation: "Portrait",
        aspect_ratio: 1.0,
        keep_aspect_ratio: false,
        fencing: false,

        size: parameter.artwork.canvas.size.clone(),
        center: new Vector( parameter.artwork.canvas.size.width * 0.5, parameter.artwork.canvas.size.height * 0.5),

        fak: new Vector(1.0, 1.0, 1.0),
      },
    };

    this.state_last = Format.cloneState(this.state);
  }

  /**
   * Hilfsmethode um eine deep copy des state Objektes zu machen.
   *
   * @static
   * @param {State} state
   * @return {*}  {State}
   * @memberof Format
   */
  public static cloneState(state: State): State {
    let copy: State = {
      format: {
        page_orientation: state.format.page_orientation,
        aspect_ratio: state.format.aspect_ratio,
        keep_aspect_ratio: state.format.keep_aspect_ratio,
        fencing: state.format.fencing,

        size: state.format.size.clone(),
        center: state.format.center.clone(),

        fak: state.format.fak.clone(),
      },
    };
    return copy;
  }

  isFormatChanged(
    page_orientation: string,
    aspectRatio: number,
  ): boolean {
    return (
      this.state.format.page_orientation !== page_orientation ||
      this.state.format.aspect_ratio !== aspectRatio // || !this.state.format.size.equals(canvas_size)
    );
  }

  /**
   * Sets name and aspectRatio, and notifies all Observers if changed.
   * sends: state.
   *
   * @param {CheckObserverSubject_Format_Parameter} params
   * @memberof Format
   */
  check_ObserverSubject(params: CheckObserverSubject_Format_Parameter) {
    let doNotify: boolean = false;

    // only in case of changes
    if (this.state.format.fencing !== params.fencing) {
      this.state_last.format.fencing = this.state.format.fencing;
      this.state.format.fencing = params.fencing;
      doNotify = true;
    }

    if (this.state.format.keep_aspect_ratio !== params.keep_aspect_ratio) {
      this.state_last.format.keep_aspect_ratio =
        this.state.format.keep_aspect_ratio;
      this.state.format.keep_aspect_ratio = params.keep_aspect_ratio;

      doNotify = true;
    }

    if (
      this.isFormatChanged(params.pageOrientation, params.aspectRatio)
    ) {
      // save pervious state to old
      this.state_last.format.page_orientation = this.state.format.page_orientation;
      this.state_last.format.size = this.state.format.size;
      this.state_last.format.aspect_ratio = this.state.format.aspect_ratio;

      this.state_last.format.size = this.state.format.size.clone();
      this.state_last.format.center = this.state.format.center.clone();
      this.state_last.format.fak = this.state.format.fak.clone();

      // set the new state
      this.state.format.page_orientation = params.pageOrientation;
      this.state.format.size = params.canvas_size;
      this.state.format.aspect_ratio = params.aspectRatio;

      let longSide:number;

      switch (params.pageOrientation) {
        case "Landscape":

          if (this.state_last.format.aspect_ratio !== params.aspectRatio) {
            longSide = params.canvas_size.width;
          } else {
            longSide = params.canvas_size.height;
          }

          this.state.format.size.width = longSide;
          this.state.format.size.height = longSide * params.aspectRatio;

          this.state.format.fak.x = 1;
          this.state.format.fak.y = params.aspectRatio;
          this.state.format.fak.z = params.aspectRatio;

          break;
        case "Portrait":
        default:

          if (this.state_last.format.aspect_ratio !== params.aspectRatio) {
            longSide = params.canvas_size.height;
           } else {
           longSide = params.canvas_size.width;
           }

           this.state.format.size.width = longSide * params.aspectRatio;
           this.state.format.size.height = longSide;

           this.state.format.fak.x = params.aspectRatio;
           this.state.format.fak.y = 1;
           this.state.format.fak.z = params.aspectRatio;
      }

      this.state.format.center = new Vector(
        this.state.format.size.width * 0.5,
        this.state.format.size.height * 0.5
      );

      // Das ist jetzt nicht mehr relativ zur letzten Größe...
      // this.state.format.fak.x = this.state.format.size.width / this.state_last.format.size.width;
      // this.state.format.fak.y = this.state.format.size.height / this.state_last.format.size.height;
      
      // transfert_tweakpane_parameter_to setzt alle, ausser:
      this.parameter.format.fak = this.state.format.fak.clone();
      // TODO Die rekalkulationen müssen immer von der ursprünglichen Originalgröße des Objekts ausgehen.
      // this.parameter.format.size = this.state.format.size.clone();
      // this.parameter.format.center = this.state.format.center.clone();

      this.state_last.format.size = params.canvas_size.clone();

      doNotify = true;
    }


    // notify all listeners
    if (doNotify)
      super.notifyAll(this, this.state.format, this.state_last.format);
  }


  /**
   * Recalculate the position, depending on the screen size.
   *
   * @static
   * @param {Vector} object_position
   * @param {Format_ParameterSet} format_state
   * @return {*}
   * @memberof Format
   */
  static transform_position(
    object_position: Vector,
    format_state: Format_ParameterSet
  ) {
    if (format_state.keep_aspect_ratio) {
      // perserve the proportions of the Object.
      if (format_state.size.width <= format_state.size.height) {
        // Portrait or Square
        return object_position.multiply(format_state.fak.x);
      } else {
        // Landscape
        return object_position.multiply(format_state.fak.y);
      }
    } else {
      // stretch the proportions of the Quadrat.
      return object_position.multiply(format_state.fak);
    }
  }

  /**
   * Recalculate the size, depending on the screen size.
   *
   * @static
   * @param {Size} object_size
   * @param {Format_ParameterSet} format_state
   * @return {*}
   * @memberof Format
   */
  static transform_size(object_size: Size, format_state: Format_ParameterSet) {
    let w = object_size.width;
    let h = object_size.height;

    if (format_state.keep_aspect_ratio) {
      // perserve the proportions of the Object.
      if (format_state.size.width <= format_state.size.height) {
        // Portrait or Square
        w = w * format_state.fak.x;
        h = h * format_state.fak.x;
      } else {
        // Landscape
        w = w * format_state.fak.y;
        h = h * format_state.fak.y;
      }
    } else {
      // stretch the proportions of the Quadrat.
      w = w * format_state.fak.x;
      h = h * format_state.fak.y;
    }

    return new Size(w, h);
  }

  /**
   * Recalculate the value, depending on the screen size.
   *
   * @static
   * @param {number} value
   * @param {Format_ParameterSet} format_state
   * @return {*}
   * @memberof Format
   */
  static transform(value: number, format_state: Format_ParameterSet) {
    if (format_state.size.width <= format_state.size.height) {
      // Portrait or Square
      value = value * format_state.fak.x;
    } else {
      // Landscape
      value = value * format_state.fak.y;
    }

    return value;
  }

  /**
   * Checks if the object is outside the screen.
   * Is used with Fencing.
   *
   * @static
   * @param {Vector} object_position_old
   * @param {Vector} object_position_new
   * @param {Size} object_size
   * @param {Format_ParameterSet} format_state
   * @return { isBounce:boolean, position:Vector }
   * @memberof Format
   */
  static check_bounce(
    object_position_old: Vector,
    object_position_new: Vector,
    object_size: Size,
    format_state: Format_ParameterSet
  ) {
    let isBounce = false;

    if (object_position_new.x + object_size.width > format_state.size.width) {
      // right
      isBounce = true;
    } else if (object_position_new.x < 0) {
      // left
      isBounce = true;
    }

    if (object_position_new.y + object_size.height > format_state.size.height) {
      // bottom
      isBounce = true;
    } else if (object_position_new.y < 0) {
      // top
      isBounce = true;
    }

    // TODO Json Rückgabe-Typ in Interface überführen
    return {
      isBounce: isBounce,
      position: isBounce ? object_position_old : object_position_new,
    };
  }

  /**
   * Is called by the SceneGraph.
   * Format didnt draw anything.
   * Paramter Object {format:{brush: new Brush()}}
   *
   * @param {Object} context
   * @param {Object} parameter - {format:{brush:{ Brush }}} - with a Brush Object
   */
  draw(context: any, parameter: any) {}

  //* --------------------------------------------------------------------
  //*
  //* Parameter-Set Object + Tweakpane
  //*
  //* --------------------------------------------------------------------

  /**
   * TweakpaneSupport has three Methods:
   *
   * - inject_parameterset_to
   * - transfer_tweakpane_parameter_to
   * - provide_tweakpane_to
   *
   * @static
   * @type {TweakpaneSupport}
   * @memberof Format
   */
  public static tweakpaneSupport: TweakpaneSupport = {
    /**
     ** --------------------------------------------------------------------
     ** Inject
     ** --------------------------------------------------------------------
     * @param parameter
     * @param parameterSetName
     */
    inject_parameterset_to: function (
      parameter: any,
      props: TweakpaneSupport_Props
    ): void {
      let _parameterSet: Format_ParameterSet = {
        page_orientation: parameter.tweakpane.format_page_orientation,
        aspect_ratio: parameter.tweakpane.format_aspect_ratio,
        keep_aspect_ratio: parameter.tweakpane.format_keep_aspect_ratio,
        fencing: parameter.tweakpane.format_fencing,

        size: parameter.artwork.canvas.size,
        center: new Vector(
          parameter.artwork.canvas.size.width * 0.5,
          parameter.artwork.canvas.size.height * 0.5
        ),

        fak: new Vector(1.0, 1.0, 1.0) /* A scale Factor, for Objects to fit in the Format. */,
      };

      Object.assign(parameter, {
        format: _parameterSet,
      });
    },
    /**
     ** --------------------------------------------------------------------
     ** Transfert
     ** --------------------------------------------------------------------
     * @param parameter
     * @param parameterSetName
     */
    transfer_tweakpane_parameter_to: function (
      parameter: any,
      props: TweakpaneSupport_Props
    ): void {
      let pt: Format_ParameterTweakpane = parameter.tweakpane;

      parameter.format.page_orientation = pt.format_page_orientation;
      parameter.format.aspect_ratio = pt.format_aspect_ratio;
      parameter.format.keep_aspect_ratio = pt.format_keep_aspect_ratio;
      parameter.format.fencing = pt.format_fencing;
    },
    /**
     ** --------------------------------------------------------------------
     ** Tweakpane
     ** --------------------------------------------------------------------
     *
     * @abstract
     * @param {*} parameter - The parameter object
     * @param {Provide_Tweakpane_To_Props} props
     * @return {*}  {*}
     * @memberof TweakpaneSupport
     */
    provide_tweakpane_to: function (
      parameter: any,
      props: Provide_Tweakpane_To_Props
    ) {
      let parameterTP: Format_ParameterTweakpane = {
        format_page_orientation: "Portrait",
        format_aspect_ratio: 1.0,
        format_keep_aspect_ratio: true,
        format_fencing: true,
      };

      parameter.tweakpane = Object.assign(parameter.tweakpane, parameterTP);

      Format.tweakpaneSupport.inject_parameterset_to(parameter);

      if (props.folder == null) {
        props.folder = props.pane.addFolder({
          title: props.folder_name_prefix + "Format",
        });
      }

      if (props.use_separator) {
        props.folder.addBlade({
          view: "separator",
        });
      }

      props.folder.addBinding(parameter.tweakpane, "format_page_orientation", {
        label: "Format",
        options: Format.PageOrientation,
      });

      props.folder.addBinding(parameter.tweakpane, "format_aspect_ratio", {
        label: "Asp.Ratio",
        options: Format.AspectRatios,
      });

      props.folder.addBinding(parameter.tweakpane, "format_keep_aspect_ratio", {
        label: "Keep AR",
      });

      props.folder.addBinding(parameter.tweakpane, "format_fencing", {
        label: "Fence",
      });

      return props.folder;
    },
  };
} // class Format
