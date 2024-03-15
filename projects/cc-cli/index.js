#! /usr/bin/env node

import { program } from "commander";
import build from "./commands/build.js";
import server from "./commands/server.js";

// canvas-sketch main.js --name releases/$npm_package_version/$npm_package_config_filename  --build  --inline

// https://github.com/tj/commander.js
program
  .name("cc-cli")
  .description("Commands for my Creative Code.")
  .version("0.0.0");
program
  .command("build")
  .description("Build a standalone html file.")
  .argument("[name]", "The source file to build from")
  .option("--inline", "Do all the stuff inline")
  .action(build);
program
  .command("server")
  .description("Run this project in a webserver.")
  .argument("[filename]", "The source file to run")
  .option('-t, --title <honorific>', 'title to use before name')
  .option("--hotreload", "Do hotreloading...")
  .action(server);

program.parse();

// cc-cli server apache --hotreload --title incredible