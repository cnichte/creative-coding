// index.ts

//* this is required for yarn Workspace (aka. npm monorepo)

// Animation Support
export { AnimationTimeline } from "./AnimationTimeline";
export { AnimationTimeline_Item } from "./AnimationTimeline_Item";
export { AnimationTimer, type Animable } from "./AnimationTimer";

// Animations
export { Breathe, type Breathe_Property, type Breathe_Values } from './animation/Breathe';

// and the rest of the API
export { Artwork, 
    type Artwork_ParameterSet,
    type Artwork_ParameterSet_Values,
    type Artwork_Meta,
    type Artwork_Canvas,
    type Artwork_Canvas_HTML,
    type Artwork_Animation,
} from "./Artwork";
export { Background } from "./Background";
export { BackgroundShape } from "./BackgroundShape";
export { Brush, 
    type Brush_ParameterTweakpane } from "./Brush";
export { Characters } from "./Characters";
export { ColorSet, 
    type CheckObserverSubject_ColorSet_Parameter } from "./ColorSet";
export { Coordinate } from "./Coordinate";
export { Exporter } from "./Exporter";
export { Entity_Manager, Entity } from "./Entities";
export { Format, 
    type Format_ParameterSet,
    type Format_ParameterSet_Values,
    type Check_ObserverSubject_Format_Parameter } from "./Format";
export { Grid_Manager } from "./Grid_Manager";
export { Mathematics } from "./Mathematics";
export { ObserverSubject, type Observer } from "./ObserverPattern";
export { ParameterObject } from "./ParameterObject";
export { SceneGraph, type Drawable } from "./SceneGraph";
export { Shape } from "./Shape";
export { Size } from "./Size";
export { SketchRunner, 
    type Sketch } from "./Sketch";
export { TweakpaneSupport, 
    type Provide_Tweakpane_To_Props, 
    type Tweakpane_Items, 
    type TweakpaneSupport_Props } from "./TweakpaneSupport";
export { Utils } from "./Utils";
export { Vector } from "./Vector";