<script lang="ts">
    import Nav from '$cmp/layout/Nav.svelte';
    import Page from '$cmp/layout/Page.svelte';

    const url = '/projects/share?project=N4IgbgpgTgzglgewHYgFwEYA0I4BM0gwAWAhlBCNkiQLYWogCqS1d+2uEMAxlHAA4AXRCgaUQvCCUERcAQUFp0AdgBMANgAsqlQFZd6gJzrsAV365pshUrVb1y3QA506AAxYJyGUkUN0ANRuAejiAOZQtDRkBACiAAQAtAB88QkA5AHp8QBCADpQeUgJKbkFRTlJqelu6eVIlaXp6Oni-GQw0AAqAJ789CAAMgBKodgA1hAQ-ADy-aKgEVExqABmJAA2ndircLCCcki4AGIIGxsIAO5o61sQ2CSmggjRz6KCUKb3IO2wcEhhLokABGG3ot22Pw6EC6kW44M2nQAvtgEEIRDA0KBuGdTDQkMc9jADkdTucrjdEd8kAg5PwEDAAJJIORPF7SZBoD5fKi0+lMpAABWhsJI8K5nwgSKRQA'
</script>

<svelte:head>
    <title>
        Tokeko documentation
    </title>
    <meta name="description" content="The documentation of Tokeko"/>
</svelte:head>

<Nav/>
<Page cropped padding='1rem' mobilePadding='1rem' gap="1rem">
    <h1>
        Tokeko documentation
    </h1>
    <div>
        Docs in progress
        <a href="https://github.com/umut-sahin/dotlr" style="color: var(--accent)">
            Look here for the syntax of the grammar
        </a>
    </div>
    <a href="{url}" class="tryit">
        Try it
    </a>
</Page>


<style>
    .tryit {
        border-radius: 0.8rem;
        width: 100%;
        background-color: var(--accent);
        color: var(--accent-text);
        padding: 0.5rem 1rem;
        text-align: center;
    }
</style>