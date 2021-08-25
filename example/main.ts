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

Engine.registerFeature(Stats);

const engine = new WebGLEngine('canvas');
engine.canvas.resizeByClientSize();
const scene = engine.sceneManager.activeScene;
const root = scene.createRootEntity();
scene.addRootEntity(root);

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
    {
      urls: [
        'https://gw.alipayobjects.com/os/OasisHub/e675c9e1-2b19-4940-b8ed-474792e613d7/1629603245094.json',
        'https://gw.alipayobjects.com/os/OasisHub/994dfadc-c498-4210-b9ba-0c3deed61fc5/1629603245095.atlas',
        'https://gw.alipayobjects.com/zos/OasisHub/b52768b0-0374-4c64-a1bd-763b1a37ee5f/1629603245095.png',
      ],
      type: "spine"
    },
    {
      type: AssetType.Texture2D,
      url: 'https://gw.alicdn.com/imgextra/i2/O1CN01XOchrA1Mh0wFgddGl_!!6000000001465-2-tps-802-256.png'
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
  root.addChild(spineEntity);
  const spineAnimation = spineEntity.getComponent(SpineAnimation);
  spineAnimation.state.setAnimation(0, '02_walk', true);
  spineAnimation.scale = 0.05;
  spineAnimation.skeleton.setSkinByName('skin1');
  console.log(spineAnimation);
  spineAnimation.addSeparateSlot('defult/head_hair');
  spineAnimation.addSeparateSlot('defult/arm_rigth_weapon');
  spineAnimation.addSeparateSlot('defult/Sleeveless_01');

  spineAnimation.hackSeparateSlotTexture('defult/head_hair', hackTexture);
  spineAnimation.hackSeparateSlotTexture('defult/arm_rigth_weapon', hackTexture);
  spineAnimation.hackSeparateSlotTexture('defult/Sleeveless_01', hackTexture);
}
