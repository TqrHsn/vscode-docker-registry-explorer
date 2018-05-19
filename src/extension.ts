'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as copyPaste from 'copy-paste';
import * as keytarType from 'keytar';

import { PrivateDockerExplorerProvider } from './explorer/dockerExplorer';
import { LayerNode } from './models/layerNode';
import { TagNode } from './models/tagNode';
import { InputBoxOptions, MessageItem } from 'vscode';
import { Utility } from './utils/utility';
import { URL } from 'url';
import { RegistryNode } from './models/registryNode';
import { Globals } from './globals';
import { RepositoryNode } from './models/repositoryNode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    const dockerRegistryExplorer = new PrivateDockerExplorerProvider(context);

    vscode.window.registerTreeDataProvider('dockerRegistryExplorer', dockerRegistryExplorer);

    vscode.commands.registerCommand('dockerRegistryExplorer.refreshEntry', () => dockerRegistryExplorer.refresh());
    vscode.commands.registerCommand('dockerRegistryExplorer.addEntry', async node => {
        let keytar: typeof keytarType = Utility.getCoreNodeModule('keytar');

        let regUrl: string | undefined = await vscode.window.showInputBox({
            ignoreFocusOut: true,
            prompt: 'Registry url',
            validateInput: (value: string): string => {
                try {
                    let url = new URL(value);
                    let retVal = url.toString();
                    retVal = "";
                    return retVal;
                } catch (error) {
                    return `Please enter a valid url. ${error}`;
                }
            }
        });
        if (regUrl) {
            try {
                let url: URL = new URL(regUrl);
                let username: string | undefined = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: `Username for ${url.toString()}` });
                if (username) {
                    let password: string | undefined = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: `Password for ${url.toString()}`, password: true });
                    if (password) {
                        if (keytar) {
                            let nodesData: string[] = context.globalState.get(Globals.GLOBAL_STATE_REGS_KEY, []);
                            nodesData.push(url.toString());
                            context.globalState.update(Globals.GLOBAL_STATE_REGS_KEY, nodesData);
                            dockerRegistryExplorer.refresh();
                            keytar.setPassword(Globals.KEYTAR_SECRETS_KEY, `${url.toString()}.${Globals.KEYTAR_SECRETS_ACCOUNT_USER_POSTFIX_KEY}`, username);
                            keytar.setPassword(Globals.KEYTAR_SECRETS_KEY, `${url.toString()}.${Globals.KEYTAR_SECRETS_ACCOUNT_PASSWORD_POSTFIX_KEY}`, password);
                        }
                    }
                }
            } catch (error) {
                vscode.window.showErrorMessage('Error occured. Please try again. ' + error);
            }
        }

    });

    vscode.commands.registerCommand('dockerRegistryExplorer.registryNode.refreshEntry', (node: RegistryNode) => node.refresh());
    vscode.commands.registerCommand('dockerRegistryExplorer.registryNode.deleteEntry', async (node: RegistryNode) => {
        let regName = node.key;
        const result = await vscode.window.showWarningMessage(`Delete entry for '${regName}'?`, { title: 'Yes' } as MessageItem, { title: 'No', isCloseAffordance: true } as MessageItem);
        if (result && result.title === 'Yes') {
            let nodesData: string[] = context.globalState.get(Globals.GLOBAL_STATE_REGS_KEY, []);
            var index = nodesData.indexOf(regName);
            if (index !== -1) {
                nodesData.splice(index, 1);

                let keytar: typeof keytarType = Utility.getCoreNodeModule('keytar');

                let isUserDeleted = await keytar.deletePassword(Globals.KEYTAR_SECRETS_KEY, `${regName}.${Globals.KEYTAR_SECRETS_ACCOUNT_USER_POSTFIX_KEY}`);
                let isPassDeleted = await keytar.deletePassword(Globals.KEYTAR_SECRETS_KEY, `${regName}.${Globals.KEYTAR_SECRETS_ACCOUNT_PASSWORD_POSTFIX_KEY}`);

                context.globalState.update(Globals.GLOBAL_STATE_REGS_KEY, nodesData);

                if (isUserDeleted && isPassDeleted) {
                    vscode.window.showInformationMessage(`Registry settings for '${regName}' successfully deleted.`);
                }
                dockerRegistryExplorer.refresh();
            }
        }
    });

    vscode.commands.registerCommand('dockerRegistryExplorer.repositoryNode.refreshEntry', (node: RepositoryNode) => node.refresh());

    vscode.commands.registerCommand('dockerRegistryExplorer.tagNode.pullImage', async (node: TagNode) => {
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

    vscode.commands.registerCommand('dockerRegistryExplorer.tagNode.removeLocalImage', async (node: TagNode) => {
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

    vscode.commands.registerCommand('dockerRegistryExplorer.tagNode.removeRemoteImage', async (node: TagNode) => {
        const result = await vscode.window.showWarningMessage(`Delete '${node.getImageName()}' from your docker repository?`, { title: 'Yes' } as MessageItem, { title: 'No', isCloseAffordance: true } as MessageItem);
        if (result && result.title === 'Yes') {
            await node.deleteFromRepository();
        }
    });

    vscode.commands.registerCommand('dockerRegistryExplorer.layerNode.copyDigest', (node: LayerNode) => {
        let hash = node.layerItem.digest;
        copyPaste.copy(hash);
        vscode.window.setStatusBarMessage(`The digest value "${hash}" is copied to clipboard.`, 3000);
    });

}

// this method is called when your extension is deactivated
export function deactivate() {
}