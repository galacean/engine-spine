import {
  WebGLEngine,
  Camera,
  Entity,
  Vector3,
  AssetType,
  Texture2D,
  Logger,
  Loader,
  KTX2TargetFormat,
} from "@galacean/engine";
import { OrbitControl, Stats } from "@galacean/engine-toolkit";
import { SpineAnimation, SpineRenderer } from "../src/index";

Logger.enable();

document.getElementById("canvas").oncontextmenu = function (e) {
  e.preventDefault();
  e.stopPropagation();
};

WebGLEngine.create({
  canvas: "canvas",
  ktx2Loader: {
    workerCount: 4,
    priorityFormats: [
      KTX2TargetFormat.ASTC,
      KTX2TargetFormat.ETC,
      KTX2TargetFormat.PVRTC,
    ],
  },
}).then((engine) => {
  engine.canvas.resizeByClientSize();
  engine.run();

  engine.canvas.resizeByClientSize();
  const scene = engine.sceneManager.activeScene;
  const root = scene.createRootEntity();
  scene.addRootEntity(root);

  const cameraEntity = root.createChild("camera");
  const camera = cameraEntity.addComponent(Camera);
  cameraEntity.transform.position = new Vector3(0, 0, 60);

  loadSpine(root, engine);
});

async function loadSpine(root, engine) {
  const [spineResource] = (await engine.resourceManager.load([
    // {
    //   url: "https://mmtcdp.stable.alipay.net/oasis_be/afts/file/A*5QEzTZ_dVlYAAAAAAAAAAAAADnN-AQ/spineboy.json",
    //   type: "spine",
    // },
    // {
    //   // skin
    //   urls: [
    //     "https://gw.alipayobjects.com/os/OasisHub/c51a45ef-f248-4835-b601-6d31a901f298/1629713824525.json",
    //     "https://gw.alipayobjects.com/os/OasisHub/b016738d-173a-4506-9112-045ebba84d82/1629713824527.atlas",
    //     "https://gw.alipayobjects.com/zos/OasisHub/747a94f3-8734-47b3-92b3-2d7fe2d36e58/1629713824527.png",
    //   ],
    //   type: "spine",
    // },
    {
      // ktx2
      url: "https://mmtcdp.stable.alipay.net/oasis_be/afts/file/A*3QWQQ5ouElEAAAAAAAAAAAAADnN-AQ/spineboy.json",
      type: "spine",
    },
  ])) as [Entity];

  const spineEntity = root.createChild("spine");
  spineEntity.transform.setPosition(0, -18, 0);
  const spineRenderer = spineEntity.addComponent(SpineRenderer);
  spineRenderer.scale = 0.05;
  spineRenderer.animationName = "run";
  spineRenderer.resource = spineResource;
  // spineRenderer.skinName = "boy";
  // setTimeout(() => {
  //   spineRenderer.skinName = "girl";
  // }, 3000);
}
