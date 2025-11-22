/**
 * Lightweight message contracts between the Studio (Electron-UI) and the Playground/Artwork iframe.
 * Keep these interfaces stable so both Seiten dieselbe Sprache sprechen.
 */

/** Payload für ein Component-Drop aus der Studio-Library. */
export interface LibraryComponent {
  id: string;
  name?: string;
  category?: string;
  desc?: string;
  // Platz für spätere Optionen, z.B. default-Props
  [key: string]: unknown;
}

/** Eingehende Messages aus dem Studio. */
export type StudioIncomingMessage =
  | { type: "add-component"; component: LibraryComponent }
  | { type: "timeline-scrub"; position: number }
  | { type: "request-state" }
  | { type: "timeline-play-toggle" };

/** ACK/Antwort zurück ans Studio nach erfolgreicher/fehlgeschlagener Verarbeitung. */
export interface ComponentAddedAck {
  type: "component-added";
  id: string;
  name?: string;
  status: "ok" | "error";
  total?: number;
  error?: string;
}

/** Minimaler Vertrag für eine Message-Bridge, die auf window.postMessage hört. */
export interface MessageBridge {
  attach(win: Window): void;
  detach(): void;
  handle(message: StudioIncomingMessage, source?: Window): void;
}

/** Type-Guard für Add-Component. */
export function isAddComponentMessage(msg: any): msg is { type: "add-component"; component: LibraryComponent } {
  return msg && typeof msg === "object" && msg.type === "add-component" && msg.component && typeof msg.component.id === "string";
}
