import {Grammar} from "@specy/dotlr";

export const DOTLR_TYPES_STRING = `

declare type Err<T> = {
    ok: false;
    val: T;
} 
declare type Ok<T> = {
    ok: true;
    val: T;
}
declare type Result<T, E> = Ok<T> | Err<E>

declare type Tree<NT = string, T = Token> = {
    type: 'Terminal'
    value: {
        token: T,
        slice: string
    }
} | {
    type: 'NonTerminal'
    value: {
        symbol: NT,
        pattern: Tree<NT, T>[]
    }
}

declare type Token<C = string, R = string> = {
    type: 'Constant'
    value: C
} | {
    type: 'Regex',
    value: R
} | {
    type: 'Eof'
}

declare type Rule = {
    symbol: string;
    pattern: AtomicPattern[];
};
declare type AtomicPattern = {
    type: 'Symbol';
    value: string;
} | {
    type: 'Token';
    value: Token;
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
declare type ParserError = {
    type: "EmptyGrammar";
} | {
    type: "UndefinedSymbol";
    value: {
        symbol: string;
        rule: Rule;
    };
} | {
    type: "UndefinedRegexToken";
    value: {
        regex_token: string;
        rule: Rule;
    };
} | {
    type: "Conflict";
    state: number;
    token: string;
};
declare type ParsingError = {
    type: "UnknownToken";
    value: {
        token: string;
    };
} | {
    type: "UnexpectedToken";
    value: {
        token: string;
        expected: Token[];
    };
} | {
    type: "UnexpectedEof";
    value: {
        expected: Token[];
    };
};

declare type Trace = {
    steps: Step[];
};
declare type Step = {
    state_stack: number[];
    tree_stack: Tree[];
    remaining_tokens: Token[];
    action_taken: Action;
};
declare type Item = {
    rule: Rule;
    dot: number;
    lookahead: Token[];
};
declare type State = {
    id: number;
    items: Item[];
    transitions: Map<AtomicPattern, number>;
};
declare type Automaton = {
    states: State[];
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
declare type FirstTable = Map<string, Token[]>;
declare type FollowTable = FirstTable;
declare type GoToTable = Map<string, number>[];
declare type ActionTable = Map<Token, Action[]>[];
declare type ParsingTables = {
    action_table: ActionTable;
    goto_table: GoToTable;
};

declare class Grammar {

    private constructor();

    static parse(grammar: string): Ok<Grammar> | Err<GrammarError>;

    getSymbols(): string[];

    getConstantTokens(): string[];

    getStartSymbol(): string;

    getProductions(): Rule[];

    getRegexTokens(): Map<string, string>;

    stringify(): string;

    clone(): Grammar;
}

class Parser {
    parse(input: string): Ok<Tree> | Err<ParsingError>;

    getActionTable(): ActionTable;

    getGotoTable(): GoToTable;

    getParseTables(): ParsingTables;

    getAutomaton(): Automaton;

    getFirstTable(): FirstTable;

    getFollowTable(): FirstTable;

    tokenize(input: string): Err<ParsingError> | Ok<{
        token: Token;
        slice: string;
    }[]>;

    trace(input: string): Err<ParsingError> | Ok<{
        trace: Trace;
        tree: Tree;
    }>;
}

declare class LR1Parser extends Parser {
    private constructor();

    /**
     * Consumes a grammar and returns a parser, the grammar is 
     * consumed and the ownership is transferred to the parser
     */
    static fromGrammar(grammar: Grammar): Ok<LR1Parser> | Err<ParserError>;
}

declare class LALR1Parser extends Parser {
    private constructor();

    /**
     * Consumes a grammar and returns a parser, the grammar is 
     * consumed and the ownership is transferred to the parser
     */
    static fromGrammar(grammar: Grammar): Err<ParserError> | Ok<LALR1Parser>;
}
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
    return `${DOTLR_TYPES_STRING}
    declare type ThisNonTerminal = ${nonTerminals.join(' | ') || 'string'}
    declare type ThisTerminal = ${terminals.join(' | ') || 'string'}
    declare type ThisRegex = ${regexes.join(' | ') || 'string'}
    declare type ThisToken = Token<ThisTerminal, ThisRegex>
    declare type ThisTree = Tree<ThisNonTerminal, ThisToken>
    declare function PARSE(text: string): Result<ThisTree, ParsingError | GrammarError | ParserError>`
}