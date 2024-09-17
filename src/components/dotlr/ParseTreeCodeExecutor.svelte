<script lang="ts">
    import Editor from "$cmp/editor/Editor.svelte";
    import {createEventDispatcher} from "svelte";
    import Column from "$cmp/layout/Column.svelte";

    export let code: string;
    export let grammar: string;

    const dispatcher = createEventDispatcher<{ run: () => void }>();
</script>

<Column style="position: relative; flex: 1">
    <Editor
            bind:code
            language="typescript"
            highlightedLine={-1}
    />
    <button
            class="run"
            on:click={() => dispatcher('run')}
    >
        Run
    </button>
</Column>


<style>
    .run{
        position: absolute;
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-size: 1rem;
        width: 6rem;
        background-color: color-mix(in srgb, var(--accent) 50%, var(--primary));
        transition: all 0.3s;
        color: var(--accent-text);
        font-family: Rubik;
               bottom: 0;
        right: 0;
        border-top-left-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
    }
    .run:hover{
        background: var(--accent);
    }
</style>
