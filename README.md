# Tokeko
**A website to help learn parsers**

[Tokeko](https://tokeko.specy.app) is an educational platform designed to help users understand and learn about different types of parsers, grammar structures, and parsing techniques. With interactive features, you can explore complex parsing concepts in a visual and intuitive way.

![Tokeko](./static/images/tokeko-editor-wide.webp)
![Tokeko](./static/images/tokeko-result-wide.webp)

## Features

- [x] **LR(1) parser** — Supports LR(1) grammar parsing
- [x] **LALR parser** — Handles LALR parsing
- [ ] **LR(0) parser** — Coming soon
- [ ] **LL parser** — Planned for future updates
- [x] **FIRST table** — Displays the FIRST set for grammar symbols
- [x] **FOLLOW table** — Visualizes the FOLLOW set for grammar symbols
- [x] **Partial tokenization** — Basic tokenization support
- [x] **GOTO/Action table** — Comprehensive table to guide the parsing process
- [x] **Automaton table** — Shows the automaton states and transitions
- [x] **Automaton graph** — Graphical representation of the automaton
- [x] **Parsing steps** — Visual breakdown of the parsing process
- [ ] **Custom syntax highlighting** — Planned feature that will use random colors for non-terminals, making grammar and parse trees easier to understand
- [x] **Parse tree (AST) viewer** — Visualize the abstract syntax tree (AST)

## Writing a Grammar

Tokeko allows you to define the grammar of the language you wish to recognize by specifying terminals, non-terminals, and regex patterns.

### Example Grammar

```
P -> E

E -> E '+' T
E -> T

T -> %id '(' E ')'
T -> %id

%id -> /[A-Za-z][A-Za-z0-9]+/
```

- Terminals are enclosed in single quotes (`'...'`).
- Regex tokens are prefixed with a `%` (e.g., `%id`).
- Non-terminals are written without any special symbols.

### Example of a Recognized Expression

Given the grammar above, the following expression can be parsed:
```plaintext
foo(bar+baz)
```

## How It Works

With Tokeko, you can:
1. **Explore Language Properties**: View various properties of the language, such as FIRST and FOLLOW sets, automaton tables, and more.
2. **Parse a String**: Enter a string to see if it is recognized by the defined grammar. If it is, you’ll be able to view the corresponding parse tree.

### Parsing Steps
After compiling a language or parsing a string, Tokeko breaks down the process step by step. You can click on each step to see the details and gain deeper insights into how the parsing works.

### More info
For more info about the parser itself and how to use the grammar, please [visit the dotlr](https://github.com/umut-sahin/dotlr?tab=readme-ov-file#how-does-it-work) library