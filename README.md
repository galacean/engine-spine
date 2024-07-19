

# Galacean Engine spine runtime
![Jun-12-2021 18-37-22.gif](https://gw.alipayobjects.com/mdn/mybank_yul/afts/img/A*am1ySYTDBQAAAAAAAAAAAAAAARQnAQ)


![](https://img.shields.io/npm/v/@galacean/engine-spine#id=QfHW0&originHeight=20&originWidth=80&originalType=binary&ratio=1&status=done&style=none)
![](https://img.shields.io/bundlephobia/minzip/@galacean/engine-spine#id=yUnp4&originHeight=20&originWidth=144&originalType=binary&ratio=1&status=done&style=none)
![](https://img.shields.io/npm/dm/@galacean/engine-spine#id=lqs8U&originHeight=20&originWidth=134&originalType=binary&ratio=1&status=done&style=none)

---



Spine runtime for [Galacean engine](https://github.com/galacean/engine).
## 
## Usage


```typescript
import { SpineAnimationRenderer } from '@galacean/engine-spine';

// init oasis
addSpine();

async function addSpine() {
	const resource = await engine.resourceManager.load(
    {
      url: 'https://mdn.alipayobjects.com/huamei_kz4wfo/uri/file/as/2/kz4wfo/4/mp/yKbdfgijyLGzQDyQ/spineboy/spineboy.json',
      type: 'spine',
    },
  );
  const spineEntity = new Entity(engine);
  const spine = entity.addComponent(SpineAnimationRenderer);
  spine.resource = resource;
  spine.defaultState.animationName = 'walk';
  rootEntity.addChild(spineEntity);
}
```


## npm
```sh
npm install @galacean/engine-spine
```




## Version
@galacean/engine-spine currently only supports spine version 3.8


## Feature

- Simple in usage
- High performance.
- Intergrated with galacean engine.
- Component based API.



## Contributing
Everyone is welcome to join us! Whether you find a bug, have a great feature request or you fancy owning a task from the road map feel free to get in touch.
​

Make sure to read the [Contributing Guide](.github/HOW_TO_CONTRIBUTE.md) before submitting changes.


## Links

- [Examples](https://oasisengine.cn/#/examples/latest/spine-animation)
- [Documentation](https://oasisengine.cn/#/docs/latest/cn/spine)
- [GalaceanEngine](https://oasisengine.cn/)



## License


The Galacean Engine is released under the [MIT](https://opensource.org/licenses/MIT) license. See LICENSE file.
