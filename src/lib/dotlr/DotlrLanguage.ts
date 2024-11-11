import {editor, type IDisposable, languages, Position, Range} from 'monaco-editor'
import { Grammar } from '@specy/dotlr';
import {stringifyGrammarError} from "$lib/dotlr/dotlrUtils";


export const DotlrLanguage = {
    defaultToken: 'invalid',
    ignoreCase: true,
    tokenPostfix: '.dotlr',
    // The main tokenizer for our language
    tokenizer: {
        root: [
            // Non-terminal symbols (any uppercase word)
            [/[A-Z][A-Za-z0-9]*/, {
                cases: {
                    '$S2==start': 'productionHead',
                    '@default': 'nonTerminal'
                }
            }],

            // Production arrow
            [/->/, 'productionArrow', '@production'],

            // Terminal symbols (surrounded by single quotes)
            [/'[^']*'/, 'terminal'],

            // Special symbols (starting with %)
            [/%[a-z][A-Za-z0-9]*/, 'special'],

            // Regular expressions
            [/\/.*?\//, 'regexp'],

            // Whitespace
            [/\s+/, {cases: {'@eos': {token: 'white', next: '@start'}, '@default': 'white'}}],
        ],

        production: [
            [/\n/, 'white', '@start'],
            {include: '@root'}
        ],

        start: [
            [/[A-Z][A-Za-z0-9]*/, 'productionHead', '@root'],
            {include: '@root'}
        ]
    },

}


export function createDotlrFormatter() {
    return {
        provideDocumentFormattingEdits: (model: editor.ITextModel) => {
            const text = model.getValue()
            const grammar = Grammar.parse(text)
            if (grammar.isOk()) {
                return [{
                    range: model.getFullModelRange(),
                    text: grammar.value.stringify().replace('ε', `''`)
                }]
            } else {
                return [{
                    range: model.getFullModelRange(),
                    text: text
                }]
            }
        }
    }
}


export function createDotlrHoverProvider() {
    return {
        provideHover: (model: editor.ITextModel, position: Position) => {
            const text = model.getValue()
            const word = model.getWordAtPosition(position)
            const pos = new Position(position.lineNumber, word?.startColumn ?? position.column)
            const offset = model.getOffsetAt(pos)
            const preciseOffset = model.getOffsetAt(position)
            const range = new Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column + (word?.word.length ?? 0))

            return {
                range,
                contents: []
            }
        }
    }
}



export function createDotlrRuntimeDiagnostics(model: editor.ITextModel) {
    const disposable: IDisposable[] = []
    disposable.push(model.onDidChangeContent(() => {
        const text = model.getValue()
        const grammar = Grammar.parse(text)
        const markers = []
        if (grammar.err) {
            const e = grammar.val
            if (e.type === "UnexpectedToken") {
                markers.push({
                    startLineNumber: e.value.line,
                    startColumn: e.value.column,
                    endLineNumber: e.value.line,
                    endColumn: e.value.column + 1,
                    message: stringifyGrammarError(e)
                })
            } else if (e.type === "UnexpectedEof") {
                //end of the input
                const position = model.getPositionAt(model.getValueLength())
                markers.push({
                    startLineNumber: position.lineNumber,
                    startColumn: position.column,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                    message: stringifyGrammarError(e)
                })
            } else if (e.type === 'InvalidRegex') {
                const startPosition = model.getWordAtPosition(new Position(e.value.line, e.value.column))
                markers.push({
                    startLineNumber: e.value.line,
                    startColumn: startPosition?.startColumn ?? e.value.column,
                    endLineNumber: e.value.line,
                    endColumn: startPosition?.endColumn ?? e.value.column,
                    message: stringifyGrammarError(e)
                })
            }
        }

        editor.setModelMarkers(model, 'dotlr', markers)
    }))
    return {
        dispose() {
            disposable.forEach(d => d.dispose())
        }
    }
}




export function createDotlrCompletion() {
    return {
        triggerCharacters: [' ', '%'],
        provideCompletionItems: (model: editor.ITextModel, position: Position) => {
            const word = model.getWordUntilPosition(position)
            const text = model.getValue()
            const line = model.getLineContent(position.lineNumber)
            const arrowPosition = line.indexOf('->') === -1 ? Infinity : line.indexOf('->') + 2
            const isRightOfArrow = position.column > arrowPosition
            if(!isRightOfArrow) return {suggestions: []}
            const nonTerminals = new Set(text.split('\n')
                .filter(l => l.includes('->'))
                .map(l => l.split('->')[0].trim()))
            const suggestions = [...nonTerminals.values()].map(label => {
                return {
                    label,
                    kind: languages.CompletionItemKind.Method,
                    insertText: label,
                    range: {
                        startLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endLineNumber: position.lineNumber,
                        endColumn: word.endColumn
                    }
                }
            })
            return {
                suggestions
            }
        }
    } satisfies languages.CompletionItemProvider
}