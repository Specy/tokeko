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
    import GrammarRenderer from "$cmp/dotlr/GrammarRenderer.svelte";
    import TraceTableRenderer from "$cmp/dotlr/TraceTableRenderer.svelte";
    import ParserPicker from "$cmp/dotlr/ParserPicker.svelte";
    import AutomatonGraphRenderer from "$cmp/dotlr/AutomatonGraphRenderer.svelte";
    import TreeRenderer from "$cmp/dotlr/TreeRenderer.svelte";
    import {stringifyError} from "$lib/dotlr/dotlrUtils";
    import ParsingTableRenderer from "$cmp/dotlr/ParsingTableRenderer.svelte";
    // @ts-ignore
    import GoDown from "~icons/fa6-solid/angles-down.svelte";
    import ParseTreeCodeExecutor from "$cmp/dotlr/ParseTreeCodeExecutor.svelte";
    import type {ConsoleOutput} from "$lib/sandbox";
    import ConsoleEditor from "$cmp/dotlr/ConsoleEditor.svelte";

    export let project: Project;
    let store = createCompilerStore(project);
    let runtimeResult: ConsoleOutput[] | undefined = undefined
    onMount(() => {
        Monaco.load();
        //try to parse but dont show anything if not possible
        parseString()
        if ($store.result?.type === "error") {
            $store.result = undefined
        }

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
    }

    function scrollToNearestResult() {
        for (const key in open) {
            if (open[key]) {
                scrollToResult(key)
                return
            }
        }
        scrollToResult('jump-to')
    }

    function parseGrammar() {
        store?.parseGrammar()
        scrollToNearestResult()
    }

    function reset() {
        runtimeResult = undefined
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
                style="flex: 1; min-height: 40vh;"
                language="dotlr"
                bind:code={project.grammar}
                highlightedLine={-1}
        />
        <div class="mode" class:mode-hidden={project.options.mode === 'tokens'}>
            <ParseTreeCodeExecutor
                    bind:code={project.code}
                    grammar={$store.grammar}
                    on:run={async () => {
                    const res = await store.executeTypescript(project.code)
                    runtimeResult = res.consoleOutput
                }}
            />
            <button class="mode-selector-button" on:click={() => project.options.mode = "tokens"}>
                Tokens
            </button>
        </div>
        <div class="mode" class:mode-hidden={project.options.mode === 'code'}>
            <Editor
                    runtimeGrammar={project.grammar}
                    language="dotlr-result"
                    bind:code={project.content}
                    highlightedLine={-1}
            />

            <button class="mode-selector-button" on:click={() => project.options.mode = "code"}>
                Code
            </button>
        </div>
    </Column>
    <div class="pipe-container">
        <Column style="flex: 1; height: 100%; overflow-y: auto" gap="0.5rem">
            <div class="pipe-container-inner">
                {#if $store.result?.type === 'error'}
                    <pre>{stringifyError($store.result.error)}</pre>
                {:else}
                    <TreeRenderer tree={$store.result?.result ?? {type: "Terminal", value: {slice: "Root"}}}/>
                {/if}
            </div>
            {#if runtimeResult}
                <div
                        style="
                        display: flex;
                        max-height: 50%;
                        width: 100%;
"
                >
                    <ConsoleEditor logs={runtimeResult}/>
                </div>
            {/if}
        </Column>

        <Row justify="between" gap="0.5rem" wrap>
            <Row gap="0.5rem" wrap>
                <ParserPicker bind:value={project.parserType}/>
                {#if $store.result}
                    <Button on:click={reset} border="secondary" color="primary">
                        Reset
                    </Button>
                {/if}
                <Button on:click={parseGrammar} border="secondary" color="primary"
                        disabled={project.grammar.trim() === ""}>Parse Grammar
                </Button>
            </Row>
            <Row gap="0.5rem">
                {#if $store.result && $store.result.type !== 'error'}
                    <Button
                            title="Scroll to nearest result"
                            hasIcon style="width: 2.8rem" on:click={scrollToNearestResult}>
                        <GoDown/>
                    </Button>
                {/if}

                <Button on:click={parseString} border="secondary" color="primary"
                        disabled={project.content.trim() === ""}>Parse String
                </Button>
            </Row>
        </Row>

    </div>
</div>
{#if $store.result?.type !== 'error' && $store.result}
    <Column padding="0.5rem" gap="0.5rem">
        <h1 id="jump-to">
            Result
        </h1>
        {#if $store.result?.parser}
            <ExpandableContainer bind:expanded={project.keepOpen.grammar}>
                <Row slot="title" justify="between" align="center" wrap flex1 gap="0.5rem">
                    <h2 id="grammar">Grammar</h2>
                </Row>
                <Row justify="center">
                    <GrammarRenderer grammar={$store.result.grammar}/>
                </Row>
            </ExpandableContainer>
            <ExpandableContainer bind:expanded={project.keepOpen.firstAndFollow}>
                <Row slot="title" justify="between" align="center" wrap flex1 gap="0.5rem">
                    <h2 id="firstAndFollow">First & Follow</h2>
                    <div class="el-header">
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
                    </div>
                </Row>
                <Row justify="center">
                    <FirstTableRenderer
                            column={project.options.columnFirstAndFollow}
                            first={$store.result.parser.getFirstTable()}
                            follow={$store.result.parser.getFollowTable()}
                    />
                </Row>
            </ExpandableContainer>
            <ExpandableContainer bind:expanded={project.keepOpen.automaton}>
                <Row slot="title" justify="between" align="center" wrap flex1 gap="0.5rem">
                    <h2 id="automaton">Automaton</h2>
                    <div class="el-header">
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
                    </div>

                </Row>
                <div style={project.options.showAutomatonAsGraph ? "display: none": "display: contents"}>

                    <Row justify="center">
                        <AutomatonTableRenderer
                                noApos={project.options.noAposInAutomaton}
                                table={$store.result.parser.getAutomaton()}
                                terminals={$store.result.grammar.getConstantTokens()}
                                nonTerminals={$store.result.grammar.getSymbols()}
                                regexes={[...$store.result.grammar.getRegexTokens().keys()]}
                        />
                    </Row>
                </div>
                <div id="automaton-graph"
                     class="automaton-graph"
                     class:automaton-graph-hidden={!project.options.showAutomatonAsGraph}>
                    <AutomatonGraphRenderer automaton={$store.result.parser.getAutomaton()}/>
                </div>

            </ExpandableContainer>
            <ExpandableContainer bind:expanded={project.keepOpen.parsingTable}>
                <Row slot="title" justify="between" align="center" wrap flex1 gap="0.5rem">
                    <h2 id="parsingTable">Parsing table</h2>
                    <div class="el-header">
                        <Button
                                border="secondary"
                                style="min-width: 9rem"
                                on:click={e => {
                                    e.stopImmediatePropagation()
                                    project.options.noAposInParsingTable = !project.options.noAposInParsingTable

                                }}
                        >
                            {project.options.noAposInParsingTable ? "Show apostrophe" : "Hide apostrophe"}
                        </Button>
                    </div>
                </Row>
                <Row justify="center">
                    <ParsingTableRenderer
                            noApos={project.options.noAposInParsingTable}
                            table={$store.result.parser.getParseTables()}
                            terminals={$store.result.grammar.getConstantTokens()}
                            nonTerminals={$store.result.grammar.getSymbols()}
                            regexes={[...$store.result.grammar.getRegexTokens().keys()]}
                    />
                </Row>
            </ExpandableContainer>
        {/if}
        {#if $store.result.type === 'parse'}
            <ExpandableContainer bind:expanded={project.keepOpen.parseTrace}>
                <Row slot="title" justify="between" align="center" wrap flex1 gap="0.5rem">
                    <h2 id="parsingTable">Parse trace</h2>
                    <div class="el-header">
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
                    </div>
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

    .mode {
        display: flex;
        flex: 1;
        position: relative;
    }

    .mode-selector-button {
        position: absolute;
        width: 6rem;
        background-color: var(--secondary-5);
        border: dashed 0.1rem var(--secondary-15);
        color: var(--secondary-text);
        font-size: 1rem;
        padding: 0.5rem 0.8rem;
        cursor: pointer;
        z-index: 10;
         border-bottom-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
        right: 0;
        top: 0;

        transition: background-color 0.3s;
    }
    .mode-selector-button:hover{
        background-color: var(--secondary-5);
    }
    .mode-hidden {
        display: none;
    }

    @media (max-width: 768px) {
        .wrapper {
            grid-template-columns: 1fr;
            grid-template-rows: 4fr 3fr;
            flex-direction: column;
        }
    }

    .automaton-graph {
        display: contents;
    }

    .automaton-graph-hidden {
        display: none;
    }

    .el-header {
        display: flex;
        gap: 0.5rem;
        flex: 1;
        justify-content: flex-end;
    }

    @media (max-width: 500px) {
        .el-header {
            justify-content: flex-end;
            flex: 1;
        }
    }
</style>
