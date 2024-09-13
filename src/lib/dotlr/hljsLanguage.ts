const hljskeywords = []
const hljsLiterals = []
const hljsOperators = ["->"]
export const highlightJsGrammar = {
    case_insensitive: true,
    keywords: {
        keyword: hljskeywords,
        literal: hljsLiterals,
    },
    contains: [
        {
            'className': 'keyword',
            'begin': 's.t.'
        },
        //comments
        {
            className: 'comment',
            begin: '//', end: '$',
        },
        {
            className: 'comment',
            begin: '/\\*', end: '\\*/',
        },
        //assignment
        {
            className: 'identifier',
            begin: '[a-z$][\\w$]*',
            keywords: hljskeywords,
        },
        {
            className: "identifierIgnore",
            begin: '_',
        },
        {
            className: "number",
            begin: '\\b\\d+(\\.\\d+)?',
        },
        {
            className: "string",
            begin: '"', end: '"',
        },
        {
            className: 'brackets',
            begin: '[\\[\\]()]',
        }, {
            className: 'operator',
            begin: `${hljsOperators.map(i => {
                return `${i.split('').map(j => `\\${j}`).join('')}`
            }).join('|')}`,
        }
    ]

}

