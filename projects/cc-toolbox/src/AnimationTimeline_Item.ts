/**
 * Title    : Animation Timeline
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/AnimationTimeline_Item.ts
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
 *
 ** The Baseclass for all Animations is spending lifecycle/timeline Support.
 *
 * At the moment the module supports only one time period per animation.
 * TODO: Multiple - not overlapping - time periods per animation.
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
 * @export
 * @abstract
 * @class AnimationTimeline_Item
 * @author Carsten Nichte - 2022
 */

//* AnimationTimeline_Item.ts
export abstract class AnimationTimeline_Item {
  protected startTime: number;
  protected endTime: number;

  /**
   * The Baseclass for all Animations, is spending lifecycle/timeline Support.
   */
  constructor() {
    this.startTime = 0; // 0-1 (0 to 100%)
    this.endTime = 1; // 0-1
  }

  /**
   * Prüft ob der typ vorhanden ist und führt die Animation aus.
   * 
   * @param parameter
   * @param animations
   */
  public abstract check_type_and_run(parameter: any, animations: any): void; // implementiert zB Breathe

  /**
   * Call this method to check the parameters and 'perform the animation' resp.
   * 'Calculate new/next values for a fast animation' in its timeslot.
   *
   * @param {Object} parameter - Object = {settings:{duration:60},artwork:{animation:{time:10.123, deltaTime:0.001, do_animate:true, global_animation_halt:false}}}
   * @param {Object} animation - The Animation Parameters.
   */
  public perform_animate_fast_if_in_timeslot(
    parameter: any,
    animation: { timeline: { startTime: any; endTime: any } }
  ): void {
    const animationState = parameter?.artwork?.animation ?? {};
    let time = animationState.timeStamp ?? 0; // in seconds
    let deltatime = animationState.deltaTime ?? 0; // in seconds

    let total_duration = animationState.duration ?? 60;

    if (
      animation.timeline == null ||
      typeof animation.timeline !== "object" ||
      !("startTime" in animation.timeline) ||
      !("endTime" in animation.timeline)
    ) {
      animation.timeline = {
        startTime: 0,
        endTime: 1,
      };
    }

    this.startTime = animation.timeline.startTime; // 0-1 (0 to 100%)
    this.endTime = animation.timeline.endTime; // 0-1 (0 to 100%)

    // animate only in the time-slot...
    if (
      this.endTime * total_duration > time &&
      time > this.startTime * total_duration
    ) {
      // Calculate new/next values for a fast animation.
      this.animate_fast(animation);
    }
  }

  protected abstract animate_fast(animation: any): number;
} // class AnimationTimeline_Item
