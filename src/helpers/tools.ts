import { Token, loc } from "../core/lexer/Tokens.ts";
import { Node } from "../core/parser/AST.ts";

export function isAlpha(c: string): boolean {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c == "_";
}

export function isDigit(c: string): boolean {
    return c >= "0" && c <= "9";
}

export function CombLoc(s: Node | Token, f: Node | Token): loc {
    return {
        line: s.loc.line,
        col: s.loc.col,
        end_line: f.loc.end_line,
        end_col: f.loc.end_col
    }
}