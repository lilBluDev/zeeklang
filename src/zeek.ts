import * as lexer from "./core/lexer/lexer.ts";
import * as parser from "./core/parser/parser.ts";
import * as lus from "./core/parser/lookUpMaps.ts";
import * as tys from "./core/parser/tysMaps.ts";
import * as fs from "https://deno.land/std@0.223.0/fs/mod.ts";
import * as Path from "https://deno.land/std@0.223.0/path/mod.ts";
import * as errs from "./helpers/ErrorOut/errors.ts";
// import progress from "https://deno.land/x/progress@v1.4.9/mod.ts";
// import { string } from "https://deno.land/x/cliffy@v1.0.0-rc.4/flags/types/string.ts";
// import { number } from "https://deno.land/x/cliffy@v1.0.0-rc.4/flags/types/number.ts";

interface coreOptions {
    repo: string
    ext?: string
}

interface TemplateData {
    name: string
    url: string
    download_url: string
    type: string
}

export default class ZeekLangCoreEngine {
    public extention: string = ".zl";
    public ghrepo: string = "https://raw.githubusercontent.com/lilBluDev/zeeklang/main/";

    constructor(ops?: coreOptions) {
        if (ops) {
            this.ghrepo = ops.repo;
            if (ops.ext) this.extention = ops.ext;
        }

        lus.registerLus();
        tys.registerLus();
    } // Options for the engine

    runInput(tag: string, input: string) {
        const lexerInstance = new lexer.Lexer(tag, input);
        const tokens = lexer.startLexer(lexerInstance);
        const parseHead = new parser.ParseHead(tokens, lexerInstance);
        const ast = parser.generateAST(parseHead);
        console.log(ast);
    }

    async createProject(cwd: string, t: string) {
        const examples: {[key:string]:object}[] = await (await fetch("https://api.github.com/repos/lilBluDev/zeeklang/contents/examples")).json();
        const list: {[key:string]:string} = {};

        for (const exm of examples) {
            const n = exm.name as unknown as string; 
            list[n] = this.ghrepo+"examples/"+n+"/";
        }

        const projName = cwd.split("\\")[cwd.split("\\").length-1];
        let template = "";

        if (Object.keys(list).includes(t)) {
            template = list[t];
        } else {
            errs.BasicNHErr(`template '${t}' does not exists!`);
            Deno.exit(0);
        }

        const Tpkg = await (await fetch(template+"zeek.json")).json();

        Tpkg["name"] = projName;

        if (fs.existsSync(Path.join(cwd, "zeek.json"))) {
            errs.BasicNHErr(`A project already exist on the fillowing directory: ${cwd}`);
            while (true) {
                const ans = prompt("(y/yes/n/no) do you wish to relace it?");
                if (!ans) continue;
                if (["y", "yes", "Y", "YES"].includes(ans as string)) break;
                else if (["n", "no", "N", "NO"].includes(ans as string)) { console.log("Exiting.."); Deno.exit(0);}
                else continue;
            }
        }
        Deno.writeTextFileSync(Path.join(cwd, "zeek.json"), JSON.stringify(Tpkg, null, 2));

        const repo = `https://api.github.com/repos/lilBluDev/zeeklang/contents/examples/${t}`;
        const total = await getFileCount(repo)
        console.log(`found ${total} files!`);
        console.log(`Fetching Files...`)

        await addRepoToDir(repo, cwd);

        console.log(`"${projName}" has been created!`);
    }
}

async function addRepoToDir(repo: string, dir: string) {
    const fetched: TemplateData[] = await (await fetch(repo)).json();

    for (const item of fetched) {
        if (item.type === "dir") {Deno.mkdirSync(dir+`/${item.name}`); await addRepoToDir(repo+`/${item.name}`, dir+`/${item.name}`)}
        else if (item.name === "zeek.json") continue;
        else {
            console.log("Fetching", item.name)
            const data = await (await fetch(item.download_url)).text();
            Deno.writeTextFileSync(dir+`/${item.name}`, data);
        }
    }
}

async function getFileCount(repo: string) {
    let count = 0;

    const fetched: TemplateData[] = await (await fetch(repo)).json();
    for (const item of fetched) {
        if (item.type === "dir") count += await getFileCount(repo+`/${item.name}`)
        else count++;
    }

    return count;
}