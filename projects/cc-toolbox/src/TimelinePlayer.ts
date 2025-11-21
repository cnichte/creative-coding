/**
 * TimelinePlayer
 * --------------
 * Small helper to drive the artwork animation clock (timeStamp/deltaTime/duration)
 * with play/pause/loop and scrubbing support.
 *
 * It updates `parameter.artwork.animation` directly; AnimationTimeline picks that up.
 */

import { ParameterManager } from "./ParameterManager";
import {
  TweakpaneManager,
  type TweakpaneContainer,
  type TweakpaneModule,
} from "./TweakpaneManager";

export interface TimelinePlayerState {
  playing: boolean;
  loop: boolean;
  duration: number; // seconds
  position: number; // 0..1
  playbackRate: number; // multiplier
}

export interface TimelinePlayerOptions {
  parameterPath?: string | string[];
}

export interface TimelinePlayerTweakpaneOptions {
  manager: TweakpaneManager;
  container: TweakpaneContainer;
  id?: string;
  title?: string;
}

export class TimelinePlayer {
  private parameter: any;
  private state: TimelinePlayerState;

  constructor(parameter: any, opts: TimelinePlayerOptions = {}) {
    this.parameter = parameter;
    this.state = {
      playing: true,
      loop: true,
      duration: 60,
      position: 0,
      playbackRate: 1,
    };
    TimelinePlayer.ensureParameterSet(parameter, opts.parameterPath);
  }

  public static ensureParameterSet(
    parameter: any,
    path: string | string[] = "artwork.animation"
  ) {
    const pm = ParameterManager.from(parameter);
    return pm.ensure(path, {
      duration: 60,
      timeStamp: 0,
      deltaTime: 0,
    });
  }

  /**
   * Advances the timeline and updates parameter.artwork.animation.
   * @param deltaTimeSeconds delta time in seconds
   */
  public tick(deltaTimeSeconds: number) {
    const animation = this.parameter?.artwork?.animation;
    if (!animation) return;

    const duration = animation.duration ?? this.state.duration ?? 60;
    const rate = this.state.playbackRate ?? 1;

    let delta = deltaTimeSeconds * rate;
    if (!this.state.playing) {
      delta = 0;
    }

    let newTime = (animation.timeStamp ?? 0) + delta;
    if (this.state.loop) {
      newTime = ((newTime % duration) + duration) % duration;
    } else {
      newTime = Math.min(duration, Math.max(0, newTime));
    }

    const clampedDuration = Math.max(0.0001, duration);
    const position = newTime / clampedDuration;

    animation.duration = clampedDuration;
    animation.deltaTime = delta;
    animation.timeStamp = newTime;
    this.state.duration = clampedDuration;
    this.state.position = position;
  }

  /**
   * Scrubs to a normalized position (0..1).
   */
  public setPosition(position: number) {
    const animation = this.parameter?.artwork?.animation;
    if (!animation) return;
    const duration = animation.duration ?? this.state.duration ?? 60;
    const clamped = Math.max(0, Math.min(1, position));
    animation.timeStamp = clamped * duration;
    animation.deltaTime = 0;
    this.state.position = clamped;
  }

  public setPlaying(playing: boolean) {
    this.state.playing = playing;
  }

  public setLoop(loop: boolean) {
    this.state.loop = loop;
  }

  public setPlaybackRate(rate: number) {
    this.state.playbackRate = rate;
  }

  public registerTweakpane(
    options: TimelinePlayerTweakpaneOptions
  ): TweakpaneModule | null {
    const manager = options.manager;
    if (!manager) return null;

    const module = manager.createModule({
      id: options.id ?? "timeline",
      container: options.container,
      stateDefaults: {
        playing: this.state.playing,
        loop: this.state.loop,
        duration: this.state.duration,
        position: this.state.position,
        playbackRate: this.state.playbackRate,
      },
      channelId: undefined,
    });

    module.addBinding(
      "playing",
      { label: options.title ? `${options.title} Play` : "Play" },
      {
        target: "artwork.animation.timeStamp", // dummy target to trigger binding
        transform: (value) => {
          this.setPlaying(!!value);
          return this.parameter?.artwork?.animation?.timeStamp ?? 0;
        },
      }
    );

    module.addBinding(
      "loop",
      { label: "Loop" },
      {
        target: "artwork.animation.duration",
        transform: (value) => {
          this.setLoop(!!value);
          return this.parameter?.artwork?.animation?.duration ?? this.state.duration;
        },
      }
    );

    module.addBinding(
      "duration",
      { label: "Duration (s)", min: 0.1, max: 600, step: 0.1 },
      {
        target: "artwork.animation.duration",
        transform: (value) => {
          const dur = Math.max(0.1, value);
          this.state.duration = dur;
          if (this.parameter?.artwork?.animation) {
            this.parameter.artwork.animation.duration = dur;
          }
          return dur;
        },
      }
    );

    module.addBinding(
      "playbackRate",
      { label: "Speed", min: 0.1, max: 5, step: 0.1 },
      {
        target: "artwork.animation.timeStamp",
        transform: (value) => {
          this.setPlaybackRate(value);
          return this.parameter?.artwork?.animation?.timeStamp ?? 0;
        },
      }
    );

    module.addBinding(
      "position",
      { label: "Scrub", min: 0, max: 1, step: 0.0001 },
      {
        target: "artwork.animation.timeStamp",
        transform: (value) => {
          this.setPosition(value);
          return this.parameter?.artwork?.animation?.timeStamp ?? 0;
        },
      }
    );

    return module;
  }
}
