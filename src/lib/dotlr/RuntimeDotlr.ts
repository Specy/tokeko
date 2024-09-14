import {editor, Position, Range,} from "monaco-editor";
import {Grammar, LR1Parser} from "@specy/dotlr";

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