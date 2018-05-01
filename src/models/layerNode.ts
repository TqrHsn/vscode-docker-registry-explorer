import * as vscode from 'vscode';
import { ManifestV2LayerItem } from '../utils/dockerUtils';
import { Utility } from '../utils/utility';


export class LayerNode extends vscode.TreeItem {

    constructor(
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly repository: string,
        public readonly tag: string,
        public readonly layerItem: ManifestV2LayerItem
    ) {
        super('', collapsibleState);

        let label: string = this.layerItem.digest.substr(7);
        this.label = label;
        this.tooltip = 'Layer size: ' + Utility.formatBytes(this.layerItem.size);
    }

    contextValue = 'layerNode';
}