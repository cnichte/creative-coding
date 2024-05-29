/**
 * Title    : Coordinate
 * Project  : Creative Coding
 * File     : projects/cc-toolbox/Coordinate.ts
 * Version  : 1.0.0
 * Published: https://gitlab.com/glimpse-of-life
 *
 * Stores a Coordinate.
 * This is a 1d Index in the SceneGraph.
 * This is a 2d Row- and Column-Index in the SceneGraph / Grid.
 * This is a 3d Row- and Column-Index and depth-Index in the SceneGraph.
 * TODO: This is not yet cleanly thought out.
 *
 * Synonyme Begriffe:
 * - Länge, Breite, Höhe
 * - y, y, z
 * - row, column, depth
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
export class Coordinate {

    public row:number;
    public col:number;
    public depth:number;

    /**
     * Constructes this thing.
     * Use one, two or three dimensions.
     * The not used are set to zero.
     *
     * @param {number} row 
     * @param {number} col 
     * @param {number} depth 
     */
    constructor(row=0, col=0,depth=0) {
        this.row = row;
        this.col = col;
        this.depth = depth;
    }

    public equals(other: Coordinate):boolean {
      return this.row == other.row && this.col == other.col && this.depth == other.depth;
    };
} // class Coordinate
