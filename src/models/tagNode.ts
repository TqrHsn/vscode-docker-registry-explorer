import * as vscode from 'vscode';
import { DockerAPIV2Helper } from '../utils/dockerUtils';
import { LayerNode } from './layerNode';
import { Utility } from '../utils/utility';


export class TagNode extends vscode.TreeItem {

    //private manifestV2: ManifestV2 | undefined;

    constructor(
        public readonly label: string,
        public readonly tag: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly repository: string,
        private readonly dockerAPIV2Helper: DockerAPIV2Helper
    ) {
        super(label, collapsibleState);
    }

    getChildren(element?: TagNode | undefined, onDidChangeTreeData?: vscode.EventEmitter<vscode.TreeItem>): vscode.ProviderResult<LayerNode[] | undefined> {
        return new Promise(async resolve => {
            let chldrns: LayerNode[] = new Array<LayerNode>();


            let resp = await this.dockerAPIV2Helper.getManifestV2(this.repository, this.tag);

            if (resp) {
                //this.manifestV2 = resp;
                let totalSize: number = 0;
                resp.layers.forEach(layer => {
                    chldrns.push(new LayerNode(vscode.TreeItemCollapsibleState.None, this.repository, this.label, layer));
                    totalSize += layer.size;
                });

                this.tooltip = 'Image size: ' + Utility.formatBytes(totalSize);

                if (onDidChangeTreeData) {
                    if (this.collapsibleState !== vscode.TreeItemCollapsibleState.Expanded) {
                        this.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
                        onDidChangeTreeData.fire(this);
                    }
                }
            }

            resolve(chldrns);
        });
    }

    getImageName(): string {
        let imageName: string = `${this.dockerAPIV2Helper.baseUrl.hostname}/${this.repository}:${this.tag}`;
        return imageName;
    }

    contextValue = 'tagNode';
}