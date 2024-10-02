import {Grammar} from "@specy/dotlr";


export const DOTLR_TYPES_STRING = `
declare type FirstTable<T extends Token = Token> = Map<string, T[]>;

declare type FollowTable<T extends Token = Token> = Map<string, T[]>;

declare type GoToTable<NT extends string = string> = Map<NT, number>[];

declare type ActionTable<T extends Token = Token> = Map<T, Action[]>[];

declare type ParsingTables<NT extends string = string, T extends Token = Token> = {
    action_table: ActionTable<T>;
    goto_table: GoToTable<NT>;
};

declare type Tree<NT extends string = string, T extends Token = Token> = {
    type: 'Terminal';
    value: {
        token: T;
        slice: string;
        span: Span;
    };
} | {
    type: 'NonTerminal';
    value: {
        symbol: NT;
        pattern: Tree<NT, T>[];
    };
};

declare type Token<C = string, R = string> = {
    type: 'Constant';
    value: C;
} | {
    type: 'Regex';
    value: R;
} | {
    type: 'Eof';
};

declare type _Grammar = any
declare class Grammar<
    T extends string = string, 
    NT extends string = string, 
    R extends string = string
> {
    grammar: _Grammar;
    private cache;
    private constructor();
    static parse<T extends string = string, NT extends string = string, R extends string = string>(grammar: string): Ok<Grammar<T, NT, R>> | Err<GrammarError>;
    getSymbols(): NT[];
    getConstantTokens(): T[];
    getStartSymbol(): NT;
    getProductions(): Rule<Token<T, R>>[];
    getRegexTokens(): Map<R, string>;
    stringify(): string;
    clone(): Grammar<T, NT, R>;
}

declare type _Parser = any;
class Parser<
    T extends string = string, 
    NT extends string = string, 
    R extends string = string
> {
    private parser;
    private cache;
    constructor(parser: _Parser);
    parse(input: string): Ok<Tree<NT, Token<T, R>>> | Err<ParsingError>;
    getActionTable(): ActionTable<Token<T, R>>;
    getGotoTable(): GoToTable<NT>;
    getParseTables(): ParsingTables<NT, Token<T, R>>;
    getAutomaton(): Automaton<Token<T, R>>;
    getFirstTable(): FirstTable<Token<T, R>>;
    getFollowTable(): FollowTable<Token<T, R>>;
    tokenize(input: string): Err<ParsingError> | Ok<{
        token: Spanned<Token<T, R>>;
        slice: string;
    }[]>;
    trace(input: string): Err<ParsingError> | Ok<{
        trace: Trace<Tree<NT, Token<T, R>>>;
        tree: Tree<NT, Token<T, R>>;
    }>;
}

declare class LR1Parser<
    T extends string = string, 
    NT extends string = string, 
    R extends string = string
> {
    private constructor();
    /**
     * Consumes a grammar and returns a parser, the grammar is consumed 
     * and the ownership is transferred to the parser
     */
    static fromGrammar<G extends Grammar>(grammar: G): Ok<LR1Parser<string, string, string>> | Err<ParserError>;
}

declare class LALR1Parser<
    T extends string = string, 
    NT extends string = string, 
    R extends string = string
> {
    private constructor();
    /**
     * Consumes a grammar and returns a parser, the grammar is consumed 
     * and the ownership is transferred to the parser
     */
    static fromGrammar<G extends Grammar>(grammar: G): Err<ParserError> | Ok<LALR1Parser<string, string, string>>;
}

declare type Rule<T extends Token = Token> = {
    symbol: string;
    pattern: AtomicPattern<T>[];
};

declare type AtomicPattern<T extends Token = Token> = {
    type: 'Symbol';
    value: string;
} | {
    type: 'Token';
    value: T;
};

declare type Trace<Tr extends Tree = Tree> = {
    steps: Step<Tr>[];
};

declare type Step<Tr extends Tree = Tree> = {
    state_stack: number[];
    tree_stack: Tr[];
    remaining_tokens: Tr extends Tree<any, infer T> ? T[] : never;
    action_taken: Action;
};

declare type Item<T extends Token = Token> = {
    rule: Rule<T>;
    dot: number;
    lookahead: T[];
};

declare type State<T extends Token = Token> = {
    id: number;
    items: Item<T>[];
    transitions: Map<AtomicPattern<T>, number>;
};

declare type Automaton<T extends Token = Token> = {
    states: State<T>[];
};

declare type Action = {
    type: 'Shift';
    value: {
        next_state: number;
    };
} | {
    type: 'Reduce';
    value: {
        rule_index: number;
    };
} | {
    type: 'Accept';
    value: {
        rule_index: number;
    };
};

declare type GrammarError = {
    type: "UnexpectedToken";
    value: {
        line: number;
        column: number;
        token: string;
        expected: string[];
    };
} | {
    type: "UnexpectedEof";
    value: {
        expected: string[];
    };
} | {
    type: "InvalidRegex";
    value: {
        line: number;
        column: number;
        regex: string;
    };
};

declare type ParserError<T extends Token = Token> = {
    type: "EmptyGrammar";
} | {
    type: "UndefinedSymbol";
    value: {
        symbol: string;
        rule: Rule<T>;
    };
} | {
    type: "UndefinedRegexToken";
    value: {
        regex_token: string;
        rule: Rule<T>;
    };
} | {
    type: "Conflict";
    parser: {
        grammar: any;
        first_table: any;
        follow_table: any;
        automaton: any;
        parsing_tables: any;
    };
    state: number;
    token: string;
};

declare type ParsingError<T extends Token = Token> = {
    type: "UnknownToken";
    value: {
        token: string;
    };
} | {
    type: "UnexpectedToken";
    value: {
        token: string;
        expected: T[];
    };
} | {
    type: "UnexpectedEof";
    value: {
        expected: T[];
    };
};


declare type Err<T> = {
    ok: false;
    val: T;
} 

declare type Ok<T> = {
    ok: true;
    val: T;
}

declare type Span = {
    offset: number,
    len: number,
    column: number,
    line: number
}

declare type Spanned<T> = {
    span: Span,
    value: T
}

declare type Result<T, E> = Ok<T> | Err<E>

`.trim()

export function getTsGlobal(grammar?: string) {
    const nonTerminals = [] as string[]
    const terminals = [] as string[]
    const regexes = [] as string[]
    if(grammar){
        const g = Grammar.parse(grammar)
        if(g.ok){
            nonTerminals.push(...g.val.getSymbols().map(s => `'${s.replace(/'/g, "\\'")}'`))
            terminals.push(...g.val.getConstantTokens().map(s => `'${s.replace(/'/g, "\\'")}'`))
            regexes.push(...([...g.val.getRegexTokens().keys()].map(s => `'${s.replace(/'/g, "\\'")}'`)))
        }
    }
    return `declare type ThisNonTerminal = ${nonTerminals.join(' | ') || 'string'}

declare type ThisTerminal = ${terminals.join(' | ') || 'string'}

declare type ThisRegex = ${regexes.join(' | ') || 'string'}

declare type ThisToken = Token<ThisTerminal, ThisRegex>

declare type ThisTree = Tree<ThisNonTerminal, ThisToken>

declare type ParseResult = {
    tree: ThisTree
    grammar: Grammar<ThisTerminal, ThisNonTerminal, ThisRegex>
    parser: Parser<ThisTerminal, ThisNonTerminal, ThisRegex>
}

declare function PARSE(text: string): Result<ParseResult, ParsingError | GrammarError | ParserError>

${DOTLR_TYPES_STRING}`
}
