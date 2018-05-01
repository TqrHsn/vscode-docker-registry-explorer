import * as vscode from 'vscode';

export class Utility {
    static formatBytes(bytes: number, decimals?: number) {
        if (0 === bytes) {
            return "0 Bytes";
        }
        var c = 1024, d = decimals || 2, e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"], f = Math.floor(Math.log(bytes) / Math.log(c));
        return parseFloat((bytes / Math.pow(c, f)).toFixed(d)) + " " + e[f];
    }

    static getCoreNodeModule(moduleName: string) {
        try {
            return require(`${vscode.env.appRoot}/node_modules.asar/${moduleName}`);
        } catch (err) { }

        try {
            return require(`${vscode.env.appRoot}/node_modules/${moduleName}`);
        } catch (err) { }

        return null;
    }
}