'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as copyPaste from 'copy-paste';
import * as keytarType from 'keytar';

import { PrivateDockerExplorerProvider } from './explorer/dockerExplorer';
import { LayerNode } from './models/layerNode';
import { TagNode } from './models/tagNode';
import { InputBoxOptions } from 'vscode';
import { Utility } from './utils/utility';
import { URL } from 'url';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    const pvtDockerRegExplorer = new PrivateDockerExplorerProvider(context);

    vscode.window.registerTreeDataProvider('pvtDockerRegExplorer', pvtDockerRegExplorer);
    vscode.commands.registerCommand('pvtDockerRegExplorer.refreshEntry', () => pvtDockerRegExplorer.refresh());
    vscode.commands.registerCommand('pvtDockerRegExplorer.addEntry', async node => {
        let keytar: typeof keytarType = Utility.getCoreNodeModule('keytar');

        let regUrl: string | undefined = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Registry url' });
        if (regUrl) {
            try {
                let url: URL = new URL(regUrl);
                let username: string | undefined = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Username' });
                if (username) {
                    let password: string | undefined = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Password', password: true });
                    if (password) {
                        if (keytar) {
                            context.globalState.update('vscode-private-docker-registry-explorer-nodes', [url]);
                            pvtDockerRegExplorer.refresh();
                            // keytar.setPassword('vscode-private-docker-registry-explorer', `${url.hostname}.user`, username);
                            // keytar.setPassword('vscode-private-docker-registry-explorer', `${url.hostname}.password`, password);
                        }
                    }
                }
            } catch (error) {
                vscode.window.showErrorMessage('Error occured. Please try again. ' + error);
            }



        }

    });
    vscode.commands.registerCommand('pvtDockerRegExplorer.deleteEntry', node => vscode.window.showInformationMessage('Successfully called delete entry'));
    vscode.commands.registerCommand('pvtDockerRegExplorer.layerNode.copyhash', (node: LayerNode) => {
        let hash = node.layerItem.digest.substr(7);
        copyPaste.copy(hash);
        vscode.window.setStatusBarMessage(`The digest value "${hash}" was copied to the clipboard.`, 3000);
    });
    vscode.commands.registerCommand('pvtDockerRegExplorer.tagNode.pullimage', async (node: TagNode) => {
        let imageName: string = node.getImageName();
        const command = await vscode.window.showInputBox({
            prompt: `Run this command to pull image?`,
            placeHolder: ``,
            value: `docker pull ${imageName}`
        } as InputBoxOptions);
        if (command === undefined || command === '') {
            return;
        }
        const terminal = vscode.window.createTerminal();
        terminal.show();
        terminal.sendText(command, false);
    });
    vscode.commands.registerCommand('pvtDockerRegExplorer.tagNode.removelocalimage', async (node: TagNode) => {
        let imageName: string = node.getImageName();
        const command = await vscode.window.showInputBox({
            prompt: `Run this command to remove image?`,
            placeHolder: ``,
            value: `docker rmi ${imageName}`
        } as InputBoxOptions);
        if (command === undefined || command === '') {
            return;
        }
        const terminal = vscode.window.createTerminal();
        terminal.show();
        terminal.sendText(command, false);
    });

}

// this method is called when your extension is deactivated
export function deactivate() {
}