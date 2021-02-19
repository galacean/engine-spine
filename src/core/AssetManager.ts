import { OasisTextrure } from "./OasisTexture";
import { AssetManager as IAssetManager } from "../spine-core/AssetManager";

export class AssetManager extends IAssetManager {
  private _checkRaf: number = 0;

  constructor(engine, pathPrefix: string = "") {
    super((data: HTMLImageElement | ArrayBuffer, width?: number, height?: number) => {
      return new OasisTextrure(engine, data, width, height);
    }, pathPrefix);
  }

  onLoad() {
    return new Promise((resolve) => {
      this.checkLoaded(resolve);
    });
  }

  checkLoaded(resolve: any) {
    if ((this as any).toLoad == 0) {
      cancelAnimationFrame(this._checkRaf);
      resolve(this);
    } else {
      this._checkRaf = requestAnimationFrame(this.checkLoaded.bind(this, resolve));
    }
  }
}