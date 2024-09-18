import {writable} from "svelte/store";


export const installEventStore = writable({
    event: null as Event | null,
})