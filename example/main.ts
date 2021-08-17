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
    // {
    //   url: 'https://sbfkcel.github.io/pixi-spine-debug/assets/spine/spineboy-pro.json',
    //   type: 'spine',
    // },
    {
      urls: [
        'https://gw.alipayobjects.com/os/OasisHub/67a9ea73-2ec7-4a19-b3d2-9128af07714d/1627885550182.json',
        'https://gw.alipayobjects.com/os/OasisHub/40611f01-e50c-4e2e-94ea-abc8af714f3e/1627885550185.atlas',
        'https://gw.alipayobjects.com/zos/OasisHub/bcd9ed37-f940-42bb-86c7-f3b350855ecb/1627885550185.png'
      ],
      type: 'spine'
    },
    {
      type: AssetType.Texture2D,
      url: 'https://gw.alicdn.com/imgextra/i2/O1CN01ZrLkcl1njIXAnhTbK_!!6000000005125-2-tps-1534-533.png'
    },
    // {
    //   url: 'http://alipay-rmsdeploy-image.cn-hangzhou.alipay.aliyun-inc.com/bakery/Fish.json',
    //   type: 'spine',
    // },
  ]) as [Entity, Texture2D];
  root.addChild(spineEntity);
  const spineAnimation = spineEntity.getComponent(SpineAnimation);
  spineAnimation.state.setAnimation(0, 'idling-mood4', true);
  spineAnimation.scale = 0.05;
  spineAnimation.skeleton.setSkinByName('fullskin/base');

  const skeleton = spineAnimation.skeleton;
  // 跨皮肤插槽替换
  // const currentSkin = skeleton.skin;
  // const slot = skeleton.findSlot('fBody');
  // const slotIndex = skeleton.findSlotIndex('fBody');
  // console.log(slotIndex);
  
  // const skin = skeleton.data.findSkin('fullskin/football');
  // const attachment = skin.getAttachment(slotIndex, 'fBody');

  // currentSkin.removeAttachment(slotIndex, 'fBody');
  // currentSkin.setAttachment(slotIndex, 'fBody', attachment);

  // 皮肤内插槽替换
  // console.log(spineAnimation.skeleton.data);
  // spineAnimation.skeleton.setAttachment('fGlasses', 'glassestheif');
  const slotName = 'fBody';
  const attachmentName = 'glassestheif';
  const slot = skeleton.findSlot(slotName);
  const slotIndex = skeleton.findSlotIndex(slotName);
  const attachment = skeleton.getAttachment(slotIndex, attachmentName);
  slot.setAttachment(attachment);

  // spineAnimation.addSeparateSlot('gun');
  // spineAnimation.hackSeparateSlotTexture('gun', hackTexture);
}

  // const currentSkin = this._skeleton.skin;
  // const slot = this._skeleton.findSlot(slotName);
  // const slotIndex = this._skeleton.findSlotIndex(slotName);
  // let attachment = currentSkin.getAttachment(slotIndex, attachmentName || slotName);

  // if (skinName) {
  //   const skin = this.spineInstance.spineData.findSkin(skinName);
  //   if (skin) {
  //     attachment = skin.getAttachment(slotIndex, attachmentName || slotName);
  //     if (attachment) {
  //       currentSkin.removeAttachment(slotIndex, attachmentName);
  //       currentSkin.setAttachment(slotIndex, attachmentName, attachment);
  //     }
  //   }
  // }
  // if (!slot || !attachment) return false;
  //   slot.setAttachment(attachment);

