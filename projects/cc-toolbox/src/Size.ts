import { Vector } from "./Vector";

/**
 * Title    : Size
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/Size.ts
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
 *
 * Stores the size of something on the Canvas.
 * May have a width and height, or a radius.
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
export class Size {
  public width: number;
  public height: number;
  public radius: number;

  /**
   * Creates an instance of Size.
   * This normally is with and height for all Shapes.
   * If you want to use Shapes based on circles you have to the specify radius, too.
   *
   * @param {number} width
   * @param {number} height
   * @param {number} [radius=width*0.5]
   * @memberof Size
   */
  constructor(width: number, height: number, radius: number = width * 0.5) {
    this.width = width;
    this.height = height;
    this.radius = radius;
  }

  /**
   *
   *
   * @param {(Size | Vector)} size
   * @return {*}
   * @memberof Size
   */
  public multiply(size: Size | Vector): Size {
    if (size instanceof Size)
      return new Size(
        this.width * size.width,
        this.height * size.height,
        this.radius * size.radius
      );
    if (size instanceof Vector) {
      return new Size(
        this.width * size.x,
        this.height * size.y,
        this.radius * size.z // Hier stand mal size.x
      );
    } else
      return new Size(
        this.width * size,
        this.height * size,
        this.radius * size
      );
  }

  static get_longer_side(size: Size): number {
    if (size.width > size.height) return size.width;
    return size.height;
  }

  static get_shorter_side(size: Size): number {
    if (size.width < size.height) return size.width;
    return size.height;
  }

  /**
   *
   *
   * @param {Size} other
   * @return {*}  {boolean}
   * @memberof Size
   */
  public equals(other: Size): boolean {
    return this.width == other.width && this.height == other.height;
  }

  /**
   *
   *
   * @return {*}  {Size}
   * @memberof Size
   */
  public clone(): Size {
    return new Size(this.width, this.height, this.radius);
  }
} // class Size
