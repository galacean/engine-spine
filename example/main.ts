import {
  WebGLEngine,
  Camera,
  Entity,
  Vector3,
  AssetType,
  Texture2D,
  Logger,
  Loader,
} from "@galacean/engine";
import { OrbitControl, Stats } from "@galacean/engine-toolkit";
import { SpineAnimation, SpineRenderer } from "../src/index";

Logger.enable();

document.getElementById("canvas").oncontextmenu = function (e) {
  e.preventDefault();
  e.stopPropagation();
};

WebGLEngine.create({ canvas: "canvas" }).then((engine) => {
  engine.canvas.resizeByClientSize();
  engine.run();

  engine.canvas.resizeByClientSize();
  const scene = engine.sceneManager.activeScene;
  const root = scene.createRootEntity();
  scene.addRootEntity(root);

  const cameraEntity = root.createChild("camera");
  const camera = cameraEntity.addComponent(Camera);
  camera.farClipPlane = 200;
  camera.nearClipPlane = 1;
  cameraEntity.transform.position = new Vector3(0, 0, 120);

  cameraEntity.addComponent(OrbitControl);
  cameraEntity.addComponent(Stats);

  loadSpine(root, engine);
});

async function loadSpine(root, engine) {
  const [spineResource] = (await engine.resourceManager.load([
    {
      url: "https://mmtcdp.stable.alipay.net/oasis_be/afts/file/A*5QEzTZ_dVlYAAAAAAAAAAAAADnN-AQ/spineboy.json",
      type: "spine",
    },
    // {
    //   url: "https://mdn.alipayobjects.com/huamei_kz4wfo/uri/file/as/2/kz4wfo/4/mp/kx5353rrNIDn4CsX/spineboy-pro/spineboy-pro.json",
    //   type: "spine",
    // },
    // {
    //   type: AssetType.Texture2D,
    //   url: "https://gw.alicdn.com/imgextra/i2/O1CN01ZrLkcl1njIXAnhTbK_!!6000000005125-2-tps-1534-533.png",
    // },
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
  ])) as [Entity];
  debugger;

  const spineEntity1 = root.createChild("test");
  const spineRenderer = spineEntity1.addComponent(SpineRenderer);
  // spineRenderer.autoPlay = false;
  // spineRenderer.scale = 0.05;
  spineRenderer.scale = 0.05;
  spineRenderer.animationName = "shoot";
  spineRenderer.resource = spineResource;
  
  // setTimeout(() => {
  //   // spineRenderer.autoPlay = false;
  //   spineRenderer.animationName = "shoot";
  //   spineRenderer.loop = true;
    
  //   // spineRenderer.play("shoot", false);
  //   // // spineRenderer.animationName = "shoot";
  //   // // spineRenderer.loop = false;
  //   // setTimeout(() => {
  //   //   spineRenderer.loop = true;
  //   // }, 5000);
  // }, 1000);

  // spineAnimation.addSeparateSlot('gun');
  // spineAnimation.hackSeparateSlotTexture('gun', hackTexture);

  // const outlineEntity = root.createChild('outline');
  // const outline = outlineEntity.addComponent(BoundingBoxLine);

  // outline.attachToEntity(spineEntity);
  // outline.isActive = true;
  // setInterval(() => {
  //   outline.updateVertices();
  // }, 67);
}

// WebGLEngine.create({ canvas: "canvas" }).then((engine) => {
//   engine.canvas.resizeByClientSize(1);
//   engine.resourceManager
//   .load({
//     url: 'https://mmtcdp.stable.alipay.net/oasis_be/afts/file/A*26LgRq4pDFoAAAAAAAAAAAAADnN-AQ/project.json',
//     type: AssetType.Project,
//   }).then(() => {
//     engine.run();
//   });
// });
