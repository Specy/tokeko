<script>
    import SyntaxHighlighter from "$cmp/SyntaxHighlighter.svelte";
    import Card from "$cmp/layout/Card.svelte";
    import Column from "$cmp/layout/Column.svelte";
</script>

<h2>
    Grammar syntax
</h2>
<Column gap="0.5rem">
    You can write the grammar for the language you want to recognize by writing Terminals, Non-terminals, and Regexes.
    <br/>
    Here is an example grammar that uses all of them:
    <Card padding="1rem">

        <SyntaxHighlighter
                source={`P -> E

E -> E '+' T
E -> T

T -> %id '(' E ')'
T -> %id

%id -> /[A-Za-z][A-Za-z0-9]+/`}
                language="dotlr"
        />
    </Card>
    Terminals are written by being surrounded by apostrophes, a regex token is defined by using a % sign before the name
    of the token, all the rest are non-terminals.
    This grammar is able to recognize the expression (as an example):
    <Card padding="1rem">
        foo(bar+baz)
    </Card>
</Column>

<h2>
    Steps
</h2>
<div>
    With the app you can both look at the language's properties (like the FIRST, FOLLOW, automaton table etc...)
    and you can also parse a string to see if it is recognized by the grammar, this will produce a parse tree that you
    can visualize.
</div>
<div>
    Once you compile the language or parse a string, the individual steps needed to complete the operation will be
    shown below the editor and you can click on them to see the details.
</div>