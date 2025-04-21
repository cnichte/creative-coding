/**
 * Title    : ObserverPattern
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/ObserverPattern.ts
 * Version  : 1.0.0
 * Published: https://github.com/cnichte/creative-coding/
 *
 * Code Design Pattern: Observer.
 *
 ** The Observer Pattern
 * - class Observer
 * - class ObserverSubject
 *
 * TODO Das Typisieren mit generics <> um von any los zu kommen?
 * https://www.typescriptlang.org/docs/handbook/2/generics.html
 * https://refactoring.guru/design-patterns/observer/typescript/example
 *
 * Observer and Observed_Subject can always be both: Observer and Observed_Subject.
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

 // ObserverPattern.ts
export interface Observer {
  update(
    observerSubject: ObserverSubject,
    observerSubject_ItemNew: any,
    observerSubject_ItemOld?: any
  ): void;
}

/**
 * The Observed Subject.
 * The Observer has to provide an update(source) Method, and a state Object.
 * Example: if (source instanceof ColorSet) { this.state.colorset = source.state; }
 */
export abstract class ObserverSubject {
  protected observers: Observer[];

  /**
   *
   */
  constructor() {
    this.observers = [];
  }

  clear() {
    this.observers = [];
  }

  /**
   *? Spread syntax (...)
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
   *
   * @param {Observer} observer
   */
  addObserver(observer: Observer) {
    this.observers.push(observer);
  }

  /**
   * check and notify...
   *
   * @abstract
   * @param {*} params
   * @memberof ObserverSubject
   */
  abstract check_ObserverSubject(params:any):void;

  /**
   * Remove one or more observers.
   *
   * @param {Array|Object} observers
   * @returns
   */
  removeObservers(observers: Observer[] | Observer) {
    let removed = [];
    if (Array.isArray(observers)) {
      for (var n = 0; n < observers.length; n++) {
        removed.push(this.removeObserver(observers[n]));
      }
    } else {
      removed.push(this.removeObserver(observers));
    }
    return removed;
  }

  /**
   * Remove an observer.
   *
   * @param {Observer} observer
   */
  removeObserver(observer: Observer) {
    let removed = [];
    var removeIndex = this.observers.indexOf(observer);
    /*
        const removeIndex = this.observers.findIndex(obs => {
            if ('equals' in obs && 'equals' in observer) {
                return observer.equals(obs);
            } else {
                return observer === obs;
            }
        });
*/
    if (removeIndex !== -1) {
      removed.push(this.observers.splice(removeIndex, 1));
    }

    return removed;
  }

  /**
   * Andere Variante um einen Observer zu entfernen, ungetestet.
   *
   * @param {Observer} observer
   */
  removeObserver1(observer: Observer) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  /**
   * Notifies all registered Observers, by calling their update method.
   * TODO: source mit übergeben, damit man auf den Auslöser Zugriff hat.
   *
   * @param {ObserverSubject} observerSubject
   * @param {Object} data
   */
  notifyAll(
    observerSubject: ObserverSubject,
    observerSubject_ItemNew: any,
    observerSubject_ItemOld?: any
  ) {
    if (this.observers.length > 0) {
      // https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
      // source.state = Object.assign(source.state, data);
      this.observers.forEach((observer) =>
        observer.update(
          observerSubject,
          observerSubject_ItemNew,
          observerSubject_ItemOld
        )
      );
    }
  }
}
