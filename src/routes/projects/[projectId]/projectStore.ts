import {type Project} from "$stores/userProjectsStore";
import {get, writable} from "svelte/store";
import {Grammar, LALRParser, LR1Parser} from '@specy/dotlr'
import type { Tree } from '@specy/dotlr/types'

type ProjectStoreData = {
    grammar: string,
    content: string,
    result?: {
        type: 'prepare',
        grammar: Grammar,
        parser: LR1Parser,
    } | {
        type: 'parse',
        grammar: Grammar,
        parser: LR1Parser,
        result: Tree
    } | {
        type: 'error',
        error: string
        grammar?: Grammar,
        parser?: LR1Parser,
        result?: Tree
    }
}

export function createCompilerStore(project: Project) {
    const {subscribe, update, set} = writable<ProjectStoreData>({
        grammar: project.grammar,
        content: project.content,
    })

    function parseGrammar(_grammar?: string) {
        update(s => {
            const grammar = _grammar ?? get({subscribe}).grammar
            const grammarParser = Grammar.fromGrammar(grammar)
            if (!grammarParser.ok) {
                s.result = {
                    type: 'error',
                    error: JSON.stringify(grammarParser.val, null, 2)
                }
                return s
            }
            const grammarClone = grammarParser.val.clone()
            const parser = LALRParser.fromGrammar(grammarParser.val)
            if (!parser.ok) {
                s.result = {
                    type: 'error',
                    error: JSON.stringify(parser.val, null, 2),
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
            const result = parser.parse(content)
            if (!result.ok) {
                s.result = {
                    type: 'error',
                    error: JSON.stringify(result.val, null, 2),
                    grammar: s.result.grammar,
                    parser: parser
                }
                return s
            }
            s.result = {
                grammar: s.result.grammar,
                parser: parser,
                type: 'parse',
                result: result.val
            }
            return s;
        })
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
        set: (data: ProjectStoreData) => {
            set(data)
        }
    }
}

