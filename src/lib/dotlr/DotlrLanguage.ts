import {editor, type IDisposable, languages, Position, Range} from 'monaco-editor'


export const DotlrLanguage = {
    defaultToken: 'invalid',
    ignoreCase: true,
    tokenPostfix: '.Dotlr',
    keywords: [],
    literals: ["true", "false"],
    operators: ["%", "->", "'"],
    symbols: /[=><!~?:&|+\-*\/\^%']+/,
    digits: /\d+(_+\d+)*/,
    tokenizer: {
        root: [
            {include: '@common'},
        ],
        digits_matcher: [
            [/(@digits)[eE]([\-+]?(@digits))?[fFdD]?/, 'number.float'],
            [/(@digits)\.(@digits)([eE][\-+]?(@digits))?[fFdD]?/, 'number.float'],
            [/(@digits)[fFdD]/, 'number.float'],
            [/(@digits)[lL]?/, 'number'],
        ],
        common: [
            //TODO not sure why i need to do this
            [/s\.t\./, 'keyword'],
            [/([a-z$][\w$]*)(?=\(.*\))/, 'function'],
            [/[a-z$][\w$]*/, {
                "cases": {
                    "@keywords": "keyword",
                    "@literals": "literal",
                    "@default": "identifier"
                }
            }],
            {include: '@whitespace'},
            [/_/, "identifier.ignore"],
            // regular expressions
            // delimiters
            [/[{}]/, "expansion.brackets"],
            [/[()\[\]]/, '@brackets'],
            [/[<>](?!@symbols)/, '@brackets'],
            [/@symbols/, {
                cases: {
                    '@operators': 'delimiter',
                    '@default': ''
                }
            }],
            // numbers
            {include: "digits_matcher"},
            // delimiter: after number because of .\d floats
            [/[;,.]/, 'delimiter'],
            // strings:
            [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
            [/"/, 'string', '@string_double'],
        ],
        string_double: [
            [/[^\\"]+/, 'string'],
            [/"/, 'string', '@pop']
        ],
        comment: [
            [/[^\/*]+/, 'comment'],
            [/\/\*/, 'comment', '@push'],    // nested comment
            ["\\*/", 'comment', '@pop'],
            [/[\/*]/, 'comment']
        ],
        whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/\/\*/, 'comment', '@comment'],
            [/\/\/.*$/, 'comment'],
        ],
    }
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