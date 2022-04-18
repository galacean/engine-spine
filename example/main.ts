import { Stats } from '@oasis-engine/stats';
import { 
  WebGLEngine, 
  Engine, 
  Camera,
  Entity,
  Vector3,
  AssetType,
  Texture2D
} from "oasis-engine";
import { OrbitControl } from "@oasis-engine/controls";
import { SpineAnimation } from '../src/index';
import { SpineComponent } from '../src/editor/SpineComponent';

Engine.registerFeature(Stats);

const engine = new WebGLEngine('canvas');
engine.canvas.resizeByClientSize();
const scene = engine.sceneManager.activeScene;
const root = scene.createRootEntity();
scene.addRootEntity(root);

const spine = root.createChild('spine');

const cameraEntity = root.createChild('camera');
const camera = cameraEntity.addComponent(Camera);
camera.farClipPlane = 2000000;
camera.nearClipPlane = 0.001;
cameraEntity.transform.position = new Vector3(0, 0, 120);

cameraEntity.addComponent(OrbitControl);

loadSpine(root);

engine.run();

async function loadSpine(root) {
  const [spineEntity, hackTexture] = await engine.resourceManager.load([
    // {
    //   urls: [
    //     'https://gw.alipayobjects.com/os/OasisHub/416cae15-691b-4b19-bb68-fa691c042d30/1626354535504.json',
    //     'https://gw.alipayobjects.com/os/OasisHub/174a2e33-8946-489f-b93e-7a27a90de4ec/1626354535507.atlas',
    //     'https://gw.alipayobjects.com/zos/OasisHub/4319fb1d-97dd-4509-9af3-da9c25350452/1626354535507.png'
    //   ],
    //   type: 'spine'
    // },
    {
      urls: [
        'https://gw.alipayobjects.com/os/bmw-prod/ddb7df08-2dbe-4fbc-8245-1cb2451ce6ad.bin',
        'https://gw.alipayobjects.com/os/bmw-prod/fee4e7f1-0c2a-4ee6-90a4-a3a2360a314a.atlas',
        'https://gw.alicdn.com/imgextra/i3/O1CN01wqEtP31SMlAHPxOHd_!!6000000002233-2-tps-1682-777.png',
      ],
      type: 'spine'
    },
    // {
    //   url: 'https://sbfkcel.github.io/pixi-spine-debug/assets/spine/spineboy-pro.json',
    //   type: 'spine',
    // },
    {
      type: AssetType.Texture2D,
      url: 'https://gw.alicdn.com/imgextra/i2/O1CN01ZrLkcl1njIXAnhTbK_!!6000000005125-2-tps-1534-533.png'
    },
    // {
    //   url: 'http://alipay-rmsdeploy-image.cn-hangzhou.alipay.aliyun-inc.com/bakery/Fish.json',
    //   type: 'spine',
    // },
    // {
    //   urls: [
    //     'https://gw.alipayobjects.com/os/OasisHub/416cae15-691b-4b19-bb68-fa691c042d30/1626354535504.json',
    //     'https://gw.alipayobjects.com/os/OasisHub/174a2e33-8946-489f-b93e-7a27a90de4ec/1626354535507.atlas',
    //     'https://gw.alipayobjects.com/zos/OasisHub/4319fb1d-97dd-4509-9af3-da9c25350452/1626354535507.png'
    //   ],
    //   type: 'spine'
    // }
  ]) as [Entity, Texture2D];
  const spineComponent = spine.addComponent(SpineComponent);
  spineComponent.resource = spineEntity;
  spineComponent.scale = 0.05;
  root.addChild(spine);
  const spineAnimations = [];
  spine.getComponentsIncludeChildren(SpineAnimation, spineAnimations);
  spineAnimations[0].state.setAnimation(0, 'atk2', true);
}
