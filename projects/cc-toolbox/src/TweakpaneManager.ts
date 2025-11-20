/**
 * Title    : TweakpaneManager
 * Project  : Creative Coding
 *
 * Lightweight abstraction that keeps tweakpane state in sync with the
 * parameter object and connects controls to the IO-Manager.
 *
 * Goal: modules only describe their UI + mappings; the manager handles
 * defaults, containers and channel wiring.
 */

import { Pane, type FolderApi, type TabPageApi } from "tweakpane";
import { IOManager, type IOContext } from "./IOManager";
import {
  ParameterManager,
  type ParameterMappingEntry,
} from "./ParameterManager";

type StatePath = string | string[] | undefined;

export type TweakpaneContainer = Pane | FolderApi | TabPageApi;

export interface TweakpaneModuleOptions {
  id: string;
  title?: string;
  container?: TweakpaneContainer;
  expanded?: boolean;
  statePath?: StatePath;
  stateDefaults?: Record<string, any>;
  parameterPath?: string | string[];
  parameterDefaults?: Record<string, any>;
  channelId?: string;
}

interface BindingMapping {
  target: string;
  transform?: ParameterMappingEntry["transform"];
}

export class TweakpaneManager {
  private pane: Pane;
  private ioManager: IOManager;
  private parameterManager: ParameterManager;
  private stateRoot: any;
  private channelDisposers: Map<string, () => void>;

  constructor(parameter: any, pane: Pane, ioManager: IOManager) {
    this.pane = pane;
    this.ioManager = ioManager;
    this.parameterManager = ParameterManager.from(parameter);

    if (!("tweakpane" in parameter)) {
      Object.assign(parameter, { tweakpane: {} });
    }

    this.stateRoot = parameter.tweakpane;
    this.channelDisposers = new Map();

    // Ensure the legacy tweakpane channel stays alive for older modules.
    this.ioManager.ensureChannel("tweakpane", () => this.stateRoot);
  }

  public createModule(options: TweakpaneModuleOptions): TweakpaneModule {
    const state = this.ensureState(options.statePath, options.stateDefaults);

    if (options.parameterPath) {
      this.parameterManager.ensure(
        options.parameterPath,
        options.parameterDefaults ?? {}
      );
    }

    const channelId =
      options.channelId ??
      (this.normalizeStatePath(options.statePath).length === 0
        ? "tweakpane"
        : `ui:${options.id}`);

    if (channelId !== "tweakpane") {
      this.ensureChannel(channelId, state);
    }

    const container = this.resolveContainer(options);

    return new TweakpaneModule(this, {
      id: options.id,
      channelId,
      state,
      container,
    });
  }

  private ensureChannel(channelId: string, state: any) {
    if (this.channelDisposers.has(channelId)) return;
    const dispose = this.ioManager.registerChannel(channelId, () => state);
    this.channelDisposers.set(channelId, dispose);
  }

  private resolveContainer(options: TweakpaneModuleOptions): TweakpaneContainer {
    if (options.container) {
      return options.container;
    }
    return this.pane.addFolder({
      title: options.title ?? options.id,
      expanded: options.expanded ?? false,
    });
  }

  private ensureState(
    statePath: StatePath,
    defaults: Record<string, any> = {}
  ): any {
    const segments = this.normalizeStatePath(statePath);
    if (segments.length === 0) {
      Object.assign(this.stateRoot, defaults);
      return this.stateRoot;
    }

    let node = this.stateRoot;
    segments.forEach((segment, index) => {
      if (
        typeof node[segment] !== "object" ||
        node[segment] === null ||
        Array.isArray(node[segment])
      ) {
        node[segment] = {};
      }

      if (index === segments.length - 1) {
        Object.assign(node[segment], defaults);
      }

      node = node[segment];
    });

    return node;
  }

  private normalizeStatePath(statePath: StatePath): string[] {
    if (Array.isArray(statePath)) {
      return statePath.filter((segment) => segment != null && segment !== "");
    }
    if (statePath == null || statePath === "") {
      return [];
    }
    return statePath
      .split(".")
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0);
  }

  public registerMapping(channelId: string, mappings: ParameterMappingEntry[]) {
    if (!mappings || mappings.length === 0) return;
    this.ioManager.bindToParameter(channelId, mappings);
  }

  public registerHandler(
    channelId: string,
    handler: (context: IOContext) => void
  ) {
    return this.ioManager.onChannel(channelId, handler);
  }

  public getPane(): Pane {
    return this.pane;
  }
}

interface ModuleConfig {
  id: string;
  state: any;
  container: TweakpaneContainer;
  channelId: string;
}

export class TweakpaneModule {
  private manager: TweakpaneManager;
  private id: string;
  private state: any;
  private container: TweakpaneContainer;
  private channelId: string;

  constructor(manager: TweakpaneManager, config: ModuleConfig) {
    this.manager = manager;
    this.id = config.id;
    this.state = config.state;
    this.container = config.container;
    this.channelId = config.channelId;
  }

  public addBinding(
    stateKey: string,
    params: Record<string, any>,
    mapping?: BindingMapping
  ) {
    const binding = (this.container as any).addBinding(
      this.state,
      stateKey,
      params
    );
    if (mapping) {
      this.manager.registerMapping(this.channelId, [
        {
          source: stateKey,
          target: mapping.target,
          transform: mapping.transform,
        },
      ]);
    }
    return binding;
  }

  public addBlade(params: Record<string, any>) {
    if ("addBlade" in this.container) {
      return (this.container as any).addBlade(params);
    }
    return null;
  }

  public setState(values: Record<string, any>) {
    Object.assign(this.state, values);
  }

  public onUpdate(
    handler: (state: any, context: IOContext) => void
  ): () => void {
    return this.manager.registerHandler(this.channelId, (context) => {
      handler(this.state, context);
    });
  }

  public getState(): any {
    return this.state;
  }
}
