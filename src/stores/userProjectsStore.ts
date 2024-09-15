import {db} from "$src/lib/db"
import {get, writable} from "svelte/store"
import type {ParserType} from "$src/routes/projects/[projectId]/projectStore";


export type Project = {
    version: number,
    id: string,
    name: string,
    description: string,
    createdAt: number,
    updatedAt: number
    grammar: string
    content: string
    parserType: ParserType
    keepOpen: {
        grammar: boolean,
        firstAndFollow: boolean,
        automaton: boolean,
        parsingTable: boolean,
        parseTrace: boolean
    }
    options: {
        columnFirstAndFollow: boolean
        noAposInParseTrace: boolean,
        noAposInAutomaton:boolean,
        showAutomatonAsGraph: boolean
    }
}

export function validateProject(project: Project): Project {
    return {...createProject(), ...project}
}

export function createProject(): Project {
    return {
        version: 1,
        id: "",
        name: "Unnamed",
        description: "",
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
        content: ``,
        grammar: '',
        parserType: 'LALR',
        keepOpen: {
            grammar: false,
            firstAndFollow: false,
            automaton: false,
            parsingTable: false,
            parseTrace: false
        },
        options: {
            columnFirstAndFollow: false,
            noAposInParseTrace: true,
            noAposInAutomaton: true,
            showAutomatonAsGraph: false,
        }
    }
}


type UserProjectsStore = {
    initialized: boolean,
    projects: Project[],
}

export function createProjectStore() {
    const {subscribe, update} = writable<UserProjectsStore>({
        initialized: false,
        projects: []
    })

    async function ensureInit() {
        const isInit = get({subscribe}).initialized
        if (!isInit) {
            await syncProjectsWithStore()
        }
    }

    async function createNewProject(name: string, description: string): Promise<Project> {
        await ensureInit()
        const project = createProject()
        project.name = name || "Unnamed"
        project.description = description
        const pr = await db.saveProject(project)
        update(store => {
            store.projects.push(pr)
            return store
        })
        return pr
    }

    async function updateProject(id: string, fields: Partial<Project>): Promise<Project> {
        await ensureInit()
        const project = await getProject(id)
        const toUpdate = {...project, ...fields}
        delete toUpdate.id
        const pr = await db.updateProject(id, toUpdate)

        update(store => {
            const index = store.projects.findIndex(p => p.id === pr.id)
            if (index === -1) {
                throw new Error("Project not found")
            }
            store.projects[index] = pr
            return store
        })
        return pr
    }

    async function deleteProject(id: string) {
        await ensureInit()
        await db.deleteProject(id)
        update(store => {
            store.projects = store.projects.filter(p => p.id !== id)
            return store
        })
    }

    async function syncProjectsWithStore() {
        const promise = await db.loadProjects()
        const projects = promise.sort((a, b) => b.updatedAt - a.updatedAt)
            .map(validateProject)
        update(store => {
            store.projects = projects
            store.initialized = true
            return store
        })
    }

    async function getProject(id: string): Promise<Project | undefined> {
        await ensureInit()
        return get({subscribe}).projects.find(p => p.id === id)
    }

    return {
        subscribe,
        createNewProject,
        updateProject,
        syncProjectsWithStore,
        deleteProject,
        getProject
    }
}

export const projectStore = createProjectStore()



