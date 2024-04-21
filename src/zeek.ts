import * as lexer from "./core/lexer/lexer.ts";
import * as parser from "./core/parser/parser.ts";
import * as lus from "./core/parser/lookUpMaps.ts";
import * as tys from "./core/parser/tysMaps.ts";

export default class ZeekLangCoreEngine {
    constructor() {
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
}