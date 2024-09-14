
import type {ParserError, ParsingError, GrammarError, Tree} from '@specy/dotlr/dist/types'

export function formatTree(tree: Tree, depth: number = 0, last: boolean = false): string {
    const indent = ' '.repeat(depth * 2)
    if (tree.type === 'Terminal') {
        if(tree.value.token.type === 'Eof') return ""
        const mid = last ? '└─' : '├─'
        return `${indent} ${mid} ${tree.value.token.value}`
    }
    if (tree.type === 'NonTerminal') {
        const mid = last || tree.value.pattern.length === 1 ? '└─' : '├─'
        return `${indent} ${mid} ${tree.value.symbol}\n${tree.value.pattern.map((child, i) => formatTree(child, depth + 1, i === tree.value.pattern.length - 1)).join('\n')}`
    }
    return ''
}