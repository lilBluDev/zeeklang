import * as cliffy from "https://deno.land/x/cliffy@v1.0.0-rc.4/command/mod.ts";
import {existsSync} from "https://deno.land/std@0.223.0/fs/mod.ts";
import chalk from "chalk";
import zeek from "../src/zeek.ts";

const Z = new zeek();

const AppName = "zeek";
const AppVersion = "DEV-0";


await new cliffy.Command()
    .name(AppName)
    .usage("<options> [command]")
    .version(AppVersion)
    .description("A simple REPL for the Zeek Programming Language")
    .action(() => actionScript())

    .command("run", "Run a Zeek File/Project")
    .arguments("[file:string]")
    .action((opts, ...args) => runCmd(opts, args))

    .command("init", "initialize a zeek project in the working directory")
    .option("-t, --template [template]", "the template that is used for the initialization", { default: 'hw' })
    .action((opts, ...args) => initCmd(opts, args))

    .parse(Deno.args);

function actionScript(): void {
    console.log(chalk.grey(`<<< ${AppName} ${AppVersion} >>>`));
    console.log(chalk.cyan("Note: ZeekLang is still in development. Some features may not work as intended or not working. Please report any bugs/errors to the GitHub repository."));
    const code_cache: string[] = [];
    while(true) {
        const inp = prompt(">>>");
        if (inp == "exit") {
            console.log("Exiting...");
            Deno.exit(0);
        } else if (inp == "help") {
            console.log("Type \"exit\" to exit the REPL.");
        } else if (inp == "" || inp == null) {
            code_cache.push("");
            continue;
        } else {
            code_cache.push(inp);
            Z.runInput("console", code_cache.join("\n"));
        }
    }
}

function runCmd(_opts: cliffy.CommandOptions, args: [(string | undefined)?]): void {
    const filePath = args[0];
    if (!filePath || filePath == ".") {
        console.log("Projects are not supported yet.");
        Deno.exit(1);
    }

    //check if file exist
    if (!existsSync(filePath)) {
        console.log("File not found!");
        Deno.exit(1);
    }

    if (!Deno.statSync(filePath).isFile) {
        console.log("The file path provided is not a file.");
        Deno.exit(1);
    }

    if (!filePath.endsWith(".zl")) {
        console.log("file extension must end with \".zl\"!");
        Deno.exit(1);
    }

    const data = Deno.readFileSync(filePath);
    const text = new TextDecoder().decode(data);
    Z.runInput(Deno.realPathSync(filePath), text);
}

function initCmd(opts: cliffy.CommandOptions, args: [(string | undefined)?]): void {
    console.log(opts, args);
    const cwd = Deno.cwd();

    console.log("< WIP! >");
}