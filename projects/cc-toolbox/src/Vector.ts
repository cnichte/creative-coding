/**
 * Title    : Vector
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/Vector.ts
 * Version  : 1.0.0
 * Published: https://gitlab.com/glimpse-of-life
 * 
 * A Vector is a Point in our 2D Canvas.
 * It stores the Position of someting that has a Size (or not, if only a Pixel).
 * We can make some fancy calulations on Vectors.
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
export class Vector {

  public x: number;
  public y: number;
  public z: number;

  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * TODO: joplin://x-callback-url/openNote?id=4f59a61cd32e4db0ac11ed048364cf69
   *
   * @param {Vector} other
   * @return {*}  {boolean}
   * @memberof Vector
   */
  public equals(other: Vector): boolean {
    return this.x == other.x && this.y == other.y && this.y == other.y;
  };

  /**
   * Calculates the Magnitude of a Vector.
   * or, Distance between two Vectors 
   * in the coordinate system with Mr. Pythagoras.
   * @param {Vector|undefined} toVector 
   * @returns 
   */
  public distance(toVector: Vector): number {

    let dx = this.x;
    let dy = this.y;

    if (toVector != undefined) {
      dx = this.x - toVector.x;
      dy = this.y - toVector.y;
    }

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * We have our Vector, or a Line between two Vectors.
   * Calculates a Vector of length 1
   *
   * Reference: 
   * https://www.wikihow.com/Normalize-a-Vector
   * https://www.mathepower.com/normieren.php
   *
   * @param {Vector|undefined} toVector 
   * @returns Vector - The normalized Vector.
   */
  public normalize(toVector: Vector): Vector {

    let fromVector = this.clone();
    let distance = fromVector.distance(toVector);

    if (distance != 0) {
      fromVector.multiply(1 / distance);
    } else {
      console.log("Distance between the two Vectors has to be !=0");
    }

    return fromVector;
  }

  /**
   * 
   *
   * @return {*}  {Vector}
   * @memberof Vector
   */
  public negative(): Vector {
    return new Vector(-this.x, -this.y, -this.z);
  }


  /**
   *
   *
   * @param {(Vector | number)} vector
   * @return {*}  {Vector}
   * @memberof Vector
   */
  public add(vector: Vector | number ): Vector {
    if (vector instanceof Vector) {
      return new Vector(
        this.x + vector.x,
        this.y + vector.y,
        this.z + vector.z
      );
    } else return new Vector(this.x + vector, this.y + vector, this.z + vector);
  }

  /**
   *
   *
   * @param {(Vector | number)} vector
   * @return {*}  {Vector}
   * @memberof Vector
   */
  public subtract(vector: Vector | number ): Vector {
    if (vector instanceof Vector) return new Vector(this.x - vector.x, this.y - vector.y, this.z - vector.z);
    else return new Vector(this.x - vector, this.y - vector, this.z - vector);
  }

  /**
   *
   *
   * @param {(Vector | number)} vector
   * @return {*}  {Vector}
   * @memberof Vector
   */
  public multiply(vector: Vector | number): Vector {
    if (vector instanceof Vector) return new Vector(this.x * vector.x, this.y * vector.y, this.z * vector.z);
    else return new Vector(this.x * vector, this.y * vector, this.z * vector);
  }

  /**
   *
   *
   * @param {(Vector | number)} vector
   * @return {*}  {Vector}
   * @memberof Vector
   */
  public divide(vector: Vector | number): Vector {
    if (vector instanceof Vector) return new Vector(this.x / vector.x, this.y / vector.y, this.z / vector.z);
    else return new Vector(this.x / vector, this.y / vector, this.z / vector);
  }

  /**
   *
   * https://en.wikipedia.org/wiki/Dot_product
   *
   * Absolute value of a vector?
   * https://www.geogebra.org/m/qeht5hbp
   * 
   * @param {Vector} vector
   * @return {*}  {number}
   * @memberof Vector
   */
  public scalar_product(vector: Vector ): number {
    return this.x * vector.x + this.y * vector.y + this.z * vector.z;
  }

  /**
   * https://en.wikipedia.org/wiki/Cross_product
   *
   * @param {Vector} vector
   * @return {*}  {Vector}
   * @memberof Vector
   */
  public cross_product(vector: Vector): Vector {
    return new Vector(
      this.y * vector.z - this.z * vector.y,
      this.z * vector.x - this.x * vector.z,
      this.x * vector.y - this.y * vector.x
    );
  }

  /**
   * Reference:
   * https://lakschool.com/en/math/vectors/vector-length-or-magnitude
   * 
   * @return {*}  {number}
   * @memberof Vector
   */
  public length(): number {
    return Math.sqrt(this.scalar_product(this));
  }

  /**
   *
   * Reference: 
   * https://en.wikipedia.org/wiki/Unit_vector
   * 
   * @return {*}  {Vector}
   * @memberof Vector
   */
  public unit(): Vector {
    return this.divide(this.length());
  }

  /**
   *
   *
   * @return {*}  {number}
   * @memberof Vector
   */
  public min(): number {
    return Math.min(Math.min(this.x, this.y), this.z);
  }

/**
 *
 *
 * @return {*}  {number}
 * @memberof Vector
 */
public max(): number {
    return Math.max(Math.max(this.x, this.y), this.z);
  }


  /**
   *
   *
   * @param {number} theta
   * @param {number} phi
   * @return {*}  {Vectot}
   * @memberof Vector
   */
  public fromAngles(theta: number, phi: number): Vector {
    return new Vector(Math.cos(theta) * Math.cos(phi), Math.sin(phi), Math.sin(theta) * Math.cos(phi));
  }

  /**
   * TODO: DatenTyp für zusammmengesetzte Rückgabewerte einführen.
   * 
   * joplin://x-callback-url/openNote?id=51a1dd1b8f8d4491a61fa0d0fe1ea7d0
   * 
   * @return {*} {theta:number. phi:number}
   * @memberof Vector
   */
  public toAngles():any {
    return {
      theta: Math.atan2(this.z, this.x),
      phi: Math.asin(this.y / this.length())
    };
  }

  /**
   * Returns the angle between this vector and vector v in radians.
   * 
   * @param {Vector} vector
   * @return {*}  {number}
   * @memberof Vector
   */
  public angleTo(vector: Vector): number {
    return Math.acos(this.scalar_product(vector) / (this.length() * vector.length()));
  }

  /**
   * Returns a Vector with a length of 1
   * and a statistically uniform direction.
   *
   * @return {*}  {Vector}
   * @memberof Vector
   */
  public randomDirection(): Vector {
    return this.fromAngles(Math.random() * Math.PI * 2, Math.asin(Math.random() * 2 - 1));
  }

/**
 * Returns this Vector as Array with a length of one, two or three 
 *
 * @param {number} n
 * @return {*}  {number[]} - optional: Length of Array, default = 3  
 * @memberof Vector
 */
public toArray(n: number): number[] {
    return [this.x, this.y, this.z].slice(0, n || 3);
  }

 /**
  * Copys this Vector.
  * 
  * @return {*}  {Vector}
  * @memberof Vector
  */
 public clone(): Vector {
    return new Vector(this.x, this.y, this.z);
  }

/**
 * Reference: 
 * https://studyflix.de/mathematik/lineare-interpolation-3767
 *
 * @static
 * @param {Vector} min
 * @param {Vector} max
 * @param {number} x
 * @return {*}  {Vector}
 * @memberof Vector
 */
static lerp(min: Vector, max: Vector, x: number): Vector {

  // y = y1 + (y2-y1)/(x2-x1)*(x-x1)
  let y = min.y + (max.y - min.y) / (max.x - min.x) * (x - min.x);

  return new Vector(x, y);
}


} // class Vector
