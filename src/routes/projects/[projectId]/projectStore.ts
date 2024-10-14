import {type Project} from "$stores/userProjectsStore";
import {get, writable} from "svelte/store";
import {Grammar, LALR1Parser, LR1Parser} from '@specy/dotlr'
import type {GrammarError, ParserError, ParsingError, Trace, Tree} from '@specy/dotlr/types'
import {Monaco} from "$lib/Monaco";
import {type ConsoleOutput, runSandboxedCode} from "$lib/sandbox";
import {
    stringifyGrammarError,
    stringifyParserError,
    stringifyParsingError
} from '$lib/dotlr/dotlrUtils';
export const PARSER_TYPES = ['LR1', 'LALR'] as const
export type ParserType = typeof PARSER_TYPES[number]
type Parser = LR1Parser | LALR1Parser

type ProjectStoreData = {
    grammar: string,
    content: string,
    parserType: ParserType,
    result?: {
        type: 'prepare',
        grammar: Grammar,
        parser: Parser,
    } | {
        type: 'parse',
        grammar: Grammar,
        parser: Parser,
        result: Tree
        trace: Trace
    } | {
        type: 'error',
        error: GenericError
        grammar?: Grammar,
        parser?: Parser,
        result?: Tree
        trace?: Trace
    }
}

type GenericError = {
    type: 'ParsingError',
    error: ParsingError
} | {
    type: 'GrammarError',
    error: GrammarError
} | {
    type: 'ParserError',
    error: ParserError
}
function createParser(type: ParserType, grammar: Grammar) {
    if (type === "LR1") {
        return LR1Parser.fromGrammar(grammar)
    } else if (type === 'LALR') {
        return LALR1Parser.fromGrammar(grammar)
    }
}

export function createCompilerStore(project: Project) {
    const {subscribe, update, set} = writable<ProjectStoreData>({
        grammar: project.grammar,
        content: project.content,
        parserType: "LR1",

    })

    function parseGrammar(_grammar?: string) {
        update(s => {
            const grammar = _grammar ?? get({subscribe}).grammar
            const grammarParser = Grammar.parse(grammar)
            const type = get({subscribe}).parserType
            if (grammarParser.isErr()) {
                s.result = {
                    type: 'error',
                    error: {
                        type: 'GrammarError',
                        error: grammarParser.error
                    },
                }
                return s
            }
            const grammarClone = grammarParser.value.clone()
            const parser = createParser(type, grammarParser.value)
            if (parser.isErr()) {
                s.result = {
                    type: 'error',
                    error: {
                        type: 'ParserError',
                        error: parser.error
                    },
                    grammar: grammarClone,
                    parser: parser.error.type === 'Conflict' ? parser.error.value.parser : undefined
                }
                return s
            }
            s.result = {
                type: 'prepare',
                grammar: grammarClone,
                parser: parser.value
            }
            return s;
        })
    }


    function parseString(override?: { grammar?: string, content?: string }) {
        parseGrammar(override?.grammar || get({subscribe}).grammar)
        update(s => {
            const content = override?.content || s.content
            if (s.result.type === 'error') {
                return s
            }
            const parser = s.result.parser
            const result = parser.trace(content)
            if (result.isErr()) {
                s.result = {
                    type: 'error',
                    error: {
                        type: 'ParsingError',
                        error: result.error
                    },
                    grammar: s.result.grammar,
                    parser: parser
                }
                return s
            }
            s.result = {
                grammar: s.result.grammar,
                parser: parser,
                type: 'parse',
                result: result.value.tree,
                trace: result.value.trace
            }
            return s;
        })
    }


    async function executeTypescript(code: string) {
        const current = get({subscribe})
        const grammar = current.grammar
        const grammarParser = Grammar.parse(grammar)
        if (grammarParser.isErr()) return errorToConsoleOutput({
            type: 'GrammarError',
            error: grammarParser.error
        })
        const parser = createParser(current.parserType, grammarParser.value)
        if (parser.isErr()) return errorToConsoleOutput({
            type: 'ParserError',
            error: parser.error
        })
        const stripTs = await Monaco.typescriptToJavascript(code)
        return await runSandboxedCode(
            stripTs, {
                PARSE: (code: string) => {
                    const res = parser.value.parse(code)
                    if(res.isErr()) return {
                        ok: false,
                        val: {
                            error: res.error
                        }
                    }
                    return {
                        ok: true,
                        val: {
                            tree: res.value,
                            parser: parser.value,
                            grammar: grammarParser.value
                        }
                    }
                },
                Grammar,
                LALR1Parser,
                LR1Parser,
            }
        )
    }

    function reset() {
        update(s => {
            s.result = undefined;
            return s;
        })

    }

    return {
        subscribe,
        parseString,
        parseGrammar,
        reset,
        executeTypescript,
        set: (data: ProjectStoreData) => {
            set(data)
        }
    }
}


function errorToConsoleOutput(error: GenericError) {
    return {
        consoleOutput: [
            {type: 'error', args: [stringifyGenericError(error)]}
        ] as ConsoleOutput[]
    }
}

export function stringifyGenericError(error: GenericError) {
    switch (error.type) {
        case 'ParsingError':
            return stringifyParsingError(error.error)
        case 'GrammarError':
            return stringifyGrammarError(error.error)
        case 'ParserError':
            return stringifyParserError(error.error)
    }
}