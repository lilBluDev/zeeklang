import { loc } from "../lexer/Tokens.ts";

export enum NodeTypes {
    Program,

    // Statements
    VarDecl,
    StructDecl,
    EnumDecl,
    FunctionDecl,
    WhileStmt,
    ForStmt,
    PublicExp,
    ImportStmt,
    IfStmt,

    // Expressions
    FunctionExpr,
    ComputedExpr,
    MemberExpr,
    PackagePull,
    CallExpr,
    StructInit,
    ArrayInit,
    BinaryExpr,
    PrefixExpr,
    InfixExpr,
    AssignmentExpr,
    BinaryAssignmentExpr,
    BasicLit,
    Ident,
    RangeExpr,
    CatchExpr,
    
    // Misc
    CodeBlock,
    ScopeCapture,

    //Symbol Types
    Symbol,
    MultiSymbol,
    ArraySymbol,
}


export interface Node {
    type: NodeTypes;
    loc: loc;
}

export interface Peram {
    name: string,
    type: Node,
}

export interface nvlPeram {
    name: string,
    type: Node | null,
}

//General Nodes
export interface Program extends Node {
    tag: string;
    type: NodeTypes.Program;
    body: Node[];
}

// Stmts
export interface VarDecl extends Node {
    type: NodeTypes.VarDecl;
    isConst: boolean;
    name: string;
    value: Node | null;
    ty: Node | null;
}

export interface FunctionDecl extends Node {
    type: NodeTypes.FunctionDecl,
    name: string,
    params: Peram[],
    outType: Node | null,
    body: Node,
}

export interface PublicExp extends Node {
    type: NodeTypes.PublicExp,
    exported: Node,
}

export interface ImportStmt extends Node {
    imported: string[]
}

export interface IfStmt extends Node {
    type: NodeTypes.IfStmt,
    condition: Node,
    body: Node,
    scopeCapture: Node | null,
    alternitive: Node | null,
}

export interface StructDecl extends Node {
    type: NodeTypes.StructDecl,
    name: string,
    children: Peram[],
}

export interface EnumDecl extends Node {
    type: NodeTypes.EnumDecl,
    name: string,
    children: string[],
}

export interface WhileStmt extends Node {
    type: NodeTypes.WhileStmt,
    condition: Node,
    body: Node,
}

export interface ForStmt extends Node {
    type: NodeTypes.ForStmt,
    condition: Node,
    capture: Node,
    body: Node,
}

// Exprs
export interface FunctionExpr extends Node {
    type: NodeTypes.FunctionExpr,
    params: Peram[],
    outType: Node | null,
    body: Node,
}

export interface ComputedExpr extends Node {
    type: NodeTypes.ComputedExpr,
    Member: Node,
    Property: Node,
}

export interface MemberExpr extends Node {
    type: NodeTypes.MemberExpr,
    Member: Node,
    Property: string,
}

export interface PackagePull extends Node {
    type: NodeTypes.PackagePull,
    package: Node,
    content: Node,
}

export interface CallExpr extends Node {
    type: NodeTypes.CallExpr,
    Method: Node,
    args: Node[]
}

export interface StructInit extends Node {
    type: NodeTypes.StructInit,
    instantiate: Node,
    params: nvlPeram[]
}

export interface ArrayInit extends Node {
    type: NodeTypes.ArrayInit,
    children: Node[]
}

export interface BinaryExpr extends Node {
    type: NodeTypes.BinaryExpr;
    left: Node;
    operator: string;
    right: Node;
}

export interface PrefixExpr extends Node {
    type: NodeTypes.PrefixExpr,
    op: string,
    value: Node,
}

export interface InfixExpr extends Node {
    type: NodeTypes.InfixExpr,
    op: string,
    left: Node,
}

export interface AssignmentExpr extends Node {
    type: NodeTypes.AssignmentExpr,
    left: Node,
    right: Node,
}

export interface BinarayAssignmentExpr extends Node {
    type: NodeTypes.BinaryAssignmentExpr,
    left: Node,
    op: string,
    right: Node,
}

export interface BasicLit extends Node {
    type: NodeTypes.BasicLit;
    value: string;
    typeName: 'string' | 'fmtStr' | 'int' | 'float' | 'boolean' | 'nil' | 'udef';
}

export interface Ident extends Node {
    type: NodeTypes.Ident;
    name: string;
}

export interface RangeExpr extends Node {
    type: NodeTypes.RangeExpr,
    min: Node,
    max: Node,
}

export interface CatchExpr extends Node {
    type: NodeTypes.CatchExpr,
    left: Node,
    right: Node
}

// Misc
export interface CodeBlock extends Node {
    type: NodeTypes.CodeBlock,
    body: Node[]
}

export interface ScopeCapture extends Node {
    type: NodeTypes.ScopeCapture,
    capture: string[]
}

// Symbol Types
export interface Symbol extends Node {
    type: NodeTypes.Symbol;
    name: string;
}

export interface MultiSymbol extends Node {
    type: NodeTypes.MultiSymbol;
    symbols: Node[];
}

export interface ArraySymbol extends Node {
    type: NodeTypes.ArraySymbol;
    symbol: Node;
    limit: number;
}


///////////////// AST HELPERS /////////////////

export function mkProgram(tag: string): Program {
    return {
        tag: tag,
        type: NodeTypes.Program,
        loc: {
            line: 0,
            col: 0,
            end_line: 0,
            end_col: 0,
        },
        body: [],
    };
}