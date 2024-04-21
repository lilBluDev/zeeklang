import * as tk from "./Tokens.ts";
import * as tools from "../../helpers/tools.ts";
import * as errs from "../../helpers/ErrorOut/errors.ts";


export class Lexer {
    tag: string;
    source: string;
    start: string;
    lines: string[];
    line: number;
    col: number;
    constructor (tag: string, source: string) {
        // currentLexer = this;

        this.tag = tag;
        this.source = source;
        this.start = source;
        this.lines = source.split("\n");
        this.line = 1;
        this.col = 1;
    }

    getLine(line: number): string {
        return this.lines[line - 1];
    }

    current(): string {
        return this.source[0];
    }

    peek(): string {
        return this.source[1];
    }

    isEnd(): boolean {
        return this.source.length == 0;
    }

    advance(): string {
        const ret = this.source[0];
        this.source = this.source.slice(1);
        return ret;
    }
}

// export let currentLexer: Lexer = new Lexer("empty", "");

function Ident(lexer: Lexer): tk.Token {
    const start = lexer.start;
    const sLine = lexer.line;
    const sCol = lexer.col;
    while (tools.isAlpha(lexer.current()) || tools.isDigit(lexer.current())) {
        lexer.advance();
    }

    const loc = start.length - lexer.source.length
    const slice = start.slice(0, loc);
    lexer.col += loc;

    if (tk.keyword_lu.has(slice)) {
        return {
            type: tk.keyword_lu.get(slice) as tk.TokenType,
            value: slice,
            loc: {
                line: sLine,
                col: sCol,
                end_line: lexer.line,
                end_col: lexer.col - 1 
            }
        }
    }
    return {
        type: tk.TokenType.IDENTIFIER,
        value: slice,
        loc: {
            line: sLine,
            col: sCol,
            end_line: lexer.line,
            end_col: lexer.col - 1
        }
    }
}

function Num(lexer: Lexer): tk.Token {
    const start = lexer.start;
    const sLine = lexer.line;
    const sCol = lexer.col;
    while (tools.isDigit(lexer.current())) {
        lexer.advance();
    }
    if (lexer.current() == '.') {
        lexer.advance();
        while (tools.isDigit(lexer.current())) {
            lexer.advance();
        }
    }
    const loc = start.length - lexer.source.length
    const slice = start.slice(0, loc);
    lexer.col += slice.length;
    return {
        type: tk.TokenType.INTEGER,
        value: slice,
        loc: {
            line: sLine,
            col: sCol,
            end_line: lexer.line,
            end_col: lexer.col - 1
        }
    }
}

function String(lexer: Lexer, isFmt: boolean): tk.Token {
    const start = lexer.start;
    const sLine = lexer.line;
    const sCol = lexer.col;
    const op = lexer.advance();
    while (lexer.current() != op && !lexer.isEnd()) {
        lexer.advance();
    }
    if (lexer.isEnd()) {
        errs.detailedErr(lexer.tag, sLine, lexer.getLine(sLine), sCol, "Unterminated string", "An Unterminated string was found at the end of the file. Strings must be terminated with a double quote (\").");
        Deno.exit(0);
    }
    lexer.advance();
    const loc = start.length - lexer.source.length;
    const slice = start.slice(0, loc);
    lexer.col += slice.length;
    return {
        type: isFmt ? tk.TokenType.FORMAT_STR : tk.TokenType.STRING,
        value: slice.slice(1, slice.length - 1),
        loc: {
            line: sLine,
            col: sCol,
            end_line: lexer.line,
            end_col: lexer.col - 2
        }
    }
}

export function startLexer(lexer: Lexer): tk.Token[] {
    const tokens: tk.Token[] = [];

    while (!lexer.isEnd()) {
        lexer.start = lexer.source;
        // lexer.col++;

        switch(lexer.current()) {
            case "\t":
            case "\r":
                lexer.advance();
                continue;
            case "\n":
                lexer.advance();
                lexer.line++;
                lexer.col = 1;
                continue;
            case " ":
                lexer.advance();
                lexer.col++;
                continue;
            case "/":
                if (lexer.peek() == "/") {
                    lexer.advance();
                    lexer.advance();
                    lexer.col += 2;
                    while (lexer.current() != "\n" && !lexer.isEnd()) {
                        lexer.advance();
                        lexer.col++;
                    }
                    continue;
                }
                break;
            default:
                // lexer.col++;
                break;
        }
        // console.log(lexer.col);

        if (tools.isAlpha(lexer.current())) {
            tokens.push(Ident(lexer));
            continue;
        } else if (tools.isDigit(lexer.current())) {
            tokens.push(Num(lexer));
            continue;
        } else if (['"', "'", "`"].includes(lexer.current())) {
            tokens.push(String(lexer, lexer.current() === "`"));
            continue;
        }

        const temp_double = lexer.source.slice(0, 2);
        if (tk.double_operator_lu.has(temp_double)) {
            let c = lexer.advance();
            c += lexer.advance();
            lexer.col += 2;
            const ty = tk.double_operator_lu.get(temp_double) as tk.TokenType;
            tokens.push({
                type: ty,
                value: c,
                loc: {
                    line: lexer.line,
                    col: lexer.col,
                    end_line: lexer.line,
                    end_col: lexer.col
                }
            });
            continue;
        }

        if (tk.single_operator_lu.has(lexer.current())) {
            const c = lexer.advance();
            lexer.col++;
            const ty = tk.single_operator_lu.get(c) as tk.TokenType;
            tokens.push({
                type: ty,
                value: c,
                loc: {
                    line: lexer.line,
                    col: lexer.col - 1,
                    end_line: lexer.line,
                    end_col: lexer.col - 1
                }
            });
            continue;
        }
    }

    tokens.push({
        type: tk.TokenType.EOF,
        value: "",
        loc: {
            line: lexer.line,
            col: lexer.col,
            end_line: lexer.line,
            end_col: lexer.col
        }
    });

    return tokens;
}