export const highlightJsGrammar = {
    case_insensitive: false,
    keywords: {
        $pattern: /[A-Z][A-Za-z0-9]*/,
        keyword: 'PRODUCTION_HEAD NON_TERMINAL'
    },
    contains: [
        {
            className: 'productionHead',
            begin: /^[A-Z][A-Za-z0-9]*/
        },
        {
            className: 'nonTerminal',
            begin: /[A-Z][A-Za-z0-9]*/,
            relevance: 0
        },
        {
            className: 'productionArrow',
            begin: /->/,
            relevance: 10
        },
        {
            className: 'terminal',
            begin: /'/, end: /'/
        },
        {
            className: 'special',
            begin: /%[a-z][A-Za-z0-9]*/
        },

        {
            className: 'regexp',
            begin: /\//, end: /\//
        },
        {
            className: 'comment',
            begin: /#/,
            end: /$/,
            relevance: 0
        }

    ]
};

