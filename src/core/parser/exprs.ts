import { TokenType } from "../lexer/Tokens.ts";
import { ParseHead, parseCodeBlock } from "./parser.ts";
import * as AST from "./AST.ts";
import * as errs from "../../helpers/ErrorOut/errors.ts";
import * as lus from "./lookUpMaps.ts";
import * as tys from "./tysMaps.ts";
import { CombLoc } from "../../helpers/tools.ts";

export function parse_expr(p: ParseHead, bp: lus.BindingPower): AST.Node {
    const infFN = lus.infix_lu.get(p.currentTokenType())
    if (!infFN) {
        const curr = p.currentToken();
        errs.detailedErr(p.tag, curr.loc.line, p.gl(curr.loc.line), curr.loc.col, "Unknown Token", `an infix function was expected but not found! (${curr.type})`);
        Deno.exit(0);
    }
    let left = infFN(p, bp);

    while (lus.bp_lu.get(p.currentTokenType()) as lus.BindingPower > bp) {
        const atomFN = lus.atom_lu.get(p.currentTokenType())
        if (!atomFN) {
            const curr = p.currentToken();
            errs.detailedErr(p.tag, curr.loc.line, p.gl(curr.loc.line), curr.loc.col, "Unknown Token", `an atomic function was expected but not found! (${curr.type})`);
            Deno.exit(0);
        }
        left = atomFN(p, left, bp);
    }

    return left;
}

export function parse_primary(p: ParseHead): AST.Node {
    const tk = p.advance();

    switch(tk.type) {
        case TokenType.IDENTIFIER:
            return {
                type: AST.NodeTypes.Ident,
                name: tk.value,
                loc: tk.loc,
            } as AST.Ident
        
        case TokenType.FORMAT_STR:
        case TokenType.STRING:
            return {
                type: AST.NodeTypes.BasicLit,
                value: tk.value,
                typeName: tk.type == TokenType.FORMAT_STR ? 'fmtStr' : 'string',
                loc: tk.loc,
            } as AST.BasicLit
        
        case TokenType.INTEGER:
            return {
                type: AST.NodeTypes.BasicLit,
                value: tk.value,
                typeName: 'int',
                loc: tk.loc,
            } as AST.BasicLit
        
        case TokenType.FLOAT:
            return {
                type: AST.NodeTypes.BasicLit,
                value: tk.value,
                typeName: 'float',
                loc: tk.loc,
            } as AST.BasicLit
        
        case TokenType.FALSE:
        case TokenType.TRUE:
            return {
                type: AST.NodeTypes.BasicLit,
                value: tk.value,
                typeName: 'boolean',
                loc: tk.loc,
            } as AST.BasicLit
        
        case TokenType.UDEF:
            return {
                type: AST.NodeTypes.BasicLit,
                value: tk.value,
                typeName: 'udef',
                loc: tk.loc,
            } as AST.BasicLit

        case TokenType.NIL:
            return {
                type: AST.NodeTypes.BasicLit,
                value: tk.value,
                typeName: 'nil',
                loc: tk.loc,
            } as AST.BasicLit
        
        default:
            errs.detailedErr(p.tag, tk.loc.line, p.lexer.lines[tk.loc.line - 1], tk.loc.col, "Unexpected token", "The token " + tk.value + " is not a valid token.");
            Deno.exit(0);
    }
}

export function parse_member_expr(p: ParseHead, left: AST.Node, bp: lus.BindingPower): AST.Node {
    const isComputed = p.advance().type == TokenType.LBRACKET;

    if (isComputed) {
        const rhs = parse_expr(p, bp);
        p.expect(TokenType.RBRACKET);
        return {
            type: AST.NodeTypes.ComputedExpr,
            Member: left,
            Property: rhs,
            loc: CombLoc(left, p.previous())
        } as AST.ComputedExpr
    }

    return {
        type: AST.NodeTypes.MemberExpr,
        Member: left,
        Property: p.advance().value,
        loc: CombLoc(left, p.previous())
    } as AST.MemberExpr
}

export function parse_call_expr(p: ParseHead, left: AST.Node, bp: lus.BindingPower): AST.Node {
    p.advance();
    const args: AST.Node[] = [];

    while (!p.isEnd() && !p.currIs(TokenType.RPAREN)) {
        args.push(parse_expr(p, bp))

        if (!p.isOneOfMany(TokenType.EOF, TokenType.RPAREN)) {
            p.expect(TokenType.COMMA);
        }
    }

    const end = p.expect(TokenType.RPAREN);

    return {
        type: AST.NodeTypes.CallExpr,
        Method: left,
        args,
        loc: CombLoc(left, end)
    } as AST.CallExpr
}

export function parse_prefix_expr(p: ParseHead): AST.Node {
    const op = p.advance();
    const value = parse_expr(p, lus.BindingPower.unary);

    return {
        type: AST.NodeTypes.PrefixExpr,
        op: op.value,
        value,
        loc: CombLoc(op, value)
    } as AST.PrefixExpr
}

export function parse_infix_expr(p: ParseHead, left: AST.Node, _bp: lus.BindingPower): AST.Node {
    const op = p.advance();

    return {
        type: AST.NodeTypes.InfixExpr,
        op: op.value,
        left,
        loc: CombLoc(left, op)
    } as AST.InfixExpr
}

export function parse_assignment_expr(p: ParseHead, left: AST.Node, bp: lus.BindingPower): AST.Node {
    p.advance();
    const right = parse_expr(p, bp);

    return {
        type: AST.NodeTypes.AssignmentExpr,
        left,
        right,
        loc: CombLoc(left, right)
    } as AST.AssignmentExpr
}

export function parse_binary_assignment_expr(p: ParseHead, left: AST.Node, bp: lus.BindingPower): AST.Node {
    const op = p.advance();
    const right = parse_expr(p, bp);

    return {
        type: AST.NodeTypes.BinaryAssignmentExpr,
        left,
        op: op.value,
        right,
        loc: CombLoc(left, right)
    } as AST.BinarayAssignmentExpr
}

export function parse_binary_expr(p: ParseHead, left: AST.Node, _bp: lus.BindingPower): AST.Node {
    const op = p.advance().value;
    const right = parse_expr(p, lus.BindingPower.default);

    return {
        type: AST.NodeTypes.BinaryExpr,
        left: left,
        operator: op,
        right: right,
        loc: CombLoc(left, right)
    } as AST.BinaryExpr;
}

export function parse_grouping_expr(p: ParseHead): AST.Node {
    p.expect(TokenType.LPAREN);
    const expr = parse_expr(p, lus.BindingPower.default);
    p.expect(TokenType.RPAREN);
    return expr
}

export function parse_function_expr(p: ParseHead): AST.Node {
    const start = p.advance();
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
        type: AST.NodeTypes.FunctionExpr,
        params,
        outType,
        body,
        loc: CombLoc(start, body)
    } as AST.FunctionExpr
}

export function parse_struct_init_expr(p: ParseHead, left: AST.Node, bp: lus.BindingPower): AST.Node {
    p.expect(TokenType.LBRACE);
    const params: AST.nvlPeram[] = [];
    while (!p.isOneOfMany(TokenType.EOF, TokenType.RBRACE)) {
        const name = p.expect(TokenType.IDENTIFIER).value;
        
        if (p.currIs(TokenType.COLON)) {
            p.advance();
            const type = parse_expr(p, bp);
            params.push({ name, type });
        } else {
            params.push({ name, type: null });
        }
        if (!p.isOneOfMany(TokenType.EOF, TokenType.RBRACE)) p.expect(TokenType.COMMA);
    }
    const e = p.expect(TokenType.RBRACE);

    return {
        type: AST.NodeTypes.StructInit,
        instantiate: left,
        params,
        loc: CombLoc(left, e)
    } as AST.StructInit
}

export function parse_array_init_expr(p: ParseHead): AST.Node {
    const s = p.expect(TokenType.LBRACKET);
    const children: AST.Node[] = [];
    while (!p.isOneOfMany(TokenType.EOF, TokenType.RBRACKET)) {
        children.push(parse_expr(p, lus.BindingPower.assignment));
        if (!p.isOneOfMany(TokenType.EOF, TokenType.RBRACKET)) p.expect(TokenType.COMMA);
    }
    const e = p.expect(TokenType.RBRACKET);
    return {
        type: AST.NodeTypes.ArrayInit,
        children,
        loc: CombLoc(s, e)
    } as AST.ArrayInit
}

export function parse_package_pull_expr(p: ParseHead, left: AST.Node, bp: lus.BindingPower): AST.Node {
    p.advance();
    const rhs = parse_expr(p, bp);

    return {
        type: AST.NodeTypes.PackagePull,
        package: left,
        content: rhs,
        loc: CombLoc(left, rhs)
    } as AST.PackagePull
}

export function parse_range_expr(p: ParseHead, left: AST.Node, bp: lus.BindingPower): AST.Node {
    p.advance();
    const rhs = parse_expr(p, bp);

    return {
        type: AST.NodeTypes.RangeExpr,
        min: left,
        max: rhs,
        loc: CombLoc(left, rhs)
    } as AST.RangeExpr
}

export function parse_catch_expr(p: ParseHead, left: AST.Node, bp: lus.BindingPower): AST.Node {
    p.advance();
    const right = p.currIs(TokenType.LBRACE) ? parseCodeBlock(p) : parse_expr(p, bp);

    return {
        type: AST.NodeTypes.CatchExpr,
        left,
        right,
        loc: CombLoc(left,right)
    } as AST.CatchExpr
}
