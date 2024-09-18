<script lang="ts">
    import Editor from "$cmp/editor/Editor.svelte";
    import type {Grammar} from "@specy/dotlr";

    export let code: string;
    export let grammar: string
</script>

<Editor
        bind:code
        runtimeGrammar={grammar}
        language="typescript"
        highlightedLine={-1}
/>


