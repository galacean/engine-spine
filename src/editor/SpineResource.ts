import { AssetConfig, Entity, ResourceManager, SchemaResource } from 'oasis-engine';
import '@oasis-engine/spine';

export class SpineResource extends SchemaResource {
  load(resourceManager: ResourceManager, assetConfig: AssetConfig): Promise<any> {
    const { spineAssets } = assetConfig.props;
    const urls = [];
    const keys = Object.keys(spineAssets);
    for (let i = 0; i < keys.length; i += 1) {
      const { url } = spineAssets[keys[i]];
      urls.push(url);
    }
    return resourceManager
      .load<any>({
        urls,
        type: 'spine',
      })
      .then((spineEntity: Entity) => {
        this._resource = spineEntity;
      });
  }
}
