<script lang="ts">

    import {ParserVisualization} from "$cmp/dotlr/AutomatonGraph";
    import type {Automaton} from "@specy/dotlr/types";
    import {onDestroy} from "svelte";

    let ref: HTMLElement = null
    let prev: ParserVisualization = null
    export let automaton: Automaton

    onDestroy(() => {
        if (prev) {
            prev.dispose()
        }
    })

    function updateRef(automaton: Automaton, el: HTMLElement) {
        if (el) {
            if (prev) {
                prev.dispose()
            }
            prev = new ParserVisualization(automaton, el)
            prev.render()
        }
    }

    $: if (ref) updateRef(automaton, ref)
</script>

<div class="container" bind:this={ref}>

</div>


<style class="content">
    .container {
        border-radius: 0.5rem;
        height: 80vh;
        background: var(--background);
        background-image: radial-gradient(var(--background-10) 0.1rem, transparent 0);
        background-size: 20px 20px;
        background-position: -9px -9px;
    }

    :global(.automaton_node) {
        fill: var(--primary);
        stroke: var(--primary-10);
    }

    :global(.automaton_link) {
        stroke: var(--tertiary-10);
        stroke-width: 3px;
        fill: transparent;
    }

    :global(.automaton_state-label) {
        fill: var(--primary-text);
    }

    :global(.automaton_state-info) {
        fill: var(--primary-text);
    }

    :global(.automaton_link-label) {
        fill: var(--primary-text);
    }

</style>