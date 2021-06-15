

# Oasis Engine spine runtime
![Jun-12-2021 18-37-22.gif](https://intranetproxy.alipay.com/skylark/lark/0/2021/gif/76063/1623494276374-ed91e2f0-b627-4866-8017-3dade59d8eb3.gif#clientId=u02ca4e9b-9d68-4&from=paste&height=245&id=uce07a058&margin=%5Bobject%20Object%5D&name=Jun-12-2021%2018-37-22.gif&originHeight=360&originWidth=348&originalType=binary&ratio=3&size=1583736&status=done&style=none&taskId=u242d4f20-ec00-4d25-a133-c5011031356&width=236.99431610107422)


![](https://img.shields.io/npm/v/@oasis-engine/engine-spine#id=QfHW0&originHeight=20&originWidth=80&originalType=binary&ratio=1&status=done&style=none)
![](https://img.shields.io/bundlephobia/minzip/@oasis-engine/engine-spine#id=yUnp4&originHeight=20&originWidth=144&originalType=binary&ratio=1&status=done&style=none)
![](https://img.shields.io/npm/dm/@oasis-engine/engine-spine#id=lqs8U&originHeight=20&originWidth=134&originalType=binary&ratio=1&status=done&style=none)

---



Spine runtime for [oasis engine](https://github.com/oasis-engine/engine).
## 
## Usage


```typescript
import { SpineAnimation } from '@oasis-engine/spine';

// init oasis
addSpine();

async function addSpine() {
	const spineEntity = await engine.resourceManager.load(
    {
      url: 'https://gw.alipayobjects.com/os/OasisHub/a66ef194-6bc8-4325-9a59-6ea9097225b1/1620888427489.json',
      type: 'spine',
    },
  );
  rootEntity.addChild(spineEntity);
  spineAnimation.state.setAnimation(0, 'walk', true);
}
```


## npm
```sh
npm install @oasis-engine/spine
```




## Version
oasis-engine v0.4 & @oasis-engine/spine this branch latest npm.


## Feature

- Simple in usage
- High performance.
- Intergrated oasis-engine rendering engine.
- Component based API.



## Contributing
Everyone is welcome to join us! Whether you find a bug, have a great feature request or you fancy owning a task from the road map feel free to get in touch.
​

Make sure to read the [Contributing Guide](.github/HOW_TO_CONTRIBUTE.md) before submitting changes.


## Links

- [Examples](https://oasisengine.cn/0.3/examples#spine)
- [Documentation](https://oasisengine.cn/0.3/docs/spine-cn#gatsby-focus-wrapper)
- [OasisEngine](https://oasisengine.cn/)



## License


The Oasis Engine is released under the [MIT](https://opensource.org/licenses/MIT) license. See LICENSE file.
