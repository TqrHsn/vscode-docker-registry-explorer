import * as vscode from 'vscode';
import * as path from 'path';
import { RepositoryNode } from './repositoryNode';
import { TreeItemCollapsibleState } from 'vscode';
import { DockerAPIV2Helper } from '../utils/dockerUtils';
import { URL } from 'url';
import { RootNode } from './rootNode';

export class RegistryNode extends RootNode {

    private readonly dockerApiV2Helper: DockerAPIV2Helper;
    constructor(
        readonly label: string,
        public readonly key: string,
        readonly collapsibleState: vscode.TreeItemCollapsibleState,
        private readonly url: string,
        private readonly user: string,
        private readonly password: string,
        onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem>,
        parent: RootNode | undefined = undefined,
        public readonly iconPath = {
            light: path.join(__filename, '..', '..', 'resources', 'light', 'Registry_16x.svg'),
            dark: path.join(__filename, '..', '..', 'resources', 'dark', 'Registry_16x.svg')
        }
    ) {
        super(label, collapsibleState, onDidChangeTreeData, parent);
        this.dockerApiV2Helper = new DockerAPIV2Helper(new URL(this.url), this.user, this.password);
    }

    getChildren(element?: RootNode | undefined): vscode.ProviderResult<RepositoryNode[]> {
        return new Promise(async resolve => {
            let chldrns: RepositoryNode[] = new Array<RepositoryNode>();

            let resp = await this.dockerApiV2Helper.getCatalogs();
            resp.forEach(element => {
                chldrns.push(new RepositoryNode(element, TreeItemCollapsibleState.Collapsed, this.dockerApiV2Helper, this.onDidChangeTreeData, this));
            });

            resolve(chldrns);
        });
    }

    contextValue = 'registryNode';
}