import * as vscode from 'vscode';
import * as path from 'path';
import { DockerAPIV2Helper } from '../utils/dockerUtils';
import { TagNode } from './tagNode';
import { TreeItemCollapsibleState } from 'vscode';
import { RootNode } from './rootNode';


export class RepositoryNode extends RootNode {

    private _chldrenCount: number = 0;
    public get chldrenCount(): number {
        return this._chldrenCount;
    }

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        private readonly dockerAPIV2Helper: DockerAPIV2Helper,
        onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem>,
        parent: RootNode | undefined = undefined,
        public readonly iconPath = {
            light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'Repository_16x.svg'),
            dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'Repository_16x.svg')
        }
    ) {
        super(label, collapsibleState, onDidChangeTreeData, parent);
    }

    getChildren(element?: RootNode | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
        return new Promise(async resolve => {
            let chldrns: vscode.TreeItem[] = new Array<vscode.TreeItem>();


            let resp = await this.dockerAPIV2Helper.getTags(this.label);

            if (resp) {
                resp.tags.forEach(tag => {
                    chldrns.push(new TagNode(tag, tag, TreeItemCollapsibleState.Collapsed, this.label, this.dockerAPIV2Helper, this.onDidChangeTreeData, this));
                });
            }

            (chldrns as TagNode[]).sort((a: TagNode, b: TagNode): number => {
                if (a.tag === 'latest') {
                    return -1;
                }
                if (b.tag === 'latest') {
                    return 1;
                }

                if (!isNaN(+a.tag) && !isNaN(+b.tag)) {
                    if (+a.tag < +b.tag) {
                        return 1;
                    }
                    if (+a.tag > +b.tag) {
                        return -1;
                    }
                } else {
                    if (a.tag < b.tag) {
                        return 1;
                    }
                    if (a.tag > b.tag) {
                        return -1;
                    }
                }

                return 0;
            });

            this._chldrenCount = chldrns.length;
            resolve(chldrns);
        });
    }

    contextValue = 'repositoryNode';
}