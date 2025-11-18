/**
 * Title    : ParameterManager
 * Project  : Creative Coding
 *
 * A tiny helper that keeps the parameter object consistent,
 * ensures nested parameter sets exist and supports mapping
 * values from different input sources (e.g. tweakpane, sensors).
 */

export interface ParameterMappingEntry<TSource = any> {
  source: string;
  target: string;
  transform?: (value: any, source: TSource) => any;
}

const PARAMETER_MANAGER_KEY = Symbol("__cc_parameter_manager");

export class ParameterManager {
  private parameter: any;

  private constructor(parameter: any) {
    this.parameter = parameter;
  }

  /**
   * Returns the ParameterManager for the given parameter object.
   * Creates and registers one if it does not exist yet.
   */
  public static from(parameter: any): ParameterManager {
    if (parameter == null) {
      throw new Error("ParameterManager requires a parameter object.");
    }
    if (parameter[PARAMETER_MANAGER_KEY]) {
      return parameter[PARAMETER_MANAGER_KEY];
    }

    const manager = new ParameterManager(parameter);
    Object.defineProperty(parameter, PARAMETER_MANAGER_KEY, {
      value: manager,
      enumerable: false,
      configurable: false,
      writable: false,
    });
    return manager;
  }

  /**
   * Ensures that the given path exists on the parameter object.
   * Returns the object at the path and merges the defaults into it.
   */
  public ensure(path: string | string[], defaults: any = {}): any {
    const segments = this.normalize(path);

    if (segments.length === 0) {
      ParameterManager.deepMerge(this.parameter, defaults);
      return this.parameter;
    }

    let node = this.parameter;
    segments.forEach((segment, index) => {
      if (
        typeof node[segment] !== "object" ||
        node[segment] === null ||
        Array.isArray(node[segment])
      ) {
        node[segment] = {};
      }

      if (index === segments.length - 1) {
        ParameterManager.deepMerge(node[segment], defaults);
      }

      node = node[segment];
    });

    return node;
  }

  public get(path: string | string[]): any {
    const segments = this.normalize(path);
    if (segments.length === 0) return this.parameter;

    let node = this.parameter;
    for (const segment of segments) {
      if (node == null) return undefined;
      node = node[segment];
    }
    return node;
  }

  public set(path: string | string[], value: any): void {
    const segments = this.normalize(path);
    if (segments.length === 0) {
      throw new Error("Cannot set value at root of the parameter object.");
    }

    const parent = this.ensure(segments.slice(0, -1));
    parent[segments[segments.length - 1]] = value;
  }

  /**
   * Applies a mapping array that describes how to move values from
   * a flat source (e.g. tweakpane) into the nested parameter object.
   */
  public applyMapping(
    source: Record<string, any>,
    mapping: ParameterMappingEntry[]
  ): void {
    mapping.forEach((entry) => {
      if (!entry || !entry.target) return;

      let value = source[entry.source];
      if (value === undefined) return;

      if (entry.transform) {
        value = entry.transform(value, source);
      }

      this.set(entry.target, value);
    });
  }

  private normalize(path: string | string[]): string[] {
    if (Array.isArray(path)) {
      return path.filter((segment) => segment != null && segment !== "");
    }
    if (path == null || path.trim() === "") return [];
    return path
      .split(".")
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0);
  }

  private static deepMerge(target: any, source: any): any {
    if (source == null || typeof source !== "object") {
      return target;
    }

    Object.keys(source).forEach((key) => {
      const sourceValue = source[key];
      if (
        sourceValue &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue)
      ) {
        if (typeof target[key] !== "object" || target[key] === null) {
          target[key] = {};
        }
        ParameterManager.deepMerge(target[key], sourceValue);
      } else {
        target[key] = sourceValue;
      }
    });

    return target;
  }
}
