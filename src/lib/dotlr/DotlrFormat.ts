import type {Tree} from "@specy/dotlr/types";


export function formatTree(tree: Tree, indent: string = '', isLast: boolean = true): string {
    const linePrefix = isLast ? '└─ ' : '├─ ';
    let result = '';

    if (tree.type === 'Terminal') {
        const { token, slice } = tree.value;
        if (token.type !== 'Eof') {
            result += `${indent}${linePrefix}${token.value} [${slice}]\n`;
        }
    } else {
        const { symbol, pattern } = tree.value;
        result += `${indent}${linePrefix}${symbol}\n`;

        const newIndent = indent + (isLast ? '   ' : '│  ');
        pattern.forEach((child, index) => {
            result += formatTree(child, newIndent, index === pattern.length - 1);
        });
    }

    return result;
}