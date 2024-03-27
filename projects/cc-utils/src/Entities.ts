/**
 * Title    : Entities
 * Project  : Creative Coding
 * File     : projects/cc-utils/Entities.js
 * Version  : 1.0.0
 * Published: https://gitlab.com/glimpse-of-life
 *
 ** Here we have free floating Entities on the Canvas, which can be connected by a line.
 * 
 * We have two Classes here:
 *
 *  - Manager - Manages the Entities
 *  - Entity - Represents a free floating Entity
 *
 * and the usual support methods:
 * 
 *  - Manager.inject_parameterset_to() - Fills the ParamterSet into the Parameter-Object.
 *  - Manager.provide_tweakpane_to() - Provides a Tweakpane
 *  - Manager.transfer_tweakpane_parameter_to() - Swaps the paramter-Set
 *
 * made with 
 * https://github.com/mattdesl/canvas-sketch
 * https://github.com/mattdesl/canvas-sketch-util
 * 
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

import { Brush, type Brush_ParameterTweakpane } from "./Brush";
import { ColorSet } from "./ColorSet";
import { Format } from "./Format";
import { ObserverSubject, type Observer } from "./ObserverPattern";
import { SceneGraph, type Drawable } from "./SceneGraph";
import { Shape } from "./Shape";
import { Size } from "./Size";
import { TweakpaneSupport, type TweakpaneSupport_Props, type Provide_Tweakpane_To_Props } from "./TweakpaneSupport";
import { Vector } from "./Vector";

import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');


export class Entity_Manager extends ObserverSubject {

  private parameter: any;
  private sceneGraph: SceneGraph;
  private lastCount: number;
  private randomized: any;

  public state: any;

  check_ObserverSubject(params: any): void {
    throw new Error("Method not implemented.");
  } // implements Pattern.Observer

  /**
   * 
   * @param {Object} parameter 
   */
  constructor(parameter: any) {
    super();

    this.parameter = parameter;
    this.sceneGraph = new SceneGraph();

    this.lastCount = -1;

    this.state = {
      entity: {

      },
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


    // deprecated
    this.randomized = {

      canvasColor: "#ffffffff",

      backgroundFillColor: '#ffffffff',
      backgroundBorderColor: '#efefefff',

      entityFillColor: '#ffffffff',
      entityBorderColor: '#2a27ebff',

      entityConnectionFillColor: '#ffffffff',
      entityConnectionBorderColor: '#2a27ebff',
    }
  } // constructor

  animationTimerReset() {
    // TODO this.sceneGraph.animationTimer.reset();
    const d:Drawable| Drawable[] = this.sceneGraph.get(0);
    if(Array.isArray(d)){
      (d as Array<Drawable>).forEach(a_entity => {
        // TODO a_entity.animationTimer.reset();
      });
    }else{
      // TODO (d as Drawable).animationTimer.reset();
    }
  } // animationTimerReset

  /**
   * Is called from the ObserverSubject.
   * 
   * @param {Object} state
   */
  update(source: any) {
    if (source instanceof Format) {
      this.state.format = source.state.format;
      this.notifyAll(source, source.state.format); // informiere alle Entities über die Formatänderung!
    }
    if (source instanceof ColorSet) {
      this.state.colorset = source.state.colorset;
      this.notifyAll(source, source.state.colorset); // informiere alle Entities über die Formatänderung!
    }
  } // update

  /**
   * This is called by the AnimationTimer.
   * This is throttled down, and called for every n-th frame by the AnimationTimer.
   *
   * @param {Class} source 
   */
  animate_slow(source: any) {

    console.log("### Manager animate_slow");

    // TODO: PassThrought all cells

    /*
        let random = ColorSet.get_colors_from_mode(
          this.state.colorset.mode,
          this.state.colorset.groupname,
          this.state.colorset.cs_object,
          parameter.quadrat[this.ps_nr].brush,
          this.state.colorset.variant,
          this.state.colorset.number
        );
    */

    let cs = ColorSet.get_random_colorset(); // #FFFFFF

    if ('background' in cs) {

    } else {

    }

    if ('stroke' in cs) {
      this.randomized.entityBorderColor = cs.stroke;
      this.randomized.entityConnectionBorderColor = cs.stroke;
    } else {


      // this.randomized.entityBorderColor = ColorSet.get_random_color_from_colorset(cs);
      // this.randomized.entityConnectionBorderColor = ColorSet.get_random_color_from_colorset(cs);
    }

    // this.randomized.entityConnectionFillColor = ColorSet.get_random_color_from_colorset(cs);
    // this.randomized.entityFillColor = ColorSet.get_random_color_from_colorset(cs);

  } // animate_slow

  /**
   * The number of entities may have changed.
   * If so, add or remove some entities.
   * This is unthrottled, and called for every frame.
   * 
   * @param {Object} parameter 
   */
  add_or_remove_some(parameter: any) {

    let count = parameter.entity.count;

    if (this.lastCount != count) {
      // the count may have changed: add or remove some entities

      // Add or remove, they should fade out or fade in.
      if (this.sceneGraph.getCount() > count) {

        // remove some
        let diff = this.sceneGraph.getCount() - count;
        for (var i = 0; i < diff; i++) {

          let d:Drawable| Drawable[] = this.sceneGraph.get(0);
          if(Array.isArray(d)){
            let removed = (d as Array<Drawable>).shift();
            if(removed!==undefined){
              let os:Observer = removed as any as Observer;
              super.removeObserver(os);
            }
          }else{
            // (d as Drawable)
          }
        }

      } else if (this.sceneGraph.getCount() < count) {

        // add some
        let diff = count - this.sceneGraph.getCount();
        for (var i = 0; i < diff; i++) {

          const min = this.parameter.tweakpane.entity_sizeRange.min * this.parameter.artwork.canvas.size.width;
          const max = this.parameter.tweakpane.entity_sizeRange.max ** this.parameter.artwork.canvas.size.width;

          const radius = random.range(min, max);
          const x = random.range(0 + radius, this.parameter.artwork.canvas.size.width - radius);
          const y = random.range(0 + radius, this.parameter.artwork.canvas.size.height - radius)

          let entity = new Entity(x, y, radius, this.parameter);
          this.sceneGraph.push(entity);
          super.addObserver(entity); // The Agent listens to the Manager

        }

      }
    }

    this.lastCount = count;

  } // add_or_remove_entities

  /**
   * Move and draw all the entitys and draw the lines.
   *
   * parameter.entity.animation.timer - {time:0.002 ,deltaTime:0.2 ,do_animate:true,global_animation_halt:false, speedFactor:0.01}
   * parameter.entity.count
   * parameter.entity.thegroup
   * 
   * @param {Object} context 
   * @param {Object} parameter 
   */
  draw(context: any, parameter: any) {

    this.add_or_remove_some(parameter);

    let the_distance = this.parameter.artwork.canvas.size.width * parameter.tweakpane.entity_distanceFactor;

    if (typeof this.state.format !== 'undefined')
      the_distance = Format.transform(the_distance, this.state.format);

    // connecting the lines 
    // TODO: 1. Die Linien sollen nicht bis zum Zentrum gehen sondern am Radius enden.
    // TODO: 2. Shapes die sich innerhalb eines anderen befinden sollen keine Linie haben?
    for (let i = 0; i < this.sceneGraph.getCount(); i++) {

      const entity:Entity = this.sceneGraph.get(i) as Entity;

      for (let j = i + 1; j < this.sceneGraph.getCount(); j++) { // j=i+1 -> dont draw twice

        const other:Entity = this.sceneGraph.get(j) as Entity;

        let entity_position = entity.position;
        let other_position = other.position;

        if (typeof this.state.format !== 'undefined') {
          entity_position = Format.transform_position(entity.position, this.state.format);
          other_position = Format.transform_position(other.position, this.state.format);
        }

        // Calculate the LineWith
        let minLineWidth = 1;
        let maxLineWidth = entity.radius;

        if (other.radius < entity.radius) {
          maxLineWidth = other.radius;
        }

        maxLineWidth = (maxLineWidth > 50) ? 50 : maxLineWidth; // but clip to 50

        const distance = entity_position.distance(other_position);

        if (distance < the_distance) {

          context.save();
          context.fillStyle = this.randomized.entityConnectionFillColor;
          context.strokeStyle = this.randomized.entityConnectionBorderColor;
          context.lineWidth = math.mapRange(distance, 0, the_distance, maxLineWidth, minLineWidth);
          context.beginPath();
          context.moveTo(entity_position.x, entity_position.y);
          context.lineTo(other_position.x, other_position.y);
          context.stroke();
          context.restore();
        }
      }
    }

    //* moving all entities
    this.sceneGraph.draw(context, parameter);


  } // draw

  public static tweakpaneSupport: TweakpaneSupport = {
    provide_tweakpane_to: function (parameter: any, props: Provide_Tweakpane_To_Props) {

      // Inject Tweakpane parameters
      parameter.tweakpane = Object.assign(parameter.tweakpane, {

        entity_bounceMode: true,
        entity_count: 40,
        entity_distanceFactor: 0.20,
        entity_nature: 'uniform', // 'individual'
        entity_sizeRange: {
          min: 0.01,
          max: 0.1
        }
      });

      Entity_Manager.tweakpaneSupport.inject_parameterset_to(parameter);

      let brush_defaults: Brush_ParameterTweakpane = {
        brush_shape: "Circle",
        brush_position_x: 0.5, // Die initiale Position des Shapes.
        brush_position_y: 0.5,
        brush_scale: 1.0,
        brush_scale_x: 1.0,
        brush_scale_y: 1.0,
        brush_rotate: 0,
        brush_border: 0.18,
        brush_borderColor: "#efefef7F",
        brush_fillColor: "#efefef7F",
      };

      if (props.folder == null) {
        props.folder = props.pane.addFolder({
          title: 'Entities ',
          // view: 'color',
          // alpha: true
        });
      }

      // TODO folder_name_prefix + "Entity::", pane, folder, parameter_tweakpane, "entity", [], brush_defaults
      let brush_tp_props: Provide_Tweakpane_To_Props = {
        pane: props.pane,
        folder: null,
        folder_name_prefix: props.folder_name_prefix,
        use_separator: false,
        parameterSetName: 'entity',
        excludes: [],
        defaults: brush_defaults,
      };

      props.pane.registerPlugin(EssentialsPlugin); // TODO das muss ggfs in den Root Folder

      let folder = props.pane.addFolder({
        title: '4. Entities::Appearance'
      });

      folder = Brush.tweakpaneSupport.provide_tweakpane_to(parameter, brush_tp_props);

      props.folder.addBlade({
        view: "separator",
      });

      folder.addBinding(parameter.tweakpane, 'entity_nature', {
        label: 'Nature',
        options: {
          individual: 'individual',
          uniform: 'uniform'
        }
      });

      folder.addBinding(parameter.tweakpane, 'entity_sizeRange', {
        label: 'Size',
        min: 0,
        max: 1,
        step: 0.01,
      });

      folder.addBinding(parameter.tweakpane, 'entity_bounceMode', {
        label: 'Bounce',
      });

      folder.addBinding(parameter.tweakpane, 'entity_count', {
        label: 'Anzahl',
        min: 1,
        max: 1500,
        step: 1
      });

      folder.addBinding(parameter.tweakpane, 'entity_distanceFactor', {
        label: 'Connect',
        min: 0.0,
        max: 1,
        step: 0.01
      });

      return folder;

    },
    inject_parameterset_to: function (parameter: any, props?: TweakpaneSupport_Props | undefined): void {
      Object.assign(parameter, {

        entity: {
          bounceMode: parameter.tweakpane.entity_bounceMode,
          count: parameter.tweakpane.entity_count,
          distanceFactor: parameter.tweakpane.entity_distanceFactor,
          nature: parameter.tweakpane.entity_nature,
          sizeRange: parameter.tweakpane.entity_sizeRange,
        }
      });
    },
    transfer_tweakpane_parameter_to: function (parameter: any, props?: TweakpaneSupport_Props | undefined): void {
      parameter.entity.bounceMode = parameter.tweakpane.entity_bounceMode;
      parameter.entity.count = parameter.tweakpane.entity_count;
      parameter.entity.distanceFactor = parameter.tweakpane.entity_distanceFactor;
      parameter.entity.nature = parameter.tweakpane.entity_nature;
      parameter.entity.sizeRange = parameter.tweakpane.entity_sizeRange;

      parameter.entity.brush.shape = parameter.tweakpane.entity_brush_shape;
      parameter.entity.brush.scale = parameter.tweakpane.entity_brush_scale;
      // parameter.tweakpane.entity_brush_scale_x;
      // parameter.tweakpane.entity_brush_scale_y;
      parameter.entity.brush.angle = parameter.tweakpane.entity_brush_rotate;

      // parameter.tweakpane.entity_brush_position_x;
      // parameter.tweakpane.entity_brush_position_y;

      parameter.entity.brush.border = parameter.artwork.canvas.size.width * parameter.tweakpane.entity_brush_border;
      parameter.entity.brush.fillColor = parameter.tweakpane.entity_brush_fillColor;
      parameter.entity.brush.borderColor = parameter.tweakpane.entity_brush_borderColor;
    }
  }


} // class Manager


export class Entity implements Drawable, Observer { // is also an Observer, observes the Manager
  public parameter: any;
  public state: any;
  public position: Vector;
  public velocity: Vector;
  public radius: number;
  public radius_min: number;
  public radius_max: number;
  public bouncemode: boolean;
  public randomized: any;

  constructor(x: number, y: number, radius: number, parameter: any) {

    this.parameter = parameter;

    this.state = {
      entity: {}
    };

    this.position = new Vector(x, y);
    this.velocity = new Vector(random.range(-1, 1), random.range(-1, 1));
    this.radius = radius;

    this.radius_min = -1;
    this.radius_max = -1;

    this.bouncemode = true;

    if (random.range(0, parameter.tweakpane.entity_count) < parameter.tweakpane.entity_count * 0.5) {
      this.bouncemode = false;
    }

    this.randomized = {
      fillColor: '#ffffffff',
      borderColor: '#efefefff'
    }
  } // constructor

  /**
   * The entity bounces off.
   * 
   * @param {Size} canvasSize 
   */
  bounce(canvasSize: Size) {
    if (this.position.x <= (0 + this.radius) || this.position.x >= canvasSize.width - this.radius) this.velocity.x *= -1;
    if (this.position.y <= (0 + this.radius) || this.position.y >= canvasSize.height - this.radius) this.velocity.y *= -1;
  } // bounce

  /**
   * The entity wrapps arround,
   * TODO: Weniger plopp mehr smooth...
   * Dafür muss es eine zeitlang doppelt gezeichnet werden.
   * Das wird über (unter anderem) den Radius bestimmt.... ?
   * 
   * @param {Size} canvasSize 
   */
  wrap(canvasSize: Size) {

    if (this.position.x - this.radius >= canvasSize.width) {

    }

    if (this.position.x >= canvasSize.width) {
      this.position.x = 0;
    } else if (this.position.x <= 0) {
      this.position.x = canvasSize.width;
    }

    if (this.position.y >= canvasSize.height) {
      this.position.y = 0;
    } else if (this.position.y <= 0) {
      this.position.y = canvasSize.height;
    }
  } // wrap

  /**
   * Für den Aufruf der Methode ist der Manager zuständig.
   * 
   * @param {Class} source 
   */
  animate_slow(source: any) {
    if (source instanceof ColorSet) {

    }
  }

  /**
   * Is called from the ObserverSubject.
   *   
   * @param {Object} source 
   */
  update(source: any) {
    if (source instanceof Format) {
      this.state.format = source.state.format;
    }

    if (source instanceof ColorSet) {
      this.state.colorset = source.state.colorset;
    }

    if (source instanceof Entity_Manager) {
      this.state.entity = source.state.entity;
    }
  }

  /**
   * This is the main draw Method, which draws the complete Scene.
   * It is called by the SceneGraph.
   * 
   * @param {Object} context 
   * @param {Object} parameter 
   */
  draw(context: any, parameter: any) {

    let brush = new Brush(parameter.entity.brush);

    // Updates the Particel.
    // move, resize if have changed:
    // parameter.tweakpane.entity_sizeRange.min
    // parameter.tweakpane.entity_sizeRange.max 
    // move the entity 
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Buffer the actual radius-range, and change the radius only id parameters modified
    const min = parameter.tweakpane.entity_sizeRange.min * parameter.artwork.canvas.size.width;
    const max = parameter.tweakpane.entity_sizeRange.max * parameter.artwork.canvas.size.width;

    if (min != this.radius_min || max != this.radius_max) {
      this.radius = random.range(min, max);
      this.radius_min = min;
      this.radius_max = max;
    }


    /*
        let cs = ColorSet.get_random_colorset(); // #FFFFFF

        if ('background' in cs) {
          this.randomized.fillColor = cs.background;
        } else {
          // this.randomized.fillColor = ColorSet.get_random_color_from_colorset(cs);
        }
        if ('stroke' in cs) {
          this.randomized.borderColor = cs.stroke;
        } else {
          // this.randomized.borderColor = ColorSet.get_random_color_from_colorset(cs);;
        }
    */

    let size: Size = new Size(2 * this.radius, 2 * this.radius, this.radius);

    if (typeof this.state.format !== 'undefined') {

      size = Format.transform_size(size, this.state.format);
      let position = Format.transform_position(this.position, this.state.format);
      brush.border = Format.transform(brush.border, this.state.format);
      Shape.draw(context, position, size, brush, true);

    } else {
      Shape.draw(context, this.position, size, brush, true);
    }



    /*
        context.save();
        context.lineWidth = this.radius * brush.border;
        context.fillStyle = this.randomized.fillColor; // brush.fillColor;
        context.strokeStyle = this.randomized.borderColor // brush.borderColor;
        context.translate(this.position.x, this.position.y);
        context.beginPath();
        context.arc(0, 0, this.radius, 0, 2 * Math.PI);
        context.fill();
        if (parameter.tweakpane.entity_border > 0) context.stroke();
        context.restore();
    */

    // I want half of the entities to bounce, and the other half to wrap.
    // This behaviour is defined in the constructor.
    if (parameter.tweakpane.entity_bounceMode && this.bouncemode) {
      this.bounce(parameter.artwork.canvas.size);
    } else {
      this.wrap(parameter.artwork.canvas.size);
    }
  }

} // class entity