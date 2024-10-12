import {editor, type IDisposable, Position, Range,} from "monaco-editor";
import {Grammar, LALR1Parser, LR1Parser} from "@specy/dotlr";
import type {ParsingError} from "@specy/dotlr/types";
import {stringifyParsingError} from "$lib/dotlr/dotlrUtils";

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
    const grammarParser = Grammar.parse(grammar)
    if (!grammarParser.ok) return []
    const parser = LR1Parser.fromGrammar(grammarParser.val)
    if (!parser.ok) return []
    const tokens = parser.val.tokenize(text)
    if (!tokens.ok) {
        return []
    }

    const typeAlternate: {
        [key: string]: boolean
    } = {}
    return tokens.val.map(({token}) => {
        const start = token.span.offset
        const startPositon = model.getPositionAt(start)
        const endPosition = model.getPositionAt(token.span.offset + token.span.len)

        typeAlternate[token.value.type] = !(typeAlternate[token.value.type] ?? false)
        const col = startPositon.column
        const line = startPositon.lineNumber
        return {
            range: new Range(line, col, endPosition.lineNumber, endPosition.column),
            options: {
                className: 'runtime-token-' + token.value.type + (typeAlternate[token.value.type] ? '-alt' : '')
            }
        }
    })
}

export function createDotlrRuntimeRuntimeDiagnostics(model: editor.ITextModel, _grammar: string) {
    const disposable: IDisposable[] = []
    const grammar = Grammar.parse(_grammar)
    disposable.push(model.onDidChangeContent(() => {
        const text = model.getValue()
        const markers = []
        if (!grammar.ok) return editor.setModelMarkers(model, 'dotlr', [])
        const parser = LALR1Parser.fromGrammar(grammar.val.clone())
        if (!parser.ok) return editor.setModelMarkers(model, 'dotlr', [])
        const parsed = parser.val.parse(text)
        if (parsed.ok) return editor.setModelMarkers(model, 'dotlr', [])
        const err = parsed.val as ParsingError
        const posStart = model.getPositionAt(err.value.span.offset)
        const posEnd = model.getPositionAt(err.value.span.offset + err.value.span.len)
        markers.push({
            startLineNumber: posStart.lineNumber,
            startColumn: posStart.column,
            endLineNumber: posEnd.lineNumber,
            endColumn: posEnd.column,
            severity: 8,
            message: stringifyParsingError(err),
        })
        editor.setModelMarkers(model, 'dotlr', markers)
    }))
    return {
        dispose() {
            disposable.forEach(d => d.dispose())
        }
    }
}


