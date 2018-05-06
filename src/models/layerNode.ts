import * as vscode from 'vscode';
import * as path from 'path';
import { ManifestV2LayerItem } from '../utils/dockerUtils';
import { Utility } from '../utils/utility';


export class LayerNode extends vscode.TreeItem {

    constructor(
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly layerItem: ManifestV2LayerItem,
        public readonly iconPath = {
            light: path.join(__filename, '..', '..', 'resources', 'light', 'Layer_16x.svg'),
            dark: path.join(__filename, '..', '..', 'resources', 'dark', 'Layer_16x.svg')
        }
    ) {
        super('', collapsibleState);

        //let label: string = this.layerItem.digest.substr(7);
        if (this.layerItem) {
            this.label = this.layerItem.digest;
            this.tooltip = 'Layer size: ' + Utility.formatBytes(this.layerItem.size);
        }
    }

    contextValue = 'layerNode';
}