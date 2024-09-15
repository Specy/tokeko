<script lang="ts">
    import type {Grammar} from "@specy/dotlr";
    import {stringifyRule} from "$lib/dotlr/dotlrUtils";

    export let grammar: Grammar

    $: rules = grammar.getProductions()
</script>


<div class="table">
    <div class="header-cell">
        ID
    </div>
    <div class="header-cell">
        Rule
    </div>
    {#each rules as rule, i}
        <div class="header-cell">
            {i + 1}
        </div>
        <div class="body-cell">
            <div class="item">
                {stringifyRule(rule)}
            </div>
        </div>
    {/each}
</div>

<style>
    .table {
        display: grid;
        width: fit-content;
        grid-template-columns: repeat(2, minmax(min-content, max-content));
        border: var(--background-5) solid 0.1rem;
        gap: 0.1rem;
        background: var(--background-5);
        border-radius: 0.5rem;
        overflow: hidden;
    }



    .header-cell {
        text-align: center;
        padding: 0.2rem 2rem;
        font-weight: bold;
        background: var(--secondary-10);
        color: var(--secondary-text);
    }

    .body-cell {
        background: var(--secondary-10);
        color: var(--secondary-text);
        gap: 0.1rem;
        display: flex;
    }


    .item{
        display: flex;
        flex: 1;
        gap: 0.1rem;
        padding: 0.3rem 1rem;
        background: var(--secondary);
        color: var(--secondary-text);
    }



</style>