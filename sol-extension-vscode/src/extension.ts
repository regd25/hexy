import * as vscode from 'vscode';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
    console.log('SOL YAML Support extension is now active!');

    // The server is implemented in node
    let serverModule = context.asAbsolutePath(
        './server/out/server.js'
    );
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
    let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    let serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: debugOptions
        }
    };

    // Options to control the language client
    let clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: 'file', language: 'sol' }],
        synchronize: {
            // Notify the server about file changes to '.yaml' files contained in the workspace
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.sol.yaml')
        }
    };

    // Create the language client and start the client.
    client = new LanguageClient(
        'solYamlSupport',
        'SOL YAML Support',
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    client.start();

    let disposable = vscode.commands.registerCommand('sol-yaml-support.helloWorld', () => {
        vscode.window.showInformationMessage('¡Hola desde la extensión SOL YAML Support!');
    });

    context.subscriptions.push(disposable);
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
