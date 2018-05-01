import * as vscode from 'vscode';
import * as path from 'path';
import { RepositoryNode } from './repositoryNode';
import { TreeItemCollapsibleState } from 'vscode';
import { DockerAPIV2Helper } from '../utils/dockerUtils';
import { URL } from 'url';

export interface RegistrySettings {
    url: URL;
    user: string;
    password: string;
}

export class RegistryNode extends vscode.TreeItem {

    private readonly dockerApiV2Helper: DockerAPIV2Helper;
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        private readonly url: string,
        private readonly user: string,
        private readonly password: string,
        public readonly iconPath = {
            light: path.join(__filename, '..', '..', 'resources', 'light', 'Registry_16x.svg'),
            dark: path.join(__filename, '..', '..', 'resources', 'dark', 'Registry_16x.svg')
        }
    ) {
        super(label, collapsibleState);
        this.dockerApiV2Helper = new DockerAPIV2Helper(new URL(this.url), this.user, this.password);
    }

    getChildren(element?: RegistryNode | undefined): vscode.ProviderResult<RepositoryNode[]> {
        return new Promise(async resolve => {
            let chldrns: RepositoryNode[] = new Array<RepositoryNode>();

            let resp = await this.dockerApiV2Helper.getCatalogs();
            resp.forEach(element => {
                chldrns.push(new RepositoryNode(element, TreeItemCollapsibleState.Collapsed, this.dockerApiV2Helper));
            });

            resolve(chldrns);
        });
    }

    contextValue = 'registryNode';
}