<script lang="ts">
    import Nav from '$cmp/layout/Nav.svelte';
    import Page from '$cmp/layout/Page.svelte';

    const url = ''
</script>

<svelte:head>
    <title>
        Tokeko documentation
    </title>
    <meta name="description" content="The documentation of Tokeko"/>
</svelte:head>

<Nav/>
<Page cropped padding='1rem' mobilePadding='1rem' gap="1rem">
    <a href="{url}" class="tryit">
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