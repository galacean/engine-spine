# Oasis spine runtime

--------------------

## Badges

[![TNPM version][tnpm-image]][tnpm-url]
[![TNPM downloads][tnpm-downloads-image]][tnpm-url]
[![install size][install-size-image]][install-size-url]

[tnpm-image]: https://npm.alibaba-inc.com/badge/v/@oasis-engine/core.svg
[tnpm-url]: https://npm.alibaba-inc.com/package/@oasis-engine/core
[tnpm-downloads-image]: https://npm.alibaba-inc.com/badge/d/@oasis-engine/core.svg

--------------------

## Installation

```
tnpm install @oasis-engine/spine --save
```

## Usage

```typescript
import {
  SpineRenderer,
  AssetManager,
  AtlasAttachmentLoader,
  TextureAtlas,
  SkeletonJson,
} from '@oasis-engine/spine';

let assetManager: AssetManager

const skeletonFile = 'your spine json';
const atlasFile = 'your spine atlas';
const textureFile = 'your skeleton texture';

assetManager = new AssetManager(engine);
assetManager.loadText(skeletonFile);
assetManager.loadText(atlasFile);
assetManager.loadImage(textureFile);

assetManager.onLoad().then(() => {
  initSpine();
});

function initSpine() {
	const textureData = assetManager.get(textureFile);
  const atlas = new TextureAtlas(assetManager.get(atlasFile), function () {
    return assetManager.get(textureFile);
  });
  
  const atlasLoader = new AtlasAttachmentLoader(atlas);
  const skeletonJson = new SkeletonJson(atlasLoader);
  
  skeletonJson.scale = 0.007;
  const skeletonData = skeletonJson.readSkeletonData(assetManager.get(skeletonFile));
  
  const skeletonNode = root.createChild('skeleton');
  const spineRenderer = skeletonNode.addComponent(SpineRenderer);
  spineRenderer.setSkeletonData(skeletonData);
  
  spineRenderer.skeleton.setToSetupPose();
  spineRenderer.state.setAnimation(0, "animation", true);
  skeletonNode.transform.position = new o3.Vector3(0, 0, 0);
}
```

## Options
### SpineRenderer
#### props

- assset：spine.SkeletonData - spine asset
- state： spine.AnimationState - spine animation state
- skeleton：spine.Skeleton - spine skeleton
- batches：GeometryRenderer
- autoUpdate：Boolean - Whether trigger update automatically


#### Method

- setSkeletonData - set spine asset
- setInitialRenderPriority - set custom render priority
- disposeCurrentSkeleton - dispose
- updateState - update animation state

