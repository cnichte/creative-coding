/**
 * Title    : Mathematics
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/Mathematics.ts
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
 *
 ** Some Mathematics for Creative Code.
 *
 *  Reference:
 *  https://openframeworks.cc/documentation/math/ofMath/
 *  https://github.com/mattdesl/canvas-sketch-util/blob/master/docs/math.md
 *  https://github.com/mattdesl/canvas-sketch-util/blob/master/math.js
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

 // Mathematics.ts
import { Vector } from "./Vector";

const EPSILON = Number.EPSILON;

export class Mathematics {

  /**
   * Linear interpolation.
   *
   * Parameter t is generally expected to be between 0..1 range.
   * Precise method, which guarantees y(t) = `max` when t = 1.
   * This method is monotonic only when `min` * `max` < 0.
   * Lerping between same values might not produce the same value.
   *
   * Reference:
   * https://en.wikipedia.org/wiki/Linear_interpolation
   *
   * @static
   * @param {number} min
   * @param {number} max
   * @param {number} t
   * @return {*}  {number}
   * @memberof Mathematics
   */
  public static lerp(min: number, max: number, t: number): number {
    return min * (1 - t) + max * t;
  }

 
  /**
   * Linear interpolation with Vectors.
   *
   * Reference:
   * https://studyflix.de/mathematik/lineare-interpolation-3767
   *
   * @static
   * @param {Vector} min - Vector 1
   * @param {Vector} max - Vector 2
   * @param {number} x - Coordinate on the x Axis
   * @return {*}  {Vector} - Calculated Vector on the line between min and max
   * @memberof Mathematics
   */
  public static lerp_vector(min: Vector, max: Vector, x: number): Vector {
    return Vector.lerp(min, max, x);
  }

  /**
   * Calculates an angle from degrees to radians.
   * For example: 180º will return Math.PI.
   *
   * @static
   * @param {number} angle_deg
   * @return {*}  {number} - Angle in radians
   * @memberof Mathematics
   */
  public static deg_to_rad(angle_deg: number): number {
    return (angle_deg * Math.PI) / 180;
  }

  /**
   * Transforms a value from the value-range (in) to the value-range (out), min/max is included.
   * clamp: Clamps the output within `out_min` and `out_max`.
   *
   * @static
   * @param {number} value_in
   * @param {number} in_min
   * @param {number} in_max
   * @param {number} out_min
   * @param {number} out_max
   * @param {boolean} [clamp=false]
   * @return {*}  {number} - value_out
   * @memberof Mathematics
   */
  public static map_range(
    value_in: number,
    in_min: number,
    in_max: number,
    out_min: number,
    out_max: number,
    clamp: boolean = false
  ): number {
    if (Math.abs(in_min - in_max) < EPSILON) {
      // If the Range is too small
      return out_min;
    } else {
      var value_out =
        ((value_in - in_min) / (in_max - in_min)) * (out_max - out_min) +
        out_min;

      if (clamp) {
        if (out_max < out_min) {
          if (value_out < out_max) {
            value_out = out_max;
          } else if (value_out > out_min) {
            value_out = out_min;
          }
        } else {
          if (value_out > out_max) {
            value_out = out_max;
          } else if (value_out < out_min) {
            value_out = out_min;
          }
        }
      }

      return value_out;
    }
  }
}
