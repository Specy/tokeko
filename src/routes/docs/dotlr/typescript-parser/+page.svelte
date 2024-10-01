<script>
    import {getTsGlobal} from "$lib/dotlr/dotlrTypesString";
    import ExpandableContainer from "$cmp/layout/ExpandableContainer.svelte";
    import SyntaxHighlighter from "$cmp/SyntaxHighlighter.svelte";
    import Page from "$cmp/layout/Page.svelte";
</script>

<svelte:head>
    <title>
        Typescript runtime
    </title>
    <meta name="description" content="The documentation of Tokeko: Typescript runtime"/>
</svelte:head>
<Page cropped="70ch" padding='1rem' mobilePadding='1rem' gap="1rem">
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
        <h2 slot="title" style="margin: 0">Type definitions</h2>
        <div style="width: 100%; overflow-x: auto">
            <SyntaxHighlighter
                    language="typescript"
                    source={getTsGlobal()}
            />
        </div>
    </ExpandableContainer>
</Page>

<style>
    @import "../common.scss";
</style>

