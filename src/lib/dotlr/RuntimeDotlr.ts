import {editor, type IDisposable, Position, Range,} from "monaco-editor";
import {Grammar, LALRParser, LR1Parser} from "@specy/dotlr";
import type {ParsingError} from "@specy/dotlr/types";
import {stringifyParsingError, stringifyToken} from "$lib/dotlr/dotlrUtils";

export function createRuntimeDotlrHoverProvider() {
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

export function getRuntimeDeltaDecorations(model: editor.ITextModel, grammar: string, text: string) {
    const grammarParser = Grammar.fromGrammar(grammar)
    if (!grammarParser.ok) return []
    const parser = LR1Parser.fromGrammar(grammarParser.val)
    if (!parser.ok) return []
    const tokens = parser.val.tokenize(text)
    if (!tokens.ok) {
        return []
    }
    //add a background to each token
    let offset = 0

    return tokens.val.map(({slice, token}) => {
        const start = offset
        offset += slice.length
        const startPositon = model.getPositionAt(start)
        const endPosition = model.getPositionAt(offset)
        return {
            range: new Range(startPositon.lineNumber, startPositon.column, endPosition.lineNumber, endPosition.column),
            options: {
                className: 'runtime-token-' + token.type
            }
        }
    })
}

export function createDotlrRuntimeRuntimeDiagnostics(model: editor.ITextModel, _grammar: string) {
    const disposable: IDisposable[] = []
    const grammar = Grammar.fromGrammar(_grammar)
    disposable.push(model.onDidChangeContent(() => {
        const text = model.getValue()
        const end = model.getPositionAt(text.length)
        const markers = []
        if (!grammar.ok) return editor.setModelMarkers(model, 'dotlr', [])
        const parser = LALRParser.fromGrammar(grammar.val.clone())
        if (!parser.ok) return editor.setModelMarkers(model, 'dotlr', [])
        const parsed = parser.val.parse(text)
        if (parsed.ok) return editor.setModelMarkers(model, 'dotlr', [])
        const err = parsed.val as ParsingError
        if (err.type === "UnexpectedEof") {
            markers.push({
                startLineNumber: end.lineNumber,
                startColumn: end.column,
                endLineNumber: end.lineNumber,
                endColumn: end.column + 1,
                message: stringifyParsingError(err),
                severity: 8
            })
        } else if (err.type === 'UnknownToken') {
            markers.push({
                startLineNumber: 0,
                startColumn: 0,
                endLineNumber: end.lineNumber,
                endColumn: end.column,
                message: stringifyParsingError(err),
                severity: 8
            })
        } else if (err.type === "UnexpectedToken") {
            markers.push({
                startLineNumber: 0,
                startColumn: 0,
                endLineNumber: end.lineNumber,
                endColumn: end.column,
                message: stringifyParsingError(err),
                severity: 8
            })
        }

        editor.setModelMarkers(model, 'dotlr', markers)
    }))
    return {
        dispose() {
            disposable.forEach(d => d.dispose())
        }
    }
}


