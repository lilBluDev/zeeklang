import { Lexer } from "../lexer/lexer.ts";
import { Token, TokenType, TokenTypeToSTR } from "../lexer/Tokens.ts";
import * as AST from "./AST.ts";
import * as stmts from "./stmts.ts";
// import * as exprs from "./exprs.ts";
import * as errs from "../../helpers/ErrorOut/errors.ts";
import { CombLoc } from "../../helpers/tools.ts";

export class ParseHead {
    tag: string;
    pos: number;
    tokens: Token[];
    lexer: Lexer;

    constructor(sourceTk: Token[], lx: Lexer) {
        this.tag = lx.tag;
        this.pos = 0;
        this.tokens = sourceTk;
        this.lexer = lx;
    }

    currIs(ty: TokenType) {
        return this.currentTokenType() === ty;
    }

    gl(i: number): string {
        return this.lexer.getLine(i - 1);
    }

    expect(ty: TokenType) {
        this.expectError(ty, "Expected \"%e\" but got \"%c\" instead");
        return this.advance();
    }

    expectSemiColon() {
        if (!this.currIs(TokenType.SEMICOLON)) {
            const prev = this.previous();
            const linePrev = this.lexer.getLine(prev.loc.line)
            errs.detailedErr(this.tag, prev.loc.line, linePrev, prev.loc.col, "Missing Semicolon", "Expected Semicolon after the expression/statement");
            Deno.exit(0);
        } else this.advance();
    }

    expectError(ty: TokenType, errMsg: string) {
        if (this.currentTokenType() !== ty) {
            const curr = this.currentToken();
            const linePrev = this.lexer.getLine(curr.loc.line)
            errs.detailedErr(this.tag, curr.loc.line, linePrev, curr.loc.col, "Unexpected Token", errMsg.replace("%c", TokenTypeToSTR(curr.type)).replace("%e", TokenTypeToSTR(ty)));
            Deno.exit(0);
        }
    }

    advance() {
        this.pos++;
        return this.tokens[this.pos - 1];
    }
    currentTokenType() {
        return this.tokens[this.pos].type;
    }

    currentToken() {
        return this.tokens[this.pos];
    }
    next() {
        return this.tokens[this.pos+1];
    }
    previous() {
        return this.tokens[this.pos-1];
    }

    isOneOfMany(...types: TokenType[]) {
        return types.includes(this.currentTokenType());
    }

    isEnd() {
        return this.currentTokenType() === TokenType.EOF;
    }
}

export function generateAST(p: ParseHead): AST.Program {
    const prgm = AST.mkProgram(p.tag);

    while (!p.isEnd()) {
        const stmt = stmts.parseStmt(p);
        prgm.body.push(stmt);
    }

    return prgm;
}

export function parseScopeCapture(p: ParseHead): AST.ScopeCapture {
    const s = p.expect(TokenType.PIPE);
    const capture: string[] = [];

    while (!p.isEnd() && !p.currIs(TokenType.PIPE)) {
        capture.push(p.expect(TokenType.IDENTIFIER).value);
        if (!p.isOneOfMany(TokenType.EOF, TokenType.PIPE)) {
            p.expect(TokenType.COMMA);
        }
    }
    const e = p.expect(TokenType.PIPE);

    return {
        type: AST.NodeTypes.ScopeCapture,
        capture,
        loc: CombLoc(s, e)
    } as AST.ScopeCapture
}

export function parseCodeBlock(p: ParseHead): AST.CodeBlock {
    const start = p.expect(TokenType.LBRACE)
    const body: AST.Node[] = [];

    while (!p.isEnd() && !p.currIs(TokenType.RBRACE)) {
        body.push(stmts.parseStmt(p));
    }
    const end = p.expect(TokenType.RBRACE);

    return {
        type: AST.NodeTypes.CodeBlock,
        body,
        loc: CombLoc(start, end)
    }
}