<script lang="ts">
	import type {ColorName} from '$src/stores/themeStore';
	import {type Justify, justifyMap} from './layoutUtils';

	export let justify: Justify | undefined = undefined
    export let align: Justify | undefined = undefined;
    export let gap: string | undefined = undefined;
    export let padding: string | undefined = undefined;
    export let background: ColorName | undefined = undefined;
    export let style: string | undefined = undefined;
    export let wrap: boolean = false
    export let flex1: boolean = false
</script>

<div
        class="flex"
        style="
    {justify ? `justify-content: ${justifyMap[justify]};` : ''}
    {align ? `align-items: ${justifyMap[align]};` : ''}
    {gap ? `gap: ${gap};` : ''}
    {padding ? `padding: ${padding};` : ''}
    {background ? `background-color: var(--${background}); color: var(--${background}-text);` : ''}
	{wrap ? 'flex-wrap: wrap;' : ''}
	{flex1? 'flex: 1;' : ''}
{style ?? ''}
    "
>
    <slot/>
</div>