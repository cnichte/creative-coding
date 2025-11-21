/**
 * Simple debug helper keeping flat flags under `parameter.debug`.
 * Can also be used globally without parameter: Debug.enable("foo.bar")
 */

// projects/cc-toolbox/src/core/Debug.ts
export class Debug {
  // Menge aller aktivierten Debug-Keys
  static enabledKeys = new Set();

  /**
   * Einzelnen Key aktivieren
   * Debug.enable("key.x.y.z")
   */
  static enable(key: string) {
    if (typeof key === "string" && key.trim() !== "") {
      this.enabledKeys.add(key.trim());
    }
  }

  /**
   * Key deaktivieren
   */
  static disable(key: string) {
    this.enabledKeys.delete(key);
  }

  /**
   * Alle Keys auf einmal setzen
   * Debug.setEnabledKeys(["key.a", "key.b.c"])
   */
  static setEnabledKeys(keys: string[]) {
    this.enabledKeys.clear();
    for (const k of keys) {
      this.enable(k);
    }
  }

  /**
   * Optional: aus Komma-getrennter String-Liste initialisieren
   * Debug.initFromString("key.a, key.b.c")
   */
  static initFromString(str: string) {
    if (!str) return;
    const parts = str.split(",").map((s) => s.trim()).filter(Boolean);
    this.setEnabledKeys(parts);
  }

  /**
   * Prüfen, ob ein Key aktiviert ist
   */
  static isEnabled(key: string) {
    return this.enabledKeys.has(key);
  }

  /**
   * Alias: Debug.enabled("key.x.y.z")
   */
  static enabled(key: string) {
    return this.isEnabled(key);
  }

  /**
   * Kleiner Helfer: nur loggen, wenn Key aktiv ist
   */
  static log(key: string, ...args: string[]) {
    if (this.isEnabled(key)) {
      // Prefix mit dem Key (kannst du anpassen)
      console.log(`[${key}]`, ...args);
    }
  }
}