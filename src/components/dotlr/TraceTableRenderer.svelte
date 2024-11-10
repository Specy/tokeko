<script lang="ts">
    import type {Trace} from "@specy/dotlr/types";
    import type {Grammar} from "@specy/dotlr";
    import {stringifyRule, stringifyToken, stringifyTreeStack} from "$lib/dotlr/dotlrUtils";

    export let trace: Trace
    export let grammar: Grammar
    export let noApos = false

    $: rules = grammar.getProductions()
</script>

<div
        class="table"
        style:--cols={5}
>
    <div class="header-cell">Step</div>
    <div class="header-cell">State Stack</div>
    <div class="header-cell">Symbol Stack</div>
    <div class="header-cell">Remaining Input</div>
    <div class="header-cell">Action taken</div>
    {#each trace.steps as step, i}
        <div class="header-cell">
            {i}
        </div>
        <div class="body-cell">
            <div class="item">
                {step.state_stack.join(" ")}
            </div>
        </div>
        <div class="body-cell">
            <div class="item">
                {stringifyTreeStack(step.tree_stack, noApos).join(" ")}
            </div>
        </div>
        <div class="body-cell">
            <div class="item">
                {step.remaining_tokens.map(i => stringifyToken(i.object, true)).join(' ')}
            </div>
        </div>
        <div class="body-cell" style="gap: 0">
            <div class="action flex align-center">
                {step.action_taken.type}
            </div>
            {#if step.action_taken.type === "Shift"}
                <div class="item separated">
                    {step.action_taken.value.next_state}
                </div>
                 <div class="item">
                </div>
            {:else if step.action_taken.type === "Reduce"}
                <div class="item separated">
                    {step.action_taken.value.rule_index + 1}
                </div>
                <div class="item">
                    {stringifyRule(rules[step.action_taken.value.rule_index], noApos)}
                </div>
            {:else if step.action_taken.type === "Accept"}
                <div class="item separated">
                    {step.action_taken.value.rule_index + 1}
                </div>
                <div class="item">
                    {stringifyRule(rules[step.action_taken.value.rule_index], noApos)}
                </div>
            {/if}
        </div>
    {/each}
</div>
<style>
    .action {
        padding: 0.2rem 1rem;
        background-color: var(--secondary-5);
        width: 5.5rem;
    }

    .table{
        display: grid;
        width: fit-content;
        grid-template-columns: repeat(var(--cols), minmax(min-content, max-content));
        border: var(--background-5) solid 0.1rem;
        gap: 0.1rem;
        background: var(--background-5);
        border-radius: 0.5rem;
        overflow-x: auto;
    }


    .item {
        display: flex;
        align-items: center;
        flex: 1;
        gap: 0.1rem;
        padding: 0.2rem 1rem;
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
        display: flex;
        gap: 0.1rem;
    }

    .separated {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;
        max-width: 5ch;
        min-width: 5ch;
        border-right: solid 0.1rem var(--secondary-10);
        border-left: solid 0.1rem var(--secondary-10);
    }

    .body-cell, .item, .header-cell {
         text-wrap: nowrap;
    }
</style>