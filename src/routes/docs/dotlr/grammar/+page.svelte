<script>
    import Page from "$cmp/layout/Page.svelte";
    import SyntaxHighlighter from "$cmp/SyntaxHighlighter.svelte";
    import Card from "$cmp/layout/Card.svelte";
</script>

<svelte:head>
    <title>
        Grammar
    </title>
    <meta name="description" content="The documentation of Tokeko: Grammar"/>
</svelte:head>

<Page cropped="70ch" padding='1rem' mobilePadding='1rem'>
    <h1>
        Writing a grammar
    </h1>
    <p>
        When building a parser for a language, you need to define the structure of valid expressions.
        This is achieved by writing a grammar that describes how expressions in the language can be formed.
        The grammar is defined using terminals, non-terminals, and regular expressions (regexes).
    </p>
    <h2>Key Components of a Grammar</h2>
    <ol>
        <li><p><strong>Terminals</strong>:</p>
            <ul>
                <li>These are the basic symbols from which strings are formed in the language. Terminals are usually
                    literal values like keywords, operators, or punctuation.
                </li>
                <li>In the grammar, terminals are enclosed in single quotes (<code>&#39;</code>), e.g., <code>&#39;+&#39;</code>,
                    <code>&#39;(&#39;</code>, and <code>&#39;)&#39;</code>.
                </li>
            </ul>
        </li>
        <li><p><strong>Non-Terminals</strong>:</p>
            <ul>
                <li>These are the abstract symbols that represent structures or expressions that can be expanded into
                    sequences of terminals and other non-terminals. Non-terminals can be seen as &quot;rules&quot; in
                    the grammar.
                </li>
                <li>Non-terminals are simply written without any special surrounding characters.</li>
            </ul>
        </li>
        <li><p><strong>Regex Tokens</strong>:</p>
            <ul>
                <li>Sometimes, you need to define terminals using regular expressions to capture more flexible patterns,
                    like identifiers or numbers.
                </li>
                <li>In this grammar, a regex token is defined by using a <code>%</code> sign followed by the name of the
                    token. The regex itself is specified using standard regex notation between slashes (<code>/</code>),
                    e.g., <code>%id -&gt; /[A-Za-z][A-Za-z0-9]+/</code>.
                </li>
            </ul>
        </li>
    </ol>
    <Card padding="1rem" style="overflow-x: auto; margin-top: 2rem;">

        <SyntaxHighlighter
                language="dotlr"
                source={`P  -> E                # The program starts by expanding an expression

E  -> E '+' T          # An expression can be another expression followed by '+' and a term
E  -> T                # Or, an expression can be a single term

T  -> %id '(' E ')'    # A term can be a function call with an identifier followed by parentheses and an expression
T  -> %id              # Or, a term can just be an identifier

# Identifiers are defined by this regex: a letter followed by any number of letters or digits
%id -> /[A-Za-z][A-Za-z0-9]+/  `}

        />
    </Card>

    <p style="margin: 1rem 0">
        This grammar can recognize and parse an expression like the following:
    </p>
    <Card padding="1rem">
        foo(bar+baz)
    </Card>
      <p style="margin-top: 1rem">
        For more info visit the <a href="https://github.com/umut-sahin/dotlr?tab=readme-ov-file#table-of-contents">dotlr</a> library docs
    </p>
</Page>

<style>
    @import "../common.scss";
</style>