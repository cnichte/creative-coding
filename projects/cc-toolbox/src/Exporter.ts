/**
 * Title    : Exporter
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/Exporter.ts
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
 * 
 ** Object Serializion - Save and Load all the Parameters to and from Json.
 * That should help to recreate an Artwork.
 * 
 * TODO: Mit einer uuid arbeiten für das "Artwork" und seine Varianten ?
 * artwork-uuid-001
 * artwork-uuid-002
 * 
 * TODO: https://stackoverflow.com/questions/6487699/best-way-to-serialize-unserialize-objects-in-javascript
 *
 * Uses:
 * https://github.com/eligrey/FileSaver.js
 * https://github.com/Stuk/jszip
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
import { Pane } from "tweakpane";
import type { Provide_Tweakpane_To_Props, TweakpaneSupport, TweakpaneSupport_Props } from "./TweakpaneSupport";

let JSZip = require('jszip');
let saveAs = require('file-saver');

export interface Exporter_ParameterSet {
    exporter: Exporter_ParameterSet_Values
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
    static zip_and_save(pane: Pane, theCanvas: any, parameter: any, filename: string) {
        // Zip the stuff and download all together.

        var zip = new JSZip();

        var fileContent = Exporter.bundle_all_params(pane, parameter);

        var bb_json = new Blob([fileContent], {
            type: 'text/plain'
        });

        zip.file(filename + ".json", bb_json);

        const the_copyright =
            `# Readme / Copyright
Hi! You have created this Artwork with cc-toolbox by Carsten Nichte.

* https://carsten-nichte.de/portfolio/generative-art/
* https://carsten-nichte.de/publications/applications/creative-code/

Feel free to print and display it for your own joy, but you are not allowed to sell prints or whatever.
Have fun! - Carsten`;

        zip.file(filename + ".md", the_copyright);

        var img_folder = zip.folder("images");

        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
        // For bigger Files: https://github.com/jimmywarting/StreamSaver.js
        // Canvas-to-Blob: https://github.com/eligrey/canvas-toBlob.js

        let dataURL = theCanvas.toDataURL();
        // Hack: convert dataURL to base64 Data
        let base64Data = dataURL.replace(/^data:image\/(png|jpg);base64,/, "")

        img_folder.file(filename + ".png", base64Data, {
            base64: true
        });

        // Generate the zip file asynchronously
        zip.generateAsync({ type: "blob" }).then(function (content: any) {
            // Force down of the Zip file
            // https://github.com/eligrey/FileSaver.js
            saveAs(content, filename + ".zip");
        });
    }


    /**
     * Helperfunction to check if a String contains JSON.
     * 
     * @param {string} test 
     * @returns 
     */
    static is_json(test: string) {
        try {
            JSON.parse(test);
            if (typeof (test) == 'string')
                if (test.length == 0) return false;
        } catch (e) {
            return false;
        }
        return true;
    }

    /**
     * Helperfunction to build a filename, if Parameter is empty.
     * 
     * @param {string} filename 
     * @returns 
     */
    static build_filename(filename: string): string {

        filename = filename.trim();

        let d = new Date();
        var datestring =
            d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " +
            d.getHours() + "-" + d.getMinutes() + "-" + d.getSeconds();

        filename = filename + "_" + datestring;

        return filename;
    }


    /**
     * Merges the Tweakpane-Parameters (parameter_tweakpane) and the additional ones (parameter).
     * EXPORT
     * @param {Pane} pane 
     * @param {*} parameter 
     * @returns String - filename
     */
    static bundle_all_params(pane: Pane, parameter: any) {

        const state = pane.exportState();
        console.log(state);

        // JSON.stringify(golbal.theGrid.cells);
        let bundled_json = {
            parameter: parameter,
            parameter_tweakpane: state
        };
        var file_content = JSON.stringify(bundled_json, null, 4);

        return file_content;
    }

    /**
     * Separate the Tweakpane-Parameters (parameter_tweakpane) from the additional Parameters (parameter) and load both.
     * Das wurde für den IMPORT benutzt, den ich aber nichte nutze.
     * @param {Pane} pane 
     * @param {*} jsonString 
     * @returns Object - the parameter
     */
    static split_all_params(pane: Pane, jsonString: string) {
        let allParameters_JsonObject = JSON.parse(jsonString);

        const f = pane.addFolder({
            title: 'Values',
        });

        f.importState((allParameters_JsonObject.parameter_tweakpane));

        return allParameters_JsonObject.parameter;
    }



    //* --------------------------------------------------------------------
    //* Provide Default Parameter-Set
    //* --------------------------------------------------------------------

    public static get_default_paramterset(parameter?: any): any {
        const parameter_default: Exporter_ParameterSet = {
            exporter: {
                filename: "artwork-"
            }
        }
        return parameter_default;
    } // get_default_paramterset


    public static tweakpaneSupport: TweakpaneSupport = {
        provide_tweakpane_to: function (parameter: any, props: Provide_Tweakpane_To_Props) {

            // werden übergeben, oder es werden defaultwerte gesetzt.
            Exporter.tweakpaneSupport.inject_parameterset_to(parameter);

            let parameterTP: Exporter_ParameterTweakpane = {
                exporter_filename: parameter.exporter.filename
            };
            parameter.tweakpane = Object.assign(parameter.tweakpane, parameterTP);

            if (props.items.folder == null) {
                props.items.folder = props.items.pane.addFolder({
                    title: props.folder_name_prefix + "Export",
                    expanded: false,
                });
            }

            props.items.folder.addBinding(parameter.tweakpane, "exporter_filename", {
                label: "Filename",
            });

            props.items.folder.addBlade({
                view: 'buttongrid',
                size: [2, 1],
                cells: (x: number, y: number) => ({
                    title: [
                        ['Image', 'Parameter']
                    ][y][x],
                }),
                label: 'Download',
            }).on('click', (ev: any) => {

                const theFilename = Exporter.build_filename(parameter.tweakpane.exporter_filename.trim().replace(/ /g, "-") + "-" + parameter.artwork.meta.title.trim().replace(/ /g, "-"));

                if (ev.index[0] === 0 && ev.index[1] === 0) {
                    console.log("Exporter: Download canvas as png...");

                    // Die gobalen Objekte window & document stehen im Browser überall zur Verfügung.
                    let theCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById(parameter.artwork.canvas.html.id); // HTMLElement

                    // Download Artwork
                    if (theCanvas != null) {

                        // Method 1
                        // const a = document.createElement("a");
                        // a.download = theFilename + "_method-1.png";
                        // a.href = theCanvas.toDataURL();
                        // a.click();

                        // Method 2
                        theCanvas.toBlob(function (blob) {
                            saveAs(blob, theFilename + ".png");
                        });
                    }
                } else if (ev.index[0] === 1 && ev.index[1] === 0) {
                    console.log("Exporter: Download Parameter-Object...");

                    // Download settings.json
                    var fileContent = Exporter.bundle_all_params(props.items.pane, parameter);

                    var bb = new Blob([fileContent], {
                        type: 'text/plain'
                    });

                    var a = document.createElement('a');
                    a.download = theFilename + ".json";
                    a.href = window.URL.createObjectURL(bb);
                    a.click();
                }
            });

            const btn_download_all_zipped = props.items.folder.addButton({
                title: 'Image & Parameter (zip)',
                label: '', // optional
            });

            btn_download_all_zipped.on('click', () => {
                console.log("Exporter download all zipped...");
                let theCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById(parameter.artwork.canvas.html.id); // HTMLElement
                if (theCanvas != null) {
                    const theFilename = Exporter.build_filename(parameter.tweakpane.exporter_filename.trim().replace(/ /g, "-") + "-" + parameter.artwork.meta.title.trim().replace(/ /g, "-"));
                    Exporter.zip_and_save(props.items.pane, theCanvas, parameter, theFilename);
                }
            });

            /*            
                                    folder = tab_main.pages[1].addFolder({
                                        title: 'Parameter Clipboard'
                                    });
                                    const btn_export_to_clipboard = folder.addButton({
                                        title: 'Copy to Clipboard',
                                        label: '', // optional
                                    });
                                    btn_export_to_clipboard.on('click', () => {
                                        var json = Exporter.bundle_all_params(pane, parameter);
                                        window.prompt("Copy to clipboard: Ctrl+C, Enter", json);
                                    });
                                    folder.addInput(parameter_tweakpane, 'jsonString', {
                                        label: 'JSON String'
                                    }).on('change', (ev) => {
                                        // console.log(ev.value);
                                        if (ev.last) {
                                            // console.log('(last)');
                                        }
                                    });
                                    const btn_import = folder.addButton({
                                        title: 'Import Parameter',
                                        label: '', // optional
                                    });
                                    btn_import.on('click', () => {
                        
                                        if (JsonManager.is_json(parameter_tweakpane.jsonString)) {
                        
                                            // Here i rely on the fact that a proper TheGrid-Json is provided.
                                            // This should be the case if it was also exported with this.
                                            parameter = JsonManager.split_all_params(pane, parameter_tweakpane.jsonString);
                                            // parameter_tweakpane.jsonString = "";
                        
                                        } else {
                                            // console.log("Kein JSON: '" + paramsTP.jsonString + "'");
                                        }
                                    });            
                        */

        },
        inject_parameterset_to: function (parameter: any, props?: TweakpaneSupport_Props | undefined): void {
            if (!("exporter" in parameter)) {
                Object.assign(parameter, Exporter.get_default_paramterset());
            }
        },
        transfer_tweakpane_parameter_to: function (parameter: any, props?: TweakpaneSupport_Props | undefined): void {
            parameter.exporter.filename = parameter.tweakpane.exporter_filename;
        }
    }
}