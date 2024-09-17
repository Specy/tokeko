export type ConsoleOutput = {
    type: 'log' | 'error' | 'warn' | 'info';
    args: unknown[];
};


export async function runSandboxedCode(code: string, global: Record<string, any> = {}): Promise<{
    result: any;
    consoleOutput: ConsoleOutput[]
}> {
    return new Promise((resolve) => {
        const iframe = document.createElement('iframe');
        iframe.sandbox.add("allow-same-origin")
        iframe.sandbox.add("allow-scripts")
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const consoleOutput: ConsoleOutput[] = [];

        const iframeWindow = iframe.contentWindow;
        if (!iframeWindow) {
            throw new Error('Failed to create iframe');
        }

        for (const [key, value] of Object.entries(global)) {
            iframeWindow[key] = value
        }

        // Override console methods
        (['log', 'error', 'warn', 'info']).forEach((method) => {
            //@ts-expect-error
            iframeWindow.console[method as keyof Console] = (...args: any[]) => {
                consoleOutput.push({type: method as 'log' | 'error' | 'warn' | 'info', args});
            };
        });

        // Inject code to signal completion
        const wrappedCode = `
      // Disable dangerous APIs
      const dangerousApis = [
        'localStorage',
        'sessionStorage',
        'indexedDB',
        'webkitIndexedDB',
        'mozIndexedDB',
        'msIndexedDB',
        'webkitStorageInfo',
        'crypto',
        'caches',
        'navigation',
        'navigator'
      ];

      function disableApi(obj, api) {
        Object.defineProperty(obj, api, {
          get: () => {
            console.warn(\`Access to \${api} is not allowed in this sandbox.\`);
            return undefined;
          },
          set: () => {
            console.warn(\`Setting \${api} is not allowed in this sandbox.\`);
          },
        });
      }

      // Disable APIs on both window and globalThis
      [window, globalThis].forEach(obj => {
        dangerousApis.forEach(api => {
          if (api in obj) {
            disableApi(obj, api);
          }
        });

        // Disable access to window.opener and globalThis.opener
        disableApi(obj, 'opener');
      });

      // Disable access to document.domain
      Object.defineProperty(document, 'domain', {
        get: () => {
          console.warn('Access to document.domain is not allowed in this sandbox.');
          return null;
        },
        set: () => {
          console.warn('Modifying document.domain is not allowed in this sandbox.');
        },
        configurable: false
      });

      try {
        ${code}
      } catch (error) {
        console.error(error);
      } finally {
        window.parent.postMessage({ type: 'CODE_EXECUTION_COMPLETE', result: (typeof result !== 'undefined') ? result : undefined }, '*');
      }
    `;

        // Listen for the completion message
        window.addEventListener('message', function onMessage(event) {
            if (event.data.type === 'CODE_EXECUTION_COMPLETE') {
                window.removeEventListener('message', onMessage);
                document.body.removeChild(iframe);
                resolve({result: event.data.result, consoleOutput});
            }
        });

        // Execute the code
        const script = iframeWindow.document.createElement('script');
        script.textContent = wrappedCode;
        iframeWindow.document.body.appendChild(script);
    });
}