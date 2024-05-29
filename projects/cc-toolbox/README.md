# cc-utils

* Project : Creative Coding
* Title : cc-toolbox
* Date : 2022
* Published: https://gitlab.com/glimpse-of-life

---

* Author : Carsten Nichte
* Web : https://carsten-nichte.de/ 

---

## Description

Some Common Classes / Objects i use in my Creative Code Projects, are packed in the following Modules:

* Artwork - Die Hauptklasse.
    * Exporter              -
    * Format                - Provides Screen- & Paper-Formats.
    * ParameterObject       - Handles all the Parameter stuff (ua. for Tweakpane) like import and export, zipping, etc ??? EXPORTER
    * SceneGraph - All the Agents to draw are arganized in a SceneGraph.

### Animation

* AnimationTimer    - A Timer to throttle down an animation
* AnimationTimeline - Execute animations in specific time windows.
* Animations        - Some basic Animations.

### Things to paint with 

* Brush          - A thing to paint with. 
    * Shape      - A collectoin of basic Shapes to draw. 
    * Characters -
* ColorSet       - to color something from a collection of colors.

### Supporting Classes

* Coordinate - bundles col and row Property in one Class for comfort.
* Size       - A size class to bundle with and height in a single Object for comfort.
* Vector     - Supports some 2d and 3d Vector Operations.

### Design-Patterns

* ObserverPattern

### Predefined reusable Agents:

* Background      - Supports colored Background.
* BackgroundShape - Supports a centered Background Shape.
* Entities
* Grid            - A Grid... it is what it is: A collection of mini canvases.


## Makes use of...

* canvas-sketch-utils

## Usage

For reference take a look in the projects.

## Licence

* Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
* https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode
* https://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1

### Licence in short

* Do not sell the code, or creative stuff made with this code.
* You are allowed to make someone happy, and give away the works you have created with it for free.
* Learn, code, create, and have fun.
