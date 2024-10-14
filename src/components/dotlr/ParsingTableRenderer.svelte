<script lang="ts">
    import type {ParsingTables} from "@specy/dotlr/types";
    import {stringifyAction, stringifyToken} from "$lib/dotlr/dotlrUtils";

    export let table: ParsingTables

    export let nonTerminals: string[]
    export let terminals: string[]
    export let regexes: string[]
    export let noApos = false

    function zipTable(table: ParsingTables) {
        const actionEntries = [...table.action_table.values()]
        const gotoEntries = [...table.goto_table.values()]
        return actionEntries.map(((a, i) => ({
                action: new Map([...a.entries()].map(([k, v]) => [stringifyToken(k), v])),
                goto: gotoEntries[i]
            }
        )))

    }

    $: states = zipTable(table)
</script>
<div
        class="table"
        style:--cols={nonTerminals.length + terminals.length + regexes.length + 2}
>
    <div class="header-cell"
         style="grid-row: span 2; display: flex; align-items: center;"
    >
        State
    </div>

    <div class="header-cell" style="grid-column: span {terminals.length + regexes.length + 1};">
        Action
    </div>
    <div class="header-cell" style="grid-column: span  {nonTerminals.length};">
        Goto
    </div>
    {#each terminals as t}
        <div class="header-cell">
            {noApos ? t : `'${t}'`}
        </div>
    {/each}
    {#each regexes as r}
        <div class="header-cell">%{r}</div>
    {/each}
    <div class="header-cell">$</div>
    {#each nonTerminals as nt}
        <div class="header-cell">{nt}</div>
    {/each}
    {#each states as state, i}
        {@const eofAction = state.action.get('$')}
        <div class="header-cell state">{i}</div>
        {#each terminals as t}
            <div class="body-cell">
                {#each state.action.get(`'${t}'`) ?? [] as action}
                    <div class="item-centered">
                        {stringifyAction(action)}
                    </div>
                {:else}
                    <div class="item-centered">

                    </div>
                {/each}
            </div>
        {/each}
        {#each regexes as r}
            <div class="body-cell">
                {#each state.action.get(`%${r}`) ?? [] as action}
                    <div class="item-centered">
                        {stringifyAction(action)}
                    </div>
                {:else}
                    <div class="item-centered">

                    </div>
                {/each}
            </div>
        {/each}
        <div class="body-cell">
						{#each eofAction ?? [] as action}
								<div class="item-centered">
										{stringifyAction(action)}
								</div>
						{:else}
								<div class="item-centered">

								</div>
						{/each}
        </div>
        {#each nonTerminals as nt}
            <div class="body-cell">
                <div class="item-centered">
                    {state.goto.get(nt) ?? ""}
                </div>
            </div>
        {/each}
    {/each}
</div>
<style>
    .table {
        display: grid;
        overflow-x: auto;
        width: fit-content;
        grid-template-columns: repeat(var(--cols), minmax(min-content, max-content));
        border: var(--background-5) solid 0.1rem;
        gap: 0.1rem;
        background: var(--background-5);
        border-radius: 0.5rem;
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


    .item, .item-centered {
        display: flex;
        flex: 1;
        gap: 0.1rem;
        padding: 0.3rem 1rem;
        background: var(--secondary);
        color: var(--secondary-text);
    }

    .item-centered {
        justify-content: center;

    }

    .state {
        font-size: 1.2rem;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;
        border: solid 0.2rem transparent;
    }

    .body-cell, .header-cell {
        text-wrap: nowrap;
    }

</style>