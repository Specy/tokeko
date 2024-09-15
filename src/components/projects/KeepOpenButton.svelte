<script lang="ts">
    import Button from "$cmp/inputs/Button.svelte";
    import type {Project} from "$stores/userProjectsStore";

    export let project: Project
    export let openKey: keyof Project['keepOpen']
</script>
<Button
        border="secondary"
        style="min-width: 7rem"
        color={project.keepOpen[openKey] ? "secondary" : "primary"}
        on:click={(e) => {
                                e.stopImmediatePropagation()
                                project.keepOpen[openKey] = !project.keepOpen[openKey]
                            }}
>
    {project.keepOpen[openKey] ? "Keep closed" : "Keep open"}
</Button>