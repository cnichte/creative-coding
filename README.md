# creative-coding

- Project : Creative Coding
- Author : Carsten Nichte
- Date : 2022 - to date
- Web : <https://carsten-nichte.de/index/>

## Pages

- <https://carsten-nichte.de/apps/creative-code/>
- <https://carsten-nichte.de/apps/docs/creative-code-projekt-dokumentation/>
- <https://carsten-nichte.de/#generative-art>
- <https://carsten-nichte.de/notes/artikel/generative-art-creative-code/>

## Description

Creative-Coding Projects for HTML Canvas, with focus more on organisation and structure than on speed.

Navigate to one of the projects folder in the Terminal, and from there:

- For Development:
- Start watch: `yarn run watch` - live-reload without server
- Start Server: `yarn run start` - live-reload with server
- For Production:
  - Build release:`yarn run build` - build the code for production

## Made with love and the great

- YARN 2
- Webpack 5
- Typescript 5.2
- <https://github.com/cocopon/tweakpane>
- <https://github.com/mattdesl/canvas-sketch-util>

## Licence

- Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
- <https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode>
- <https://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1>

## Licence in short

- Do not sell the code, or creative stuff made with this code.
- You are allowed to make someone happy, and give away the works you have created with it for free.
- Learn, code, create, and have fun.

Tips

## Tips

Wie liste ich unter MacOS im Terminal eine Verzeichnis Struktur auf, so das ich sie kopieren kann.

- `brew install tree`
- `tree -a -L 3`
- `tree -a -L 3 ./assets > verzeichnis-struktur.txt`
- `tree -a -L 3 ./assets | pbcopy`

wobei

- `-a` zeigt auch versteckte Dateien
- `-L 3` begrenzt die Tiefe der Verzeichnisstruktur auf zB. 3 Ebenen
- `pbcopy` in die Zwischenablage
