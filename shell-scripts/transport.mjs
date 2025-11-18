/**
 * Transport Script für cc-projekte nach Hugo.
 * 
 * @author Carsten Nichte, 2025
 * 
 * Allgemein:
 * Dieses Script kopiert gebaute JavaScript-Bundles von einem Quellverzeichnis
 * in ein Zielverzeichnis, basierend auf der Konfigurationsdatei transport.conf.json.
 * 
 * Speziell:
 *  Ich nutze das Skript um die CC-Projekte zu carsten-nichte.de zu deployen.
 * - Quellverzeichnis: ./projects/<projectName>/dist/production/index.bundle.js
 * - Zielverzeichnis: .../hugo-site/static/js/<projectName>.js
 */
// shell-scripts/transport.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname für ESM rekonstruieren
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config laden
const configPath = path.join(__dirname, 'transport.conf.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// CLI-Argument lesen
const argProject = process.argv[2];

// Funktion zum Kopieren eines Projekts
// Der zu kopierende Code steckt immer in: dist/production/index.bundle.js'
// Ziel ist: <destinationBase>/<projectName>.js
function copyProject(projectName) {
  const sourcePath = path.join(config.sourceBase, projectName, 'dist', 'production', 'index.bundle.js');
  const destPath = path.join(config.destinationBase, `${projectName}.js`);

  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source not found: ${sourcePath}`);
    return;
  }

  // Zielverzeichnis anlegen, falls nötig
  fs.mkdirSync(config.destinationBase, { recursive: true });

  fs.copyFileSync(sourcePath, destPath);
  console.log(`✅ Copied: ${projectName}`);
}

// Entweder einzelnes Projekt oder alle aus Config
if (argProject) {
  console.log(`🚀 Copying single project: ${argProject}`);
  copyProject(argProject);
} else {
  console.log(`🚀 Copying all projects from config (${config.projects.length})...`);
  for (const project of config.projects) {
    copyProject(project);
  }
}