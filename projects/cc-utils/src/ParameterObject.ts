/**
 * Title    : ParameterObject
 * Project  : Creative Coding
 * File     : projects/cc-utils/ParameterObject.ts
 * Version  : 1.0.0
 * Published: https://gitlab.com/glimpse-of-life
 *
 * Nützliche Funktionen zum Parameter-Objekt.
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

export class ParameterObject {

  /**
   * Checks whether the parameterSet with the name exists in the object.
   * If not, it is created and the default values are loaded.
   *
   * @static
   * @param {*} parameterObject
   * @param {string} parametersetName
   * @param {*} default_ps
   * @memberof ParameterObject
   */
  public static init(parameterObject: any, parametersetName: string, default_ps: any) {

    if (!(parametersetName in parameterObject)) {
      Object.assign(parameterObject, default_ps);
    }
  }

  public static loadParameter(): any {}

  public static saveParameter(): any {}

  public static stringToObject(): any {}

  public static objectToString(): any {}
}
