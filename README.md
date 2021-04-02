A simple, high-perfomance spine runtime using oasis-engine BufferMesh API ～

## Install
```
tnpm i @oasis-engine/engine-spine --save
```
## 
## Usage
### Resource Load
```typescript
// import * as o3 from 'oasis-engine';
import '@oasis-engine/engine-spine';

init();

function init() {
	// oasis initial code: https://github.com/oasis-engine/engine#usage
  // root: Engine root entity.
  loadSpine(root);
  engine.run();
}

// When SpineAnimation is imported, a SpineLoader is automatically register to the engine loader.
// And then you can use engine.resourceManager to load spine file.

// You should specify resource type in 'spine' and pass resource cdn link.
// When pass single url, we assume that the .json(or .bin), .atlas and .png files
// that correspond to the spine file are in the same base URL and that the .json and .atlas files have the same name.
// When pass multiple url in an array, you need to pass three typeof files: .json(or .bin),.atlas and .png files.

async function loadSpine(root) {
  const spineEntity = await engine.resourceManager.load(
    {
      url: 'Your spine animation file(.json or .bin).',
      type: 'spine',
    },
    // {
      // urls: [
        // 'Your spine animation file(.json or .bin).',
    		// 'atlas file',
    		// 'texture image'
      // ],
      // type: 'spine',
    // }
  );
  root.addChild(spineEntity);
}

```


### Animation Play
```typescript
import { SpineAnimation } from '@oasis-engine/engine-spine';

const spineEntity = await engine.resourceManager.load(
  {
    url: 'Your spine animation file(.json or .bin).',
    type: 'spine',
  },
);
root.addChild(spineEntity);

// You can get skeleton and animationState from SpineAnimation component.
// And use spine-core API to play animation or do other things~
// spineAnimation.state(AnimationState): http://zh.esotericsoftware.com/spine-api-reference#AnimationState
// spineAnimation.skeleton(Skeleton): http://zh.esotericsoftware.com/spine-api-reference#Skeleton
const spineAnimation = spineEntity.getComponent(SpineAnimation);
spineAnimation.state.setAnimation(0, 'your_animation_name', true);

```


## Spine Version
oasis-engine 0.2 & engine-spine 0.1 - this branch, latest npm

