import * as vscode from 'vscode';
import * as path from 'path';
import { DockerAPIV2Helper } from '../utils/dockerUtils';
import { TagNode } from './tagNode';
import { TreeItemCollapsibleState } from 'vscode';


export class RepositoryNode extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        private readonly dockerAPIV2Helper: DockerAPIV2Helper,
        public readonly iconPath = {
            light: path.join(__filename, '..', '..', 'resources', 'light', 'Repository_16x.svg'),
            dark: path.join(__filename, '..', '..', 'resources', 'dark', 'Repository_16x.svg')
        }
    ) {
        super(label, collapsibleState);
    }

    getChildren(element?: RepositoryNode | undefined): vscode.ProviderResult<TagNode[] | undefined> {
        return new Promise(async resolve => {
            let chldrns: TagNode[] = new Array<TagNode>();


            let resp = await this.dockerAPIV2Helper.getTags(this.label);

            if (resp) {
                resp.tags.forEach(tag => {
                    chldrns.push(new TagNode(tag, tag, TreeItemCollapsibleState.Collapsed, this.label, this.dockerAPIV2Helper));
                });
            }

            resolve(chldrns);
        });
    }

    contextValue = 'repositoryNode';
}