<script lang="ts">
    import {createProject} from "$stores/userProjectsStore";
    import lzstring from "lz-string";
    import DotlrDocs from "$cmp/dotlr/DotlrDocs.svelte";
    import Page from "$cmp/layout/Page.svelte";

    const p = createProject();
    const s = lzstring.compressToEncodedURIComponent(JSON.stringify(p));
    const url = `/projects/share?project=${s}`;
</script>

<svelte:head>
    <title>
        Tokeko documentation
    </title>
    <meta name="description" content="The documentation of Tokeko"/>
</svelte:head>

<Page cropped="70ch" padding='1rem' mobilePadding='1rem' gap="1rem" style="padding-top: 2rem">
    <DotlrDocs/>
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