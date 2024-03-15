const {
    Animation,
    Brush,
    ColorSet,
    Format,
    Shape,
    Size,
    Vector
} = require('@carstennichte/cc-utils');

const Color = require('canvas-sketch-util/color');

/**
 * My_Quadrat implements 
 *  Pattern.Observer (update)
 *  SceneGraph_Item (draw)
 */
class My_Quadrat {

    /**
     * Construct a Quadrat.
     * 
     * @param {Size} canvas_size 
     * @param {number} parameter_set_nr Index of the  parameterset
     * @param {Object} parameter
     */
    constructor(canvas_size, parameter_set_nr, parameter) {
        // super();

        this.parameter = parameter;
        this.ps_nr = parameter_set_nr;

        // parameter.canvas.colorsetNumber
        // parameter.canvas.colorsAnimate
        // parameter.canvas.color

        //! this.animationTimer = new AnimationTimer();
        // The scenegraph does the: this.animationTimer.push(this);
        // automatically, becauses he found this timer.

        this.state = {
            colorset: {
                mode: "", // "custom, colorset, random, chaos"

                groupname: "", // The name of The colorset
                variant: 0, // A name could return more then one colorset. This is to choose one of them.
                variant_index: 0,

                number: 0, // A colorset has more than one color. This is to choose a specific.
                number_index: 0,

                cs_object: null, // The ColorSet-Object

                borderColor: "", // Three default colors with alpha, extracted for easy access
                fillColor: "",
                backgroundColor: ""
            },
            format: {
                fencing: true,
                preserveAspectRatio: true,
                position_lefttop: new Vector(0, 0),
                size: this.parameter.artwork.canvas.size,
                /* center is always the same, instead the case: we move the Format outside the center. */
                center: new Vector(this.parameter.artwork.canvas.size.width * 0.5, this.parameter.artwork.canvas.size.height * 0.5),
                fak: new Vector(1.0, 1.0) /* A scale Factor, for Objects to fit in the Format. */
            }
        };

        /*
                // TODO aufräumen
                this.state_colorset = {
                    mode: parameter.colorset.mode, // "custom, colorset, random, chaos"

                    groupname: parameter.colorset.group, // The name of The colorset
                    variant: -1, // A name could return more then one colorset. This is to choose one of them. 
                    number: -1, // A colorset has more than one color. This is to choose a specific.

                    cs_object: null, // The ColorSet-Object

                    borderColor: parameter.quadrat[this.ps_nr].brush.borderColor, // Three default colors, extracted for easy access
                    fillColor: parameter.quadrat[this.ps_nr].brush.fillColor,
                };
        */
        this.fillColorAlpha = Color.parse(parameter.quadrat[this.ps_nr].brush.fillColor).alpha;
        this.borderColorAlpha = Color.parse(parameter.quadrat[this.ps_nr].brush.borderColor).alpha;

        // That is the factual canvas.
        this.canvas_position = new Vector(0, 0);
        this.canvas_size = canvas_size;

        // The position and size of the Quadrat
        this.quadrat_position = new Vector(0, 0);
        this.quadrat_size = new Size(this.canvas_size.width * 0.25, this.canvas_size.height * 0.25); // TODO Parameter
        /*
                this.state_format = {
                    // This is the area "cropped" by the format.
                    position_lefttop: new Vector(0, 0), // canvas_position_crop
                    size: canvas_size.clone(), // canvas_size_crop

                    fak: 1,
                    fencing: true,
                    preserveAspectRatio: true
                };
        */
    }



    /**
     * Is called from the ObserverSubject.
     * Which are the Format class, and the Colorset in this case.
     * 
     * TODO Here I could simply save the entire state object.
     * But that would be very intransparent.
     * I would not recognize on what is listened here.
     * Beside that, I don't want to "store" anything that I don't need.
     * 
     * @param {Object} state
     */
    update(source) {
        if (source instanceof Format) {
            this.state.format = source.state.format;
        }
        if (source instanceof ColorSet) {
            this.state.colorset = source.state.colorset;
        }
    }


    /**
     * This is called by the AnimationTimer.
     *
     * @param {Class} source 
     */
    animate_slow(source) {
        if (source instanceof ColorSet) {
            // mode, groupname, cs_object, brush, variant=-1, number=-1
            let random = ColorSet.get_colors_from_mode(this.state.colorset, this.parameter.quadrat[this.ps_nr].brush);

            this.state.colorset.borderColor = random.borderColor;
            this.state.colorset.fillColor = random.fillColor;
            this.borderColorAlpha = random.borderColorAlpha;
            this.fillColorAlpha = random.fillColorAlpha;
        }
    }

    /**
     * Is called by the SceneGraph.
     *
     * needs:
     * parameter.quadrat.brush
     * parameter.quadrat.position_faktor
     * parameter.quadrat.size_faktor
     *
     * @param {Object} context 
     * @param {Object} parameter 
     */
    draw(context, parameter) {

        // bring in the parameters
        let brush = new Brush(parameter.quadrat[this.ps_nr].brush);

        if (this.state.colorset.mode !== "use_custom_colors") {
            brush.borderColor = this.state.colorset.borderColor;
            brush.fillColor = this.state.colorset.fillColor;
            // brush.borderColorAlpha = this.borderColorAlpha;
            // brush.fillColorAlpha = this.fillColorAlpha;
        }

        // TODO Manage die custom colors
        // TODO übergebe alpha an colorset farben
        // parameter.quadrat[this.ps_nr].brush.borderColor
        // parameter.quadrat[this.ps_nr].brush.fillColor

        brush.border = brush.border * this.canvas_size.width;

        // Recalculate Format-Changes...
        // the calculation does not take into account a pontential change of brush.scale.
        // It is set to 1.0 in the parameters
        let w = brush.scale.x * this.canvas_size.width;
        let h = brush.scale.y * this.canvas_size.height;
        this.quadrat_size = Format.transform_size(new Size(w, h), this.state.format);

        let x = brush.position.x * this.canvas_size.width;
        let y = brush.position.y * this.canvas_size.height;
        this.quadrat_position = Format.transform_position(new Vector(x, y), this.state.format);

        brush.border = Format.transform(brush.border, this.state.format);

        // TODO hier fehlen noch die Übergabe-Methoden
        brush.angle = parameter.tweakpane["quadrat" + (this.ps_nr + 1) + "_brush_rotate"];

        Shape.draw(context, this.quadrat_position, this.quadrat_size, brush, true);
    }

} // class MyQuadrat

module.exports = My_Quadrat;