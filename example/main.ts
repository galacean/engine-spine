// import {
//   WebGLEngine,
//   Camera,
//   Entity,
//   Vector3,
//   AssetType,
//   Texture2D,
//   Logger,
//   Loader,
// } from "@galacean/engine";
// import { OrbitControl, Stats } from "@galacean/engine-toolkit";
// import { SpineAnimation, SpineRenderer } from "../src/index";

// Logger.enable();

// document.getElementById("canvas").oncontextmenu = function (e) {
//   e.preventDefault();
//   e.stopPropagation();
// };

// let globalEngine = null;

// WebGLEngine.create({ canvas: "canvas" }).then((engine) => {
//   engine.canvas.resizeByClientSize();
//   engine.run();
//   globalEngine = engine;

//   engine.canvas.resizeByClientSize();
//   const scene = engine.sceneManager.activeScene;
//   const root = scene.createRootEntity();
//   scene.addRootEntity(root);

//   const cameraEntity = root.createChild("camera");
//   const camera = cameraEntity.addComponent(Camera);
//   camera.farClipPlane = 200;
//   camera.nearClipPlane = 1;
//   cameraEntity.transform.position = new Vector3(0, 0, 120);

//   // cameraEntity.addComponent(OrbitControl);
//   // cameraEntity.addComponent(Stats);

//   engine.resourceManager
//     .load({
//       urls: [
//         "https://gw.alipayobjects.com/os/OasisHub/a66ef194-6bc8-4325-9a59-6ea9097225b1/1620888427489.json",
//         "https://gw.alipayobjects.com/os/OasisHub/a1e3e67b-a783-4832-ba1b-37a95bd55291/1620888427490.atlas",
//         "https://gw.alipayobjects.com/zos/OasisHub/a3ca8f62-1068-43a5-bb64-5c9a0f823dde/1620888427490.png",
//       ],
//       type: "spine",
//     })
//     .then((spineEntity: Entity) => {
//       spineEntity.transform.setPosition(0, -15, 0);
//       root.addChild(spineEntity);
//       const spineAnimation = spineEntity.getComponent(SpineAnimation);
//       spineAnimation.state.setAnimation(0, "walk", true);
//       spineAnimation.scale = 0.05;
//     });

//   setTimeout(() => {
//     globalEngine.destroy();

//     init();
//   }, 5000);
// });

// async function loadSpine(root, engine) {
//   const [spineResource] = (await engine.resourceManager.load([
//     {
//       url: "https://mmtcdp.stable.alipay.net/oasis_be/afts/file/A*5QEzTZ_dVlYAAAAAAAAAAAAADnN-AQ/spineboy.json",
//       type: "spine",
//     },
//     // {
//     //   url: "https://mdn.alipayobjects.com/huamei_kz4wfo/uri/file/as/2/kz4wfo/4/mp/kx5353rrNIDn4CsX/spineboy-pro/spineboy-pro.json",
//     //   type: "spine",
//     // },
//     // {
//     //   type: AssetType.Texture2D,
//     //   url: "https://gw.alicdn.com/imgextra/i2/O1CN01ZrLkcl1njIXAnhTbK_!!6000000005125-2-tps-1534-533.png",
//     // },
//     // {
//     //   url: 'http://alipay-rmsdeploy-image.cn-hangzhou.alipay.aliyun-inc.com/bakery/Fish.json',
//     //   type: 'spine',
//     // },
//     // {
//     //   urls: [
//     //     'https://gw.alipayobjects.com/os/OasisHub/416cae15-691b-4b19-bb68-fa691c042d30/1626354535504.json',
//     //     'https://gw.alipayobjects.com/os/OasisHub/174a2e33-8946-489f-b93e-7a27a90de4ec/1626354535507.atlas',
//     //     'https://gw.alipayobjects.com/zos/OasisHub/4319fb1d-97dd-4509-9af3-da9c25350452/1626354535507.png'
//     //   ],
//     //   type: 'spine'
//     // }
//   ])) as [Entity];

//   const spineEntity1 = root.createChild("test");
//   const spineRenderer = spineEntity1.addComponent(SpineRenderer);
//   // spineRenderer.autoPlay = false;
//   // spineRenderer.scale = 0.05;
//   spineRenderer.scale = 0.05;
//   spineRenderer.animationName = "shoot";
//   spineRenderer.resource = spineResource;

//   // setTimeout(() => {
//   //   // spineRenderer.autoPlay = false;
//   //   spineRenderer.animationName = "shoot";
//   //   spineRenderer.loop = true;

//   //   // spineRenderer.play("shoot", false);
//   //   // // spineRenderer.animationName = "shoot";
//   //   // // spineRenderer.loop = false;
//   //   // setTimeout(() => {
//   //   //   spineRenderer.loop = true;
//   //   // }, 5000);
//   // }, 1000);

//   // spineAnimation.addSeparateSlot('gun');
//   // spineAnimation.hackSeparateSlotTexture('gun', hackTexture);

//   // const outlineEntity = root.createChild('outline');
//   // const outline = outlineEntity.addComponent(BoundingBoxLine);

//   // outline.attachToEntity(spineEntity);
//   // outline.isActive = true;
//   // setInterval(() => {
//   //   outline.updateVertices();
//   // }, 67);
// }

// // WebGLEngine.create({ canvas: "canvas" }).then((engine) => {
// //   engine.canvas.resizeByClientSize(1);
// //   engine.resourceManager
// //   .load({
// //     url: 'https://mmtcdp.stable.alipay.net/oasis_be/afts/file/A*26LgRq4pDFoAAAAAAAAAAAAADnN-AQ/project.json',
// //     type: AssetType.Project,
// //   }).then(() => {
// //     engine.run();
// //   });
// // });

/**
 * @title Spine Animation
 * @category 2D
 */
import {
  Camera,
  Logger,
  Vector3,
  WebGLEngine,
  Entity,
  SpriteRenderer,
  Engine,
} from "@galacean/engine";
import { SpineAnimation, SpineRenderer } from "../src/index";

Logger.enable();

let globalEngine: Engine;
const spines: Array<Entity> = [];
let globalResource;

// Create engine

function init() {
  WebGLEngine.create({ canvas: "canvas" }).then((engine) => {
    globalEngine = engine;
    engine.canvas.resizeByClientSize();

    const scene = engine.sceneManager.activeScene;
    const rootEntity = scene.createRootEntity();

    // debugger;
    // camera
    const cameraEntity = rootEntity.createChild("camera_node");
    const camera = cameraEntity.addComponent(Camera);
    cameraEntity.transform.position = new Vector3(0, 0, 60);

    engine.resourceManager
      .load({
        // urls: [
        //   "https://gw.alipayobjects.com/os/OasisHub/a66ef194-6bc8-4325-9a59-6ea9097225b1/1620888427489.json",
        //   "https://gw.alipayobjects.com/os/OasisHub/a1e3e67b-a783-4832-ba1b-37a95bd55291/1620888427490.atlas",
        //   "https://gw.alipayobjects.com/zos/OasisHub/a3ca8f62-1068-43a5-bb64-5c9a0f823dde/1620888427490.png",
        // ],
        url: "https://mmtcdp.stable.alipay.net/oasis_be/afts/file/A*5QEzTZ_dVlYAAAAAAAAAAAAADnN-AQ/spineboy.json",
        type: "spine",
      })
      .then((spineResource: Entity) => {
        // debugger;
        globalResource = spineResource;
        for (let i = 0; i < 3; ++i) {
          const spine = rootEntity.createChild(`spine-${i}`);
          const renderer = spine.addComponent(SpineRenderer);
          // debugger;
          renderer.resource = spineResource;
          renderer.scale = 0.05;
          spine.transform.setPosition(-5 + 5 * i, 0, 0);
          spines[i] = spine;
        }
        // 加载好的 spine 资源不用了也记得释放
        globalResource.destroy();
      });

    engine.run();
  });
}

init();

setTimeout(() => {
  // debugger;
  // globalSpine.getComponent(SpineRenderer).resource = null;
  spines[0].destroy();
  // globalEngine.resourceManager.gc();
  // tempSpine.destroy();
  setTimeout(() => {
    spines[1].destroy();
    // globalEngine.resourceManager.gc();
    setTimeout(() => {
      spines[2].destroy();
      // globalResource.destroy();
      globalEngine.resourceManager.gc();
      debugger;
    }, 3000);
  }, 3000);
  // globalEngine.destroy();
}, 3000);

// // 模拟游戏过了一段时间结束之后销毁，重新玩游戏
// setTimeout(() => {
//   globalEngine.destroy();
//   // globalSPine.destroy();

//   init();
// }, 5000);
