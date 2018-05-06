import * as vscode from 'vscode';

export abstract class RootNode extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
        protected readonly onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem>,
        protected readonly parent: RootNode | undefined = undefined
    ) {
        super(label, collapsibleState);
    }

    abstract getChildren(element?: RootNode | undefined): vscode.ProviderResult<vscode.TreeItem[]>;

    refresh(): void {
        this.onDidChangeTreeData.fire(this);
    }
}