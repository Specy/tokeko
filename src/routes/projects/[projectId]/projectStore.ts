import {type Project} from "$stores/userProjectsStore";
import {writable} from "svelte/store";
import {Grammar, LALRParser, LR1Parser} from '@specy/dotlr'
import type {Tree} from "@specy/dotlr/dist/types";

type ProjectStoreData = {
    grammar: string,
    content: string,
    result?: {
        ok: boolean,
        grammar: Grammar,
        parser: LR1Parser | LALRParser,
        result: Tree
    } | {
        ok: false
        error: string
    }
}

export function createCompilerStore(project: Project) {
    const {subscribe, update, set} = writable<ProjectStoreData>({
        grammar: project.grammar,
        content: project.content,
    })

    function run(override?: { grammar?: string, content?: string }) {
        update(s => {
            const grammar = override?.grammar || s.grammar;
            const content = override?.content || s.content;
            const grammarParser = Grammar.fromGrammar(grammar)
            if (!grammarParser.ok) {
                s.result = {
                    ok: false,
                    error: JSON.stringify(grammarParser.val)
                }
                return s
            }
            const parser = LALRParser.fromGrammar(grammarParser.val)
            if (!parser.ok) {
                s.result = {
                    ok: false,
                    error: JSON.stringify(parser.val)
                }
                return s
            }
            const result = parser.val.parse(content)
            if(!result.ok){
                s.result = {
                    ok: false,
                    error: JSON.stringify(result.val)
                }
                return s
            }
            s.result = {
                ok: true,
                grammar: grammarParser.val,
                parser: parser.val,
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
        run,
        reset,
        set: (data: ProjectStoreData) => {
            set(data)
        }
    }
}

