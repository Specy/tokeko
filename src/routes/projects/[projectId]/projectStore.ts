import {type Project} from "$stores/userProjectsStore";
import {get, writable} from "svelte/store";
import {Grammar, LALRParser, LR1Parser} from '@specy/dotlr'
import type {GrammarError, ParserError, ParsingError, Trace, Tree} from '@specy/dotlr/types'
import {Monaco} from "$lib/Monaco";
import {type ConsoleOutput, runSandboxedCode} from "$lib/sandbox";
import {stringifyError} from "$lib/dotlr/dotlrUtils";


export const PARSER_TYPES = ['LR1', 'LALR'] as const
export type ParserType = typeof PARSER_TYPES[number]
type Parser = LR1Parser | LALRParser

type SomeError = ParsingError | GrammarError | ParserError
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
        error: ParsingError | GrammarError | ParserError
        grammar?: Grammar,
        parser?: Parser,
        result?: Tree
        trace?: Trace
    }
}

function createParser(type: ParserType, grammar: Grammar) {
    if (type === "LR1") {
        return LR1Parser.fromGrammar(grammar)
    } else if (type === 'LALR') {
        return LALRParser.fromGrammar(grammar)
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
            const grammarParser = Grammar.fromGrammar(grammar)
            const type = get({subscribe}).parserType
            if (!grammarParser.ok) {
                s.result = {
                    type: 'error',
                    error: grammarParser.val as GrammarError,
                }
                return s
            }
            const grammarClone = grammarParser.val.clone()
            const parser = createParser(type, grammarParser.val)
            if (!parser.ok) {
                s.result = {
                    type: 'error',
                    error: parser.val as ParserError,
                    grammar: grammarClone
                }
                return s
            }
            s.result = {
                type: 'prepare',
                grammar: grammarClone,
                parser: parser.val
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
            if (!result.ok) {
                s.result = {
                    type: 'error',
                    error: result.val as ParsingError,
                    grammar: s.result.grammar,
                    parser: parser
                }
                return s
            }
            s.result = {
                grammar: s.result.grammar,
                parser: parser,
                type: 'parse',
                result: result.val.tree,
                trace: result.val.trace
            }
            return s;
        })
    }


    async function executeTypescript(code: string) {
        const current = get({subscribe})
        const grammar = current.grammar
        const grammarParser = Grammar.fromGrammar(grammar)
        if (!grammarParser.ok) return errorToConsoleOutput(grammarParser.val as SomeError)
        const parser = createParser(current.parserType, grammarParser.val)
        if (!parser.ok) return errorToConsoleOutput(parser.val as SomeError)
        const stripTs = await Monaco.typescriptToJavascript(code)
        return await runSandboxedCode(
            stripTs, {
                PARSE: (code: string) => {
                    const res = parser.val.parse(code)
                    return {
                        ok: res.ok,
                        val: res.val
                    }
                }
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


function errorToConsoleOutput(error: SomeError) {
    return {
        consoleOutput: [
            {type: 'error', args: [stringifyError(error)]}
        ] as ConsoleOutput[]
    }
}