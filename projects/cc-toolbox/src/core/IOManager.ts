/**
 * Title    : IOManager
 * Project  : Creative Coding
 *
 * Central hub to connect realtime inputs (e.g. tweakpane, sensors) with
 * parameter sets or arbitrary handlers. Sources register themselves as
 * channels and bindings describe how to forward their values.
 */

import {
  ParameterManager,
  type ParameterMappingEntry,
} from "./ParameterManager";
import { Debug } from "./Debug";

export interface IOContext {
  parameter: any;
  parameterManager: ParameterManager;
  timestamp: number;
  deltaTime: number;
  channelId: string;
  source: Record<string, any> | any;
}

export interface IOBinding {
  channelId: string;
  mapping?: ParameterMappingEntry[];
  handler?: (context: IOContext) => void;
  description?: string;
}

type ChannelFactory = () => any;

const IO_MANAGER_KEY = Symbol("__cc_io_manager");

export class IOManager {
  private parameter: any;
  private parameterManager: ParameterManager;
  private channels: Map<string, ChannelFactory>;
  private bindings: IOBinding[];
  private debugPanel: HTMLElement | null;

  private constructor(parameter: any) {
    this.parameter = parameter;
    this.parameterManager = ParameterManager.from(parameter);
    this.channels = new Map();
    this.bindings = [];
    this.debugPanel = null;
  }

  public static from(parameter: any): IOManager {
    if (parameter == null) {
      throw new Error("IOManager requires a parameter object.");
    }

    if (parameter[IO_MANAGER_KEY]) {
      return parameter[IO_MANAGER_KEY];
    }

    const manager = new IOManager(parameter);
    Object.defineProperty(parameter, IO_MANAGER_KEY, {
      value: manager,
      enumerable: false,
      configurable: false,
      writable: false,
    });

    return manager;
  }

  public registerChannel(id: string, pull: ChannelFactory): () => void {
    this.channels.set(id, pull);
    return () => {
      this.channels.delete(id);
    };
  }

  public ensureChannel(id: string, pull: ChannelFactory): void {
    if (!this.channels.has(id)) {
      this.channels.set(id, pull);
    }
  }

  public connect(binding: IOBinding): () => void {
    this.bindings.push(binding);
    return () => {
      const index = this.bindings.indexOf(binding);
      if (index >= 0) {
        this.bindings.splice(index, 1);
      }
    };
  }

  public bindToParameter(
    channelId: string,
    mapping: ParameterMappingEntry[],
    description?: string
  ): () => void {
    if (!Array.isArray(mapping) || mapping.length === 0) {
      return () => {};
    }

    return this.connect({ channelId, mapping, description });
  }

  public onChannel(
    channelId: string,
    handler: (context: IOContext) => void,
    description?: string
  ): () => void {
    if (typeof handler !== "function") {
      return () => {};
    }

    return this.connect({ channelId, handler, description });
  }

  public registerTweakpaneTransfer(
    transfer: () => void,
    description?: string
  ): () => void {
    return this.onChannel(
      "tweakpane",
      () => {
        transfer();
      },
      description
    );
  }

  public update(timestamp = 0, deltaTime = 0): void {
    if (this.channels.size === 0 || this.bindings.length === 0) {
      return;
    }

    const cachedSources = new Map<string, any>();
    this.channels.forEach((pull, id) => {
      try {
        cachedSources.set(id, pull());
      } catch (error) {
        console.warn(`IOManager: failed to read channel '${id}'`, error);
      }
    });

    if (cachedSources.size === 0) {
      return;
    }

    const contextBase = {
      parameter: this.parameter,
      parameterManager: this.parameterManager,
    };

    // optional visual debug panel
    if (Debug.isEnabled("debug.panel")) {
      const lines: string[] = [];
      cachedSources.forEach((value, key) => {
        lines.push(
          `${key}: ${JSON.stringify(value, null, 2).substring(0, 400)}`
        );
      });
      Debug.renderPanel(this.parameter, lines.join("\n\n"), "cc-io-debug", "Debug", true);
    }

    for (let i = 0; i < this.bindings.length; i++) {
      const binding = this.bindings[i];
      const source = cachedSources.get(binding.channelId);
      if (source == null) {
        continue;
      }

      const debugKey = `io.${binding.channelId}`;
      const debugEnabled =
        Debug.isEnabled("io") || Debug.isEnabled(debugKey);

      if (binding.mapping && binding.mapping.length > 0) {
        if (debugEnabled) {
          console.log(`[IO] apply mapping ${binding.channelId}`, source);
        }
        this.parameterManager.applyMapping(source, binding.mapping);
      }

      if (binding.handler) {
        binding.handler({
          ...contextBase,
          timestamp,
          deltaTime,
          channelId: binding.channelId,
          source,
        });
      }

      if (debugEnabled) {
        console.log(`[IO] after mapping ${binding.channelId}`, this.parameter);
      }
    }
  }

}
