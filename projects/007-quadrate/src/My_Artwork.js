/**
 * Title    : Quadrate nach Josef Albers
 * Project  : Creative Coding
 * File     : projects/005-quadrate/main.js
 * Version  : 0.1.0
 * Published: -
 *
 **
 * 
 * made with 
 * https://github.com/mattdesl/canvas-sketch
 * https://github.com/mattdesl/canvas-sketch-util
 * 
 * In the projects folder open the Terminal, and:
 * Start Server: `npm run server`
 * Build html:   `npm run html`
 * Build release:`npm run release`
 *
 ** Licence
 * Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
 * https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode
 * https://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1
 * 
 * In short:
 * Do not sell the code, or creative stuff made with this code.
 * You are allowed to make someone happy, and give away the works you have created for free.
 * learn, code, and have fun.
 * 
 * @author Carsten Nichte - 2022
 * 
 */

const {
    Artwork,
    Brush,
    Background,
    ColorSet,
    Format,
    SceneGraph,
    Shape,
    Size,
    Vector
} = require('@carstennichte/cc-utils');

let My_Quadrat = require('./My_Quadrat.js');


class My_Artwork extends Artwork {

    /**
     * 
     * @param {Object} sketchManager
     * @param {Object} settings - from canvas-sketch
     * @param {Object} window 
     * @param {Object} document 
     * @param {Object} canvas 
     * @param {Object} onKeyUp_Callback 
     * @param {Object} openOptionPanes 
     * @param {number} parameter 
     */
    constructor(sketchManager, settings, window, document, canvas, onKeyUp_Callback, openOptionPanes, parameter) {
        super(sketchManager, settings, window, document, canvas, onKeyUp_Callback, openOptionPanes);

        this.parameter = {
            // background: { color:"" }
            canvas: {
                size: undefined,
                // backgroundColor: this.parameter.tweakpane.canvas_background_color,
                // outer_color: this.parameter.tweakpane.canvas_outer_color,

                brush: {
                    shape: "Rect",
                    angle: 0,
                    scale: 1.0,
                    border: 5.0,
                    borderColor: "#000000ff",
                    fillColor: "#ffffff00"
                }
            },

            quadrat: [{
                    brush: {
                        shape: "Rect",
                        angle: 0,
                        scale: 1.0,
                        border: 0.001,
                        borderColor: parameter.tweakpane.quadratColor_1,
                        fillColor: parameter.tweakpane.quadratColor_1
                    },
                    position_faktor: {
                        x: 0,
                        y: 0
                    },
                    size_faktor: {
                        x: 0,
                        y: 0
                    }
                },
                {
                    brush: {
                        shape: "Rect",
                        angle: 0,
                        scale: 1.0,
                        border: 0.001,
                        borderColor: parameter.tweakpane.quadratColor_2,
                        fillColor: parameter.tweakpane.quadratColor_2
                    },
                    position_faktor: {
                        x: 0,
                        y: 0
                    },
                    size_faktor: {
                        x: 0,
                        y: 0
                    }
                },
                {
                    brush: {
                        shape: "Rect",
                        angle: 0,
                        scale: 1.0,
                        border: 0.001,
                        borderColor: parameter.tweakpane.quadratColor_3,
                        fillColor: parameter.tweakpane.quadratColor_3
                    },
                    position_faktor: {
                        x: 0,
                        y: 0
                    },
                    size_faktor: {
                        x: 0,
                        y: 0
                    }
                }
            ]
        }; // const parameter

        this.parameter = Object.assign(this.parameter, parameter);

        this.quadrat = [];
    }

    /**
     * Prepares the Artwork.
     * @param {number} canvas_width 
     * @param {number} canvas_height 
     */
    prepare(canvas_width, canvas_height) {

        // Inject ParameterSets and init with Tweakpane-Parameters
        Artwork.inject_parameterset_to(this.parameter, this.parameter.tweakpane);
        Artwork.set_canvas_size(this.parameter, canvas_width, canvas_height);
        Background.inject_parameterset_to(this.parameter, this.parameter.tweakpane);
        Format.inject_parameterset_to(this.parameter, this.parameter.tweakpane);
        ColorSet.inject_parameterset_to(this.parameter, this.parameter.tweakpane);

        this.parameter.quadrat[0].brush = this.fill_brush(1);
        this.parameter.quadrat[1].brush = this.fill_brush(2);
        this.parameter.quadrat[2].brush = this.fill_brush(3);

        // Position und Größe des Quadrats muss immer relativ zum Format angegeben werden.

        // create my Artwork-Objects
        this.background = new Background(this.parameter);
        this.format = new Format(this.parameter);

        this.quadrat.push(new My_Quadrat(this.parameter.artwork.canvas.size, 0, this.parameter));
        this.quadrat.push(new My_Quadrat(this.parameter.artwork.canvas.size, 1, this.parameter));
        this.quadrat.push(new My_Quadrat(this.parameter.artwork.canvas.size, 2, this.parameter));

        // myQuadrat listens to Format changes
        // TODO: Das kann in den Konstruktor des Quadrat Objekts
        this.format.addObserver(this.background);
        this.format.addObserver(this.quadrat[0]);
        this.format.addObserver(this.quadrat[1]);
        this.format.addObserver(this.quadrat[2]);

        // Quadrat listens to ColorSet changes
        this.colorSet = new ColorSet();
        this.colorSet.addObserver(this.background);
        this.colorSet.addObserver(this.quadrat[0]);
        this.colorSet.addObserver(this.quadrat[1]);
        this.colorSet.addObserver(this.quadrat[2]);

        // ColorSet has an animation Timer...
        this.colorSet.animationTimer.addListener(this.background);
        this.colorSet.animationTimer.addListener(this.quadrat[0]);
        this.colorSet.animationTimer.addListener(this.quadrat[1]);
        this.colorSet.animationTimer.addListener(this.quadrat[2]);

        // Lets set up the Scene
        this.scene = new SceneGraph();
        this.scene.push(this.background);
        this.scene.push(this.quadrat[0]);
        this.scene.push(this.quadrat[1]);
        this.scene.push(this.quadrat[2]);

        // TODO Background muss auf Veränderungen im Format hören.

    }

    /**
     * 
     * @param {number} index 
     * @returns 
     */
    fill_brush(index) {

        let brush = new Brush();

        const x = this.parameter["tweakpane"]["quadrat" + index + "_brush_position_x"]
        const y = this.parameter["tweakpane"]["quadrat" + index + "_brush_position_y"]
        brush.position = new Vector(x, y);

        const w = this.parameter["tweakpane"]["quadrat" + index + "_brush_scale_x"];
        const h = this.parameter["tweakpane"]["quadrat" + index + "_brush_scale_y"];

        const s = this.parameter["tweakpane"]["quadrat" + index + "_brush_scale"];
        brush.scale = new Vector(w, h).multiply(s).multiply(this.parameter.artwork.scale);
        // TODO Artwork scale affects also the position of the Squares
        // brush.position = Shape.scale();

        brush.angle = this.parameter["tweakpane"]["quadrat" + index + "_brush_angle"];

        brush.shape = this.parameter["tweakpane"]["quadrat" + index + "_brush_shape"];

        brush.border = this.parameter["tweakpane"]["quadrat" + index + "_brush_border"];

        brush.borderColor = this.parameter["tweakpane"]["quadrat" + index + "_brush_borderColor"];
        brush.fillColor = this.parameter["tweakpane"]["quadrat" + index + "_brush_fillColor"];

        return brush;
    }

    /**
     * Renders the artwork.
     *
     * @param {Object} context 
     * @param {long} time 
     * @param {long} deltaTime 
     */
    render(context, time, deltaTime) {
        Artwork.transfer_tweakpane_parameter_to(this.parameter);
        ColorSet.transfer_tweakpane_parameter_to(this.parameter);

        this.parameter.artwork.clearscreen = this.parameter.tweakpane.artwork_clearscreen;
        this.clearScreen(context, this.parameter.artwork.canvas.size.width, this.parameter.artwork.canvas.size.height, this.parameter.tweakpane.artwork_clearscreen);

        // TODO use parameter.background.color = this.parameter.tweakpane.background_color
        this.background.setBackgroundColor(this.parameter.tweakpane.background_color);
        // set a new Format and notify all Observers
        this.format.setFormat(this.parameter.tweakpane.format_type, this.parameter.tweakpane.format_aspect_ratio);
        this.format.useFencing(this.parameter.tweakpane.format_fencing);
        this.format.setPreserveAspectRatio(this.parameter.tweakpane.format_keep_aspect_ratio);

        // Lets fill the Parameter Set
        this.parameter.quadrat[0].brush = this.fill_brush(1);
        this.parameter.quadrat[1].brush = this.fill_brush(2);
        this.parameter.quadrat[2].brush = this.fill_brush(3);

        this.colorSet.set_colorset_by_name(
            this.parameter.colorset.groupname,
            this.parameter.colorset.mode,
            this.parameter.colorset.variante,
            this.parameter.colorset.number); // and notify all...

        this.colorSet.animationTimer.check_timer(time, deltaTime, this.animation_halt, this.parameter.colorset);

        // update, animate, draw
        this.scene.draw(context, this.parameter);

    }
}


My_Artwork.ARTWORK_NAME = "Quadrate";
My_Artwork.ARTWORK_VERSION = "0.9.0";
My_Artwork.OPEN_TWEAK_PANES = 0; // from below, the others are closed

/**
 * Provides a Tweakpane for this Module.
 * Adds the Modules Parameters to the Tweakpane Parameter-Object
 *
 * @param {String} folder_name_prefix 
 * @param {Object} pane 
 * @param {Object} parameter_tweakpane - Tweakpane Parameter-Object
 * @returns 
 */
My_Artwork.provide_tweakpane_to = function (folder_name_prefix = "", pane, parameter_tweakpane) {

    // Inject Tweakpane parameters
    parameter_tweakpane = Object.assign(parameter_tweakpane, {});

    // Inject Tweakpane and Tweakpane-Parameters
    let folder = Artwork.provide_tweakpane_to("0. ", pane, parameter_tweakpane);
    folder = Format.provide_tweakpane_to("1. ", pane, parameter_tweakpane);
    folder = ColorSet.provide_tweakpane_to("2. ", pane, parameter_tweakpane);
    folder = Background.provide_tweakpane_to("3. ", pane, null, false, parameter_tweakpane);

    let brush_defaults1 = {
        shape: "Rect",
        position_x: 0.5,
        position_y: 0.6522,
        scale: 1.0,
        scale_x: 0.6000,
        scale_y: 0.6000,
        angle: 0,
        border: 0.0080,
        borderColor: "#ff00007F",
        fillColor: "#ff00007F" // red 7F (50%)
    };

    let brush_defaults2 = {
        shape: "Rect",
        position_x: 0.5000,
        position_y: 0.5653,
        scale: 1.0,
        scale_x: 0.7000,
        scale_y: 0.700,
        angle: 0,
        border: 0.0080,
        borderColor: "#00ff6c7F",
        fillColor: "#00ff6c7F" // green 7F
    };

    let brush_defaults3 = {
        shape: "Rect",
        position_x: 0.5000,
        position_y: 0.7283,
        scale: 1.0,
        scale_x: 0.5000,
        scale_y: 0.5000,
        angle: 0,
        border: 0.0080,
        borderColor: "#0032ff7F",
        fillColor: "#0032ff7F" // blue 7F
    };

    folder = Brush.provide_tweakpane_to("4. Quadrat 1:", pane, null, parameter_tweakpane, "quadrat1", [], brush_defaults1);
    folder = Brush.provide_tweakpane_to("-- Quadrat 2:", pane, null, parameter_tweakpane, "quadrat2", [], brush_defaults2);
    folder = Brush.provide_tweakpane_to("-- Quadrat 3:", pane, null, parameter_tweakpane, "quadrat3", [], brush_defaults3);

    pane.addSeparator();
    Artwork.provide_nameVersion_for_tweakPane(pane, parameter_tweakpane, My_Artwork.ARTWORK_NAME, My_Artwork.ARTWORK_VERSION);

    return folder;
};

module.exports = My_Artwork;