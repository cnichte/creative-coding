/**
 * Title    : Entities
 * Project  : Creative Coding
 * File     : projects/002-entities/main.js
 * Version  : 0.1.0
 * Published: https://carsten-nichte.de/art/portfolio/entities/
 * 
 * Classes:
 * - My_Artwork
 *
 * and the usual support methods:
 * 
 *  - My_Artwork.provide_tweakpane_to() - Provides a Tweakpane
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
    BackgroundShape,
    Brush,
    ColorSet,
    Entities,
    Format,
    SceneGraph,
    Size
} = require('@carstennichte/cc-utils');


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

        this.parameter = {}; // const parameter

        this.parameter = Object.assign(this.parameter, parameter);

        // custom stuff

        this.entity_manager = null;
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
        BackgroundShape.inject_parameterset_to(this.parameter, this.parameter.tweakpane);
        Format.inject_parameterset_to(this.parameter, this.parameter.tweakpane);
        ColorSet.inject_parameterset_to(this.parameter, this.parameter.tweakpane);
        Entities.Manager.inject_parameterset_to(this.parameter, this.parameter.tweakpane);

        // create my Artwork-Objects
        this.background = new BackgroundShape(this.parameter);
        this.format = new Format(this.parameter);

        this.entity_manager = new Entities.Manager(this.parameter);

        // Background listens to Format changes
        this.format.addObserver(this.background);
        this.format.addObserver(this.entity_manager);

        // Quadrat listens to ColorSet changes
        this.colorSet = new ColorSet();
        this.colorSet.addObserver(this.background);
        this.colorSet.addObserver(this.entity_manager);
        this.colorSet.animationTimer.addListener(this.background);
        this.colorSet.animationTimer.addListener(this.entity_manager);

        // Lets set up the Scene
        this.scene = new SceneGraph();
        this.scene.push(this.background);
        this.scene.push(this.entity_manager);
    }

    /**
     * Renders the artwork.
     *
     * @param {Object} context 
     * @param {long} time 
     * @param {long} deltaTime 
     */
    render(context, time, deltaTime) {

        this.parameter.artwork.clearscreen = this.parameter.tweakpane.artwork_clearscreen;
        this.clearScreen(context, this.parameter.artwork.canvas.size.width, this.parameter.artwork.canvas.size.height, this.parameter.tweakpane.artwork_clearscreen);

        // TODO use parameter.background.color = this.parameter.tweakpane.background_color
        this.background.setBackgroundColor(this.parameter.tweakpane.background_color);

        // set a new Format and notify all Observers
        this.format.setFormat(this.parameter.tweakpane.format_type, this.parameter.tweakpane.format_aspect_ratio);
        this.format.useFencing(this.parameter.tweakpane.format_fencing);
        this.format.setPreserveAspectRatio(this.parameter.tweakpane.format_keep_aspect_ratio);

        //? Dafür setter machen?
        BackgroundShape.transfer_tweakpane_parameter_to(this.parameter);
        ColorSet.transfer_tweakpane_parameter_to(this.parameter);
        Entities.Manager.transfer_tweakpane_parameter_to(this.parameter);

        this.colorSet.animationTimer.check_timer(time, deltaTime, this.animation_halt, this.parameter.colorset);

        this.colorSet.set_colorset_by_name(
            this.parameter.tweakpane.colorset_groupname,
            this.parameter.tweakpane.colorset_mode,
            this.parameter.tweakpane.colorset_variante,
            this.parameter.tweakpane.colorset_number);

        // update, animate, draw
        this.scene.draw(context, this.parameter);

    }
}


My_Artwork.ARTWORK_NAME = "Entities";
My_Artwork.ARTWORK_VERSION = "0.9.0";
My_Artwork.OPEN_TWEAK_PANES = 1; // from below, the others are closed

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
    folder = BackgroundShape.provide_tweakpane_to("3. ", pane, parameter_tweakpane);
    folder = Entities.Manager.provide_tweakpane_to("4. ", pane, parameter_tweakpane);

    pane.addSeparator();
    Artwork.provide_nameVersion_for_tweakPane(pane, parameter_tweakpane, My_Artwork.ARTWORK_NAME, My_Artwork.ARTWORK_VERSION);

    return folder;
};

module.exports = My_Artwork;