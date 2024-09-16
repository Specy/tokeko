<script lang="ts">
    import Editor from '$cmp/editor/Editor.svelte';
    import Button from '$cmp/inputs/Button.svelte';
    import {Monaco} from '$src/lib/Monaco';
    import {onMount} from 'svelte';
    import {type Project} from '$stores/userProjectsStore';
    import Row from '$cmp/layout/Row.svelte';
    import {createCompilerStore} from '$src/routes/projects/[projectId]/projectStore';
    import Column from "$cmp/layout/Column.svelte";
    import ExpandableContainer from "$cmp/layout/ExpandableContainer.svelte";
    import FirstTableRenderer from "$cmp/dotlr/FirstTableRenderer.svelte";
    import AutomatonTableRenderer from "$cmp/dotlr/AutomatonTableRenderer.svelte";
    import ActionTableRenderer from "$cmp/dotlr/ActionTableRenderer.svelte";
    import GrammarRenderer from "$cmp/dotlr/GrammarRenderer.svelte";
    import KeepOpenButton from "$cmp/projects/KeepOpenButton.svelte";
    import TraceTableRenderer from "$cmp/dotlr/TraceTableRenderer.svelte";
    import ParserPicker from "$cmp/dotlr/ParserPicker.svelte";
    import AutomatonGraphRenderer from "$cmp/dotlr/AutomatonGraphRenderer.svelte";
    import TreeRenderer from "$cmp/dotlr/TreeRenderer.svelte";
    import {stringifyError} from "$lib/dotlr/dotlrUtils";

    export let project: Project;
    let store = createCompilerStore(project);

    let open: Record<keyof Project['keepOpen'], boolean> = {
        grammar: false,
        firstAndFollow: false,
        automaton: false,
        parsingTable: false,
        parseTrace: false
    }
    onMount(() => {
        Monaco.load();
        open = {...project.keepOpen}
        return () => {
            Monaco.dispose();
        };
    });

    function scrollToResult(id: string) {
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({behavior: 'smooth'});
            }
        }, 100);
    }

    function parseString() {
        store?.parseString();
        //scrollToResult('result')
    }

    function parseGrammar() {
        store?.parseGrammar()
        for (const key in open) {
            if (open[key]) {
                scrollToResult(key)
                return
            }
        }
        scrollToResult('jump-to')
    }

    function reset() {
        store?.reset();
    }


    $: $store.grammar = project.grammar;
    $: $store.content = project.content;
    $: {
        if (project.parserType !== $store.parserType) {
            $store.parserType = project.parserType
            reset()
        }

    }
</script>

<div id="result" style="position: absolute; top: 0; right: 0">

</div>
<div class="wrapper">
    <Column gap="0.5rem" style="min-height: 70%">
        <Editor
                style="flex: 1;"
                language="dotlr"
                bind:code={project.grammar}
                highlightedLine={-1}
        />
        <Editor
                style="flex: 1;"
                runtimeGrammar={project.grammar}
                language="dotlr-result"
                bind:code={project.content}
                highlightedLine={-1}
        />
    </Column>
    <div class="pipe-container">
        <div class="pipe-container-inner">
            {#if $store.result?.type === 'error'}
                <pre>{stringifyError($store.result.error)}</pre>
            {:else}
                <TreeRenderer tree={$store.result?.result ?? {type: "Terminal", value: {slice: "Root"}}}/>
            {/if}
        </div>
        <Row justify="between" gap="0.5rem" wrap>
            <Row gap="0.5rem" wrap>
                <ParserPicker bind:value={project.parserType}/>
                {#if $store.result}
                    <Button on:click={reset} border="secondary" color="primary">Reset</Button>
                {/if}
                <Button on:click={parseGrammar} border="secondary" color="primary"
                        disabled={project.grammar.trim() === ""}>Parse Grammar
                </Button>
            </Row>
            <Button on:click={parseString} border="secondary" color="primary"
                    disabled={project.content.trim() === ""}>Parse String
            </Button>
        </Row>

    </div>
</div>
{#if $store.result?.type !== 'error' && $store.result}
    <Column padding="0.5rem" gap="0.5rem">
        <h1 id="jump-to">
            Result
        </h1>
        {#if $store.result?.parser}
            <ExpandableContainer defaultExpanded={project.keepOpen.grammar} bind:expanded={open.grammar}>
                <Row slot="title" justify="between" align="center" wrap flex1 gap="0.5rem">
                    <h2 id="grammar">Grammar</h2>
                    <KeepOpenButton bind:project openKey="grammar"/>
                </Row>
                <Row justify="center">
                    <GrammarRenderer grammar={$store.result.grammar}/>
                </Row>
            </ExpandableContainer>
            <ExpandableContainer defaultExpanded={project.keepOpen.firstAndFollow} bind:expanded={open.firstAndFollow}>
                <Row slot="title" justify="between" align="center" wrap flex1 gap="0.5rem">
                    <h2 id="firstAndFollow">First & Follow</h2>
                    <Row gap="0.5rem">
                        <Button
                                border="secondary"
                                style="min-width: 9rem"
                                on:click={(e) => {
                                e.stopImmediatePropagation()
                                project.options.columnFirstAndFollow = !project.options.columnFirstAndFollow
                            }}
                        >
                            {project.options.columnFirstAndFollow ? "View as row" : "View as column"}
                        </Button>
                        <KeepOpenButton bind:project openKey="firstAndFollow"/>
                    </Row>

                </Row>
                <Row justify="center">
                    <FirstTableRenderer
                            column={project.options.columnFirstAndFollow}
                            first={$store.result.parser.getFirstTable()}
                            follow={$store.result.parser.getFollowTable()}
                    />
                </Row>
            </ExpandableContainer>
            <ExpandableContainer defaultExpanded={project.keepOpen.automaton} bind:expanded={open.automaton}>
                <Row slot="title" justify="between" align="center" wrap flex1 gap="0.5rem">
                    <h2 id="automaton">Automaton</h2>
                    <Row gap="0.5rem" wrap>
                        <Button
                                border="secondary"
                                style="min-width: 8rem"
                                on:click={e => {
                                    e.stopImmediatePropagation()
                                    project.options.showAutomatonAsGraph = !project.options.showAutomatonAsGraph
                                        if(project.options.showAutomatonAsGraph){
                                        scrollToResult('automaton')
                                    }
                                }}
                        >
                            {project.options.showAutomatonAsGraph ? "Show as table" : "Show as Graph"}
                        </Button>
                        <Button
                                border="secondary"
                                style="min-width: 9rem"
                                on:click={e => {
                                    e.stopImmediatePropagation()
                                    project.options.noAposInAutomaton = !project.options.noAposInAutomaton

                                }}
                        >
                            {project.options.noAposInAutomaton ? "Show apostrophe" : "Hide apostrophe"}
                        </Button>
                        <KeepOpenButton bind:project openKey="automaton"/>
                    </Row>

                </Row>
                <div style={project.options.showAutomatonAsGraph ? "display: none": "display: contents"}>

                    <Row justify="center">
                        <AutomatonTableRenderer
                                noApos={project.options.noAposInAutomaton}
                                table={$store.result.parser.getAutomaton()}
                                terminals={$store.result.grammar.getConstantTokens()}
                                nonTerminals={$store.result.grammar.getSymbols()}
                        />
                    </Row>
                </div>
                <div id="automaton-graph"
                     class="automaton-graph"
                     class:automaton-graph-hidden={!project.options.showAutomatonAsGraph}>
                    <AutomatonGraphRenderer automaton={$store.result.parser.getAutomaton()}/>
                </div>

            </ExpandableContainer>
            <ExpandableContainer defaultExpanded={project.keepOpen.parsingTable} bind:expanded={open.parsingTable}>
                <Row slot="title" justify="between" align="center" wrap flex1 gap="0.5rem">
                    <h2 id="parsingTable">Parsing table</h2>
                    <KeepOpenButton bind:project openKey="parsingTable"/>
                </Row>
                <Row justify="center">
                    <ActionTableRenderer
                            table={$store.result.parser.getParseTables()}
                            terminals={$store.result.grammar.getConstantTokens()}
                            nonTerminals={$store.result.grammar.getSymbols()}
                    />
                </Row>
            </ExpandableContainer>
        {/if}
        {#if $store.result.type === 'parse'}
            <ExpandableContainer defaultExpanded={project.keepOpen.parseTrace} bind:expanded={open.parseTrace}>
                <Row slot="title" justify="between" align="center" wrap flex1 gap="0.5rem">
                    <h2 id="parsingTable">Parse trace</h2>
                    <Row gap="0.5rem">
                        <Button
                                border="secondary"
                                style="min-width: 9rem"
                                on:click={e => {
                                    e.stopImmediatePropagation()
                                    project.options.noAposInParseTrace = !project.options.noAposInParseTrace
                                }}
                        >
                            {project.options.noAposInParseTrace ? "Show apostrophe" : "Hide apostrophe"}
                        </Button>
                        <KeepOpenButton bind:project openKey="parseTrace"/>
                    </Row>
                </Row>
                <Row justify="center">
                    <TraceTableRenderer
                            grammar={$store.result.grammar}
                            trace={$store.result.trace}
                            noApos={project.options.noAposInParseTrace}
                    />
                </Row>
            </ExpandableContainer>
        {/if}
    </Column>
{/if}

<style>
    .pipe-container {
        display: flex;
        flex: 1;
        flex-direction: column;
        overflow: hidden;
        gap: 0.5rem;
    }

    .pipe-container-inner {
        background-color: var(--primary);
        padding: 0.5rem;
        border-radius: 0.4rem;
        overflow-y: auto;
        height: 100%;
    }


    .wrapper {
        display: grid;
        grid-template-columns: 3fr 3fr;
        gap: 0.5rem;
        height: calc(100vh - 3.5rem - 0.5rem);
        padding: 0 0.5rem;
    }

    @media (max-width: 768px) {
        .wrapper {
            display: flex;
            flex-direction: column;
        }
    }

    .automaton-graph {
        display: contents;
    }

    .automaton-graph-hidden {
        display: none;
    }
</style>
