# README

## Vorbemerkung

Meine ersten Artworks basierten auf [canvas-sketch](https://github.com/mattdesl/canvas-sketch) - das hat sich aber schnell als zu unstrukturiert und chaotisch heraus gestellt, und nicht passend für daswas ich will.

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
- Agenten können miteinander kommunizieren, oder mit anderen Komponenten, wenn sie sich dort jeweils als listener registrieren (oder registriert werden).
- Agenten werden einem Scene-Graph hinzugefügt, der dafür sorgt das alles gezeichnet wird.
  - Brush - ist im Grunde auch ein Agent - Eine Art Basis-Element das gezeichnet werden kann.
- Agenten können einer Timeline hinzugefügt werden, damit sie in einem bestimmten Zeitfenster bestimmte Aktionen ausführen.
  - Das werden meist Animationen sein.
  - Die Eigenschaften eines Agenten können über Parameter verstellt werden
    - das nennt sich Parameter-Set.
    - Viele Parameter-Sets bilden ein Parameter-Objekt.
    - Damit ist ein Artwork vollständig beschrieben.
    - Das Parameter-Objekt sollte man speichern können, und laden - dann sollte das Artwork angezeigt werden.
    - Es gibt nur eine Source of truth - das Parameter-Objekt .
- Über eine Tweakpane können Parameter manuell eingestellt werden um das Artwork in Echtzeit zu beeinflussen.
  - Jeder Agent (oder jede Gruppe von Agenten verfügt über ein Tweakpane-Panel)
  - Perspektivisch kann das zb durch Gestensteuerung, oder anderen Input von der Außenwelt ersetzt werden.
  - Save als default - !!! (Pro Option, oder/und insgesamt)

### Z Achse

- Die Bedeutung der z-Achse.
  - Auf der selben Ebene: Agenten kollidieren.
  - Unterschiedliche Ebenen: Agent 1 bewegt sich vor oder hinter Agent 2.

### Das Parameter-Objekt

Alle Parameter werden in einem Parameter-Objekt gespeichert.
Im Parameter-Objekt stecken viele ParameterSet-Objekte.
Alle Tweakpane-Parameter in das Parameter-Objekt übertragen.
dazu gilt:

Der Name des ParameterSet-Objekts spiegelt den Namen des Objekts wieder, das damit versorgt wird. Das schafft hoffentlich Übersicht.
Das Parameter-Objekt wird immer komplett übergeben, und jedes Objekt nimmt sich daraus das, was es braucht.
Das Parameter-Objekt hat die Form:

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
  - jeder Agent und jedes ander Objekt hat sein eigenes Parameterset.
  - die Daten müssen also gemappt werden.
  - Dazu arbeite ich mit prefixen
  - Hinzu kommt das die Tweakpane Parameter an tieferen Stellen in mein value-object eingehängt werden müssen.
  - Gibt es für den tweakpaneSupport einen besseren / generischerenn Ansatz?
- Die Tweakpane soll austauschbar sein - oder kann im grunde auch entfallen.
  - Sie könnte auch dazu dienen geeignete Startparameter für das Artwork heraus zu finden.
  - Es geht im grunde darum veränderliche parameter in das Artwork ein zu schleusen, und an die richtigen stellen im artwork zu bringen.
  - Das können im Endeffekt auch Sensor-Werte aus der aussenwelt sein

## Verschiedenes

- Playhead
  - Play, Stop
  - Record (save, load)
  - Skip: Forwards, Backwards
  - Reverse, Loop, Flipflop?
  - speed?

## Ideen für später

- Ein Passepartout in 3d Optik
- Fotografien unterlegen (später auch via Projektion Mapping überlagern)
- 2d in den 3d Raum bringen (für Projektion Mapping)
