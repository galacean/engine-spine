

import { Disposable, Map } from "./Utils";

class Assets {
	clientId: string;
	toLoad = new Array<string>();
	assets: Map<any> = {};
	textureLoader: (image: HTMLImageElement | ImageBitmap) => any;

	constructor(clientId: string) {
		this.clientId = clientId;
	}

	loaded() {
		let i = 0;
		for (let v in this.assets) i++;
		return i;
	}
}

export class SharedAssetManager implements Disposable {
	private pathPrefix: string;
	private clientAssets: Map<Assets> = {};
	private queuedAssets: Map<string> = {};
	private rawAssets: Map<any> = {}
	private errors: Map<string> = {};

	constructor (pathPrefix: string = "") {
		this.pathPrefix = pathPrefix;
	}

	private queueAsset(clientId: string, textureLoader: (image: HTMLImageElement | ImageBitmap) => any, path: string): boolean {
		let clientAssets = this.clientAssets[clientId];
		if (clientAssets === null || clientAssets === undefined) {
			clientAssets = new Assets(clientId);
			this.clientAssets[clientId] = clientAssets;
		}
		if (textureLoader !== null) clientAssets.textureLoader = textureLoader;
		clientAssets.toLoad.push(path);

		// check if already queued, in which case we can skip actual
		// loading
		if (this.queuedAssets[path] === path) {
			return false;
		} else {
			this.queuedAssets[path] = path;
			return true;
		}
	}

	loadText(clientId: string, path: string) {
		path = this.pathPrefix + path;
		if (!this.queueAsset(clientId, null, path)) return;
		let request = new XMLHttpRequest();
		request.overrideMimeType("text/html");
		request.onreadystatechange = () => {
			if (request.readyState == XMLHttpRequest.DONE) {
				if (request.status >= 200 && request.status < 300) {
					this.rawAssets[path] = request.responseText;
				} else {
					this.errors[path] = `Couldn't load text ${path}: status ${request.status}, ${request.responseText}`;
				}
			}
		};
		request.open("GET", path, true);
		request.send();
	}

	loadJson(clientId: string, path: string) {
		path = this.pathPrefix + path;
		if (!this.queueAsset(clientId, null, path)) return;
		let request = new XMLHttpRequest();
		request.overrideMimeType("text/html");
		request.onreadystatechange = () => {
			if (request.readyState == XMLHttpRequest.DONE) {
				if (request.status >= 200 && request.status < 300) {
					this.rawAssets[path] = JSON.parse(request.responseText);
				} else {
					this.errors[path] = `Couldn't load text ${path}: status ${request.status}, ${request.responseText}`;
				}
			}
		};
		request.open("GET", path, true);
		request.send();
	}

	loadTexture (clientId: string, textureLoader: (image: HTMLImageElement | ImageBitmap) => any, path: string) {
		path = this.pathPrefix + path;
		if (!this.queueAsset(clientId, textureLoader, path)) return;

		let isBrowser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document);
		let isWebWorker = !isBrowser && typeof importScripts !== 'undefined';

		if (isWebWorker) {
			// For webworker use fetch instead of Image()
			const options = {mode: <RequestMode>"cors"};
			fetch(path, options).then( (response) => {
					if (!response.ok) {
						this.errors[path] = "Couldn't load image " + path;
					}
					return response.blob();
				}).then( (blob) => {
					return createImageBitmap(blob, {
					premultiplyAlpha: 'none',
					colorSpaceConversion: 'none',
					});
				}).then( (bitmap) => {
					this.rawAssets[path] = bitmap;
				});
		} else {
			let img = new Image();
			img.crossOrigin = "anonymous";
			img.onload = (ev) => {
				this.rawAssets[path] = img;
			}
			img.onerror = (ev) => {
				this.errors[path] = `Couldn't load image ${path}`;
			}
			img.src = path;
		}
	}

	get (clientId: string, path: string) {
		path = this.pathPrefix + path;
		let clientAssets = this.clientAssets[clientId];
		if (clientAssets === null || clientAssets === undefined) return true;
		return clientAssets.assets[path];
	}

	private updateClientAssets(clientAssets: Assets): void {
		let isBrowser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document);
		let isWebWorker = !isBrowser && typeof importScripts !== 'undefined';

		for (let i = 0; i < clientAssets.toLoad.length; i++) {
			let path = clientAssets.toLoad[i];
			let asset = clientAssets.assets[path];
			if (asset === null || asset === undefined) {
				let rawAsset = this.rawAssets[path];
				if (rawAsset === null || rawAsset === undefined) continue;

				if (isWebWorker)
				{
					if (rawAsset instanceof ImageBitmap) {
						clientAssets.assets[path] = clientAssets.textureLoader(<ImageBitmap>rawAsset);
					} else {
						clientAssets.assets[path] = rawAsset;
					}
				} else {
					if (rawAsset instanceof HTMLImageElement) {
						clientAssets.assets[path] = clientAssets.textureLoader(<HTMLImageElement>rawAsset);
					} else {
						clientAssets.assets[path] = rawAsset;
					}						
				}
			}
		}
	}

	isLoadingComplete (clientId: string): boolean {
		let clientAssets = this.clientAssets[clientId];
		if (clientAssets === null || clientAssets === undefined) return true;
		this.updateClientAssets(clientAssets);
		return clientAssets.toLoad.length == clientAssets.loaded();

	}

	/*remove (clientId: string, path: string) {
		path = this.pathPrefix + path;
		let asset = this.assets[path];
		if ((<any>asset).dispose) (<any>asset).dispose();
		this.assets[path] = null;
	}

	removeAll () {
		for (let key in this.assets) {
			let asset = this.assets[key];
			if ((<any>asset).dispose) (<any>asset).dispose();
		}
		this.assets = {};
	}*/

	dispose () {
		// this.removeAll();
	}

	hasErrors() {
		return Object.keys(this.errors).length > 0;
	}

	getErrors() {
		return this.errors;
	}
}
