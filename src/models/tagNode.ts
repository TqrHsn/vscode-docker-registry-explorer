import * as vscode from 'vscode';
import * as path from 'path';
import { DockerAPIV2Helper } from '../utils/dockerUtils';
import { LayerNode } from './layerNode';
import { Utility } from '../utils/utility';
import { RootNode } from './rootNode';


export class TagNode extends RootNode {

    //private manifestV2: ManifestV2 | undefined;

    constructor(
        public readonly label: string,
        public readonly tag: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly repository: string,
        private readonly dockerAPIV2Helper: DockerAPIV2Helper,
        onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem>,
        parent: RootNode | undefined = undefined,
        public readonly iconPath:{ light: string; dark: string } | undefined = {
            light: path.join(__filename, '..', '..', 'resources', 'light', 'Image_16x.svg'),
            dark: path.join(__filename, '..', '..', 'resources', 'dark', 'Image_16x.svg')
        }
    ) {
        super(label, collapsibleState, onDidChangeTreeData, parent);
        this.tooltip = "Expand to view total size of this image.";
    }

    getChildren(element?: RootNode): vscode.ProviderResult<LayerNode[]> {
        return new Promise(async resolve => {
            let chldrns: LayerNode[] = new Array<LayerNode>();


            let resp = await this.dockerAPIV2Helper.getManifestV2(this.repository, this.tag);

            if (resp) {
                let totalSize: number = 0;
                resp.layers.forEach(layer => {
                    chldrns.push(new LayerNode(vscode.TreeItemCollapsibleState.None, layer));
                    totalSize += layer.size;
                });

                this.tooltip = 'Image size: ' + Utility.formatBytes(totalSize);

                if (this.collapsibleState !== vscode.TreeItemCollapsibleState.Expanded) {
                    this.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
                    this.onDidChangeTreeData.fire(this);
                }

            }

            resolve(chldrns);
        });
    }

    getImageName(): string {
        let imageName: string = `${this.dockerAPIV2Helper.baseUrl.hostname}/${this.repository}:${this.tag}`;
        return imageName;
    }

    async deleteFromRepository(): Promise<void> {
        await this.dockerAPIV2Helper.deleteManifestV2(this.repository, this.tag);
        if (this.parent) {
            this.parent.refresh();
        }
    }

    contextValue = 'tagNode';
}