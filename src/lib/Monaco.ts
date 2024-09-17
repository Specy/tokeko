import {browser} from '$app/environment';
import {generateTheme} from '$lib/theme/editorTheme';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import type monaco from 'monaco-editor'
import type * as typescript from 'typescript'
import * as ts from 'typescript';
import {
    createDotlrCompletion,
    createDotlrFormatter,
    createDotlrHoverProvider,
    createDotlrRuntimeDiagnostics,
    DotlrLanguage
} from "$lib/dotlr/DotlrLanguage";


export type MonacoType = typeof monaco

class MonacoLoader {
    private monaco: MonacoType;
    private ts: typeof typescript;
    loading: Promise<{
        monaco: MonacoType,
        ts: typeof typescript
    }>;
    toDispose: monaco.IDisposable[] = [];
    runtimeGrammarToDispose: monaco.IDisposable[] = []

    constructor() {
        if (browser) this.load()
    }

    dispose = () => {
        this.toDispose.forEach(d => d.dispose())
    }

    async typescriptToJavascript(code: string) {
        const model = this.monaco.editor.createModel(code, 'typescript')
        const worker = await this.monaco.languages.typescript.getTypeScriptWorker()
        return worker(model.uri).then((client) => {
            return client.getEmitOutput(model.uri.toString()).then((result) => {
                model.dispose()
                return result.outputFiles[0].text
            })
        })
    }


    async load(): Promise<{ monaco: MonacoType, ts: typeof typescript }> {
        if (this.loading) return this.loading
        this.loading = new Promise(async res => {
            const [monaco, ts] = await Promise.all([
                import('monaco-editor'),
                import('typescript')
            ])
            res({monaco, ts: ts})
        })
        const {monaco, ts} = await this.loading
        this.monaco = monaco
        this.ts = ts
        monaco.editor.defineTheme('custom-theme', generateTheme())
        monaco.languages.register({id: 'dotlr'})
        monaco.languages.register({id: 'dotlr-result'})
        this.monaco = monaco
        monaco.languages.typescript.typescriptDefaults.addExtraLib(tsGlobal, 'global.d.ts')
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            strict: true,
            noImplicitAny: true,
            strictNullChecks: true,
            strictFunctionTypes: true,
        });
        this.registerLanguages()
        self.MonacoEnvironment = {
            getWorker: function (_, label) {
                if (label === 'typescript' || label === 'javascript') {
                    return new tsWorker()
                }
                return new editorWorker()
            }
        }
        return {monaco, ts}
    }

    //converts a typescript code to a tree
    codeToTree(code: string): ts.Node {
        const ts = this.ts
        const sourceFile = ts.createSourceFile(
            'example.ts',
            code,
            ts.ScriptTarget.Latest,
            true
        );
        console.log(sourceFile.statements[0])
        return sourceFile.statements[0]

    }

    replaceParseCalls(sourceCode: string, fnName: string, onMatch: (ts: typeof typescript, node: ts.Node) => ts.Node): string {
        const ts = this.ts
        const id = Math.floor(Math.random() * 1000000)
        const sourceFile = ts.createSourceFile(
            `${id}-example.ts`,
            sourceCode,
            ts.ScriptTarget.Latest,
            true
        );

        function visit(node: ts.Node): ts.Node {
            if (
                ts.isCallExpression(node) &&
                ts.isIdentifier(node.expression) &&
                node.expression.text === fnName
            ) {
                const arg = node.arguments[0];
                if (!arg) return node
                return onMatch(ts, arg)
            }
            //@ts-expect-error - ts.visitEachChild works
            return ts.visitEachChild(node, visit, ts.nullTransformationContext);
        }

        const result = ts.transform(sourceFile, [
            //@ts-expect-error - ts.visitNode works
            (context) => (rootNode) => ts.visitNode(rootNode, visit)
        ]);

        const printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed});
        const res = printer.printFile(result.transformed[0] as ts.SourceFile);
        return res
    }

    setTheme = (theme: string) => {
        this.monaco.editor.setTheme(theme)
    }
    setCustomTheme = (theme: monaco.editor.IStandaloneThemeData) => {
        this.monaco.editor.defineTheme('custom-theme', theme)
        this.monaco.editor.setTheme('custom-theme')
    }
    registerLanguages = () => {
        this.dispose()
        const {monaco} = this
        if (!monaco) return
        //@ts-expect-error - Language works
        this.toDispose.push(monaco.languages.setMonarchTokensProvider('dotlr', DotlrLanguage))
        this.toDispose.push(monaco.languages.registerDocumentFormattingEditProvider('dotlr', createDotlrFormatter()))
        this.toDispose.push(monaco.languages.registerHoverProvider('dotlr', createDotlrHoverProvider()))
        this.toDispose.push(monaco.languages.registerCompletionItemProvider('dotlr', createDotlrCompletion()))

    }

    registerRuntimePushers = (language: 'dotlr' | 'dotlr-result' | "typescript", instance: monaco.editor.ITextModel) => {
        if (language === 'dotlr') {
            const disposer = createDotlrRuntimeDiagnostics(instance)
            return () => disposer.dispose()
        }
        return () => {
        }
    }


    async get() {
        if (this.monaco) return this.monaco
        await this.load()
        return this.monaco
    }
}


const tsGlobal = `
    type ReturnTree = {
        ok: true
        val: Tree
    } | {
        ok: false
        val: unknown
    }
    declare function PARSE(text: string): ReturnTree;
    declare type Tree = {
        type: 'Terminal'
        value: {
            token: Token,
            slice: string
        }
    } | {
        type: 'NonTerminal'
        value: {
            symbol: string,
            pattern: Tree[]
        }
    }
    declare type Token = {
        type: 'Constant'
        value: string
    } | {
        type: 'Regex',
        value: string
    } | {
        type: 'Eof'
    }
`

export function objectFactory(ts: typeof typescript, object: object) {
    //use JSON.parse(JSON.stringify(object)) to create a deep copy of the object
    const factory = ts.factory
    return factory.createCallExpression(
        factory.createPropertyAccessExpression(
            factory.createIdentifier("JSON"),
            factory.createIdentifier("parse")
        ),
        undefined,
        [factory.createStringLiteral(JSON.stringify(object))]
    );
}


export const Monaco = new MonacoLoader()