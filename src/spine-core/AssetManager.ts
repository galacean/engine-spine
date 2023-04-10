import { Disposable, Map } from "./Utils";
import { TextureAtlas } from "./TextureAtlas";
import { FakeTexture } from "./Texture";
import { AdaptiveTexture } from "../SpineLoader";

export class AssetManager implements Disposable {
	// todo: enhance asset manager: load image data
	protected pathPrefix: string;
	protected textureLoader: (image: HTMLImageElement) => AdaptiveTexture;
	protected assets: Map<any> = {};
	protected errors: Map<string> = {};
	protected toLoad = 0;
	protected loaded = 0;
	protected rawDataUris: Map<string> = {};
	onLoadComplete: any;

	constructor (pathPrefix?: string, textureLoader?: (image: HTMLImageElement) => AdaptiveTexture) {
		this.pathPrefix = pathPrefix || '';
		this.textureLoader = textureLoader;
	}

	private downloadText (url: string, success: (data: string) => void, error: (status: number, responseText: string) => void) {
		let request = new XMLHttpRequest();
		request.overrideMimeType("text/html");
		if (this.rawDataUris[url]) url = this.rawDataUris[url];
		request.open("GET", url, true);
		request.onload = () => {
			if (request.status == 200) {
				success(request.responseText);
			} else {
				error(request.status, request.responseText);
			}
		}
		request.onerror = () => {
			error(request.status, request.responseText);
		}
		request.send();
	}

	protected downloadBinary (url: string, success: (data: Uint8Array) => void, error: (status: number, responseText: string) => void) {
		let request = new XMLHttpRequest();
		if (this.rawDataUris[url]) url = this.rawDataUris[url];
		request.open("GET", url, true);
		request.responseType = "arraybuffer";
		request.onload = () => {
			if (request.status == 200) {
				success(new Uint8Array(request.response as ArrayBuffer));
			} else {
				error(request.status, request.responseText);
			}
		}
		request.onerror = () => {
			error(request.status, request.responseText);
		}
		request.send();
	}

	setRawDataURI(path: string, data: string) {
		this.rawDataUris[this.pathPrefix + path] = data;
	}

	loadBinary(path: string,
		success: (path: string, binary: Uint8Array) => void = null,
		error: (path: string, error: string) => void = null) {
		path = this.pathPrefix + path;
		this.toLoad++;

		this.downloadBinary(path, (data: Uint8Array): void => {
			this.assets[path] = data;
			if (success) success(path, data);
			this.onLoad();
			this.loaded++;
		}, (state: number, responseText: string): void => {
			this.errors[path] = `Couldn't load binary ${path}: status ${status}, ${responseText}`;
			if (error) error(path, `Couldn't load binary ${path}: status ${status}, ${responseText}`);
			this.onLoad();
			this.loaded++;
		});
	}

	loadText(path: string,
		success: (path: string, text: string) => void = null,
		error: (path: string, error: string) => void = null) {
		path = this.pathPrefix + path;
		this.toLoad++;

		this.downloadText(path, (data: string): void => {
			this.assets[path] = data;
			if (success) success(path, data);
			this.onLoad();
			this.loaded++;
		}, (state: number, responseText: string): void => {
			this.errors[path] = `Couldn't load text ${path}: status ${status}, ${responseText}`;
			if (error) error(path, `Couldn't load text ${path}: status ${status}, ${responseText}`);
			this.onLoad();
			this.loaded++;
		});
	}

	loadImage (path: string,
		success: (path: string, image: HTMLImageElement) => void = null,
		error: (path: string, error: string) => void = null) {
		path = this.pathPrefix + path;
		let storagePath = path;
		this.toLoad++;
		let img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = (ev) => {
			this.assets[storagePath] = img;
			this.onLoad();
			this.loaded++;
			if (success) success(path, img);
		}
		img.onerror = (ev) => {
			this.errors[path] = `Couldn't load image ${path}`;
			this.onLoad();
			this.loaded++;
			if (error) error(path, `Couldn't load image ${path}`);
		}
		if (this.rawDataUris[path]) path = this.rawDataUris[path];
		img.src = path;
	}

	loadTexture (path: string,
		success: (path: string, texture: AdaptiveTexture) => void = null,
		error: (path: string, error: string) => void = null) {
		path = this.pathPrefix + path;
		let storagePath = path;
		this.toLoad++;
		let img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = (ev) => {
			let texture = this.textureLoader(img);
			this.assets[storagePath] = texture;
			this.onLoad();
			this.loaded++;
			if (success) success(path, texture);
		}
		img.onerror = (ev) => {
			this.errors[path] = `Couldn't load image ${path}`;
			this.onLoad();
			this.loaded++;
			if (error) error(path, `Couldn't load image ${path}`);
		}
		if (this.rawDataUris[path]) path = this.rawDataUris[path];
		img.src = path;
	}

	loadTextureAtlas (path: string,
		success: (path: string, atlas: TextureAtlas) => void = null,
		error: (path: string, error: string) => void = null
	) {
		let parent = path.lastIndexOf("/") >= 0 ? path.substring(0, path.lastIndexOf("/")) : "";
		path = this.pathPrefix + path;
		this.toLoad++;

		this.downloadText(path, (atlasData: string): void => {
			let pagesLoaded: any = { count: 0 };
			let atlasPages = new Array<string>();
			try {
				let atlas = new TextureAtlas(atlasData, (path: string) => {
					atlasPages.push(parent == "" ? path : parent + "/" + path);
					let image = document.createElement("img") as HTMLImageElement;
					image.width = 16;
					image.height = 16;
					return new FakeTexture(image);
				});
			} catch (e) {
				let ex = e as Error;
				this.errors[path] = `Couldn't load texture atlas ${path}: ${ex.message}`;
				if (error) error(path, `Couldn't load texture atlas ${path}: ${ex.message}`);
				this.onLoad();
				this.loaded++;
				return;
			}

			for (let atlasPage of atlasPages) {
				let pageLoadError = false;

				this.loadTexture(atlasPage, (imagePath: string, texture: AdaptiveTexture) => {
					pagesLoaded.count++;
					if (pagesLoaded.count == atlasPages.length) {
						if (!pageLoadError) {
							try {
								let atlas = new TextureAtlas(atlasData, (path: string) => {
									return this.get(parent == "" ? path : parent + "/" + path);
								});
								this.assets[path] = atlas;
								if (success) success(path, atlas);
								this.onLoad();
								this.loaded++;
							} catch (e) {
								let ex = e as Error;
								this.errors[path] = `Couldn't load texture atlas ${path}: ${ex.message}`;
								if (error) error(path, `Couldn't load texture atlas ${path}: ${ex.message}`);
								this.onLoad();
								this.loaded++;
							}
						} else {
							this.errors[path] = `Couldn't load texture atlas page ${imagePath}} of atlas ${path}`;
							if (error) error(path, `Couldn't load texture atlas page ${imagePath} of atlas ${path}`);
							this.onLoad();
							this.loaded++;
						}
					}
				}, (imagePath: string, errorMessage: string) => {
					pageLoadError = true;
					pagesLoaded.count++;

					if (pagesLoaded.count == atlasPages.length) {
						this.errors[path] = `Couldn't load texture atlas page ${imagePath}} of atlas ${path}`;
						if (error) error(path, `Couldn't load texture atlas page ${imagePath} of atlas ${path}`);
						this.onLoad();
						this.loaded++;
					}
				});
			}
		}, (state: number, responseText: string): void => {
			this.errors[path] = `Couldn't load texture atlas ${path}: status ${status}, ${responseText}`;
			if (error) error(path, `Couldn't load texture atlas ${path}: status ${status}, ${responseText}`);
			this.onLoad();
			this.loaded++;
		});
	}

	get (path: string) {
		path = this.pathPrefix + path;
		return this.assets[path];
	}

	remove (path: string) {
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
	}

	isLoadingComplete (): boolean {
		return this.toLoad == 0;
	}

	onLoad() {
		this.toLoad--;
		if (this.toLoad === 0) {
			this.onLoadComplete();
		}
	}

	getToLoad (): number {
		return this.toLoad;
	}

	getLoaded (): number {
		return this.loaded;
	}

	dispose () {
		this.removeAll();
	}

	hasErrors() {
		return Object.keys(this.errors).length > 0;
	}

	getErrors() {
		return this.errors;
	}
}
