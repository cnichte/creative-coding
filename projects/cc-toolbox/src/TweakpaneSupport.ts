/**
 * Title    : TweakpaneSupport
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/TweakpaneSupport.ts
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
 *
 ** Supports Tweakpane, and Parameter-Transport & Mapping for all Modules.
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
 * @author Carsten Nichte - 2022
 */


 //* TweakpaneSupport.ts
import { Pane } from "tweakpane";
import { TabApi } from "tweakpane";
import { FolderApi } from "tweakpane";

/**
 * Die Parameter für die Methode provide_tweakpane_to, als Objekt.
 *
 * TODO: Kann man das noch eleganer lösen?
 * ? Siehe: react ?
 * https://blog.battlefy.com/parameter-objects-are-annoying-with-typescript
 * https://fjolt.com/article/typescript-parameters-utility-type
 *
 * TODO: Eine exclude list falls ich einige Optionen nicht benutzen möchte?
 * zB. exclude = ["brush_position_x", "brush_position_x"]
 *
 * @interface Provide_Tweakpane_To_Props
 */

export interface Tweakpane_Items {
  pane: Pane;
  folder: any;
  tab: any;
}
export interface Provide_Tweakpane_To_Props {
  items: Tweakpane_Items;
  folder_name_prefix: string;
  use_separator: boolean;
  parameterSetName: string;
  excludes?: any[]; // optional
  defaults?: any; // optional
}

/**
 * * Der parameterSetName wird auch für den Tweakpane Parameter-Prefix verwendet.
 * * -  ParameterSetName          : parameter.colorset
 * * -  Tweakpane Parameter-Prefix: colorset_tweakpane_property
 *
 * TODO: Das könnte ja entweder das objekt oder der name eines Parametersets sein. 
 * 
 * @export
 * @interface TweakpaneSupport_Props
 */
export interface TweakpaneSupport_Props {
  parameterSet?: any;
  parameterSetName?: string;
}

/**
 * I have three methods to support tweakpane and handling with data objects.
 *
 * The methods are supposed to be static,
 * but unfortunately this is not implemented in Typescript.
 * https://stackoverflow.com/questions/13955157/how-to-define-static-property-in-typescript-interface
 *
 * @export
 * @interface TweakpaneSupportType
 */
interface TweakpaneSupportType {
  /* Step 2 - init parameterSet with TP Parameters */
  inject_parameterset_to(parameter: any, props: TweakpaneSupport_Props): void;

  /* Step 3 - transfert */
  transfer_tweakpane_parameter_to(
    parameter: any,
    props: TweakpaneSupport_Props
  ): void;

  /* Step 1. initialize TP */
  provide_tweakpane_to(parameter: any, props: Provide_Tweakpane_To_Props): Tweakpane_Items;
}

/**
 * This Blueprint should be used in all Modules, that want support a Tweakpane.
 *
 * The class can be used in a static Context - (so i do)
 *
 * @export
 * @abstract
 * @class TweakpaneSupport
 * @implements {TweakpaneSupportType}
 */
export abstract class TweakpaneSupport implements TweakpaneSupportType {

  /**
   * Provides a Tweakpane for a Module.
   *
   * ?Adds the Modules Parameters to the Tweakpane Parameter-Object?
   *
   * @abstract
   * @param {*} parameter - The parameter object
   * @param {Provide_Tweakpane_To_Props} props
   * @return {*}  {*}
   * @memberof TweakpaneSupport
   */
    abstract provide_tweakpane_to(
      parameter: any,
      props: Provide_Tweakpane_To_Props
    ): any;

  /**
   * Provides the Modules ParameterSet to the Parameter-Object.
   * 
   * Is usually inialized from Tweakpane-Parameters parameter.tweakpane
   * So it should be initilaized before.
   * 
   * In practice, this method is called in provide_tweakpane_to
   * directly after the initialization of the tweakpane.
   *
   * @abstract
   * @param {*} parameter
   * @param {TweakpaneSupport_Props} props
   * @memberof TweakpaneSupport
   */
  abstract inject_parameterset_to(
    parameter: any,
    props?: TweakpaneSupport_Props
  ): void;


  /**
   * Transfers tweakpane parameters to the ParameterSet.
   *
   * @abstract
   * @param {*} parameter
   * @param {TweakpaneSupport_Props} [props]
   * @memberof TweakpaneSupport
   */
  abstract transfer_tweakpane_parameter_to(
    parameter: any,
    props?: TweakpaneSupport_Props
  ): void;



  /**
   * Helper Method, to create a prefix.
   * 
   * The prefix is formed from the name of the parameter set.
   * 
   * 'prefix' becomes 'prefix_', or ''
   * 
   * @static
   * @param {(string | undefined)} parametersetName
   * @return {*}  {string}
   * @memberof TweakpaneSupport
   */
  public static create_tp_prefix(parametersetName: string | undefined): string {
    if(parametersetName!= null){
      if (parametersetName.endsWith("_")) return parametersetName;
      return parametersetName !== "" ? parametersetName + "_" : parametersetName;
    }else {
      return "";
    }
  }
}
