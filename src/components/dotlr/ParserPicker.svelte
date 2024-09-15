<script lang="ts">
    import {PARSER_TYPES, type ParserType} from "$src/routes/projects/[projectId]/projectStore";

    export let value: ParserType
</script>


<select bind:value>
    {#each PARSER_TYPES as type}
        <option value={type}>
            {type}
        </option>
    {/each}
</select>


<style>
    select{
        background-color: var(--secondary);
        color: var(--secondary-text);
        border-radius: 0.5rem;
        padding: 0.2rem 0.8rem;
        min-width: 8ch;
        font-family: Rubik;
        font-size: 1.1rem;
    }
</style>