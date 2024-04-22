import { ParseHead } from "./parser.ts";
import * as AST from "./AST.ts";
import { TokenType } from "../lexer/Tokens.ts";
import * as expr from "./exprs.ts";
import * as stmt from "./stmts.ts";

export enum BindingPower {
    default,
    comma,
	assignment,
	logical,
	relational,
	additive,
	multiplicative,
	unary,
	call,
	member,
    obj,
	primary,
}

export type StmtFn = (p: ParseHead) => AST.Node;
export type infixFn = (p: ParseHead, bp: BindingPower) => AST.Node;
export type atomicFn = (p: ParseHead, left: AST.Node, bp: BindingPower) => AST.Node;

export const bp_lu = new Map<TokenType, BindingPower>()
export const stmt_lu = new Map<TokenType, StmtFn>()
export const atom_lu = new Map<TokenType, atomicFn>()
export const infix_lu = new Map<TokenType, infixFn>()

function regStmt(type: TokenType, handler: StmtFn): void {
    bp_lu.set(type, BindingPower.default)
    stmt_lu.set(type, handler)
}

function regAtomic(type: TokenType, bp: BindingPower, handler: atomicFn): void {
    bp_lu.set(type, bp)
    atom_lu.set(type, handler)
}

function regInfix(type: TokenType, _bp: BindingPower, handler: infixFn): void {
    bp_lu.set(type, BindingPower.primary)
    infix_lu.set(type, handler)
}

export function registerLus(): void {
    regInfix(TokenType.FN, BindingPower.default, expr.parse_function_expr);

    regInfix(TokenType.IDENTIFIER, BindingPower.primary, expr.parse_primary);
    regInfix(TokenType.NIL, BindingPower.primary, expr.parse_primary);
    regInfix(TokenType.UDEF, BindingPower.primary, expr.parse_primary);
    regInfix(TokenType.STRING, BindingPower.primary, expr.parse_primary);
    regInfix(TokenType.FORMAT_STR, BindingPower.primary, expr.parse_primary);
    regInfix(TokenType.INTEGER, BindingPower.primary, expr.parse_primary);
    regInfix(TokenType.FLOAT, BindingPower.primary, expr.parse_primary);
    regInfix(TokenType.TRUE, BindingPower.primary, expr.parse_primary);
    regInfix(TokenType.FALSE, BindingPower.primary, expr.parse_primary);

    regInfix(TokenType.PLUS, BindingPower.unary, expr.parse_prefix_expr);
    regInfix(TokenType.MINUS, BindingPower.unary, expr.parse_prefix_expr);
    regInfix(TokenType.EXCLAMATION, BindingPower.unary, expr.parse_prefix_expr);

    regInfix(TokenType.LPAREN, BindingPower.default, expr.parse_grouping_expr);
    regInfix(TokenType.LBRACKET, BindingPower.primary, expr.parse_array_init_expr);

    regAtomic(TokenType.LBRACE, BindingPower.assignment, expr.parse_struct_init_expr);

    regAtomic(TokenType.DOT, BindingPower.member, expr.parse_member_expr);
    regAtomic(TokenType.LBRACKET, BindingPower.member, expr.parse_member_expr);
    regAtomic(TokenType.LPAREN, BindingPower.call, expr.parse_call_expr);
    regAtomic(TokenType.COLON, BindingPower.member, expr.parse_package_pull_expr);

    regAtomic(TokenType.AND, BindingPower.logical, expr.parse_binary_expr);
    regAtomic(TokenType.OR, BindingPower.logical, expr.parse_binary_expr);
    regAtomic(TokenType.DOUBLE_DOT, BindingPower.logical, expr.parse_range_expr);
    regAtomic(TokenType.CATCH, BindingPower.logical, expr.parse_catch_expr);

    regAtomic(TokenType.PLUS, BindingPower.additive, expr.parse_binary_expr);
    regAtomic(TokenType.MINUS, BindingPower.additive, expr.parse_binary_expr);
    regAtomic(TokenType.STAR, BindingPower.multiplicative, expr.parse_binary_expr);
    regAtomic(TokenType.SLASH, BindingPower.multiplicative, expr.parse_binary_expr);
    regAtomic(TokenType.PERCENT, BindingPower.multiplicative, expr.parse_binary_expr);

    regAtomic(TokenType.DOUBLE_EQUAL, BindingPower.relational, expr.parse_binary_expr);
    regAtomic(TokenType.EXCLAMATION_EQUAL, BindingPower.relational, expr.parse_binary_expr);
    regAtomic(TokenType.GREATER, BindingPower.relational, expr.parse_binary_expr);
    regAtomic(TokenType.GREATER_EQUAL, BindingPower.relational, expr.parse_binary_expr);
    regAtomic(TokenType.LESS, BindingPower.relational, expr.parse_binary_expr);
    regAtomic(TokenType.LESS_EQUAL, BindingPower.relational, expr.parse_binary_expr);

    regAtomic(TokenType.PLUS_EQUAL, BindingPower.additive, expr.parse_binary_assignment_expr);
    regAtomic(TokenType.MINUS_EQUAL, BindingPower.additive, expr.parse_binary_assignment_expr);
    regAtomic(TokenType.STAR_EQUAL, BindingPower.multiplicative, expr.parse_binary_assignment_expr);
    regAtomic(TokenType.SLASH_EQUAL, BindingPower.multiplicative, expr.parse_binary_assignment_expr);
    regAtomic(TokenType.PERCENT_EQUAL, BindingPower.multiplicative, expr.parse_binary_assignment_expr);

    regAtomic(TokenType.EQUAL, BindingPower.assignment, expr.parse_assignment_expr);

    regAtomic(TokenType.DOUBLE_PLUS, BindingPower.unary, expr.parse_infix_expr);
    regAtomic(TokenType.DOUBLE_MINUS, BindingPower.unary, expr.parse_infix_expr);

    regStmt(TokenType.VAR, stmt.parseVarDecl);
    regStmt(TokenType.CONST, stmt.parseVarDecl);
    regStmt(TokenType.WHILE, stmt.parseWhileStmt);
    regStmt(TokenType.FOR, stmt.parseForStmt);
    regStmt(TokenType.FN, stmt.parseFnDecl);
    regStmt(TokenType.PUB, stmt.parsePubExp);
    regStmt(TokenType.IMPORT, stmt.parseImportExpr);
    regStmt(TokenType.IF, stmt.parseIfStmt);
    regStmt(TokenType.STRUCT, stmt.parseStructDecl);
    regStmt(TokenType.ENUM, stmt.parseEnumDecl);
}
