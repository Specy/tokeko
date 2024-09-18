<script lang="ts">
    import {createEventDispatcher, onDestroy, onMount} from 'svelte';
    import type monaco from 'monaco-editor';
    import {type MonacoType} from '$lib/Monaco';
    import {Monaco} from '$lib/Monaco';
    import {generateTheme} from '$lib/theme/editorTheme';
    import {createDotlrRuntimeRuntimeDiagnostics, getRuntimeDeltaDecorations} from "$lib/dotlr/RuntimeDotlr";

    export let disabled = false;
    export let code: string;
    export let highlightedLine: number;
    export let hasError = false;
    export let language: 'dotlr' | 'dotlr-result' | "typescript";
    export let style = '';
    export let editor: monaco.editor.IStandaloneCodeEditor | null = null;
    export let config: monaco.editor.IStandaloneEditorConstructionOptions = {};
    export let runtimeGrammar: string = undefined;
    let mockEditor: HTMLDivElement | null;
    let monacoInstance: MonacoType | null;
    let runtimeDiagnostic: monaco.editor.IDisposable;

    $: {
        if(editor && runtimeGrammar && language === 'dotlr'){
            runtimeDiagnostic?.dispose();
            runtimeDiagnostic = createDotlrRuntimeRuntimeDiagnostics(editor.getModel(), runtimeGrammar);
        }
    }

    $: {
        if(editor && runtimeGrammar && language === 'typescript'){
            Monaco.setRuntimeGrammar(runtimeGrammar);
        }
    }

    const toDispose = [];
    const dispatcher = createEventDispatcher<{
        change: string;
        breakpointPress: number;
    }>();
    let el: HTMLDivElement;

    onMount(async () => {
        monacoInstance = await Monaco.get();
        if (!el) return console.log('Wrapper element not valid', el);
        Monaco.registerLanguages();
        editor = monacoInstance.editor.create(el, {
            value: code,
            language: language.toLowerCase(),
            theme: 'custom-theme',
            minimap: {enabled: false},
            fontLigatures: true,
            fontFamily: "Fira Code",
            scrollbar: {
                vertical: 'auto',
                horizontal: 'auto'
            },
            glyphMargin: false,
            cursorBlinking: 'phase',
            fontSize: 16,
            smoothScrolling: true,
            cursorSmoothCaretAnimation: 'on',
            ...config
        });
        const model = editor.getModel();
        const observer = new ResizeObserver(() => {
            if (!mockEditor) return;
            const bounds = mockEditor.getBoundingClientRect();
            editor.layout({
                width: bounds.width,
                height: bounds.height
            });
        });
        Monaco.setCustomTheme(generateTheme());
        observer.observe(mockEditor);
        toDispose.push(() => observer.disconnect());
        const disposer = model.onDidChangeContent(() => {
            code = editor.getValue();
            dispatcher('change', code);
        })
        toDispose.push(() => disposer.dispose());
        toDispose.push(Monaco.registerRuntimePushers(language, model))
        let id = setTimeout(() => {
            //trigger to run the diagnostics on build
            editor.setValue(code)
        }, 1000)
        toDispose.push(() => clearTimeout(id));
    });
    $: {
        if (editor && code !== editor.getValue()) {
            editor.setValue(code);
        }
    }

    onDestroy(() => {
        toDispose.forEach((d) => {
            if (typeof d === 'function') return d();
            d.dispose();
        });
        editor?.dispose();
    });

    $: decorations = editor?.createDecorationsCollection()
    $: {
        if (editor && decorations) {
            decorations.set([
                ...(highlightedLine >= 0
                    ? [
                        {
                            range: new monacoInstance.Range(highlightedLine + 1, 0, highlightedLine + 1, 0),
                            options: {
                                className: hasError ? 'error-line' : 'selected-line',
                                inlineClassName: 'selected-line-text',
                                isWholeLine: true
                            }
                        }
                    ]
                    : []),
                ...((runtimeGrammar && language === 'dotlr-result')  ? getRuntimeDeltaDecorations(editor.getModel(), runtimeGrammar, code) : [])
            ]);
        }
    }

    $: {
        if (editor && highlightedLine > 0) {
            editor.revealLineInCenter(highlightedLine);
        }
    }
    $: editor?.updateOptions({readOnly: disabled});
</script>

<div bind:this={mockEditor} class="mock-editor" {style}>
    {#if !editor}
        <h1 class="loading">Loading editor...</h1>
    {/if}
    <div bind:this={el} class="editor"/>
</div>

<style lang="scss">
  :global(.selected-line) {
    background-color: var(--accent);
    color: var(--accent-text);
  }

  :global(.runtime-token-Constant) {

    background: rgba(100, 74, 72, 0.2);
    border-radius: 2px;
    border: solid 1px rgba(100, 74, 72, 1);
  }

  :global(.runtime-token-Regex) {
    background: rgb(78, 143, 121, 0.1);
    border-radius: 2px;
    border: solid 1px rgb(78, 143, 121, 0.8);
  }

  :global(.overflow-guard, .monaco-editor) {
    border-radius: 0.4rem;
  }

  :global(.error-line) {
    background-color: var(--red);
    color: var(--red-text);
  }

  :global(.selected-line-text) {
    color: var(--accent-text) !important;
  }

  :global(.find-widget) {
    border-radius: 0.3rem !important;
    top: 1rem !important;
    right: 1rem !important;
  }

  :global(.editor-widget.suggest-widget) {
    border-radius: 0.3rem !important;
    overflow: hidden;
  }

  :global(.monaco-editor-overlaymessage .message) {
    border-radius: 0.3rem !important;
    border-bottom-left-radius: 0 !important;
  }

  :global(.monaco-inputbox) {
    border-radius: 0.2rem;
  }

  :global(.monaco-hover) {
    border-radius: 0.3rem;
    box-shadow: 0 3px 10px rgb(0 0 0 / 0.2);
    border: 1px solid var(--accent2) !important;
  }

  :global(.monaco-editor .monaco-hover .hover-row:not(:first-child):not(:empty)) {
    border-top: 1px solid var(--accent2) !important;
  }

  :global(.find-widget) {
    transform: translateY(calc(-100% - 1.2rem)) !important;
  }

  :global(.find-widget.visible) {
    transform: translateY(0) !important;
  }

  .mock-editor {
    display: flex;
    position: relative;
    flex: 1;
  }

  :global(.breakpoint-glyph),
  :global(.hovered-glyph) {
    width: calc(22px - 0.6rem) !important;
    height: calc(22px - 0.6rem) !important;
    margin-top: 0.3rem;
    cursor: pointer;
    margin-left: 0.6rem;
    background-color: var(--accent);
    border-radius: 1rem;
  }

  :global(.hovered-glyph) {
    background-color: var(--accent2) !important;
  }

  .editor {
    display: flex;
    position: absolute;
    flex: 1;
    box-shadow: 0 3px 10px rgb(0 0 0 / 0.2);
  }

  .loading {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    background-color: var(--secondary);
    color: var(--secondary-text);
    border-radius: 0.4rem;
    animation: infinite 3s pulse ease-in-out;
    position: absolute;
  }

  @keyframes pulse {
    0% {
      background-color: var(--secondary);
    }
    50% {
      background-color: var(--primary);
    }
    100% {
      background-color: var(--secondary);
    }
  }
</style>
