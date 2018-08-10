import * as vscode from 'vscode';
import * as typedRestClient from 'typed-rest-client/RestClient';
import { URL } from 'url';

export interface Tag {
    name: string;
    tags: string[];
}

export interface ManifestV2LayerItem {
    mediaType: string;
    size: number;
    digest: string;
}

export interface ManifestV2 {
    schemaVersion: number;
    mediaType: string;
    config: ManifestV2LayerItem;
    layers: ManifestV2LayerItem[];
}

export class DockerAPIV2Helper {

    private restClient: typedRestClient.RestClient;
    private authHeader: string;
    constructor(
        public readonly baseUrl: URL,
        private readonly user: string,
        private readonly password: string
    ) {
        this.restClient = new typedRestClient.RestClient('vscode-pvt-registry-explorer', this.baseUrl.toString());
        this.authHeader = 'Basic ' + Buffer.from(`${this.user}:${this.password}`).toString('base64');
    }

    async getCatalogs(): Promise<string[]> {
        try {
            let resp = await this.restClient.get<{ repositories: string[] }>('/v2/_catalog', { additionalHeaders: { 'Authorization': this.authHeader } });
            if (resp.statusCode !== 200) {
                vscode.window.showErrorMessage(`${this.baseUrl} returned ${resp.statusCode}.`);
            }
            if (resp.result) {
                return resp.result.repositories;
            } else {
                return [];
            }
        } catch (error) {
            this.showRequestError(error);
        }

        return [];
    }

    async getTags(repository: string): Promise<Tag | null> {
        try {
            let resp = await this.restClient.get<Tag>(`/v2/${repository}/tags/list`, { additionalHeaders: { 'Authorization': this.authHeader } });

            if (resp.statusCode !== 200) {
                vscode.window.showErrorMessage(`${this.baseUrl} returned ${resp.statusCode}.`);
            }
            if (resp.result) {
                return resp.result;
            } else {
                return null;
            }
        } catch (error) {
            this.showRequestError(error);
        }

        return null;
    }

    async getManifestV2(repository: string, reference: string): Promise<ManifestV2 | null> {
        try {
            let resp = await this.restClient.get<ManifestV2>(`/v2/${repository}/manifests/${reference}`, { additionalHeaders: { 'Authorization': this.authHeader }, acceptHeader: 'application/vnd.docker.distribution.manifest.v2+json' });

            if (resp.statusCode !== 200) {
                vscode.window.showErrorMessage(`${this.baseUrl} returned ${resp.statusCode}.`);
            }
            if (resp.result) {
                return resp.result;
            } else {
                return null;
            }
        } catch (error) {
            this.showRequestError(error);
        }

        return null;
    }

    async deleteManifestV2(repository: string, reference: string): Promise<boolean> {
        try {
            let resp = await this.restClient.del<ManifestV2>(`/v2/${repository}/manifests/${reference}`, { additionalHeaders: { 'Authorization': this.authHeader } });

            if (resp.statusCode !== 202) {
                vscode.window.showErrorMessage(`${this.baseUrl} returned ${resp.statusCode}.`);
            }else{
                return true;
            }
        } catch (error) {
            this.showRequestError(error);
        }

        return false;
    }

    private showRequestError(error: any): void {
        vscode.window.showErrorMessage(`Error occured while sending request to ${this.baseUrl}.\r\n` + error);
    }

}