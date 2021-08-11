import { Stats } from '@oasis-engine/stats';
import { 
  WebGLEngine, 
  Engine, 
  Camera,
  Vector3,
  Entity,
  Texture2D,
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
  const spineEntity = await engine.resourceManager.load(
    {
      url: 'https://sbfkcel.github.io/pixi-spine-debug/assets/spine/spineboy-pro.json',
      type: 'spine',
    },
    // {
    //   urls: [
    //     'http://alipay-rmsdeploy-image.cn-hangzhou.alipay.aliyun-inc.com/bakery/huabei-wufu.json',
    //     'http://alipay-rmsdeploy-image.cn-hangzhou.alipay.aliyun-inc.com/bakery/huabei-wufu.atlas'
    //   ],
    //   type: 'spine'
    // },
    // {
    //   urls: [
    //     'https://gw.alipayobjects.com/os/OasisHub/416cae15-691b-4b19-bb68-fa691c042d30/1626354535504.json',
    //     'https://gw.alipayobjects.com/os/OasisHub/174a2e33-8946-489f-b93e-7a27a90de4ec/1626354535507.atlas',
    //     'https://gw.alipayobjects.com/zos/OasisHub/4319fb1d-97dd-4509-9af3-da9c25350452/1626354535507.png'
    //   ],
    //   type: 'spine'
    // },
    // {
    //   urls: [
    //     'https://gw.alipayobjects.com/os/OasisHub/6f58bc27-bacb-493d-9a59-892eb2a37981/1625465092881.json',
    //     'https://gw.alipayobjects.com/os/OasisHub/46ac35c1-4ac6-479e-90da-4d8161642f7c/1625465092882.atlas',
    //     'https://gw.alipayobjects.com/zos/OasisHub/223e5e5d-e1ca-469b-87ce-088310cdded3/1625465092882.png'
    //   ],
    //   type: 'spine'
    // },
    // {
    //   urls: [
    //     'https://gw.alipayobjects.com/os/OasisHub/e47394d0-c7a7-4c49-82e5-2b44544d2c3d/1622118773229.json',
    //     'https://gw.alipayobjects.com/os/OasisHub/be0c5ae1-e3ef-4a35-829c-448c04d82a82/1622118773230.atlas',
    //     'https://gw.alipayobjects.com/zos/OasisHub/f6a4696b-4206-4233-9914-afc509f1f151/1622118773230.png'
    //   ],
    //   type: 'spine'
    // },
    // {
    //   urls: [
    //     'https://gw.alipayobjects.com/os/OasisHub/88ea1911-5a07-45b0-aef1-c2938cda3ec5/1626946153367.json',
    //     'https://gw.alipayobjects.com/os/OasisHub/70be1e0a-8625-487c-8254-dc967e33a7b4/1626946153369.atlas',
    //     'https://gw.alipayobjects.com/zos/OasisHub/7ff09d11-b8ad-4fb3-9157-dcd8559892ea/1626946153368.png'
    //   ],
    //   type: 'spine'
    // }
  ) as Entity;
  root.addChild(spineEntity);
  const spineAnimation = spineEntity.getComponent(SpineAnimation);
  spineAnimation.state.setAnimation(0, 'shoot', true);
  spineAnimation.scale = 0.048;
}
