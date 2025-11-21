/**
 * Title    : Shape Class
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/Shape.ts
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
 *
 ** A Class for drawing all the nice little basic Shapes on the canvas.
 ** This is a well organized Collection of Shapes.
 *
 * It supports at the moment:
 * 'Circle', 'Polygon', 'Rect', 'TriangleOne', 'TriangleTwo'
 * 'Text', 'Ellipse', 'Trapez', 'Rhombus' aka Parallelogramm
 *
 * TODO drawable machen, dann können die auch direkt vom SceneGraph aufgerufen werden...
 ** aus draw(context:any, position:Vector, size:Size, brush:Brush): void  wird  draw(context, parameter)
 ** mit parameter: shape:{position, size, brush}  ... oder so.
 *
 *
 * The following parameters are used in all (most) cases:
 *
 *  context  - The context to draw on.
 *  position - A Vector with the x and y Coordinate in the Canvas.
 *  size     - The Size of the Shape as with and height, or radius.
 *  brush    - A brush with additional Drawing-Options.
 *
 ** Licence
 * Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
 * https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode
 * https://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1
 *
 * In short:
 * Do not sell the code, or creative stuff made with this code.
 * You are allowed to make someone happy, and give away the works you have created with it for free.
 * Learn, code, create, and have fun.
 *
 * @author Carsten Nichte - 2022
 */

 // Shape.ts
import { AnimationTimer } from "./AnimationTimer";
import { Brush } from "../agents/Brush";
import { Size } from "./Size";
import { Vector } from "./Vector";
import { Mathematics } from "../utils/Mathematics";


// const math = require('canvas-sketch-util/math');

export class Shape {
  /**
   * We use this compforable Method to draw one of all the Shapes.
   *
   * The Shape is choosen from the brush.shape Property, which is a String.
   * Valid Shapes-Names are: 'Circle', 'Polygon', 'Rect', 'TriangleOne', 'TriangleTwo'.
   *
   * If the Shape Name is 'nothing', nothig is drawn.
   * 
   * TODO: USE size & position from brush
   *
   * @static
   * @param {*} context
   * @param {Vector} position
   * @param {Size} size
   * @param {Brush} brush
   * @param {boolean} do_center
   * @memberof Shape
   */
  public static draw(
    context: any,
    position: Vector,
    size: Size,
    brush: Brush,
    do_center: boolean
  ): void {
    if (brush.shape !== "Nothing") {
      let shape = Shape.factory(brush.shape);
      shape.draw(context, position, size, brush, do_center);
    }
  } // draw

  /**
   * Create an Object by ClassName the Javascript Style.
   * This follows the Factory-Pattern.
   *
   * @param {String} className The Name of the Class
   * @returns
   */
  public static factory(className: string): any {
    const shapeClasses: any = {
      BezierCurveOne, // -
      BezierCurveTwo, // finished (vorläufig)
      Character, // finished
      Circle, // finished
      Elipse, // finished
      Image, // -
      Line, // finished
      Polygon, // finished
      Rect, // finished
      Rhombus, // finished
      Star, // finished
      Trapez, // finished
      TriangleOne, // finished
      TriangleTwo, // finished
    };

    // console.log('----------------------------------------------');
    // console.log('className: ', className);
    // console.log('class: ', shapeClasses[className]);
    // console.log('instanz: ', new shapeClasses[className]());
    // console.log('----------------------------------------------');

    return new shapeClasses[className]();
  }

  /**
   * Scale a Shape on position with size by the factor scale.
   * Optional, recalculate the Position.
   *
   * This is a so called "PassTrough" Method.
   *
   * @static
   * @param {(number|Vector)} scale - The scale factor.
   * @param {Size} size - The size of the Shape.
   * @param {Vector} position - The Position of the Shape
   * @param {boolean} [re_position=false] - if true, ReCalulate the start position. Default is false.
   * @return {*}  {"size":Size, "position":Vector}
   * @memberof Shape
   */
  public static scale(
    scale: number | Vector,
    size: Size,
    position: Vector,
    re_position: boolean = false
  ): any {
    return ShapeBase.scale(scale, size, position, re_position);
  }

  /**
   * Helper-Method which rotates our Shape +-180 Degrees around a center.
   *
   * @static
   * @param {*} context
   * @param {number} angle
   * @param {Vector} center
   * @memberof Shape
   */
  public static rotate(context: any, angle: number, center: Vector): void {
    ShapeBase.rotate(context, angle, center);
  }

  public static ShapeNames = {
    Nothing: "Nothing",
    BezierCurveOne: "BezierCurveOne",
    BezierCurveTwo: "BezierCurveTwo",
    Character: "Character",
    Circle: "Circle",
    Elipse: "Elipse",
    Image: "Image",
    Line: "Line",
    Polygon: "Polygon",
    Rect: "Rect",
    Rhombus: "Rhombus",
    Star: "Star",
    Trapez: "Trapez",
    TriangleOne: "TriangleOne",
    TriangleTwo: "TriangleTwo",
  };
} // class Shape

/**
 * The BaseClass for all the Shapes.
 * Provides some common Methods for all Shapes.
 */
class ShapeBase {
  public animationTimer: AnimationTimer;

  constructor() {
    this.animationTimer = new AnimationTimer(this);
  }

  animate() {
    console.log("animate ShapeBase");
  }

  /**
   * Helper Method to apply the Brush on the Canvas.
   *
   * @static
   * @param {*} context
   * @param {Brush} brush
   * @memberof ShapeBase
   */
  public static apply_brush(context: any, brush: Brush): void {
    context.lineWidth = brush.border;
    context.fillStyle = brush.fillColor;
    context.strokeStyle = brush.borderColor;
  }

  /**
   * Helper-Method which rotates our Shape +-180 Degrees around a center.
   *
   * @static
   * @param {*} context
   * @param {number} angle
   * @param {Vector} center
   * @memberof ShapeBase
   */
  public static rotate(context: any, angle: number, center: Vector): void {
    if (angle != 0) {
      // Matrix transformation
      context.translate(center.x, center.y);

      if (angle >= 0) {
        context.rotate((angle * Math.PI) / 180);
      } else {
        context.rotate(((360 + angle) * Math.PI) / 180);
      }
      context.translate(-center.x, -center.y);
    }
  }

  /**
   * Scale a Shape on position with size by the factor scale.
   * Optional, recalculate the Position.
   *
   * @static
   * @param {(number|Vector)} scale - The scale factor.
   * @param {Size} size - The size of the Shape (width & height, or radius)
   * @param {Vector} position - The Position of the Shape
   * @param {boolean} [re_position=false] - if true, ReCalulate the position. Default is false.
   * @return {*}  {"size":Size, "position":Vector}
   * @memberof ShapeBase
   */
  public static scale(
    scale: number | Vector,
    size: Size,
    position: Vector,
    re_position: boolean = false
  ): any {

    let _sizeScaled = size;
    let _new_start_position = position;

    let _scale_x: number;
    let _scale_y: number;
    let _scale_r: number;

    if (typeof scale === "number") {
      _scale_x = scale;
      _scale_y = scale;
      _scale_r = scale;
    } else {
      // may be its a Vector
      _scale_x = scale.x;
      _scale_r = scale.x;
      _scale_y = scale.y;
    }

    if (_scale_x != 1 || _scale_y != 1) {
      _sizeScaled = new Size(
        size.width * _scale_x,
        size.height * _scale_y,
        size.radius * _scale_r
      );
    }

    // Verschiebe den Startpunkt so,
    // das die Form zentriert gezeichnet wird.
    // Der Startpunkt ist links oben in der Ecke der Form.
    // canvas verwendet ein invertiertes kartesisches Koordinatensystem.
    if (re_position) {
      _new_start_position = new Vector(
        position.x - 0.5 * _sizeScaled.width,
        position.y - 0.5 * _sizeScaled.height
      );
    }
    // TODO Type für zusammengesetztes Return-Object 
    return {
      size: _sizeScaled,
      position: _new_start_position,
    };
  }
} // class ShapeBase

/**
 * A BezierCurveOne Shape.
 */
class BezierCurveOne extends ShapeBase {
  constructor() {
    super();
  }

  /**
   * Draws a filled or outlined BezierCurveOne.
   * TODO: https://www.w3schools.com/tags/canvas_quadraticcurveto.asp
   *
   * @param {Object} context
   * @param {Vector} position
   * @param {Size} size
   * @param {Brush} brush
   */
  public draw(context: any, position: Vector, size: Size, brush: Brush): void {
    context.save();

    ShapeBase.apply_brush(context, brush);

    context.translate(position.x, position.y);

    context.beginPath();

    const center = new Vector(0, 0);

    let o1 = Shape.scale(brush.scale, size, center, true);
    let scaledSize = o1.size;
    let new_start_position = o1.position;

    // TODO How to deal with complexer parameters.

    const start = new Vector(new_start_position.x, new_start_position.y);
    const end = new Vector(
      new_start_position.x + scaledSize.width,
      new_start_position.y + scaledSize.height
    );

    // Den Kontrollpunkt rechne ich relativ zum Startpunkt.
    // Der ist jetzt mal festgelegt auf...
    let cpp = new Size(500, 275);

    let o2 = Shape.scale(brush.scale, size, center, true);
    let cpp_scaledSize = o2.size;
    let cpp_new_start_position = o2.position;

    // Der Kontrollpunkt
    const cp = new Vector(
      start.x + cpp_scaledSize.width,
      start.y + cpp_scaledSize.height
    );

    ShapeBase.rotate(context, brush.angle, center);

    context.moveTo(start.x, start.y);
    context.quadraticCurveTo(cp.x, cp.y, end.x, end.y);
    context.stroke();

    if (brush.fillColorAlpha > 0) context.fill();

    context.restore();
  } // BezierCurveOne.draw

  animate() {} // BezierCurveTwo.animate
} // class BezierCurveOne

/**
 * A BezierCurveTwoTwo Shape.
 */
class BezierCurveTwo extends ShapeBase {
  constructor() {
    super();
  }

  /**
   * Draws a filled or outlined BezierCurveTwo.
   * TODO: https://www.w3schools.com/tags/canvas_beziercurveto.asp
   *
   * center BezierCurve: https://stackoverflow.com/questions/24188869/center-a-beziercurve-html5-canvas-drawing
   * @param {Object} context
   * @param {Vector} position
   * @param {Size} size
   * @param {Brush} brush
   */
  public draw(context: any, position: Vector, size: Size, brush: Brush): void {
    let o = Shape.scale(brush.scale, size, position, false);
    size = o.size;
    position = o.position;

    position.x = position.x - 0.5 * size.width;
    position.y = position.y - 0.25 * size.height; //TODO?  Why that!

    context.save();

    ShapeBase.apply_brush(context, brush);

    // context.translate(position.x, position.y); // Die Mitte der Leinwand

    context.beginPath();

    // const center = new Vector(0, 0);
    const center = new Vector(size.width * 0.5, size.height * 0.5);

    // TODO How to deal with complexer parameters.

    // Waagerechte liegene Punkte mit dem Abstand size.width
    const start = new Vector(position.x, position.y);
    const end = new Vector(position.x + size.width, position.y);

    //* Die Kontrollpunkte sind relative Koordinaten zu Start bzw. Endpunkt.
    // relative Positionierung..
    // hier beliebige werte einsetzen.
    // Ich mache die Positionen der Controlpoints mal abhängig von der Shape-Grösse:
    // Hier könnte ich natürlich schön mit Zufallswerten arbeiten.
    const cp1_rel = new Vector(size.width * 0.5, size.height * 0.5); // Koordinate links
    const cp2_rel = new Vector(-size.width * 0.2, size.height * 0.1); // Koordinate rechts

    // Die Positionen der Kontrollpunkte
    const cp1 = new Vector(start.x + cp1_rel.y, position.y + cp1_rel.y);
    const cp2 = new Vector(end.x + cp2_rel.x, position.y + cp2_rel.y);

    ShapeBase.rotate(context, brush.angle, center);

    context.moveTo(start.x, start.y);
    context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    context.stroke();

    if (brush.fillColorAlpha > 0) context.fill();

    // Make control points and connecting lines visible.
    if (true) {
      context.fillStyle = "#000000"; // black
      context.strokeStyle = "#000000";
      context.lineWidth = 5;

      context.beginPath();
      context.arc(cp1.x, cp1.y, 10, 0, 2 * Math.PI);
      context.fill();
      context.stroke();

      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(cp1.x, cp1.y);
      context.stroke();

      context.beginPath();
      context.arc(cp2.x, cp2.y, 10, 0, 2 * Math.PI);
      context.fill();
      context.stroke();

      context.beginPath();
      context.moveTo(end.x, end.y);
      context.lineTo(cp2.x, cp2.y);
      context.stroke();
    }

    context.restore();
  } // BezierCurveTwo.draw

  animate() {} // BezierCurveTwo.animate
} // class BezierCurveTwo

/**
 * A Character Shape.
 */
class Character extends ShapeBase {
  constructor() {
    super();
  }

  /**
   * A Character is also a shape to draw.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_text
   *
   * @param {Object} context
   * @param {Vector} position
   * @param {Size} size
   * @param {Brush} brush
   */
  public draw(context: any, position: Vector, size: Size, brush: Brush): void {
    let o1 = Shape.scale(brush.scale, size, position, false);
    size = o1.size;
    position = o1.position;

    context.save();

    ShapeBase.apply_brush(context, brush);

    // brush.text = "content":"T", fontSize:100, fontFamily:"serif"
    // brush.text.fontSize ist not used here. I calculate the fontSize from size.height.
    let character = "X";
    let fontSize = size.height;
    let fontFamily = "serif";

    if (brush.hasOwnProperty("text")) {
      character = brush.text.content;
      fontFamily = brush.text.fontFamily;
    }

    context.font = `${fontSize}px ${fontFamily}`;
    context.textBaseline = "top";

    // Measure the font to align it exactly in the centre.
    // https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics
    const metrics = context.measureText(character);
    const mx = metrics.actualBoundingBoxLeft;
    const my = metrics.actualBoundingBoxAscent;
    const mw = metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft;
    const mh =
      metrics.actualBoundingBoxDescent - metrics.actualBoundingBoxAscent;

    // Rotate
    const center = new Vector(position.x, position.y);
    ShapeBase.rotate(context, brush.angle, center);

    // console.log(metrics);
    // context.fillRect(mx, my, mw, mh); // show metrics box

    context.translate(-0.5 * mw, -0.5 * mh); // move box to center

    if (brush.fillColorAlpha > 0)
      context.fillText(character, position.x, position.y);
    context.strokeText(character, position.x, position.y);

    context.restore();
  } // Character.draw

  animate() {} // Character.animate
} // class Character

/**
 * A Circle Shape.
 */
class Circle extends ShapeBase {
  constructor() {
    super();
  }

  /**
   * Draws a filled or outlined Circle.
   *
   * @param {Object} context
   * @param {Vector} position
   * @param {Size} size
   * @param {Brush} brush
   */
  public draw(context: any, position: Vector, size: Size, brush: Brush): void {
    // console.log('Shape Circle.draw');
    let o1 = Shape.scale(brush.scale, size, position, false);
    size = o1.size;
    position = o1.position;

    context.save();

    ShapeBase.apply_brush(context, brush);

    context.translate(position.x, position.y);

    // https://developer.mozilla.org/de/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors
    // context.globalAlpha = brush.fillColorAlpha; TODO: ?? oder ist Alpha schon im HEX wert drin.
    // context.globalAlpha = brush.borderColorAlpha;

    context.globalAlpha = brush.borderColorAlpha;

    context.beginPath();
    context.arc(0, 0, size.radius, 0, 2 * Math.PI);
    context.stroke();

    if (brush.fillColorAlpha > 0) {
      context.globalAlpha = brush.fillColorAlpha;
      context.fill();
    }

    context.restore();
  } // Circle.draw

  animate() {} // Circle.animate
} // class Circle

/**
 * A Elipse Shape.
 */
class Elipse extends ShapeBase {
  constructor() {
    super();
  }

  /**
   * Draw the Elipse.
   *
   * @param {Object} context
   * @param {Vector} position
   * @param {Size} size
   * @param {Brush} brush
   */
  public draw(context: any, position: Vector, size: Size, brush: Brush): void {
    let o1 = Shape.scale(brush.scale, size, position, false);
    size = o1.size;
    position = o1.position;

    context.save();

    ShapeBase.apply_brush(context, brush);

    context.translate(position.x, position.y);

    context.beginPath();
    // (x, y, radiusX, radiusY, rotation, startAngle, endAngle
    context.ellipse(
      0,
      0,
      size.width * 0.5,
      size.height * 0.5,
      Mathematics.deg_to_rad(brush.angle),
      0,
      2 * Math.PI
    );
    if (brush.fillColorAlpha > 0) context.fill();

    context.stroke();

    context.restore();
  } // Elipse.draw

  animate() {} // Elipse.animate
} // class Elipse

/**
 * A Image Shape.
 */
class Image extends ShapeBase {
  constructor() {
    super();
  }

  /**
   * Draw the Image.
   * https://www.nashvail.me/blog/canvas-image
   *
   * @param {Object} context
   * @param {Vector} position
   * @param {Size} size
   * @param {Brush} brush
   */
  public draw(context: any, position: Vector, size: Size, brush: Brush): void {
    context.save();

    ShapeBase.apply_brush(context, brush);

    context.translate(position.x, position.y);

    // https://www.npmjs.com/package/load-asset
    // const image = await load('https://mdn.mozillademos.org/files/5397/rhino.jpg');
    // console.log(`Image Size: ${image.width} x ${image.height}`);
    // context.drawImage(image, size.width, size.height);

    // https://developer.mozilla.org/de/docs/Web/API/Canvas_API/Tutorial/Using_images

    // TODO load Image
    /* 
    var img = new Image(); // Erstelle neues Image-Objekt  
    img.onload = function () {
      context.drawImage(img, size.width, size.height);
    };
    img.src = 'https://mdn.mozillademos.org/files/5397/rhino.jpg'; // 'data:image/gif;base64,R0lGODlhCwALAIAAAAAA3pn/ZiH5BAEAAAEALAAAAAALAAsAAAIUhA+hkcuO4lmNVindo7qyrIXiGBYAOw==';
*/

    context.restore();
  } // Image.draw

  animate() {} // Image.animate
} // class Image

/**
 * A Line Shape.
 */
class Line extends ShapeBase {
  constructor() {
    super();
  }

  /**
   * Draw the Line.
   *
   * @param {Object} context
   * @param {Vector} position
   * @param {Size} size
   * @param {Brush} brush
   */
  public draw(context: any, position: Vector, size: Size, brush: Brush): void {
    let o2 = Shape.scale(brush.scale, size, position, true);
    size = o2.size;
    position = o2.position;

    context.save();

    ShapeBase.apply_brush(context, brush);

    context.translate(position.x, position.y);

    const center = new Vector(size.width * 0.5, size.height * 0.5);
    ShapeBase.rotate(context, brush.angle, center);

    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(size.width, size.height);
    context.stroke();

    context.restore();
  } // Line.draw

  animate() {} // Line.animate
} // class Line

/**
 * A Polygon Shape.
 */
class Polygon extends ShapeBase {
  constructor() {
    super();
  }

  /**
   * Draws a filled and outlined regular Polygon.
   *
   * @param {Object} context
   * @param {Vector} position
   * @param {Size} size
   * @param {Brush} brush
   */
  public draw(context: any, position: Vector, size: Size, brush: Brush): void {
    let o1 = Shape.scale(brush.scale, size, position, false);
    size = o1.size;
    position = o1.position;

    context.save();

    ShapeBase.apply_brush(context, brush);

    let corners = 6;

    // TODO Was hab ich mit brush.corners gemeint?
    // if (brush.hasOwnProperty('corners')) {
    //  corners = brush.corners;
    // }

    context.translate(position.x, position.y);

    const center = new Vector(0, 0);
    ShapeBase.rotate(context, brush.angle, center);

    // fill
    context.moveTo(size.radius, 0);

    context.beginPath();
    for (let i = 0; i < corners + 1; i++) {
      context.rotate((2 * Math.PI) / corners);
      context.lineTo(size.radius, 0);
    }

    context.fill();

    // stroke
    for (let i = 0; i < corners + 1; i++) {
      context.rotate((2 * Math.PI) / corners);
      context.lineTo(size.radius, 0);
    }

    context.rotate((-2 * Math.PI) / corners);

    context.stroke();
    context.restore();
  } // Polygon.draw

  animate() {} // Polygon.animate
} // class Polygon

/**
 * A Rect Shape.
 */
class Rect extends ShapeBase {
  constructor() {
    super();
  }

  /**
   * Draws a filled or outlined Rect.
   *
   * @param {Object} context
   * @param {Vector} position
   * @param {Size} size
   * @param {Brush} brush
   * @param {boolean} do_center default=true
   */
  public draw(
    context: any,
    position: Vector,
    size: Size,
    brush: Brush,
    do_center: boolean = true
  ): void {
    // console.log('Shape Rect.draw');
    let o2 = Shape.scale(brush.scale, size, position, do_center);
    size = o2.size;
    position = o2.position;

    context.save();

    ShapeBase.apply_brush(context, brush);

    context.translate(position.x, position.y);

    const center = new Vector(size.width * 0.5, size.height * 0.5);

    ShapeBase.rotate(context, brush.angle, center);

    if (brush.fillColorAlpha > 0) {
      context.globalAlpha = brush.fillColorAlpha;
      context.fillRect(0, 0, size.width, size.height);
    }

    context.globalAlpha = brush.borderColorAlpha;

    context.beginPath();
    context.rect(0, 0, size.width, size.height);
    context.stroke();
    context.restore();
  } // Rect.draw

  animate() {} // Rect.draw
} // class Rect

/**
 * A Rhombus / Parallelogramm Shape.
 */
class Rhombus extends ShapeBase {
  constructor() {
    super();
  }

  /**
   * TODO: Draws a filled or outlined Rhombus / Parallelogramm.
   * In a parallelogram, opposite sides are of equal length and parallel.
   * In the case of the rhombus, all four sides are the same length.
   *
   * https://stackoverflow.com/questions/51442664/drawing-a-parallelogram-html5-canvas
   * Rhombus: https://www.lernnetz24.de/rechenliesel/hinweise/66.html
   *
   * @param {Object} context
   * @param {Vector} position
   * @param {Size} size
   * @param {Brush} brush
   */
  public draw(context: any, position: Vector, size: Size, brush: Brush): void {
    let o1 = Shape.scale(brush.scale, size, position, true);
    size = o1.size;
    position = o1.position;

    context.save();

    ShapeBase.apply_brush(context, brush);

    context.translate(position.x, position.y);

    const center = new Vector(size.width * 0.5, size.height * 0.5);
    ShapeBase.rotate(context, brush.angle, center);

    // https://github.com/mattdesl/canvas-sketch-util/tree/master/docs
    // Parameter
    // Die Länge einer Seite: size.width
    // Der Winkel
    let angle = 15;

    // construction helper
    let L1_part = Math.atan(Mathematics.deg_to_rad(angle)) * size.height;

    // parallel Line 1
    let L1_P1 = new Vector(0, 0);
    // shorten by L1_part to fit on the screen
    let L1_P2 = new Vector(size.width - L1_part, 0);

    // parallel Line 2
    let L2_P1 = new Vector(L1_part, size.height);
    let L2_P2 = new Vector(size.width + L1_part - L1_part, size.height); // shorten by L1_part to fit

    // TODO Center...
    // https://www.mathe-lexikon.at/geometrie/ebene-figuren/vierecke/raute-rhombus/seitenlangen-und-diagonalen-berechnen/lange-der-diagonale-f-berechnen.html

    context.beginPath();
    context.moveTo(L1_P1.x, L1_P1.y);
    context.lineTo(L1_P2.x, L1_P2.y);
    context.lineTo(L2_P2.x, L2_P2.y);
    context.lineTo(L2_P1.x, L2_P1.y);
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo(L1_P1.x, L1_P1.y);
    context.lineTo(L1_P2.x, L1_P2.y);
    context.lineTo(L2_P2.x, L2_P2.y);
    context.lineTo(L2_P1.x, L2_P1.y);
    context.closePath();
    context.stroke();

    context.restore();
  } // Rect.draw

  animate() {} // Rhombus.draw
} // class Rhombus

/**
 * A Star Shape
 */
class Star extends ShapeBase {
  constructor() {
    super();
  }

  /**
   * Draws a filled and outlined Star.
   *
   * https://stackoverflow.com/questions/25837158/how-to-draw-a-star-by-using-canvas-html5
   * https://jsfiddle.net/m1erickson/8j6kdf4o/
   *
   * @param {Object} context
   * @param {Vector} position
   * @param {Size} size
   * @param {Brush} brush
   */
  public draw(context: any, position: Vector, size: Size, brush: Brush): void {
    let o1 = Shape.scale(brush.scale, size, position, false);
    size = o1.size;
    position = o1.position;

    context.save();

    ShapeBase.apply_brush(context, brush);

    const center = new Vector(position.x, position.y);
    ShapeBase.rotate(context, brush.angle, center);

    // TODO How to deal with complexer parameters.
    // Parameter: cx, cy, spikes, outerRadius, innerRadius
    let cx = position.x;
    let cy = position.y;
    let spikes = 6;
    let outerRadius = size.radius;
    let innerRadius = size.radius * 0.5;

    var rot = (Math.PI / 2) * 3;
    var x = cx;
    var y = cy;
    var step = Math.PI / spikes;

    context.beginPath();
    context.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      context.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      context.lineTo(x, y);
      rot += step;
    }

    context.lineTo(cx, cy - outerRadius);
    context.closePath();
    // context.lineWidth = 5;
    // context.strokeStyle = 'blue';
    context.stroke();
    // context.fillStyle = 'skyblue';
    context.fill();

    context.restore();
  } // Star.draw

  animate() {} // Star.animate
} // class Star

/**
 * A Trapez Shape.
 */
class Trapez extends ShapeBase {
  constructor() {
    super();
  }

  /**
   * TODO: Draw a Trapez.
   *
   * https://www.lernnetz24.de/rechenliesel/hinweise/67.html
   * https://www.lernhelfer.de/schuelerlexikon/mathematik/artikel/trapez#
   *
   * @param {Object} context
   * @param {Vector} position
   * @param {Size} size
   * @param {Brush} brush
   */
  public draw(context: any, position: Vector, size: Size, brush: Brush): void {
    let o1 = Shape.scale(brush.scale, size, position, true);
    size = o1.size;
    position = o1.position;

    context.save();

    ShapeBase.apply_brush(context, brush);

    context.translate(position.x, position.y);

    const center = new Vector(size.width * 0.5, size.height * 0.5);
    ShapeBase.rotate(context, brush.angle, center);

    // I have four parameters here:
    // Baseline 1 - size.with
    // Baseline 2 - size.radius
    // Height     - size.height

    let fak = 0.5; // Line 2 is 80% of the length of line 1

    // parallel Line 1, Point 1 and 2
    let L1_P1 = new Vector(0, 0);
    let L1_P2 = new Vector(size.width, 0);

    // construction helper
    let L1_half = new Vector(size.width * 0.5, 0);
    let L2_half = new Vector(L1_half.x, size.height);

    // parallel Line 2, Point 1 and 2
    let L2_P1 = new Vector(L2_half.x - fak * size.width * 0.5, L2_half.y);
    let L2_P2 = new Vector(L2_half.x + fak * size.width * 0.5, L2_half.y);

    context.beginPath();
    context.moveTo(L1_P1.x, L1_P1.y);
    context.lineTo(L1_P2.x, L1_P2.y);
    context.lineTo(L2_P2.x, L2_P2.y);
    context.lineTo(L2_P1.x, L2_P1.y);
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo(L1_P1.x, L1_P1.y);
    context.lineTo(L1_P2.x, L1_P2.y);
    context.lineTo(L2_P2.x, L2_P2.y);
    context.lineTo(L2_P1.x, L2_P1.y);
    context.closePath();
    context.stroke();

    context.restore();
  } // Trapez.draw

  animate() {} // Trapez.animate
} // class Trapez

/**
 * A Triangle Shape, Type one.
 */
class TriangleOne extends ShapeBase {
  constructor() {
    super();
  }

  /**
   * Draws a filled and outlined regular triangle.
   *
   * @param {Object} context
   * @param {Vector} position
   * @param {Size} size
   * @param {Brush} brush
   */
  public draw(context: any, position: Vector, size: Size, brush: Brush): void {
    let o2 = Shape.scale(brush.scale, size, position, true);
    size = o2.size;
    position = o2.position;

    context.save();

    ShapeBase.apply_brush(context, brush);

    context.translate(position.x, position.y);

    const center = new Vector(size.width * 0.5, size.height * 0.5);
    ShapeBase.rotate(context, brush.angle, center);

    // Filled triangle
    context.beginPath();
    context.moveTo(0, size.height); // rechte untere Ecke
    context.lineTo(size.width, size.height); // waagerecht unten
    context.lineTo(size.width * 0.5, 0);
    context.fill();

    context.moveTo(0, size.height);
    context.lineTo(size.width, size.height);
    context.lineTo(size.width * 0.5, 0);
    context.closePath();
    context.stroke();
    context.restore();
  } // TriangleOne.draw

  animate() {} // TriangleOne.animate
} // class TriangleOne

/**
 * A Triangle Shape, Type two.
 */
class TriangleTwo extends ShapeBase {
  constructor() {
    super();
  }

  /**
   * Draws a filled and outlined regular triangle.
   *
   * @param {Object} context
   * @param {Vector} position
   * @param {Size} size
   * @param {Brush} brush
   */
  public draw(context: any, position: Vector, size: Size, brush: Brush): void {
    let o2 = Shape.scale(brush.scale, size, position, true);
    size = o2.size;
    position = o2.position;

    context.save();

    ShapeBase.apply_brush(context, brush);

    context.translate(position.x, position.y);

    const center = new Vector(size.width * 0.5, size.height * 0.5);
    ShapeBase.rotate(context, brush.angle, center);

    // Filled triangle
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(size.width, 0);
    context.lineTo(size.width, size.height);
    context.fill();

    // Stroked triangle
    context.moveTo(0, 0);
    context.lineTo(size.width, 0);
    context.lineTo(size.width, size.height);
    context.closePath();
    context.stroke();
    context.restore();
  } // TriangleTwo.draw

  animate() {} // TriangleTwo.animate
} // class TriangleTwo
