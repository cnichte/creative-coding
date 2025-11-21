/**
 * Agent: drawable + updatable unit on the canvas.
 * Can optionally act as a composite by hosting child agents.
 */

export interface Agent {
  /**
   * Optional reference into the parameter tree (e.g. "agents[0]").
   */
  parameterPath?: string | string[];

  /**
   * Update internal state based on parameters and delta time.
   */
  update(parameter: any, deltaTime: number): void;

  /**
   * Render to the canvas.
   */
  draw(context: any, parameter: any): void;

  /**
   * Optional collision hook.
   */
  onCollision?(other: Agent): void;

  /**
   * Optional composite hooks.
   */
  addChild?(agent: Agent): void;
  removeChild?(agent: Agent): void;
  getChildren?(): Agent[];
}

/**
 * Minimal composite agent that forwards update/draw to its children.
 */
export class CompositeAgent implements Agent {
  public parameterPath?: string | string[];
  protected children: Agent[] = [];

  constructor(children: Agent[] = [], parameterPath?: string | string[]) {
    this.children = children;
    this.parameterPath = parameterPath;
  }

  addChild(agent: Agent): void {
    this.children.push(agent);
  }

  removeChild(agent: Agent): void {
    const idx = this.children.indexOf(agent);
    if (idx >= 0) {
      this.children.splice(idx, 1);
    }
  }

  getChildren(): Agent[] {
    return this.children;
  }

  update(parameter: any, deltaTime: number): void {
    for (const child of this.children) {
      child.update(parameter, deltaTime);
    }
  }

  draw(context: any, parameter: any): void {
    for (const child of this.children) {
      child.draw(context, parameter);
    }
  }
}
