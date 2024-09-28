<script lang="ts">
    import {onMount} from 'svelte';
    import hljs from 'highlight.js/lib/core';
    import "highlight.js/styles/atom-one-dark.css"
    import {highlightJsGrammar} from '$src/lib/dotlr/hljsLanguage';
    import typescript from 'highlight.js/lib/languages/typescript'
    import python   from 'highlight.js/lib/languages/python'
    export let style: string = ""
    export let source: string;
    export let language: "dotlr"
    let code: HTMLElement;
    onMount(() => {
        hljs.registerLanguage('dotlr', () => highlightJsGrammar);
        hljs.registerLanguage('typescript', typescript);
        hljs.registerLanguage('python', python);
    });

    function highlight(sourceCode: string, el: HTMLElement, lang: string) {
        if (!el) return;
        const highlighted = hljs.highlight(sourceCode, {language: lang}).value;
        el.innerHTML = highlighted;
    }

    $: highlight(source, code, language);
</script>

<pre class="my_hljs" {style}><code bind:this={code}></code></pre>

<style lang="scss">
  .my_hljs {
    font-family: "Fira Code", Consolas, "Courier New", monospace !important;
    font-weight: normal;
    font-feature-settings: "liga", "calt";
    font-variation-settings: normal;
    font-size: 1rem;
  }

  :global(code) {
    font-family: "Fira Code", Consolas, "Courier New", monospace !important;
    font-weight: normal;
    font-feature-settings: "liga", "calt";
    font-variation-settings: normal;
  }

  :global(.hljs-identifierDefine) {
    color: #bb82d2;
  }

  :global(.hljs-keyword) {
    color: #ff6087;
  }

  :global(.hljs-number) {
    color: #69ac91;
  }

  :global(.hljs-string) {
    color: #d9b33f;
  }

  :global(.hljs-bracketsExpansion) {
    color: #ff6087;
  }

  :global(.hljs-graphDeclaration) {
    color: #00fff0;
  }

  :global(.hljs-operator) {
    color: #dcdcdc;
  }

  :global(.hljs-identifier) {
    color: #b9b9b9;
  }

  :global(.hljs-built_in) {
    color: #dc8455;
  }

  :global(.hljs-literal) {
    color: #69ac91;
  }

  :global(.hljs-brackets, .hljs-operator, .hljs-delimiter) {
    color: #dcdcdc;
  }

  :global(.hljs-identifierIgnore) {
    color: #6a6a6a;
  }

  :global(.hljs-productionHead) {
    color: #a6a6a6;
    font-weight: bold;
  }

  :global(.hljs-productionArrow ) {
    color: #beaa3d;
  }

  :global(.hljs-terminal) {
    color: #ce9178;
  }

  :global(.hljs-nonTerminal) {
    color: #978cca;
  }

  :global(.hljs-special) {
    color: #509e82;
    font-style: italic;
  }

  :global(.hljs-regexp) {
    color: #d3547e;
  }

  :global(.hljs-invalid) {
    color: #d72d2d;
  }
  :global(.hljs-comment) {
    opacity: 1;
  }

</style>
