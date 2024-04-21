import { ParseHead, parseCodeBlock, parseScopeCapture } from "./parser.ts";
import { TokenType } from "../lexer/Tokens.ts";
import * as lus from "./lookUpMaps.ts";
import * as AST from "./AST.ts";
import * as errs from "../../helpers/ErrorOut/errors.ts";
import * as tys from "./tysMaps.ts";
import * as exprs from "./exprs.ts";
import { CombLoc } from "../../helpers/tools.ts";

export function parseStmt(p: ParseHead): AST.Node {
    const stmt = lus.stmt_lu.get(p.currentTokenType());
    if (stmt) {
        return stmt(p);
    }

    return parseExprStmt(p);
}

export function parseExprStmt(p: ParseHead): AST.Node {
    const expr = exprs.parse_expr(p, lus.BindingPower.default);

    if (p.currentTokenType() == TokenType.SEMICOLON) {
        p.advance();
    } else {
        const curr = p.previous();
        errs.detailedErr(p.tag, curr.loc.line, p.lexer.getLine(curr.loc.line), curr.loc.col, "Missing Semicolon", "a semicolon was expected after the expression!")
        Deno.exit(0);
    }

    return expr;
}

export function parseVarDecl(p: ParseHead): AST.Node {
    const op = p.advance();
    const isConst = op.type == TokenType.CONST;
    const name = p.expect(TokenType.IDENTIFIER);

    if (isConst) {
        let ty: AST.Node | null = null;
        let value: AST.Node | null = null;
        if (p.currIs(TokenType.COLON)) {
            p.advance();
            ty = tys.parse_type(p, lus.BindingPower.default, true);
            p.expectError(TokenType.EQUAL, "expected %e after a constant decleration! a constant must have a predefined value!");
            p.advance();
            value = exprs.parse_expr(p, lus.BindingPower.default);
        } else {
            p.expect(TokenType.WALRUS);
            value = exprs.parse_expr(p, lus.BindingPower.default);
        }
        p.expectSemiColon();
        return { type: AST.NodeTypes.VarDecl, name: name.value, isConst, ty, value,
            loc: CombLoc(op, p.previous())
        } as AST.VarDecl;
    } else {
        if (p.currIs(TokenType.SEMICOLON)) {
            p.advance()
            return { type: AST.NodeTypes.VarDecl, name: name.value, isConst, ty: null, value: null,
                loc: CombLoc(op, p.previous())
            } as AST.VarDecl;
        } else if (p.currIs(TokenType.COLON)) {
            p.advance();
            const ty = tys.parse_type(p, lus.BindingPower.default, true);
            p.expect(TokenType.EQUAL);
            const value = exprs.parse_expr(p, lus.BindingPower.default);
            p.expectSemiColon();
            return { type: AST.NodeTypes.VarDecl, name: name.value, isConst, ty, value,
                loc: CombLoc(op, p.previous())
            } as AST.VarDecl;
        } else if (TokenType.WALRUS) {
            p.advance();
            const value = exprs.parse_expr(p, lus.BindingPower.default);
            p.expectSemiColon();
            return { type: AST.NodeTypes.VarDecl, name: name.value, ty: null, isConst, value,
                loc: CombLoc(op, p.previous())
            } as AST.VarDecl;
        } else {
            const c = p.currentToken();
            errs.detailedErr(p.tag, c.loc.line, p.lexer.getLine(c.loc.line), c.loc.col, "Unexpected Token", "an unexpected operand on a variable decleration was found! either a \":\", \":=\" or a \";\" was expected!");
            Deno.exit(0);
        }
    }
}

export function parseImportExpr(p: ParseHead): AST.Node {
    const s = p.advance();
    const imported: string[] = []

    if (p.currIs(TokenType.LPAREN)) {
        p.advance();
        while (!p.isOneOfMany(TokenType.EOF, TokenType.RPAREN)) {
            imported.push(p.expect(TokenType.STRING).value);
            if (!p.isOneOfMany(TokenType.EOF, TokenType.RPAREN)) {
                p.expect(TokenType.COMMA);
            }
        }
        p.expect(TokenType.RPAREN);
    } else {
        imported.push(p.expect(TokenType.STRING).value);
    }

    p.expectSemiColon();

    return {
        type: AST.NodeTypes.ImportStmt,
        imported,
        loc: CombLoc(s, p.previous())
    } as AST.ImportStmt
}

export function parsePubExp(p: ParseHead): AST.Node {
    const s = p.advance();
    const exported = parseStmt(p);

    return {
        type: AST.NodeTypes.PublicExp,
        exported,
        loc: CombLoc(s, exported)
    } as AST.PublicExp
}

export function parseFnDecl(p: ParseHead): AST.Node {
    const s = p.advance();
    const name = p.expect(TokenType.IDENTIFIER).value;
    const params: AST.Peram[] = [];

    p.expect(TokenType.LPAREN);
    while (!p.isEnd() && !p.currIs(TokenType.RPAREN)) {
        const type = tys.parse_type(p, lus.BindingPower.default, true);
        const name = p.expect(TokenType.IDENTIFIER).value;
        params.push({ name, type });
        if (!p.isOneOfMany(TokenType.EOF, TokenType.RPAREN)) {
            p.expect(TokenType.COMMA);
        }
    }
    p.expect(TokenType.RPAREN);

    let outType: AST.Node | null = null;
    if (p.currIs(TokenType.RIGHT_ARROW)) {
        p.advance();
        outType = tys.parse_type(p, lus.BindingPower.default, true);
    }

    const body = parseCodeBlock(p);

    return {
        type: AST.NodeTypes.FunctionDecl,
        name,
        params,
        outType,
        body,
        loc: CombLoc(s, body)
    } as AST.FunctionDecl
}

export function parseIfStmt(p: ParseHead): AST.Node {
    const s = p.advance();
    const condition = exprs.parse_expr(p, lus.BindingPower.assignment);
    
    let scopeCapture: AST.Node | null = null;
    if (p.currIs(TokenType.PIPE))
        scopeCapture = parseScopeCapture(p);

    const body = parseCodeBlock(p);
    let alternitive: AST.Node | null = null;

    if (p.currIs(TokenType.ELIF)) {
        alternitive = parseIfStmt(p);
    } else if (p.currIs(TokenType.ELSE)) {
        p.advance();
        alternitive = parseCodeBlock(p);
    }

    return {
        type: AST.NodeTypes.IfStmt,
        condition,
        scopeCapture,
        body,
        alternitive,
        loc: CombLoc(s, p.previous())
    } as AST.IfStmt
    
}

export function parseStructDecl(p: ParseHead): AST.Node {
    const s = p.advance();
    const name = p.expect(TokenType.IDENTIFIER).value;
    const children: AST.Peram[] = [];

    p.expect(TokenType.LBRACE)
    while (!p.isEnd() && !p.currIs(TokenType.RBRACE)) {
        if (p.currIs(TokenType.FN)) {
            const fn = parseFnDecl(p) as AST.FunctionDecl;
            children.push({ name: fn.name, type: fn })
        } else {
            const type = tys.parse_type(p, lus.BindingPower.default, true);
            const name = p.expect(TokenType.IDENTIFIER).value;
            children.push({ name, type })

            if (!p.isOneOfMany(TokenType.EOF, TokenType.RBRACE)) p.expect(TokenType.COMMA);
        }
    }
    const e = p.expect(TokenType.RBRACE);

    return {
        type: AST.NodeTypes.StructDecl,
        name,
        children,
        loc: CombLoc(s, e)
    } as AST.StructDecl
}

export function parseEnumDecl(p: ParseHead): AST.Node {
    const s = p.advance();
    const name = p.expect(TokenType.IDENTIFIER).value;
    const children: string[] = [];

    p.expect(TokenType.LBRACE);
    while (!p.isEnd() && !p.currIs(TokenType.RBRACE)) {
        children.push(p.expect(TokenType.IDENTIFIER).value);
        if (!p.isOneOfMany(TokenType.EOF, TokenType.RBRACE)) p.expect(TokenType.COMMA);
    }
    const e = p.expect(TokenType.RBRACE);

    return {
        type: AST.NodeTypes.EnumDecl,
        name,
        children,
        loc: CombLoc(s, e)
    } as AST.EnumDecl
}

export function parseWhileStmt(p: ParseHead): AST.Node {
    const s = p.advance();
    p.expect(TokenType.LPAREN)
    const condition = exprs.parse_expr(p, lus.BindingPower.default);
    p.expect(TokenType.RPAREN)
    const body = parseCodeBlock(p);

    return {
        type: AST.NodeTypes.WhileStmt,
        condition,
        body,
        loc: CombLoc(s, body)
    } as AST.WhileStmt
}

export function parseForStmt(p: ParseHead): AST.Node {
    const s = p.advance();
    p.expect(TokenType.LPAREN)
    const condition = exprs.parse_expr(p, lus.BindingPower.default);
    p.expect(TokenType.RPAREN)
    const capture = parseScopeCapture(p);
    const body = parseCodeBlock(p);

    return {
        type: AST.NodeTypes.ForStmt,
        condition,
        capture,
        body,
        loc: CombLoc(s, body)
    } as AST.ForStmt
}