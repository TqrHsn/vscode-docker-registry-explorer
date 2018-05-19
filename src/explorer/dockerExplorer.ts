import * as vscode from 'vscode';
import * as keytarType from 'keytar';
import { RegistryNode } from '../models/registryNode';
import { URL } from 'url';
import { Globals } from '../globals';
import { Utility } from '../utils/utility';
import { RootNode } from '../models/rootNode';

export class PrivateDockerExplorerProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem> = new vscode.EventEmitter<vscode.TreeItem>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem> = this._onDidChangeTreeData.event;

    async refresh(): Promise<void> {
        this._onDidChangeTreeData.fire();
    }

    constructor(private context: vscode.ExtensionContext) {

    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: RootNode | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
        if (!element) {
            return new Promise(async resolve => {
                let chldrns: RegistryNode[] = new Array<RegistryNode>();
                let keytar: typeof keytarType = Utility.getCoreNodeModule('keytar');

                let nodesData: string[] = this.context.globalState.get(Globals.GLOBAL_STATE_REGS_KEY, []);

                for (let i = 0; i < nodesData.length; i++) {
                    const key = nodesData[i];
                    let url: URL = new URL(key);
                    let user = await keytar.getPassword(Globals.KEYTAR_SECRETS_KEY, `${url}.${Globals.KEYTAR_SECRETS_ACCOUNT_USER_POSTFIX_KEY}`);
                    let password = await keytar.getPassword(Globals.KEYTAR_SECRETS_KEY, `${url}.${Globals.KEYTAR_SECRETS_ACCOUNT_PASSWORD_POSTFIX_KEY}`);
                    chldrns.push(new RegistryNode(url.hostname, url.toString(), vscode.TreeItemCollapsibleState.Collapsed, url.toString(), user || '', password || '', this._onDidChangeTreeData));
                }

                resolve(chldrns);
            });
        } else {
            return element.getChildren();
        }
    }
}