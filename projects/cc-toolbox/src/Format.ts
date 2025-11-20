/**
 * Title    : Format
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/Format.ts
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
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
// Format.ts

import { ObserverSubject } from "./ObserverPattern";
import { Shape } from "./Shape";
import { Size } from "./Size";
import { Vector } from "./Vector";
import { TweakpaneManager } from "./TweakpaneManager";


export interface Format_ParameterSet {
  format: Format_ParameterSet_Values;
}
export interface Format_ParameterSet_Values {
  paper: string;
  paper_dpi: number;
  page_orientation: string;
  aspect_ratio: number;
  keep_aspect_ratio: boolean;
  fencing: boolean;

  size: Size;
  center: Vector;

  fak: Vector;
}

/**
 * This reflects the internal state, and is used by Observer functionality.
 *
 * @interface State
 */
interface State {
  format: Format_ParameterSet_Values;
}

interface Format_ParameterTweakpane {

  format_paper: string;
  format_paper_dpi: number;

  format_width: number;
  format_height: number;

  format_page_orientation: string;
  format_aspect_ratio: number;

  format_keep_aspect_ratio: boolean;
  format_fencing: boolean;
}

export interface Check_ObserverSubject_Format_Parameter {
  canvas_size: Size;
}

enum UnitOfMeasurement {
  mm = "mm",
  inch = "inch"
}

interface PaperSize {
  name: string;
  width: number;
  height: number;
  unit: UnitOfMeasurement
}

export class Format extends ObserverSubject {
  private parameter: any;

  public state: State;
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
    "From Paper": 0,
  };

  public static PaperSizes: PaperSize[] = [
    { name: "postcard", width: 101.6, height: 152.4, unit: UnitOfMeasurement.mm },
    { name: "poster-small", width: 280, height: 430, unit: UnitOfMeasurement.mm },
    { name: "poster", width: 460, height: 610, unit: UnitOfMeasurement.mm },
    { name: "poster-large", width: 610, height: 910, unit: UnitOfMeasurement.mm },
    { name: "business-card", width: 50.8, height: 88.9, unit: UnitOfMeasurement.mm },

    { name: "2r", width: 64, height: 89, unit: UnitOfMeasurement.mm },
    { name: "3r", width: 89, height: 127, unit: UnitOfMeasurement.mm },
    { name: "4r", width: 102, height: 152, unit: UnitOfMeasurement.mm },
    { name: "5r", width: 127, height: 178, unit: UnitOfMeasurement.mm }, // 5″x7″
    { name: "6r", width: 152, height: 203, unit: UnitOfMeasurement.mm }, // 6″x8″″
    { name: "8r", width: 203, height: 254, unit: UnitOfMeasurement.mm }, // 8″x10″
    { name: "10r", width: 254, height: 305, unit: UnitOfMeasurement.mm }, // 10″x12″
    { name: "11r", width: 279, height: 356, unit: UnitOfMeasurement.mm }, // 11″x14″
    { name: "12r", width: 305, height: 381, unit: UnitOfMeasurement.mm }, // 11″x14″

    // Standard Paper Sizes
    { name: "a0", width: 841, height: 1189, unit: UnitOfMeasurement.mm },
    { name: "a1", width: 594, height: 841, unit: UnitOfMeasurement.mm },
    { name: "a2", width: 420, height: 594, unit: UnitOfMeasurement.mm },
    { name: "a3", width: 297, height: 420, unit: UnitOfMeasurement.mm },
    { name: "a4", width: 210, height: 297, unit: UnitOfMeasurement.mm },
    { name: "a5", width: 148, height: 210, unit: UnitOfMeasurement.mm },
    { name: "a6", width: 105, height: 148, unit: UnitOfMeasurement.mm },
    { name: "a7", width: 74, height: 105, unit: UnitOfMeasurement.mm },
    { name: "a8", width: 52, height: 74, unit: UnitOfMeasurement.mm },
    { name: "a9", width: 37, height: 52, unit: UnitOfMeasurement.mm },
    { name: "a10", width: 26, height: 37, unit: UnitOfMeasurement.mm },
    { name: "2a0", width: 1189, height: 1682, unit: UnitOfMeasurement.mm },
    { name: "4a0", width: 1682, height: 2378, unit: UnitOfMeasurement.mm },
    { name: "b0", width: 1000, height: 1414, unit: UnitOfMeasurement.mm },
    { name: "b1", width: 707, height: 1000, unit: UnitOfMeasurement.mm },
    { name: "b1+", width: 720, height: 1020, unit: UnitOfMeasurement.mm },
    { name: "b2", width: 500, height: 707, unit: UnitOfMeasurement.mm },
    { name: "b2+", width: 520, height: 720, unit: UnitOfMeasurement.mm },
    { name: "b3", width: 353, height: 500, unit: UnitOfMeasurement.mm },
    { name: "b4", width: 250, height: 353, unit: UnitOfMeasurement.mm },
    { name: "b5", width: 176, height: 250, unit: UnitOfMeasurement.mm },
    { name: "b6", width: 125, height: 176, unit: UnitOfMeasurement.mm },
    { name: "b7", width: 88, height: 125, unit: UnitOfMeasurement.mm },
    { name: "b8", width: 62, height: 88, unit: UnitOfMeasurement.mm },
    { name: "b9", width: 44, height: 62, unit: UnitOfMeasurement.mm },
    { name: "b10", width: 31, height: 44, unit: UnitOfMeasurement.mm },
    { name: "b11", width: 22, height: 32, unit: UnitOfMeasurement.mm },
    { name: "b12", width: 16, height: 22, unit: UnitOfMeasurement.mm },
    { name: "c0", width: 917, height: 1297, unit: UnitOfMeasurement.mm },
    { name: "c1", width: 648, height: 917, unit: UnitOfMeasurement.mm },
    { name: "c2", width: 458, height: 648, unit: UnitOfMeasurement.mm },
    { name: "c3", width: 324, height: 458, unit: UnitOfMeasurement.mm },
    { name: "c4", width: 229, height: 324, unit: UnitOfMeasurement.mm },
    { name: "c5", width: 162, height: 229, unit: UnitOfMeasurement.mm },
    { name: "c6", width: 114, height: 162, unit: UnitOfMeasurement.mm },
    { name: "c7", width: 81, height: 114, unit: UnitOfMeasurement.mm },
    { name: "c8", width: 57, height: 81, unit: UnitOfMeasurement.mm },
    { name: "c9", width: 40, height: 57, unit: UnitOfMeasurement.mm },
    { name: "c10", width: 28, height: 40, unit: UnitOfMeasurement.mm },
    { name: "c11", width: 22, height: 32, unit: UnitOfMeasurement.mm },
    { name: "c12", width: 16, height: 22, unit: UnitOfMeasurement.mm },

    { name: "half-letter", width: 5.5, height: 8.5, unit: UnitOfMeasurement.inch },
    { name: "letter", width: 8.5, height: 11.0, unit: UnitOfMeasurement.inch },
    { name: "legal", width: 8.5, height: 14.0, unit: UnitOfMeasurement.inch },
    { name: "junior-legal", width: 5.0, height: 8.0, unit: UnitOfMeasurement.inch },
    { name: "ledger", width: 11.0, height: 17.0, unit: UnitOfMeasurement.inch },
    { name: "tabloid", width: 11.0, height: 17.0, unit: UnitOfMeasurement.inch },
    { name: "ansi-a", width: 8.5, height: 11.0, unit: UnitOfMeasurement.inch },
    { name: "ansi-b", width: 11.0, height: 17.0, unit: UnitOfMeasurement.inch },
    { name: "ansi-c", width: 17.0, height: 22.0, unit: UnitOfMeasurement.inch },
    { name: "ansi-d", width: 22.0, height: 34.0, unit: UnitOfMeasurement.inch },
    { name: "ansi-e", width: 34.0, height: 44.0, unit: UnitOfMeasurement.inch },

    { name: "arch-a", width: 9.0, height: 12.0, unit: UnitOfMeasurement.inch },
    { name: "arch-b", width: 12.0, height: 18.0, unit: UnitOfMeasurement.inch },
    { name: "arch-c", width: 18.0, height: 24.0, unit: UnitOfMeasurement.inch },
    { name: "arch-d", width: 24.0, height: 36.0, unit: UnitOfMeasurement.inch },
    { name: "arch-e", width: 36.0, height: 48.0, unit: UnitOfMeasurement.inch },
    { name: "arch-e1", width: 30.0, height: 42.0, unit: UnitOfMeasurement.inch },
    { name: "arch-e2", width: 26.0, height: 38.0, unit: UnitOfMeasurement.inch },
    { name: "arch-e3", width: 27.0, height: 39.0, unit: UnitOfMeasurement.inch },
  ];

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

    this.state = { //? Format.get_default_paramterset(parameter);
      // for the Observer-Pattern: observerSubject_Item
      format: {
        paper: "a4",
        paper_dpi: 300,

        page_orientation: "Portrait",
        aspect_ratio: 1.0,
        keep_aspect_ratio: false,
        fencing: false,

        size: parameter.artwork.canvas.size.clone(),
        center: new Vector(parameter.artwork.canvas.size.width * 0.5, parameter.artwork.canvas.size.height * 0.5),

        fak: new Vector(1.0, 1.0, 1.0)
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
        paper: "a4",
        paper_dpi: 300,
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
   * Hier gibt es theoretisch zwei Möglichkeiten:
   * a.) Grob: Alle Änderungen sammeln und einmal notify. Dann muss der Empfänger das auseinander dividieren.
   * b.) FeinGranular: Für jede einzelne Änderung ein notify, für exakt das eine Property.
   * 
   * Ich hab Variante a.) implementiert.
   *
   * @param {Check_ObserverSubject_Format_Parameter} params
   * @memberof Format
   */
  check_ObserverSubject(params: Check_ObserverSubject_Format_Parameter) {
    let doNotify: boolean = false;

    // Das ist die aktuelle Größe: this.parameter.artwork.canvas.size
    let actual_canvas_size = params.canvas_size;
    
    // Die restlichen Parameter kommen aus der eigenen Tweakpane...
    // TODO: Hier könnte (sollte) ich auch das parameter-set nehmen da die daten dorthin transportiert worden sind.
    // vergleichen tu ich mit dem state.
    let pageOrientation = this.parameter.format.page_orientation; // tweakpane.format_page_orientation;
    let aspectRatio = this.parameter.format.aspect_ratio; // .tweakpane.format_aspect_ratio;
    let fencing = this.parameter.format.fencing; // tweakpane.format_fencing;
    let keep_aspect_ratio = this.parameter.format.keep_aspect_ratio; // tweakpane.format_keep_aspect_ratio;
    let paper = this.parameter.format.paper; // tweakpane.format_paper;
    let paper_dpi = this.parameter.format.paper_dpi; // tweakpane.format_paper_dpi;
    let width = this.parameter.format.width // tweakpane.format_width; TODO format_size_width
    let height = this.parameter.format.height // tweakpane.format_height;

    // This is: Property-Change Support...
    // only in case of changes
    if (this.state.format.paper !== paper) {
      // save pervious state to old
      this.state_last.format.paper = this.state.format.paper;
      this.state_last.format.size = this.state.format.size.clone();

      // set the new state
      this.state.format.paper = paper;
      this.state.format.size = Format.transform_from_paper_size(actual_canvas_size, this.state.format);
      // set p-set
      this.parameter.format.size = this.state.format.size.clone();

      this.parameter.tweakpane.format_aspect_ratio = 0; // aspect ratio kommt vom Papier.
      doNotify = true;
    }

    if (this.state.format.paper_dpi !== paper_dpi) {
      // save pervious state to old
      this.state_last.format.paper_dpi = this.state.format.paper_dpi;
      this.state_last.format.size = this.state.format.size.clone();

      // set the new state
      this.state.format.paper_dpi = paper_dpi;
      this.state.format.size = Format.transform_from_paper_size(actual_canvas_size, this.state.format);
      
      // p-set
      this.parameter.format.size = this.state.format.size.clone();

      this.parameter.tweakpane.format_aspect_ratio = 0; // aspect ratio kommt vom Papier.
      doNotify = true;
    }

    if (this.state.format.fencing !== fencing) {
      this.state_last.format.fencing = this.state.format.fencing;
      this.state.format.fencing = fencing;
      doNotify = true;
    }

    if (this.state.format.keep_aspect_ratio !== keep_aspect_ratio) {
      this.state_last.format.keep_aspect_ratio =
        this.state.format.keep_aspect_ratio;
      this.state.format.keep_aspect_ratio = keep_aspect_ratio;

      doNotify = true;
    }

    // TODO width oder height wurde geändert
    if (this.state.format.size.width !== width) {
      // Berechne den jeweiligen anderen aus pageOrientation und aspectRatio
      // entweder aus den Papier- oder den Screen formaten
    }

    if (this.state.format.size.height !== height) {

    }


    if(aspectRatio===0){
      // Aspect ratio kommt vom Papier
      // TODO Umschaltung Portrait Landscape bekommt er hier noch nicht mit...

      // neue aspect-ratio
      let new_canvas_size:Size = this.state.format.size.clone();
      let new_aspectRatio:number = new_canvas_size.width / new_canvas_size.height;
      this.calculate_aspect_ratio(pageOrientation, new_canvas_size, new_aspectRatio);
      
      this.state.format.center = new Vector(
        this.state.format.size.width * 0.5,
        this.state.format.size.height * 0.5
      );

      this.parameter.tweakpane.format_width = new_canvas_size.width;
      this.parameter.tweakpane.format_height = new_canvas_size.height;
      //! Ein Tweakpane refresh(); erfolgt in SketchRunner.update

    } else {
      // Aspect ratio kommt nicht vom Papier...
      if (
        this.isFormatChanged(pageOrientation, aspectRatio)
      ) {
        // save pervious state to old
        this.state_last.format.page_orientation = this.state.format.page_orientation;
        this.state_last.format.size = this.state.format.size;
        this.state_last.format.aspect_ratio = this.state.format.aspect_ratio;
  
        this.state_last.format.size = this.state.format.size.clone();
        this.state_last.format.center = this.state.format.center.clone();
        this.state_last.format.fak = this.state.format.fak.clone();
  
        // set the new state
        this.state.format.page_orientation = pageOrientation;
        this.state.format.size = actual_canvas_size;
        this.state.format.aspect_ratio = aspectRatio;
  
        this.calculate_aspect_ratio(pageOrientation, actual_canvas_size, aspectRatio);
  
        this.state.format.center = new Vector(
          this.state.format.size.width * 0.5,
          this.state.format.size.height * 0.5
        );
  
        // ?? p-set
        this.parameter.format.size = this.state.format.size.clone();
        this.parameter.format.center = this.state.format.center.clone();

        // Das ist jetzt nicht mehr relativ zur letzten Größe...
        // this.state.format.fak.x = this.state.format.size.width / this.state_last.format.size.width;
        // this.state.format.fak.y = this.state.format.size.height / this.state_last.format.size.height;
  
        // transfert_tweakpane_parameter_to setzt alle, ausser:
        this.parameter.format.fak = this.state.format.fak.clone();
        // TODO Die rekalkulationen müssen immer von der ursprünglichen Originalgröße des Objekts ausgehen.
        // this.parameter.format.size = this.state.format.size.clone();
        // this.parameter.format.center = this.state.format.center.clone();
  
        this.state_last.format.size = actual_canvas_size.clone();
  
        doNotify = true;
      }
    }



    // notify all listeners
    if (doNotify)
      super.notifyAll(this, this.state.format, this.state_last.format);
  }

  /**
   * 
   */
  private calculate_aspect_ratio(pageOrientation:string, actual_canvas_size:Size, aspectRatio:number): void{
    
    let longSide: number;

    switch (pageOrientation) {

      case "Landscape":

        if (this.state_last.format.aspect_ratio !== aspectRatio) {
          longSide = actual_canvas_size.width;
        } else {
          longSide = actual_canvas_size.height;
        }

        this.state.format.size.width = longSide;
        this.state.format.size.height = longSide * aspectRatio;

        this.state.format.fak.x = 1;
        this.state.format.fak.y = aspectRatio;
        this.state.format.fak.z = aspectRatio;

        break;
      case "Portrait":
      default:

        if (this.state_last.format.aspect_ratio !== aspectRatio) {
          longSide = actual_canvas_size.height;
        } else {
          longSide = actual_canvas_size.width;
        }

        this.state.format.size.width = longSide * aspectRatio;
        this.state.format.size.height = longSide;

        this.state.format.fak.x = aspectRatio;
        this.state.format.fak.y = 1;
        this.state.format.fak.z = aspectRatio;
    }

  }

  /**
   * Recalculate the position, depending on the screen size.
   *
   * @static
   * @param {Vector} object_position
   * @param {Format_ParameterSet_Values} format_state
   * @return {*}
   * @memberof Format
   */
  static transform_position(
    object_position: Vector,
    format_state: Format_ParameterSet_Values
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
   * @param {Format_ParameterSet_Values} format_state
   * @return {*}
   * @memberof Format
   */
  static transform_size(object_size: Size, format_state: Format_ParameterSet_Values) {
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
   * Berechne die neue canvas größe aus dem papierformat und den dpi...
   * 
   * @param object_size 
   * @param format_state 
   * @returns new Size from Paper-Format and dpi.
   */
  public static transform_from_paper_size(object_size: Size, format_state: Format_ParameterSet_Values): Size {

    let size: Size = object_size;
    let dpi = format_state.paper_dpi;
    let ps: PaperSize | undefined = Format.PaperSizes.find((({ name }) => name === format_state.paper));

    if (ps !== undefined) {
      // Umrechnung mm in inch
      let w = (ps.unit === UnitOfMeasurement.mm ? ps.width / 25.4 : ps.width);
      let h = (ps.unit === UnitOfMeasurement.mm ? ps.height / 25.4 : ps.height);
      // neue Größe
      size = new Size(dpi * w, dpi * h);
      // TODO: Die aspect-ratio hat sich auch geändert!
    }

    return size;
  }

  /**
   * Recalculate the value, depending on the screen size.
   *
   * @static
   * @param {number} value
   * @param {Format_ParameterSet_Values} format_state
   * @return {*}
   * @memberof Format
   */
  static transform(value: number, format_state: Format_ParameterSet_Values) {
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
   * @param {Format_ParameterSet_Values} format_state
   * @return { isBounce:boolean, position:Vector }
   * @memberof Format
   */
  static check_bounce(
    object_position_old: Vector,
    object_position_new: Vector,
    object_size: Size,
    format_state: Format_ParameterSet_Values
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
  draw(context: any, parameter: any) { }


  //* --------------------------------------------------------------------
  //* Provide Default Parameter-Set
  //* --------------------------------------------------------------------

  public static get_default_paramterset(parameter?: any): any {

    const parameter_default: Format_ParameterSet = {
      format: {
        paper: "a4",
        paper_dpi: 300,

        page_orientation: "Portrait",
        aspect_ratio: 1.0,
        keep_aspect_ratio: false,
        fencing: false,

        size: parameter.artwork.canvas.size.clone(),
        center: new Vector(parameter.artwork.canvas.size.width * 0.5, parameter.artwork.canvas.size.height * 0.5),

        fak: new Vector(1.0, 1.0, 1.0)
      }
    }

    return parameter_default;
  } // get_default_paramterset

  public static ensureParameterSet(parameter: any) {
    if (!("format" in parameter)) {
      parameter.format = {};
    }

    const defaults: Format_ParameterSet_Values = {
      paper: parameter.format.paper ?? "a4",
      paper_dpi: parameter.format.paper_dpi ?? 300,
      page_orientation: parameter.format.page_orientation ?? "Portrait",
      aspect_ratio: parameter.format.aspect_ratio ?? 1.0,
      keep_aspect_ratio: parameter.format.keep_aspect_ratio ?? true,
      fencing: parameter.format.fencing ?? true,
      size:
        parameter.format.size ??
        parameter.artwork.canvas.size.clone(),
      center:
        parameter.format.center ??
        new Vector(
          parameter.artwork.canvas.size.width * 0.5,
          parameter.artwork.canvas.size.height * 0.5
        ),
      fak:
        parameter.format.fak ?? new Vector(1.0, 1.0, 1.0),
    };

    Object.assign(parameter.format, defaults);
  }

  public static registerTweakpane(
    parameter: any,
    manager: TweakpaneManager,
    container: any
  ) {
    Format.ensureParameterSet(parameter);

    const module = manager.createModule({
      id: "format",
      container,
      stateDefaults: {
        format_paper: parameter.format.paper,
        format_paper_dpi: parameter.format.paper_dpi,
        format_width: parameter.artwork.canvas.size.width,
        format_height: parameter.artwork.canvas.size.height,
        format_page_orientation: parameter.format.page_orientation,
        format_aspect_ratio: parameter.format.aspect_ratio,
        format_keep_aspect_ratio: parameter.format.keep_aspect_ratio,
        format_fencing: parameter.format.fencing,
      },
      channelId: "tweakpane",
    });

    module.addBinding(
      "format_paper",
      {
        label: "Paper",
        options: Format.PaperSizes.map((ps) => ({
          text: ps.name,
          value: ps.name,
        })),
      },
      { target: "format.paper" }
    );

    module.addBinding(
      "format_paper_dpi",
      {
        label: "Resolution (dpi)",
      },
      { target: "format.paper_dpi" }
    );

    module.addBlade({
      view: "separator",
    });

    module.addBinding(
      "format_width",
      {
        label: "Width",
      },
      { target: "format.width" }
    );

    module.addBinding(
      "format_height",
      {
        label: "Height",
      },
      { target: "format.height" }
    );

    module.addBinding(
      "format_page_orientation",
      {
        label: "Format",
        options: Format.PageOrientation,
      },
      { target: "format.page_orientation" }
    );

    module.addBinding(
      "format_aspect_ratio",
      {
        label: "Asp.Ratio",
        options: Format.AspectRatios,
      },
      { target: "format.aspect_ratio" }
    );

    module.addBlade({
      view: "separator",
    });

    module.addBinding(
      "format_keep_aspect_ratio",
      {
        label: "Keep AR",
      },
      { target: "format.keep_aspect_ratio" }
    );

    module.addBinding(
      "format_fencing",
      {
        label: "Fence",
      },
      { target: "format.fencing" }
    );
  }
} // class Format
