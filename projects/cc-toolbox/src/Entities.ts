/**
 * Title    : Entities
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/Entities.js
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
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

 // Entities.ts
import { Brush, type Brush_ParameterTweakpane, type BrushTweakpaneOptions } from "./Brush";
import { ColorSet, type ColorSet_ParameterSet } from "./ColorSet";
import { Format } from "./Format";
import { SceneGraph, type Drawable } from "./SceneGraph";
import { Shape } from "./Shape";
import { Size } from "./Size";
import { Vector } from "./Vector";
import type { TweakpaneModule } from "./TweakpaneManager";

interface EntityTweakpaneOptions {
  manager: TweakpaneManager;
  container: TweakpaneContainer;
  id?: string;
  statePath?: string | string[];
}
import { ParameterManager } from "./ParameterManager";
import {
  TweakpaneManager,
  type TweakpaneContainer,
} from "./TweakpaneManager";
import { IOManager } from "./IOManager";
import { Random } from "./Random";
import { Mathematics } from "./Mathematics";

export class Entity_Manager {
  private parameter: any;
  private sceneGraph: SceneGraph;
  private lastCount: number;
  private randomized: any;

  private get_entity_count(): number {
    const colsCount = this.sceneGraph.getColsCount(0);
    if (typeof colsCount === "number") {
      return colsCount;
    }
    return 0;
  }

  /**
   *
   * @param {Object} parameter
   */
  constructor(parameter: any) {
    this.parameter = parameter;
    Entity_Manager.ensureParameterSet(this.parameter);
    this.sceneGraph = new SceneGraph();

    this.lastCount = -1;

    this.randomized = {
      canvasColor: "#ffffffff",
      backgroundFillColor: "#ffffffff",
      backgroundBorderColor: "#efefefff",
      entityFillColor: "#ffffffff",
      entityBorderColor: "#2a27ebff",
      entityConnectionFillColor: "#ffffffff",
      entityConnectionBorderColor: "#2a27ebff",
    };
  } // constructor

  public static ensureParameterSet(parameter: any) {
    const manager = ParameterManager.from(parameter);
    const defaults = {
      bounceMode: true,
      count: 40,
      distanceFactor: 0.0,
      nature: "uniform",
      sizeRange: {
        min: 0.01,
        max: 0.1,
      },
      brush: new Brush(),
    };

    return manager.ensure("entity", defaults);
  }

  animationTimerReset() {
    // TODO this.sceneGraph.animationTimer.reset();
    const d: Drawable | Drawable[] = this.sceneGraph.get(0);
    if (Array.isArray(d)) {
      (d as Array<Drawable>).forEach((a_entity) => {
        // TODO a_entity.animationTimer.reset();
      });
    } else {
      // TODO (d as Drawable).animationTimer.reset();
    }
  } // animationTimerReset

  /**
   * This is called by the AnimationTimer.
   * This is throttled down, and called for every n-th frame by the AnimationTimer.
   *
   * @param {Class} source
   */
  animate_slow(source: any) {
    let cs = ColorSet.get_random_colorset(); // #FFFFFF

    if ("background" in cs) {
    } else {
    }

    if ("stroke" in cs) {
      this.randomized.entityBorderColor = cs.stroke;
      this.randomized.entityConnectionBorderColor = cs.stroke;
    } else {
      this.randomized.entityBorderColor = ColorSet.get_color_from_colorset(cs);
      this.randomized.entityConnectionBorderColor =
        ColorSet.get_color_from_colorset(cs);
    }

    this.randomized.entityConnectionFillColor =
      ColorSet.get_color_from_colorset(cs);
    this.randomized.entityFillColor = ColorSet.get_color_from_colorset(cs);
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
    const entitiesInScene = this.get_entity_count();

    if (this.lastCount != count) {
      // the count may have changed: add or remove some entities

      // Add or remove, they should fade out or fade in.
      if (entitiesInScene > count) {
        // remove some
        let diff = entitiesInScene - count;
        for (var i = 0; i < diff; i++) {
          let d: Drawable | Drawable[] = this.sceneGraph.get(0);
          if (Array.isArray(d)) {
            (d as Array<Drawable>).shift();
          } else {
            // (d as Drawable)
          }
        }
      } else if (entitiesInScene < count) {
        // add some
        let diff = count - entitiesInScene;
        for (var i = 0; i < diff; i++) {
          const min =
            this.parameter.entity.sizeRange.min *
            this.parameter.artwork.canvas.size.width;
          const max =
            this.parameter.entity.sizeRange.max **
            this.parameter.artwork.canvas.size.width;

        const radius = Random.range(min, max);
        const x = Random.range(
            0 + radius,
            this.parameter.artwork.canvas.size.width - radius
          );
        const y = Random.range(
            0 + radius,
            this.parameter.artwork.canvas.size.height - radius
          );

        let entity = new Entity(x, y, radius, this.parameter);
        this.sceneGraph.push(entity);
      }
    }
    }

    this.lastCount = count;
  } // add_or_remove_entities

  public static registerTweakpane(
    parameter: any,
    options: EntityTweakpaneOptions
  ): TweakpaneModule | null {
    if (!options.manager) return null;

    const entity = Entity_Manager.ensureParameterSet(parameter);

    const module = options.manager.createModule({
      id: options.id ?? "entity",
      container: options.container,
      statePath: options.statePath ?? ["entity"],
      stateDefaults: {
        nature: entity.nature,
        sizeRange: entity.sizeRange,
        bounceMode: entity.bounceMode,
        count: entity.count,
        distanceFactor: entity.distanceFactor,
      },
      parameterPath: "entity",
      parameterDefaults: entity,
      // use a dedicated channel so mappings read from the module state
      channelId: undefined,
    });

    module.addBinding(
      "nature",
      {
        label: "Nature",
        options: {
          individual: "individual",
          uniform: "uniform",
        },
      },
      { target: "entity.nature" }
    );

    module.addBinding(
      "sizeRange",
      {
        label: "Size",
        min: 0,
        max: 1,
        step: 0.01,
      },
      { target: "entity.sizeRange" }
    );

    module.addBinding(
      "bounceMode",
      {
        label: "Bounce",
      },
      { target: "entity.bounceMode" }
    );

    module.addBinding(
      "count",
      {
        label: "Anzahl",
        min: 1,
        max: 1500,
        step: 1,
      },
      { target: "entity.count" }
    );

    module.addBinding(
      "distanceFactor",
      {
        label: "Connect",
        min: 0.0,
        max: 1,
        step: 0.01,
      },
      { target: "entity.distanceFactor" }
    );

    Brush.registerTweakpane(parameter, {
      manager: options.manager,
      container: options.container,
      parameterPath: ["entity"],
      statePath: ["entity", "brush"],
      id: `${options.id ?? "entity"}:brush`,
      defaults: {
        brush_shape: "Circle",
        brush_position_x: 0.5,
        brush_position_y: 0.5,
        brush_scale: 1.0,
        brush_scale_x: 1.0,
        brush_scale_y: 1.0,
        brush_rotate: 0,
        brush_border: 0.18,
        brush_borderColor: "#efefef7F",
        brush_fillColor: "#efefef7F",
      },
    });

    return module;
  }

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

    let the_distance =
      this.parameter.artwork.canvas.size.width * parameter.entity.distanceFactor;

    if (parameter.format)
      the_distance = Format.transform(the_distance, parameter.format);

    // connecting the lines
    // TODO: 1. Die Linien sollen nicht bis zum Zentrum gehen sondern am Radius enden.
    // TODO: 2. Shapes die sich innerhalb eines anderen befinden sollen keine Linie haben?
    const entityCount = this.get_entity_count();
    for (let i = 0; i < entityCount; i++) {
      const entity: Entity = this.sceneGraph.get(0, i) as Entity;

      for (let j = i + 1; j < entityCount; j++) {
        // j=i+1 -> dont draw twice

        const other: Entity = this.sceneGraph.get(0, j) as Entity;

        let entity_position = entity.position;
        let other_position = other.position;

        if (parameter.format) {
          entity_position = Format.transform_position(
            entity.position,
            parameter.format
          );
          other_position = Format.transform_position(
            other.position,
            parameter.format
          );
        }

        // Calculate the LineWith
        let minLineWidth = 1;
        let maxLineWidth = entity.radius;

        if (other.radius < entity.radius) {
          maxLineWidth = other.radius;
        }

        maxLineWidth = maxLineWidth > 50 ? 50 : maxLineWidth; // but clip to 50

        const distance = entity_position.distance(other_position);

        if (distance < the_distance) {
          context.save();
          context.fillStyle = this.randomized.entityConnectionFillColor;
          context.strokeStyle = this.randomized.entityConnectionBorderColor;
          context.lineWidth = Mathematics.map_range(
            distance,
            0,
            the_distance,
            maxLineWidth,
            minLineWidth
          );
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

} // class Manager

export class Entity implements Drawable {
  public parameter: any;
  public position: Vector;
  public velocity: Vector;
  public radius: number;
  public radius_min: number;
  public radius_max: number;
  public bouncemode: boolean;
  public randomized: any;

  constructor(x: number, y: number, radius: number, parameter: any) {
    this.parameter = parameter;

    this.position = new Vector(x, y);
    this.velocity = new Vector(Random.range(-1, 1), Random.range(-1, 1));
    this.radius = radius;

    this.radius_min = -1;
    this.radius_max = -1;

    this.bouncemode = true;

    if (
      Random.range(0, parameter.entity.count) <
      parameter.entity.count * 0.5
    ) {
      this.bouncemode = false;
    }

    this.randomized = {
      fillColor: "#ffffffff",
      borderColor: "#efefefff",
    };
  } // constructor

  /**
   * The entity bounces off.
   *
   * @param {Size} canvasSize
   */
  bounce(canvasSize: Size) {
    if (
      this.position.x <= 0 + this.radius ||
      this.position.x >= canvasSize.width - this.radius
    )
      this.velocity.x *= -1;
    if (
      this.position.y <= 0 + this.radius ||
      this.position.y >= canvasSize.height - this.radius
    )
      this.velocity.y *= -1;
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
    const min =
      parameter.entity.sizeRange.min * parameter.artwork.canvas.size.width;
    const max =
      parameter.entity.sizeRange.max * parameter.artwork.canvas.size.width;

    if (min != this.radius_min || max != this.radius_max) {
      this.radius = Random.range(min, max);
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

    if (parameter.format) {
      size = Format.transform_size(size, parameter.format);
      let position = Format.transform_position(
        this.position,
        parameter.format
      );
      brush.border = Format.transform(brush.border, parameter.format);
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
    if (parameter.entity.bounceMode && this.bouncemode) {
      this.bounce(parameter.artwork.canvas.size);
    } else {
      this.wrap(parameter.artwork.canvas.size);
    }
  }
} // class entity
