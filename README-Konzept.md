# README

## Vorbemerkung

Meine ersten Artworks basierten auf [canvas-sketch](https://github.com/mattdesl/canvas-sketch) - das hat sich aber schnell als zu unstrukturiert und chaotisch heraus gestellt, und nicht passend für das was ich will.

## Das Ziel

- Ablösen meine bisherigen arbeiten von canvas-sketch auf mein eigenes Framework cc-toolbox
- Eigenes Framework für 2D Artworks (Statics und Dynamics)
- Später auch für 3D Objekte?

## Grundlegende Konzepte

Um die Übersicht nicht zu verlieren möchte ich streng typisiert arbeiten mit Schnittstellen, Klassen und Objekten. Damit lässt sich der Code dann hoffentlich auch leichter in andere Programmiersprachen übersetzen.

- Das Artwork

  - ist ein Skript das vom Framework ausgeführt wird?
  - kann geladen und gespeichert werden:
    - als Static - das ist quasi ein Snapshot aus einem dynamic.
    - Als Dynamic - das ist der Normalfall: Eine Animation.
  - Das Framework könnte später einmal einen Editor mit GUI bekommen in dem Module zusammen gesteckt werden, die im Zusammenspiel ein Artwork bilden.

- Alles was auf der 2D-Leinwand gezeichnet werden kann ist ein Agent.
- Agenten können Agenten enthalten - also zB. Listen von Agenten Managen.
- Agenten können miteinander kommunizieren, oder mit anderen Komponenten, wenn sie sich dort jeweils als listener registrieren (oder registriert werden).
- Agenten werden einem Scene-Graph hinzugefügt, der dafür sorgt das alles gezeichnet wird.
  - Brush - ist im Grunde auch ein Agent - Eine Art Basis-Element das gezeichnet werden kann.
  - Brushes werden von Agenten benutzt um etwas auf die Leinwand zu bringen.
- Agenten können einer Timeline hinzugefügt werden, damit sie in einem bestimmten Zeitfenster bestimmte Aktionen ausführen.
  - Das werden meist Animationen sein.
  - Die Eigenschaften eines Agenten können über Parameter verstellt werden
    - das nennt sich Parameter-Set.
    - Viele Parameter-Sets bilden ein Parameter-Objekt.
    - Damit ist ein Artwork vollständig beschrieben.
    - Das Parameter-Objekt sollte man speichern können, und laden - dann sollte das Artwork angezeigt werden.
    - Es gibt nur eine "Source of truth": Das Parameter-Objekt.
- Über eine Tweakpane können Parameter manuell eingestellt werden um das Artwork in Echtzeit zu beeinflussen.
  - Jeder Agent (oder jede Gruppe von Agenten verfügt über ein Tweakpane-Panel)
  - Perspektivisch kann das zb durch Gestensteuerung, oder anderen Input von der Außenwelt ersetzt werden.
  - Save Einstellungen als default! Pro Option, oder/und insgesamt ??

### Z Achse

- Die Bedeutung der z-Achse.
  - Auf der selben Ebene: Agenten kollidieren.
  - Unterschiedliche Ebenen: Agent 1 bewegt sich vor oder hinter Agent 2.

### Vier Elemente

Ich hab vier Elemente mit denen ich arbeite:

Drawable — Dinge die gezeichnet, und schnell animiert werden.
Animable — Dinge die (langsam) animiert werden.
Observable — Dinge die beobachtet werden.
Observer — Dinge, die andere Dinge beobachten.
anders ausgedrückt:

- Einen SceneGraph mit seiner draw() Methode.
- Den langsamen Timer mit seiner animate_slow() Methode.
- Das Observer-Pattern das auf Veränderungen von Eigenschaften in einem Observable-Object reagiert, und alle registrierten Observer-Objekte informiert — was bedeutet deren update() Methode auf zu rufen.
- Was brauche ich sonst noch?
  - Ich brauche eine Effekt-Pipeline… ?

### Verschiedenes

- Animation - Das Modul stellt einen AnimationTimer, eine Animation Timeline sowie Animationen bereit.
- AnimationTimer - Eine Klasse, um langsame Animationen durchzuführen.
- AnimationTimeline - Eine Zeitleiste die zu gegebenen Zeitpunkten Animationen startet und stoppt.
- Animations - Verschiedene einfache Animationen die auf Formen angewendet werden können.

- Playhead (fehlt noch)
  - Play, Stop
  - Record (save, load)
  - Skip: Forwards, Backwards
  - Reverse, Loop, Flipflop?
  - speed?

## Die Komponenten

### Sketch

### Artwork

### Agents

### Special-Agents

### Das Parameter-Objekt

Alle Parameter werden in einem Parameter-Objekt gespeichert.
Im Parameter-Objekt stecken viele ParameterSet-Objekte.
Alle Tweakpane-Parameter werden in das Parameter-Objekt übertragen.
dazu gilt:

- Der Name des ParameterSet-Objekts spiegelt den Namen des Objekts wieder, das damit versorgt wird. Das schafft hoffentlich Übersicht.
- Das Parameter-Objekt wird immer komplett übergeben, und jedes Objekt nimmt sich daraus das, was es braucht.
- Das Parameter-Objekt hat die Form:

```js
let parameter = {
    parameterSet_1:{
        eigenschaft_1a:"wert A"
    },
    parameterSet_2:{
        eigenschaft_2a:"wert B"
    },
    format: {paper: "a4", paper_dpi: 300, page_orientation: "Portrait", aspect_ratio: 1, keep_aspect_ratio: true, …}
    tweakpane:{
      artwork_canvas_height: 1000
      artwork_canvas_width: 1000
      artwork_clearscreen: true
      artwork_scale: 1
      background_color: "#efefefFF"
      colorset_animation_timer_doAnimate: true
      colorset_animation_timer_slowDownFactor: 200
      colorset_groupname: "cako"
      colorset_mode: "animate_from_all"
      colorset_number: -1
      colorset_setname: "cako.02-sub02, 0"
      colorset_variante: -1
      exporter_filename: "artwork-"
      format_aspect_ratio: 1
      format_fencing: true
      format_height: 2000
      format_keep_aspect_ratio: true
      format_page_orientation: "Portrait"
      format_paper: "a4"
      format_paper_dpi: 300
      format_width: 2000
    }
}
```

tweakpane unterstützt nur eine flache struktur, die in das jeweilige paramterset gemappt werden muss.

`format_paper` muss in `{format:{ paper:""}}` landen.

Ich arbeite mit beliebig vielen prefixen um auch tiefer verschachtelte Properties zu abbilden zu können.

`<prefix>_format_paper` muss in `{<prefix>:{format:{ paper:""}}}` landen.

### Tweakpane und Datentransport

- Tweakpane unterstützt nur eine flache Struktur, mein Value-Objekte ist aber verschachtelt.
  - jeder Agent und jedes andere Objekt hat sein eigenes Parameterset.
  - die Daten müssen also gemappt werden.
  - Dazu arbeite ich mit prefixen
  - Hinzu kommt das die Tweakpane Parameter an tieferen Stellen in mein value-object eingehängt werden müssen.
  - Gibt es für den tweakpaneSupport einen besseren / generischerenn Ansatz?
- Die Tweakpane soll austauschbar sein - oder kann im grunde auch entfallen.
  - Sie könnte auch dazu dienen geeignete Startparameter für das Artwork heraus zu finden.
  - Es geht im grunde darum veränderliche parameter in das Artwork ein zu schleusen, und an die richtigen stellen im artwork zu bringen.
  - Das können im Endeffekt auch Sensor-Werte aus der aussenwelt sein

### IO-Manager

Zentrale Schnittstelle zur Verbindung von Echtzeit-Eingaben (zB. Tweakpane, Sensoren) mit Parametersätzen oder beliebigen Handlern. Quellen registrieren sich selbst als Kanäle, und Bindungen beschreiben, wie ihre Werte weitergeleitet werden sollen.

### Tweakpane-Manager

Leichte Abstraktion, die den Status der Tweakpane mit dem Parameterobjekt synchronisiert und die Steuerelemente mit dem IO-Manager verbindet. Das Ziel ist: Module beschreiben nur ihre Benutzeroberfläche und Zuordnungen; der Manager kümmert sich um Standardeinstellungen, Container und Kanalverdrahtung.

### Scene-Graph

### Timeline
