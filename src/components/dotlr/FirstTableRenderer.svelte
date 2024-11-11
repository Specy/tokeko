<script lang="ts">
    import type {FirstTable, FollowTable, Token} from "@specy/dotlr/types";
    import {stringifyToken} from "$lib/dotlr/dotlrUtils";

    export let first: FirstTable
    export let follow: FollowTable
    export let column = true

    function sortItems(a: Token, b: Token) {
        return stringifyToken(a).localeCompare(stringifyToken(b))
    }

    $: keys = [...first.keys()]
    $: firstItems = [...first.entries()].filter(([k]) => keys.includes(k)).map(([_,v]) => v.sort(sortItems))
    $: followItems = [...follow.entries()].filter(([k]) => keys.includes(k)).map(([_,v]) => v.sort(sortItems))
</script>

{#if column}
    <div
            class="table-col"
            style:--elements={keys.length * 3}
            style:--cols={keys.length + 1}
    >
        <div class="header-cell">Symbol</div>
        <div class="header-cell">First</div>
        <div class="header-cell">Follow</div>

        {#each keys as key, i}
            <div class="header-cell">{key}</div>
            <div class="body-cell">
                {#each firstItems[i] as item}
                    <div class="item">
                        {stringifyToken(item, true)}
                    </div>
                {/each}
            </div>
            <div class="body-cell">
                {#each followItems[i] as item}
                    <div class="item">
                        {stringifyToken(item, true)}
                    </div>
                {/each}
            </div>
        {/each}
    </div>
{:else}

    <div
            class="table"
            style:--elements={keys.length * 3}
            style:--cols={keys.length + 1}
    >
        <div class="header-cell">Symbol</div>
        {#each keys as key}
            <div class="header-cell">{key}</div>
        {/each}
        <div class="header-cell">First</div>
        {#each firstItems as items}
            <div class="body-cell">
                {#each items as item}
                    <div class="item">
                        {stringifyToken(item, true)}
                    </div>
                {/each}
            </div>
        {/each}
        <div class="header-cell">Follow</div>
        {#each followItems as items}
            <div class="body-cell">
                {#each items as item}
                    <div class="item">
                        {stringifyToken(item, true)}
                    </div>
                {/each}
            </div>
        {/each}
    </div>
{/if}


<style>
    .table, .table-col {
        display: grid;
        width: fit-content;
        grid-template-columns: repeat(var(--cols), minmax(min-content, max-content));
        border: var(--background-5) solid 0.1rem;
        gap: 0.1rem;
        background: var(--background-5);
        border-radius: 0.5rem;
        overflow-x: auto;
    }

    .table-col {
        grid-template-columns: repeat(3, minmax(min-content, max-content));
    }

    .item {
        display: flex;
        justify-content: center;
        flex: 1;
        gap: 0.1rem;
        min-width: 4ch;
        padding: 0.2rem 0;
        background: var(--secondary);
    }

    .header-cell {
        text-align: center;
        padding: 0.2rem 2rem;
        font-weight: bold;
        background: var(--secondary-10);
    }

    .body-cell {
        background: var(--secondary-10);
        gap: 0.1rem;
        display: flex;
    }
      .body-cell, .item, .header-cell {
         text-wrap: nowrap;
    }
</style>