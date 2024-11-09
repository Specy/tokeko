<script lang="ts">
    import FaChevronDown from "~icons/fa/chevron-down.svelte";
    import {onMount} from "svelte";

    export let expanded: boolean = false
    export let defaultExpanded: boolean = undefined
    export let style: string = ""
    onMount(() => {
        if (defaultExpanded !== undefined) expanded = defaultExpanded
    })


</script>


<div class="expandable-container" class:expandable-container-open={expanded} {style}>
    <button
            on:click={() => expanded = !expanded}
            class="expandable-container-expand"
    >
        <div class="chevron-icon" class:chevron-icon-expanded={expanded}>
            <FaChevronDown/>
        </div>
        <slot name="title"/>
    </button>
    <div class="expandable-container-content">
        <slot/>
    </div>
</div>

<style>
    .expandable-container-expand {
        display: flex;
        align-items: center;
        gap: 1rem;
        background-color: transparent;
        padding: 0.5rem;
        cursor: pointer;
        color: var(--primary-text);
    }

    .expandable-container {
        display: flex;
        flex-direction: column;
        background-color: var(--primary);
        color: var(--primary-text);
        border-radius: 0.4rem;
        border: solid 0.2rem transparent;
    }

    .chevron-icon {
        margin-left: 0.3rem;
        transition: all 0.2s;
        transform: rotate(-90deg);
    }

    .chevron-icon-expanded {
        transform: rotate(0deg);
    }

    .expandable-container-open {
        border: solid 0.2rem var(--secondary-5);
    }

    .expandable-container-content {
        display: none;
        flex-direction: column;
        padding: 0.5rem;
        border-top: solid 0.2rem var(--secondary-5);
    }

    .expandable-container-open .expandable-container-content {
        display: flex;
        animation: appear 0.2s;
    }


    @keyframes appear {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
</style>