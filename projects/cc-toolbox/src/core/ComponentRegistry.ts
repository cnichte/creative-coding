import type { LibraryComponent } from "./MessageBridge";

export type ComponentFactoryResult =
  | { status: "ok"; message?: string }
  | { status: "unsupported"; message?: string }
  | { status: "error"; message?: string };

export interface ComponentFactory {
  (component: LibraryComponent): ComponentFactoryResult;
}

/**
 * Registry für Komponenten-Factories. Hält nur Mapping + Doku,
 * die eigentliche Anbindung (SceneGraph/Parameter) folgt in den Factories.
 */
export class ComponentRegistry {
  private factories: Record<string, ComponentFactory> = {};

  register(id: string, factory: ComponentFactory) {
    this.factories[id] = factory;
  }

  /**
   * Versucht, eine Komponente zu verarbeiten. Gibt ein Ergebnis zurück,
   * das 1:1 als ACK an das Studio gehen kann.
   */
  handle(component: LibraryComponent): ComponentFactoryResult {
    const factory = this.factories[component.id];
    if (!factory) {
      return { status: "unsupported", message: `No factory for id=${component.id}` };
    }
    try {
      return factory(component);
    } catch (err: any) {
      return { status: "error", message: String(err?.message || err) };
    }
  }

  /**
   * Vorbelegte Registry mit bekannten IDs. Aktuell Stub-Implementierungen,
   * die später echte SceneGraph-/Parameter-Integration bekommen.
   */
  static withDefaults(
    opts: Partial<Record<DefaultComponentIds, ComponentFactory>> = {}
  ): ComponentRegistry {
    const r = new ComponentRegistry();
    const stub = (name: string): ComponentFactory => () => ({
      status: "unsupported",
      message: `${name} factory not yet implemented`,
    });
    const ids: DefaultComponentIds[] = [
      "background",
      "grid",
      "colorset",
      "particle",
      "sensor",
      "timeline",
    ];
    ids.forEach((id) => {
      r.register(id, opts[id] ?? stub(id));
    });
    return r;
  }
}

export type DefaultComponentIds =
  | "background"
  | "grid"
  | "colorset"
  | "particle"
  | "sensor"
  | "timeline";
