<script lang="ts">

    import {ParseTreeVisualization} from "$cmp/dotlr/TreeGraph";
    import type {Tree} from "@specy/dotlr/types";
    import {onDestroy} from "svelte";

    let ref: HTMLElement = null
    let prev: ParseTreeVisualization = null
    export let tree: Tree

    onDestroy(() => {
        if (prev) {
            prev.dispose()
        }
    })

    function updateRef(tree: Tree, el: HTMLElement) {
        if (el) {
            if(tree === prev?.tree){
                return
            }
            if (prev) {
                prev.dispose()
            }
            prev = new ParseTreeVisualization(tree, el)
            prev.render()
        }
    }

    $: if (ref) updateRef(tree, ref)
</script>

<div class="container" bind:this={ref}>

</div>


<style class="content">
    .container {
        border-radius: 0.3rem;
        height: 100%;
        cursor: grab;
        overflow: hidden;
        background: var(--background);
        --dotted-grid-color: var(--primary-5);
        --arrow-color: var(--primary-10)
    }

    .container:active{
        cursor: grabbing;
    }

    :global(.tree_node) {
        fill: var(--primary-text);
    }
    :global(.tree_link){
        stroke: var(--tertiary-10);
        stroke-width: 2px;
        fill: transparent;
    }
    :global(.tree_terminal){
        fill: color-mix(in srgb, var(--accent) 70%, var(--primary-15));
    }
     :global(.tree_non_terminal){
        fill: var(--primary-15);
    }
</style>