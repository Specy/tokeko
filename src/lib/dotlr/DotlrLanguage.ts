import {editor, type IDisposable, languages, Position, Range} from 'monaco-editor'


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
            return [{
                range: model.getFullModelRange(),
                text: text
            }]
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
        const markers = [] as editor.IMarkerData[]
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
        provideCompletionItems: (model: editor.ITextModel, position: Position) => {
            const word = model.getWordUntilPosition(position)
            return {
                suggestions: []
            }
        }
    } satisfies languages.CompletionItemProvider
}