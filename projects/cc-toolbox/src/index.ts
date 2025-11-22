// index.ts

//* this is required for yarn Workspace (aka. npm monorepo)

// Animation Support
export { AnimationTimeline } from "./core/AnimationTimeline";
export { AnimationTimeline_Item } from "./core/AnimationTimeline_Item";
export { AnimationTimer, type Animable } from "./core/AnimationTimer";

// Animations
export {
  Breathe,
  type Breathe_Property,
  type Breathe_Values,
} from "./animation/Breathe";
export {
  Move,
  MoveMode,
  type Move_Property,
  type Move_Values,
} from "./animation/Move";
export {
  Rotate,
  RotateMode,
  type Rotate_Property,
  type Rotate_Values,
} from "./animation/Rotate";
export {
  Shake,
  ShakeMode,
  type Shake_Property,
  type Shake_Values,
} from "./animation/Shake";

// and the rest of the API
export { Artwork, 
    type Artwork_ParameterSet,
    type Artwork_ParameterSet_Values,
    type Artwork_Meta,
    type Artwork_Canvas,
    type Artwork_Canvas_HTML,
    type Artwork_Animation,
} from "./core/Artwork";
export { Background } from "./agents/Background";
export { BackgroundShape } from "./agents/BackgroundShape";
export { Brush, 
    type Brush_ParameterTweakpane } from "./agents/Brush";
export { Characters } from "./agents/Characters";
export { ColorSet, 
    type CheckObserverSubject_ColorSet_Parameter } from "./colors/ColorSet";
export { Coordinate } from "./core/Coordinate";
export { Exporter } from "./Exporter";
export { Entity_Manager, Entity } from "./agents/Entities";
export { Format, 
    type Format_ParameterSet,
    type Format_ParameterSet_Values,
    type Check_ObserverSubject_Format_Parameter } from "./core/Format";
export { Grid_Manager } from "./agents/Grid_Manager";
export { ParameterObject } from "./core/ParameterObject";
export { SceneGraph, type Drawable } from "./core/SceneGraph";
export { Shape } from "./core/Shape";
export { Size } from "./core/Size";
export { SketchRunner, 
    type Sketch } from "./core/Sketch";
export { CompositeAgent } from "./core/Agent";
export type { Agent } from "./core/Agent";
export { ParticleManager } from "./agents/Particles";
export { Random } from "./utils/Random";
export { ColorUtils } from "./utils/ColorUtils";
export { Noise } from "./utils/Noise";
export { Mathematics } from "./utils/Mathematics";
export { TimelinePlayer, type TimelineItem } from "./core/TimelinePlayer";
export { TweakpaneSupport, 
    type Provide_Tweakpane_To_Props, 
    type Tweakpane_Items, 
    type TweakpaneSupport_Props } from "./core/TweakpaneSupport";
export { Utils } from "./core/Utils";
export { Vector } from "./core/Vector";
export { Debug } from "./core/Debug";
export {
  ParameterManager,
  type ParameterMappingEntry,
} from "./core/ParameterManager";
export { IOManager, type IOBinding, type IOContext } from "./core/IOManager";
export {
  TweakpaneManager,
  TweakpaneModule,
  type TweakpaneModuleOptions,
  type TweakpaneContainer,
} from "./core/TweakpaneManager";
export {
  type MessageBridge,
  type LibraryComponent,
  type ComponentAddedAck,
  type StudioIncomingMessage,
  isAddComponentMessage,
} from "./core/MessageBridge";
export {
  ComponentRegistry,
  type ComponentFactory,
  type ComponentFactoryResult,
} from "./core/ComponentRegistry";
