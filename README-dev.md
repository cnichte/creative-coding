# Readme Development

## Konzepte

- Ein (Static) Artwork entsteht in dem ich ein Parameter Objekt übergebe welches das Artwork initialisiert und aufbaut.
- Die Tweakpane kann man im finalen Artwork komplett weglassen / deaktivieren, wenn man mag. Dafür muss ein globaler Schalter her.
- Daraus folgt auch: Agenten sollten sich immer aus dem Parameter-Set bedienen, und nicht aus der Tweakpane. Um die Daten vorher aus der TP in das PS zu transportieren ist der swap da.

Ziele kurz gesagt:

- Ein Artwork aus dem paramter-objekt rekonstruieren.
- Bein Animationen will ich Vor- und Zurückspulen und anhalten können.
- Das bedeutet das ich im paramter-objekt auch Werte über die Zeit speichern muss.

Die Frage ist ob der momentan weg über `tweakpaneSupport` mit dem swappen der werte elegant und performant ist, oder ob es da bessere Konzepte gibt.

- Auf die neue Logik umgebaute Projekte:
  - umgebaut
    - 001-bit
    - 002-shape
  - teilweise
    - 003-grid - teilweise
    - 004-entities - teilweise
      - scharze quadrate bewegen sich
      - aber keine änderung über Tweakpane möglich
  - noch nicht
    - 005-punktstunde (noch nicht umgebaut?)
    - 006-particles
    - 007-quadrate
    - 008-duette

---

Das Verhalten der Tweakpane-items: pane, folder, tab.

- folder==null -> legt folder in der pane an und packt alles rein.
- folder!=null -> legt alles in den übergebenen folder.
  - Der übergebene Folder kann auch ein tab.pane[x] sein
  - Bei bedarf kann ein Separator eingefügt werden.
- Zurück gegeben wird am besten der zuletzt verwendete/erzeugte Folder/Tab

### Setup a minimalistic Dev Enviroment with JARN 2 and Webpack 5

```bash
Post-resolution validation
➤ YN0002: │ @carstennichte/creative-coding@workspace:. doesn't provide html-webpack-plugin (p84341), requested by html-inline-script-webpack-plugin.
➤ YN0086: │ Some peer dependencies are incorrectly met; run yarn explain peer-requirements <hash> for details, where <hash> is the six-letter p-prefixed code.
```

- <https://github.com/icelam/html-inline-script-webpack-plugin/issues/493>
- <https://www.npmjs.com/package/html-inline-script-webpack-plugin>
- npm install --save-dev html-inline-script-webpack-plugin
- npm i html-inline-script-webpack-plugin
- yarn add html-inline-script-webpack-plugin   <---- so gings

---

- Hier läuft ein YARN-Workspace (bzw. Monorepo nach npm nomenklatur),
- Typescript and Webpack.
- <https://yarnpkg.com/features/workspaces>

#### Projekt archivieren mit ZIP

Das Projekt flott in ein zip archiv verpacken (ohne das Projektverzeichnis selber, und node_modules, und das Ziparchiv selber natürlich.)

```bash
zip -r creativeCoding-Backup-$(date +"%Y-%m-%d").zip . -x '*node_modules*' '*.yarn*' '*.git*' '*.vscode*' '*.zip'
```

#### Projekt zur Hugo-Webseite transportieren

Dazu hab ich das Skript `copy.sh` geschrieben das die datei kopiert und umbenennt:

```bash
# im jeweiligen Projekt-Folder
yarn run build

# im root folder
bash copy.sh 001-bit
bash copy.sh 002-shape
bash copy.sh 003-grid
bash copy.sh 004-entities

bash copy.sh 005-punktstunde
bash copy.sh 006-particles
bash copy.sh 007-quadrate

bash copy.sh 008-duette
```

Kopiert `projects/001-pixel/dist/production/index.bundle.js`

nach `/Users/cnichte/develop-software/01-active/carsten-nichte.de - static website/assets/js/cc-code/001-pixel.js`

### YARN 2

- <https://yarnpkg.com/getting-started/install>
- Viele Infos: <https://medium.com/swlh/getting-started-with-yarn-2-and-typescript-43321a3acdee>

#### Install YARN 2

```bash
corepack enable
yarn init -2
```

#### Update YARN 2

```bash
yarn set version berry
yarn install
```

- <https://yarnpkg.com/cli>

einfach `yarn` eintippen. Man wird darauf hingewiesen das es eine neue Version gibt.

Update zB. mit:

```bash
yarn set version 4.0.2
yarn install
```

### Update mit YARN / NPM, npm aktualisieren

So sollte man das machen:

```bash
## https://yarnpkg.com/cli/up
yarn up -i
## https://yarnpkg.com/cli/upgrade-interactive
yarn upgrade-interactive
```

yarn nutzt ja auch npm...

```bash
npm audit report
npm outdated

# check for updates
npx npm-check-updates

# upgrade package.json
npx npm-check-updates -u
# oder
npx npm-check-updates -u --interactive --format group

# install the new Versions
 npm update --save
 npm update --save-dev

 npm install ??
```

### Create a release (gilt das auch für yarn?)

```bash
# first build, also to update the d.ts
npm run build:ts
# then commit all changes to git, and then...
# create a version: major,minor,patch 
# patch: 1.0.0 -> 1.0.1
npm version major
npm version minor
npm version patch
```

#### Add typescript & enable VSCode integration

```bash
yarn add typescript --dev
yarn add ts-loader --dev
ggfs: yarn add ignore-loader --dev
yarn dlx @yarnpkg/sdks vscode
```

- <https://yarnpkg.com/getting-started/editor-sdks>

### Monorepo / Workspaces

#### Add workspaces to `package.json`

```json
{
  "private": true,
  "workspaces": ["projects/*"]
}
```

#### creating project

Starting a new library inside a monorepo directly, without manually creating directories for it:

```bash
yarn projects/000-shapes init
```

- Weitere Rezepte: <https://yarnpkg.com/getting-started/recipes>

### Webpack 5

- <https://medium.com/dataseries/yarn-2-and-typescript-adding-webpack-9dd9d24001f7>
- <https://webpack.js.org/guides/getting-started/#basic-setup>
- <https://webpack.js.org/configuration/>

#### Beispiel vorbereiten

Im Projekt-Verzeichnis `projects/000-shapes`:

##### `dist/index.html` anlegen

```html
<!DOCTYPE html>
<!-- index.html für den Webpack Test -->
<html>
  <head>
    <meta charset="utf-8" />
    <title>Getting Started with Webpack</title>
  </head>
  <body>
    <script src="bundle.js"></script>
  </body>
</html>
```

##### `src/index.js` anlegen

```js
/*- index.js für den Webpack Test */

import { v4 as uuidv4 } from "uuid";

function component() {
  const element = document.createElement("div");

  // Lodash, currently included via a script, is required for this line to work
  element.innerHTML = "<p>Hello Webpack: " + uuidv4() + "</p>";

  return element;
}

document.body.appendChild(component());
```

##### `config/webpack.config.js` anlegen

```js
const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "bundle.js",
  },
};
```

##### scripte im Projekt anlegen

```json
  "scripts": {
    "build": "NODE_ENV=production && yarn _webpack",
    "start": "node ./dist/bundle.js",
    "_webpack": "webpack-cli --config ./config/webpack.config.js"
  },
```

#### Webpack installieren

Im Root Verzeichnis:

```bash
yarn add webpack webpack-cli --dev
yarn add uuid
```

Projektverzeichnis im Terminal öffnen

```bash
cd projects/000-shapes/
yarn run build
```

Er findet im Projekt webpack nicht.

also nochmal im Projekt-Verzeichnis.

```bash
yarn add webpack webpack-cli --dev
```

und dann

```bash
yarn run build
```

funktioniert!

1. Gehe zu `projects/000-shapes/dist/`
2. `bundle.js` wurde von webpack erzeugt.
3. `projects/000-shapes/dist/index.html` im Browser öffnen.
4. Die Webseite zeigt `Hello Webpack: cbee67a8-a761-4f52-8f38-93e9447fc6ac`.
5. Bei jedem reload wird eine neue UUID erzeugt.

#### Webpack Assets

- <https://webpack.js.org/guides/asset-management/>

```bash
yarn add style-loader css-loader --prefer-dev
```

```js
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
```

##### Images und Fonts und Data (csv, json, json5, toml, yaml, xml)

```bash
yarn add csv-loader xml-loader --prefer-dev

yarn add toml yamljs json5 --prefer-dev
yarn remove toml yamljs json5
```

da geht einiges, auch mit custom parsern.

##### Bundles

Um die Index Datei automatisch zu erzeugen...

```bash
yarn add html-webpack-plugin --prefer-dev
```

##### The Manifest

- <https://github.com/shellscape/webpack-manifest-plugin>
- <https://webpack.js.org/concepts/manifest>
- <https://webpack.js.org/guides/caching>

#### Development

- <https://webpack.js.org/guides/development/>

devtool: 'inline-source-map',

Maps your compiled code back to your original source code, damit man sehen kann wo die fehler im Browser wrklich aufreten.

- <https://webpack.js.org/guides/development/#choosing-a-development-tool>

choose one:

- webpack's Watch Mode - <https://webpack.js.org/configuration/watch/#watch>
  - "watch": "webpack --watch",
  - The only downside is that you have to refresh your browser in order to see the changes.
- webpack-dev-server - <https://github.com/webpack/webpack-dev-server>
- webpack-dev-middleware - <https://github.com/webpack/webpack-dev-middleware>

#### Live reload mit webpack-dev-server

```bash
yarn add webpack-dev-server --prefer-dev
```

```js
  devServer: {
    static: './dist',
  },
  optimization: {
    runtimeChunk: 'single',
  },
```

- <https://webpack.js.org/configuration/dev-server/>

##### Cache

- <https://webpack.js.org/configuration/cache/>

Zwischenspeichern der generierten Webpack-Module und -Chunks, um die Erstellungsgeschwindigkeit zu erhöhen.

Hier nutze ich den default.

##### Devtool

- <https://webpack.js.org/configuration/devtool/>

Diese Option steuert, ob und wie Source Maps erzeugt werden.

Hier nutze ich den default.

##### Extends

- <https://webpack.js.org/configuration/extending-configurations/>

Eine Konfiguration als Basis verwenden und erweitern.

Das nutze ich natürlich um Konfiguartionen für prod und dev an zu legen.

##### Target

- <https://webpack.js.org/configuration/target/>

Weist webpack an, Laufzeitcode für eine bestimmte Umgebung zu generieren.

Ist in meinem Fall "web".

##### Minify

Alles in eine kompakte html Datei packen

- <https://webpack.js.org/guides/production/>
- <https://webpack.js.org/plugins/terser-webpack-plugin/>

##### Alles in eine große HTML Datei packen

- <https://github.com/jantimon/html-webpack-plugin>

Das nutze ich allerdings schon, aber es bindet die bundle.js nicht ein.

...

- <https://webpack.js.org/configuration/cache/>

### Fragen & Probleme

- Woher kommt auf einmal das `node_modules` Verzeichnis?
- Das skript `yarn run start` läuft noch nicht (document is not defined). Das ist klar, denn document gibts nicht in der Node-Umgebung, sondern nur in der Browser-Umgebung.

## Neues Projekt

Ich will cc-utils als library einbinden...

```bash
yarn projects/cc-utils init
yarn add webpack webpack-cli --dev
```

Das ist jetzt natürlich noch nicht soweit
fortgeschritten initialisiert wir 000-shapes

in shapes:

```bash
yarn add @carstennichte/cc-utils
```

```json
  "dependencies": {
    "@carstennichte/cc-toolbox": "workspace:^"
  }
```

er findet nix...

### Authoring a Library

- <https://webpack.js.org/guides/author-libraries/#expose-the-library>
- <https://webpack.js.org/guides/author-libraries/#externalize-lodash>
  - <https://webpack.js.org/configuration/externals/> - Benutzt die Bibliothek weitere externe Bibliotheken, dann man die als `external` deklarieren. Sie werden dann nicht mit einkompiliert. Es wird vorausgesetzt das der Benutzer sich die installiert.

... das funktioniert noch nicht...

- <https://stackoverflow.com/questions/43037590/field-browser-doesnt-contain-a-valid-alias-configuration>
- <https://webpack.js.org/configuration/resolve/#resolve>
- <https://webpack.js.org/configuration/resolve/#resolveextensions>

  resolve: {
  extensions: ['.ts', '.js'],
  }

export from index.js
<https://stackoverflow.com/questions/34072598/es6-exporting-importing-in-index-file>

führt nicht zum ziel... er findet nix.

- Was bedeutet umd...
- <https://webpack.js.org/configuration/output/#type-umd>
- <https://github.com/umdjs/umd>

Wie kann ich eine Bibliothek mit Klassen publizieren?

- <https://stackoverflow.com/questions/44456500/webpack-library-how-to-configure-webpack-to-expose-classes>
- <https://github.com/riversun/making-library-with-webpack>
- <https://www.seancdavis.com/posts/export-es6-class-globally-webpack/>

<https://marcobotto.com/blog/compiling-and-bundling-typescript-libraries-with-webpack/>
<https://www.reddit.com/r/webpack/comments/9i2zj8/need_help_with_creating_a_library_that_exposes/>
<https://medium.com/self-modifying-code/exposing-classes-functions-and-other-fun-stuff-with-webpack-8592821d4ec8>
<https://rubenr.dev/library-generation-webpack/>

und diese output.library option...
<https://webpack.js.org/configuration/output/#outputlibrary>

------------ AAAARGH...

<https://webpack.js.org/guides/author-libraries/#final-steps>

package.json -> "main": "dist/webpack-numbers.js",

oder

package.json -> "module": "src/index.js"

Dann weiss er auch wo er die Daten findet!

FERTIG !!!

Wenn nix geht: delete `node_modules` and run `yarn -install`

## Ein Projekt aufsetzen

und canas-sketch ablösen

### Tweakpane

- <https://tweakpane.github.io/docs/>

@tweakpane/core are additional type definitions for development in TypeScript

```bash
yarn add tweakpane
yarn add @tweakpane/core --dev
yarn add @tweakpane/plugin-essentials
? canvas-sketch-util
```

### In cc-utils

- <https://github.com/mattdesl/canvas-sketch-util/tree/master>

var wrap = require('./lib/wrap');

```bash
yarn add canvas-sketch-util
yarn add jszip file-saver
yarn add load-asset   <--- das wollte ich irgendwo einsetzen (suche mal in den alten quellen)
```

## Umbau auf Typescript

Das Projekt ist so konfiguriert das, `.map` und `.d.ts` Dateien erzeugt werden. Die `ts` und `.d.ts` Dateien werden (von webpack) in je einer großen Datei zusammen gefasst, und alles im `dist` Verzeichnis abgelegt. Dazu ist ein Zusammenspiel aus den drei Konfiguratios Dateien notwendig:

- tsconfig.json
- webpack.config.js
- package.json

### Fehlermeldungen in dem Zusammenhang

```bash
TS7016: Could not find a declaration file for module '@carstennichte/cc-utils'. '/Users/cnichte/Documents/develop-software/creative-coding/projects/cc-utils/dist/cc-utils.js' implicitly has an 'any' type.
```

Das sagt er wenn er die `d.ts` Files (bzw. das File nicht findet)

Webpack benötigt den `ts-loader`. Im cc-utils Root Verzeichnis:

```bash
yarn yarn add ts-loader --dev
```

in `/cc-utils/webpack.config.js` den Loader einbinden:

```js
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
      },
    ],
  },
```

in in `/cc-utils/tsconfig.js` ist wichtig die drei Parameter auf false zu setzen:

```json
  "emitDeclarationOnly": false,
  "noEmit": false,
  "noEmitOnError":false,
```

und in `/cc-utils/package.json` den Verweis auf die types nicht vergressen:

```json
  "main": "dist/cc-utils.js",
  "types": "dist/index.d.ts",
```

## Weitere interessante Themen

Inline Source extension for the HTML Webpack Plugin
<https://github.com/DustinJackson/html-webpack-inline-source-plugin>

html-webpack-inline-source-plugin alternative

<https://github.com/jantimon/html-webpack-plugin/issues/1379>

Eigenes Template für index.html verwenden…
<https://github.com/jantimon/html-webpack-plugin#writing-your-own-templates>

Multipart... noch nicht probiert...
<https://github.com/webpack/webpack/tree/main/examples/multi-part-library>

## canvas fullscreen toogle

```js

// beenden mit esc taste
function fullscreen(){
           var el = document.getElementById('canvas');
 
           if(el.webkitRequestFullScreen) {
               el.webkitRequestFullScreen();
           }
          else {
             el.mozRequestFullScreen();
          }            
}
 
canvas.addEventListener("click",fullscreen)
```

### EXAMPLE index.js

```js
import Icon from "./images/icon.jpg";
import MyJson from "./data/data.json";
import MyData from "./data/data.xml";
import MyCSV from "./data/data.csv";

import printMe from "./print.js";

//- Add the image to our existing div.
const myIcon = new Image();
myIcon.src = Icon;
element_div.appendChild(myIcon);

//- Usimg Data
console.log(MyData);
console.log(MyCSV);
console.log(MyJson);

//- using a bundle
const btn = document.createElement("button");
btn.innerHTML = "Click me and check the console!";
btn.onclick = printMe;
element_div.appendChild(btn);
```
