import * as parser from "./parser.ts";
import * as lus from "./lookUpMaps.ts";
import * as AST from "./AST.ts";
import * as errs from "../../helpers/ErrorOut/errors.ts";
import * as tk from "../lexer/Tokens.ts";

export const bp_lu = new Map<tk.TokenType, lus.BindingPower>()
export const atom_lu = new Map<tk.TokenType, lus.atomicFn>()
export const infix_lu = new Map<tk.TokenType, lus.infixFn>()

// function regAtomic(type: tk.TokenType, bp: lus.BindingPower, handler: lus.atomicFn): void {
//     bp_lu.set(type, bp)
//     atom_lu.set(type, handler)
// }

function regInfix(type: tk.TokenType, handler: lus.infixFn): void {
    bp_lu.set(type, lus.BindingPower.primary)
    infix_lu.set(type, handler)
}

export function registerLus(): void {
    regInfix(tk.TokenType.IDENTIFIER, parseSymbol);
    regInfix(tk.TokenType.NIL, parseSymbol);
    regInfix(tk.TokenType.UDEF, parseSymbol);

    regInfix(tk.TokenType.LPAREN, parseMultiSymbol);
    regInfix(tk.TokenType.LBRACKET, parseArraySymbol);
}

export function parse_type(p: parser.ParseHead, bp: lus.BindingPower, once: boolean): AST.Node {
    const infFN = infix_lu.get(p.currentTokenType())
    if (!infFN) {
        const curr = p.currentToken();
        errs.detailedErr(p.tag, curr.loc.line, p.lexer.getLine(curr.loc.line), curr.loc.col, "Unknown Symbol", "an infix function was expected but not found!");
        Deno.exit(0);
    }
    let left = infFN(p, bp);

    while (!once && bp_lu.get(p.currentTokenType()) as lus.BindingPower > bp) {
        const atomFN = atom_lu.get(p.currentTokenType())
        if (!atomFN) {
            const curr = p.currentToken();
            errs.detailedErr(p.tag, curr.loc.line, p.lexer.getLine(curr.loc.line), curr.loc.col, "Unknown Symbol", "an atomic function was expected but not found!");
            Deno.exit(0);
        }
        left = atomFN(p, left, bp);
    }

    return left;
}

function parseArraySymbol(p: parser.ParseHead): AST.ArraySymbol {
    p.expect(tk.TokenType.LBRACKET);
    let limit = 0;
    if (p.currentTokenType() == tk.TokenType.INTEGER) {
        limit = parseInt(p.advance().value);
    }
    p.expect(tk.TokenType.RBRACKET);
    const ty = parse_type(p, lus.BindingPower.primary, true);
    return {
        type: AST.NodeTypes.ArraySymbol,
        symbol: ty,
        limit,
        loc: p.currentToken().loc,
    }

}

function parseMultiSymbol(p: parser.ParseHead): AST.MultiSymbol {
    p.expect(tk.TokenType.LPAREN);
    const symbols = [];
    while (p.currentTokenType() != tk.TokenType.RPAREN && !p.isEnd()) {
        symbols.push(parse_type(p, lus.BindingPower.primary, true));
        if (p.currentTokenType() == tk.TokenType.COMMA) {
            p.advance();
        }
    }
    p.expect(tk.TokenType.RPAREN);
    return {
        type: AST.NodeTypes.MultiSymbol,
        symbols,
        loc: p.currentToken().loc,
    }
}

function parseSymbol(p: parser.ParseHead): AST.Symbol {
    const tk = p.advance();

    return {
        type: AST.NodeTypes.Symbol,
        name: tk.value,
        loc: tk.loc,
    }
}

// function createSymbol(p: parser.ParseHead, name: string): AST.Symbol {
//     return {
//         type: AST.NodeTypes.Symbol,
//         name,
//         loc: p.currentToken().loc,
//     }
// }
