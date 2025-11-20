/**
 * Title    : Exporter
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/Exporter.ts
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
 *
 * Object serialization - save and load all parameters to and from JSON.
 */

import { Pane } from "tweakpane";
import { ParameterManager } from "./ParameterManager";
import {
  TweakpaneManager,
  type TweakpaneContainer,
} from "./TweakpaneManager";

const JSZip = require("jszip");
const saveAs = require("file-saver");

export interface Exporter_ParameterSet {
  exporter: Exporter_ParameterSet_Values;
}

export interface Exporter_ParameterSet_Values {
  filename: string;
}

interface Exporter_ParameterTweakpane {
  exporter_filename: string;
}

export class Exporter {
  /**
   * Zip and save an artwork bundle
   *
   * @param {Pane} pane
   * @param {Canvas} theCanvas
   * @param {Object} parameter
   * @param {String} filename
   */
  static zip_and_save(
    pane: Pane,
    theCanvas: any,
    parameter: any,
    filename: string
  ) {
    const zip = new JSZip();

    const fileContent = Exporter.bundle_all_params(pane, parameter);

    const bb_json = new Blob([fileContent], {
      type: "text/plain",
    });

    zip.file(filename + ".json", bb_json);

    const the_copyright = `# Readme / Copyright
Hi! You have created this Artwork with cc-toolbox by Carsten Nichte.

* https://carsten-nichte.de/portfolio/generative-art/
* https://carsten-nichte.de/publications/applications/creative-code/

Feel free to print and display it for your own joy, but you are not allowed to sell prints or whatever.
Have fun! - Carsten`;

    zip.file(filename + ".md", the_copyright);

    const img_folder = zip.folder("images");

    const dataURL = theCanvas.toDataURL();
    const base64Data = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");

    img_folder.file(filename + ".png", base64Data, {
      base64: true,
    });

    zip.generateAsync({ type: "blob" }).then(function (content: any) {
      saveAs(content, filename + ".zip");
    });
  }

  /**
   * Helperfunction to check if a String contains JSON.
   */
  static is_json(test: string) {
    try {
      JSON.parse(test);
      if (typeof test === "string") if (test.length === 0) return false;
    } catch (e) {
      return false;
    }
    return true;
  }

  /**
   * Helperfunction to build a filename, if Parameter is empty.
   */
  static build_filename(filename: string): string {
    filename = filename.trim();

    const d = new Date();
    const datestring =
      d.getFullYear() +
      "-" +
      (d.getMonth() + 1) +
      "-" +
      d.getDate() +
      " " +
      d.getHours() +
      "-" +
      d.getMinutes() +
      "-" +
      d.getSeconds();

    filename = filename + "_" + datestring;

    return filename;
  }

  /**
   * Merges the Tweakpane-Parameters (parameter_tweakpane) and the additional ones (parameter).
   * EXPORT
   */
  static bundle_all_params(pane: Pane, parameter: any) {
    const state = pane.exportState();

    const bundled_json = {
      parameter: parameter,
      parameter_tweakpane: state,
    };
    const file_content = JSON.stringify(bundled_json, null, 4);

    return file_content;
  }

  /**
   * Separate the Tweakpane-Parameters (parameter_tweakpane) from the additional Parameters (parameter) and load both.
   * Das wurde für den IMPORT benutzt, den ich aber nicht nutze.
   */
  static split_all_params(pane: Pane, jsonString: string) {
    const allParameters_JsonObject = JSON.parse(jsonString);

    const f = pane.addFolder({
      title: "Values",
    });

    f.importState(allParameters_JsonObject.parameter_tweakpane);

    return allParameters_JsonObject.parameter;
  }

  //* --------------------------------------------------------------------
  //* Provide Default Parameter-Set
  //* --------------------------------------------------------------------

  public static get_default_paramterset(parameter?: any): any {
    const parameter_default: Exporter_ParameterSet = {
      exporter: {
        filename: "artwork-",
      },
    };
    return parameter_default;
  } // get_default_paramterset

  public static ensureParameterSet(parameter: any) {
    const manager = ParameterManager.from(parameter);
    return manager.ensure("exporter", Exporter.get_default_paramterset());
  }

  public static registerTweakpane(
    parameter: any,
    manager: TweakpaneManager,
    container: TweakpaneContainer,
    id = "exporter"
  ) {
    if (!manager) return null;
    const exporter = Exporter.ensureParameterSet(parameter);

    const folder =
      (container as any) ??
      manager.getPane().addFolder({
        title: "Export",
        expanded: false,
      });

    const module = manager.createModule({
      id,
      container: folder,
      stateDefaults: {
        filename: exporter.filename,
      },
      statePath: ["exporter"],
      parameterPath: ["exporter"],
      parameterDefaults: exporter,
      channelId: "tweakpane",
    });

    const currentState = module.getState();
    if (typeof currentState.filename !== "string") {
      module.setState({ filename: exporter.filename || "artwork-" });
    }

    module.addBinding(
      "filename",
      { label: "Filename" },
      { target: "exporter.filename" }
    );

    module.addBlade({
      view: "buttongrid",
      size: [2, 1],
      cells: (x: number, y: number) => ({
        title: [["Image", "Parameter"]][y][x],
      }),
      label: "Download",
    }).on("click", (ev: any) => {
      const filenamePrefix =
        module.getState().filename ?? exporter.filename;
        const theFilename = Exporter.build_filename(
          `${filenamePrefix.trim().replace(/ /g, "-")}-${parameter.artwork.meta.title
            ?.trim()
            .replace(/ /g, "-") || "artwork"}`
        );

      if (ev.index[0] === 0 && ev.index[1] === 0) {
        const theCanvas: HTMLCanvasElement | null = document.getElementById(
          parameter.artwork.canvas.html.id
        ) as HTMLCanvasElement | null;

        if (theCanvas != null) {
          theCanvas.toBlob(function (blob) {
            if (blob) {
              saveAs(blob, theFilename + ".png");
            }
          });
        }
      } else if (ev.index[0] === 1 && ev.index[1] === 0) {
        const fileContent = Exporter.bundle_all_params(
          manager.getPane(),
          parameter
        );

        const bb = new Blob([fileContent], {
          type: "text/plain",
        });

        const a = document.createElement("a");
        a.download = theFilename + ".json";
        a.href = window.URL.createObjectURL(bb);
        a.click();
      }
    });

    return module;
  }
}
