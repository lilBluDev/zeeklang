export enum TokenType {
    EOF,
    UNKNOWN,

    // Ident & Literals
    IDENTIFIER,
    STRING,
    FORMAT_STR,
    INTEGER,
    FLOAT,
    BOOL,
    NIL,
    UDEF,

    // SingleOperators
    PLUS,
    MINUS,
    STAR,
    SLASH,
    PERCENT,
    CARET,
    AMPERSAND,
    PIPE,
    TILDE,
    EQUAL,
    EXCLAMATION,
    GREATER,
    LESS,
    COMMA,
    COLON,
    SEMICOLON,
    DOT,
    QUESTION,
    
    // DoubleOperators
    DOUBLE_DOT,
    DOUBLE_EQUAL,
    DOUBLE_EXCLAMATION,
    DOUBLE_GREATER,
    DOUBLE_LESS,
    DOUBLE_PIPE,
    DOUBLE_PLUS,
    DOUBLE_MINUS,
    DOUBLE_STAR,
    EXCLAMATION_EQUAL,
    PLUS_EQUAL,
    MINUS_EQUAL,
    SLASH_EQUAL,
    STAR_EQUAL,
    PERCENT_EQUAL,
    LESS_EQUAL,
    GREATER_EQUAL,
    WALRUS,
    RIGHT_ARROW,

    // Groupings
    LPAREN,
    RPAREN,
    LBRACE,
    RBRACE,
    LBRACKET,
    RBRACKET,

    // Reserved Keywords
    VAR,
    CONST,
    FN,
    STRUCT,
    ENUM,
    PUB,
    IMPORT,
    IF,
    ELIF,
    ELSE,
    FOR,
    WHILE,
    BREAK,
    CONTINUE,
    AND,
    OR,
    CATCH,
    TRUE,
    FALSE
}

export const keyword_lu: Map<string, TokenType> = new Map([
    ["var", TokenType.VAR],
    ["const", TokenType.CONST],
    ["fn", TokenType.FN],
    ["struct", TokenType.STRUCT],
    ["enum", TokenType.ENUM],
    ["pub", TokenType.PUB],
    ["import", TokenType.IMPORT],
    ["if", TokenType.IF],
    ["elif", TokenType.ELIF],
    ["else", TokenType.ELSE],
    ["for", TokenType.FOR],
    ["while", TokenType.WHILE],
    ["and", TokenType.AND],
    ["or", TokenType.OR],
    ["catch", TokenType.CATCH],
    ["break", TokenType.BREAK],
    ["continue", TokenType.CONTINUE],
    ["true", TokenType.TRUE],
    ["false", TokenType.FALSE],
    ["nil", TokenType.NIL],
    ["udef", TokenType.UDEF]
]);

export const single_operator_lu: Map<string, TokenType> = new Map([
    ["+", TokenType.PLUS],
    ["-", TokenType.MINUS],
    ["*", TokenType.STAR],
    ["/", TokenType.SLASH],
    ["%", TokenType.PERCENT],
    ["^", TokenType.CARET],
    ["&", TokenType.AMPERSAND],
    ["|", TokenType.PIPE],
    ["~", TokenType.TILDE],
    ["=", TokenType.EQUAL],
    ["!", TokenType.EXCLAMATION],
    [">", TokenType.GREATER],
    ["<", TokenType.LESS],
    [",", TokenType.COMMA],
    [":", TokenType.COLON],
    [";", TokenType.SEMICOLON],
    [".", TokenType.DOT],
    ["?", TokenType.QUESTION],

    // Groupings
    ["(", TokenType.LPAREN],
    [")", TokenType.RPAREN],
    ["{", TokenType.LBRACE],
    ["}", TokenType.RBRACE],
    ["[", TokenType.LBRACKET],
    ["]", TokenType.RBRACKET],
]);

export const double_operator_lu: Map<string, TokenType> = new Map([
    ["==", TokenType.DOUBLE_EQUAL],
    ["..", TokenType.DOUBLE_DOT],
    ["!!", TokenType.DOUBLE_EXCLAMATION],
    [">>", TokenType.DOUBLE_GREATER],
    ["<<", TokenType.DOUBLE_LESS],
    ["||", TokenType.DOUBLE_PIPE],
    ["++", TokenType.DOUBLE_PLUS],
    ["--", TokenType.DOUBLE_MINUS],
    ["**", TokenType.DOUBLE_STAR],
    ["&&", TokenType.AND],
    ["!=", TokenType.EXCLAMATION_EQUAL],
    ["+=", TokenType.PLUS_EQUAL],
    ["-=", TokenType.MINUS_EQUAL],
    ["/=", TokenType.SLASH_EQUAL],
    ["*=", TokenType.STAR_EQUAL],
    ["%=", TokenType.PERCENT_EQUAL],
    ["<=", TokenType.LESS_EQUAL],
    [">=", TokenType.GREATER_EQUAL],
    [":=", TokenType.WALRUS],
    ["->", TokenType.RIGHT_ARROW],
])

export function TokenTypeToSTR(tt: TokenType): string {
    switch (tt) {
        case TokenType.EOF:
            return "EOF";
        case TokenType.UNKNOWN:
            return "UNKNOWN";
        case TokenType.IDENTIFIER:
            return "IDENTIFIER";
        case TokenType.STRING:
            return "STRING";
        case TokenType.FORMAT_STR:
            return "FORMAT_STRING"
        case TokenType.INTEGER:
            return "INTEGER";
        case TokenType.FLOAT:
            return "FLOAT";
        case TokenType.BOOL:
            return "BOOL";
        case TokenType.NIL:
            return "NIL";
        case TokenType.UDEF:
            return "UDEF";
        case TokenType.PLUS:
            return "PLUS";
        case TokenType.MINUS:
            return "MINUS";
        case TokenType.STAR:
            return "STAR";
        case TokenType.SLASH:
            return "SLASH";
        case TokenType.PERCENT:
            return "PERCENT";
        case TokenType.CARET:
            return "CARET";
        case TokenType.AMPERSAND:
            return "AMPERSAND";
        case TokenType.PIPE:
            return "PIPE";
        case TokenType.TILDE:
            return "TILDE";
        case TokenType.EQUAL:
            return "EQUAL";
        case TokenType.EXCLAMATION:
            return "EXCLAMATION";
        case TokenType.GREATER:
            return "GREATER";
        case TokenType.LESS:
            return "LESS";
        case TokenType.COMMA:
            return "COMMA";
        case TokenType.COLON:
            return "COLON";
        case TokenType.SEMICOLON:
            return "SEMICOLON";
        case TokenType.DOT:
            return "DOT";
        case TokenType.QUESTION:
            return "QUESTION";
        case TokenType.DOUBLE_EQUAL:
            return "DOUBLE_EQUAL";
        case TokenType.DOUBLE_DOT:
            return "DOUBLE_DOT";
        case TokenType.DOUBLE_EXCLAMATION:
            return "DOUBLE_EXCLAMATION";
        case TokenType.DOUBLE_GREATER:
            return "DOUBLE_GREATER";
        case TokenType.DOUBLE_LESS:
            return "DOUBLE_LESS";
        case TokenType.DOUBLE_PIPE:
            return "DOUBLE_PIPE";
        case TokenType.DOUBLE_PLUS:
            return "DOUBLE_PLUS";
        case TokenType.DOUBLE_MINUS:
            return "DOUBLE_MINUS";
        case TokenType.DOUBLE_STAR:
            return "DOUBLE_STAR";
        case TokenType.EXCLAMATION_EQUAL:
            return "EXCLAMATION_EQUAL";
        case TokenType.PLUS_EQUAL:
            return "PLUS_EQUAL";
        case TokenType.MINUS_EQUAL:
            return "MINUS_EQUAL";
        case TokenType.SLASH_EQUAL:
            return "SLASH_EQUAL";
        case TokenType.PERCENT_EQUAL:
            return "PERCENT_EQUAL";
        case TokenType.STAR_EQUAL:
            return "STAR_EQUAL";
        case TokenType.LESS_EQUAL:
            return "LESS_EQUAL";
        case TokenType.GREATER_EQUAL:
            return "GREATER_EQUAL";
        case TokenType.WALRUS:
            return "WALRUS"
        case TokenType.RIGHT_ARROW:
            return "RIGHT_ARROW"
        // Groupings
        case TokenType.LPAREN:
            return "LPAREN";
        case TokenType.RPAREN:
            return "RPAREN";
        case TokenType.LBRACE:
            return "LBRACE";
        case TokenType.RBRACE:
            return "RBRACE";
        case TokenType.LBRACKET:
            return "LBRACKET";
        case TokenType.RBRACKET:
            return "RBRACKET";
        // Reserved Keywords
        case TokenType.VAR:
            return "VAR";
        case TokenType.CONST:
            return "CONST";
        case TokenType.FN:
            return "FN";
        case TokenType.STRUCT:
            return "STRUCT";
        case TokenType.ENUM:
            return "ENUM"
        case TokenType.PUB:
            return "PUB";
        case TokenType.IMPORT:
            return "IMPORT"
        case TokenType.IF:
            return "IF";
        case TokenType.ELIF:
            return "ELIF";
        case TokenType.ELSE:
            return "ELSE";
        case TokenType.FOR:
            return "FOR";
        case TokenType.WHILE:
            return "WHILE";
        case TokenType.AND:
            return "AND";
        case TokenType.OR:
            return "OR";
        case TokenType.CATCH:
            return "CATCH";
        case TokenType.BREAK:
            return "BREAK";
        case TokenType.CONTINUE:
            return "CONTINUE";
        case TokenType.TRUE:
            return "TRUE";
        case TokenType.FALSE:
            return "FALSE";
        default:
            return "...";
    }
}

export interface loc {
    line: number;
    col: number;
    end_line: number;
    end_col: number;
}

export interface Token {
    type: TokenType;
    value: string;
    loc: loc;
}
