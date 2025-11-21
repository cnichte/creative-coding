/**
 * Simple debug helper keeping flat flags under `parameter.debug`.
 * Usage: Debug.isEnabled(parameter, "colorset.animation.timer")
 */
export class Debug {
  static isEnabled(parameter: any, key: string): boolean {
    return Boolean(parameter?.debug?.[key]);
  }

  static enable(parameter: any, key: string) {
    if (!parameter.debug) parameter.debug = {};
    parameter.debug[key] = true;
  }

  static disable(parameter: any, key: string) {
    if (!parameter.debug) return;
    parameter.debug[key] = false;
  }
}

