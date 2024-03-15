import chalk from "chalk";

function server(filename, options, command) {

  console.error("Called command '%s' with options %o", command.name(), options);

  if (options.hotreload) {
    console.log(chalk.green.bold("We do some hotreloading."));
  }else{
    console.log(chalk.green.bold("We do NO hotreloading."));
  }

  const title = options.title ? `${options.title} ` : "(Kein options.title)";
  console.log(`lauching server with filename ${title} ${filename}`);
}

export default server;
