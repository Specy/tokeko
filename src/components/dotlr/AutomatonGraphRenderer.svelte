<script lang="ts">

    import {ParserVisualization} from "$cmp/dotlr/AutomatonGraph";
    import type {Automaton} from "@specy/dotlr/types";
    import {onDestroy} from "svelte";

    let ref: HTMLElement = null
    let prev: ParserVisualization = null
    export let noApos: boolean = false
    export let automaton: Automaton

    onDestroy(() => {
        if (prev) {
            prev.dispose()
        }
    })

    function updateRef(automaton: Automaton, el: HTMLElement, noApos: boolean) {
        if (el) {
            if(automaton === prev?.automaton && noApos === !prev?.config.useApostrophes){
                return
            }
            if (prev) {
                prev.dispose()
            }
            prev = new ParserVisualization(automaton, el, {useApostrophes: !noApos})
            prev.render()
        }
    }

    $: if (ref) updateRef(automaton, ref, noApos)
</script>

<div class="container" bind:this={ref}>

</div>


<style class="content">
    .container {
        border-radius: 0.5rem;
        height: 80vh;
        cursor: grab;
        overflow: hidden;
        background: var(--background);
        --dotted-grid-color: var(--primary-5);
        --arrow-color: var(--primary-10)
    }

    .container:active{
        cursor: grabbing;
    }
    :global(.automaton_node) {
        fill: var(--primary);
        stroke: var(--primary-10);
        cursor: pointer;
    }
    :global(.automaton_first_node){
        stroke: rgba(var(--accent-rgb), 0.6);

    }
    :global(.automaton_state-header-bg){
        fill: var(--primary-5);
        stroke-width: 2px;
    }

    :global(.automaton_link) {
        stroke: var(--tertiary-10);
        stroke-width: 3px;
        fill: transparent;
    }

    :global(.automaton_state-label) {
        fill: var(--primary-text);
        stroke: var(--primary-text);
        stroke-width: 0.5px;
    }

    :global(.automaton_state-info) {
        fill: var(--primary-text);
        stroke-width: 0px;
        stroke: var(--primary-text);
    }

    :global(.automaton_link-label) {
        fill: var(--primary-text);
    }

</style>