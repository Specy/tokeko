<script>
    import SyntaxHighlighter from "$cmp/SyntaxHighlighter.svelte";
    import Card from "$cmp/layout/Card.svelte";
    import Column from "$cmp/layout/Column.svelte";
    import ExpandableContainer from "$cmp/layout/ExpandableContainer.svelte";
    import {getTsGlobal} from "$lib/dotlr/dotlrTypesString";
</script>

<h2>
    Grammar syntax
</h2>
<Column gap="0.5rem">
    <p>
        You can write the grammar for the language you want to recognize by writing Terminals, Non-terminals, and
        Regexes.
        <br/>
        Here is an example grammar that uses all of them:
    </p>
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
    Typescript runtime
</h2>
<p>
    The app comes with a typescript runtime that you can use to utilize the parser you have created.
    <br/>
    The global <b>PARSE</b> function will use the grammar you have defined, and the types <b>ThisTree, ThisToken,
    ThisTerminal, ThisNonTerminal, ThisRegex</b>
    are the types of your grammar.
    <br/>
    Alternatively you can use directly the parsers and grammar functions, look at the type definitions below.
</p>
<ExpandableContainer>
    <h2 slot="title">Type definitions</h2>
    <div style="width: 100%; overflow-x: auto">
        <SyntaxHighlighter language="typescript" source={getTsGlobal()}/>
    </div>
</ExpandableContainer>


<h2>
    Steps
</h2>
<p>
    With the app you can both look at the language's properties (like the FIRST, FOLLOW, automaton table etc...)
    and you can also parse a string to see if it is recognized by the grammar, this will produce a parse tree that you
    can visualize.
</p>
<p>
    Once you compile the language or parse a string, the individual steps needed to complete the operation will be
    shown below the editor and you can click on them to see the details.
</p>

<style>
  p{
    line-height: 1.5;
  }
</style>