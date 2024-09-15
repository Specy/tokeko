<script lang="ts">
    import Editor from '$cmp/editor/Editor.svelte';
    import Button from '$cmp/inputs/Button.svelte';
    import {Monaco} from '$src/lib/Monaco';
    import {onMount} from 'svelte';
    import {type Project} from '$stores/userProjectsStore';
    import Row from '$cmp/layout/Row.svelte';
    import {createCompilerStore} from '$src/routes/projects/[projectId]/projectStore';
    import Column from "$cmp/layout/Column.svelte";
    import {formatTree} from "$lib/dotlr/DotlrFormat";
    import ExpandableContainer from "$cmp/layout/ExpandableContainer.svelte";
    import FirstTableRenderer from "$cmp/dotlr/FirstTableRenderer.svelte";

    export let project: Project;
    let store = createCompilerStore(project);
    onMount(() => {
        Monaco.load();
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
        scrollToResult('result')
    }

    function parseGrammar() {
        store?.parseGrammar()
        scrollToResult('jump-to')
    }

    function reset() {
        store?.reset();
    }


    $: $store.grammar = project.grammar;
    $: $store.content = project.content;
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
                <pre>
{#if $store.result?.type === 'parse'}
{formatTree($store.result.result)}
{/if}
                    {#if $store.result?.type === 'error'}
{$store.result.error}
{/if}
                </pre>
        </div>
        <Row justify="between">
            <Row gap="0.5rem">
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
            <ExpandableContainer expanded={true}>
                <h2 slot="title">First & Follow</h2>
                <FirstTableRenderer
                        first={$store.result.parser.getFirstTable()}
                        follow={$store.result.parser.getFollowTable()}
                />
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

    .pipe-preset-select {
        padding: 0.5rem 1rem;
        border-radius: 0.4rem;
        border: 1px solid var(--primary);
        background-color: var(--primary);
        color: var(--primary-text);
    }
</style>
