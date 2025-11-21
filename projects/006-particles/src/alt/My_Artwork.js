/**
 * Title    : Particles
 * Project  : Creative Coding
 * File     : projects/003-particles/main.js
 * Version  : 0.1.0
 * Published: https://carsten-nichte.de/blog/portfolio/particles/
 * 
 ** I test with random particles floating arround
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
    Format,
    Particles,
    SceneGraph,
    Shape,
    Size
} = require('@carstennichte/cc-utils');


/**
 * Ist hier im moment nur Platzhalter.
 * Soll ParticleManager etc. aufnehmen...
 */
class My_Artwork extends Artwork {

    constructor(sketchManager, settings, window, document, canvas, onKeyUp_Callback, openOptionPanes, parameter) {
        super(sketchManager, settings, window, document, canvas, onKeyUp_Callback, openOptionPanes);

        this.parameter = {};

        this.agents_manager = null;

        this.parameter = Object.assign(this.parameter, parameter);
    }

    /**
     * Prepares the Artwork.
     * @param {number} canvas_width 
     * @param {number} canvas_height 
     */
    prepare(canvas_width, canvas_height) {

        Artwork.inject_parameterset_to(this.parameter, this.parameter.tweakpane);
        Artwork.set_canvas_size(this.parameter, canvas_width, canvas_height);
        Format.inject_parameterset_to(this.parameter, this.parameter.tweakpane);
        ColorSet.inject_parameterset_to(this.parameter, this.parameter.tweakpane);
        BackgroundShape.inject_parameterset_to(this.parameter, this.parameter.tweakpane);
        Particles.Manager.inject_parameterset_to(this.parameter, this.parameter.tweakpane);

        this.agents_manager = new Particles.Manager(this.parameter);

        this.background = new BackgroundShape(this.parameter);
        this.format = new Format(this.parameter);

        this.colorSet = new ColorSet();

        // Lets set up the Scene
        this.scene = new SceneGraph();
        this.scene.push(this.background);
        this.scene.push(this.agents_manager);

    }


    /**
     * Renders the artwork.
     *
     * @param {Object} context 
     * @param {long} time 
     * @param {long} deltaTime 
     */
    render(context, time, deltaTime) {
        // TODO - clear Screen doesnt work? ...works...
        this.parameter.artwork.clearscreen = this.parameter.tweakpane.artwork_clearscreen;
        this.clearScreen(context, this.parameter.artwork.canvas.size.width, this.parameter.artwork.canvas.size.height, this.parameter.tweakpane.artwork_clearscreen);

        // TODO use parameter.background.color = parameter.tweakpane.background_color
        this.background.setBackgroundColor(this.parameter.tweakpane.background_color);

        // set a new Format and notify all Observers
        this.format.setFormat(this.parameter.tweakpane.format_type, this.parameter.tweakpane.format_aspect_ratio);
        this.format.useFencing(this.parameter.tweakpane.format_fencing);
        this.format.setPreserveAspectRatio(this.parameter.tweakpane.format_keep_aspect_ratio);

        Particles.Manager.transfer_tweakpane_parameter_to(this.parameter);
        ColorSet.transfer_tweakpane_parameter_to(this.parameter);

        this.colorSet.animationTimer.check_timer(time, deltaTime, this.animation_halt, this.parameter.colorset);

        this.colorSet.set_colorset_by_name(
            this.parameter.tweakpane.colorset_groupname,
            this.parameter.tweakpane.colorset_mode,
            this.parameter.tweakpane.colorset_variante,
            this.parameter.tweakpane.colorset_number);

        this.scene.draw(context, this.parameter);
    }
}


My_Artwork.ARTWORK_NAME = "Particles";
My_Artwork.ARTWORK_VERSION = "0.9.0";
My_Artwork.OPEN_TWEAK_PANES = 2; // from below, the others are closed

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
    parameter_tweakpane = Object.assign(parameter_tweakpane, { });

    let folder;

    // Inject Tweakpane and Tweakpane-Parameters
    folder = Artwork.provide_tweakpane_to("0. ", pane, parameter_tweakpane);
    folder = Format.provide_tweakpane_to("1. ", pane, parameter_tweakpane);
    folder = ColorSet.provide_tweakpane_to("2. ", pane, parameter_tweakpane);
    folder = BackgroundShape.provide_tweakpane_to("3. ", pane, parameter_tweakpane);
    folder = Particles.Manager.provide_tweakpane_to("4. ", pane, parameter_tweakpane);

    pane.addSeparator();
    Artwork.provide_nameVersion_for_tweakPane(pane, parameter_tweakpane, My_Artwork.ARTWORK_NAME, My_Artwork.ARTWORK_VERSION);

    return folder;
};

module.exports = My_Artwork;
