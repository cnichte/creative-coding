/**
 * Lightweight random helpers to replace canvas-sketch-util/random.
 * All methods are static and depend on Math.random().
 */
export class Random {
  /**
   * Returns a float in [0,1).
   */
  public static value(): number {
    return Math.random();
  }

  /**
   * Returns a float in [min,max).
   */
  public static range(min = 0, max = 1): number {
    return min + (max - min) * Math.random();
  }

  /**
   * Returns an integer in [min,max).
   */
  public static rangeFloor(min = 0, max = 1): number {
    return Math.floor(Random.range(min, max));
  }

  /**
   * Picks a random element from an array.
   */
  public static pick<T>(list: T[]): T {
    if (!Array.isArray(list) || list.length === 0) {
      return undefined as any;
    }
    return list[Random.rangeFloor(0, list.length)];
  }

  /**
   * Fisher-Yates shuffle (in place). Returns the array for chaining.
   */
  public static shuffle<T>(list: T[]): T[] {
    if (!Array.isArray(list)) return list;
    for (let i = list.length - 1; i > 0; i--) {
      const j = Random.rangeFloor(0, i + 1);
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  /**
   * Gaussian distribution (mean 0, stddev 1) using Box-Muller transform.
   */
  public static gaussian(mean = 0, stdDev = 1): number {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const mag = Math.sqrt(-2.0 * Math.log(u));
    const z0 = mag * Math.cos(2.0 * Math.PI * v);
    return mean + z0 * stdDev;
  }
}
