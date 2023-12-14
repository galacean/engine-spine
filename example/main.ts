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
  LoadItem,
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
    {
      url: "https://mmtcdp.stable.alipay.net/oasis_be/afts/file/A*5QEzTZ_dVlYAAAAAAAAAAAAADnN-AQ/spineboy.json",
      type: "spine",
    },
    // {
    //   // skin
    //   urls: [
    //     "https://gw.alipayobjects.com/os/OasisHub/c51a45ef-f248-4835-b601-6d31a901f298/1629713824525.json",
    //     "https://gw.alipayobjects.com/os/OasisHub/b016738d-173a-4506-9112-045ebba84d82/1629713824527.atlas",
    //     "https://gw.alipayobjects.com/zos/OasisHub/747a94f3-8734-47b3-92b3-2d7fe2d36e58/1629713824527.png",
    //   ],
    //   type: "spine",
    // },
    // {
    //   // ktx2 and blend mode
    //   url: "https://mdn.alipayobjects.com/oasis_be/afts/file/A*ZwvxRqyaAP4AAAAAAAAAAAAADkp5AQ/Test.json",
    //   type: "spine",
    // },
    // {
    //   // hack slot texture
    //   urls: [
    //     "https://gw.alipayobjects.com/os/OasisHub/e675c9e1-2b19-4940-b8ed-474792e613d7/1629603245094.json",
    //     "https://gw.alipayobjects.com/os/OasisHub/994dfadc-c498-4210-b9ba-0c3deed61fc5/1629603245095.atlas",
    //     "https://gw.alipayobjects.com/zos/OasisHub/b52768b0-0374-4c64-a1bd-763b1a37ee5f/1629603245095.png",
    //   ],
    //   type: "spine",
    // },
  ])) as [Entity];

  const spineEntity = root.createChild("spine");
  const spineRenderer = spineEntity.addComponent(SpineRenderer);
  spineRenderer.scale = 0.01;
  spineRenderer.resource = spineResource;

  // clone
  const spine2 = spineEntity.clone();
  root.addChild(spine2);
  spine2.transform.setPosition(10, 0, 0);
  spine2.getComponent(SpineRenderer).animationName = "run";

  // // 换皮
  // spineEntity.transform.setPosition(0, -15, 0);
  // spineRenderer.animationName = "dance";
  // spineRenderer.skinName = "boy";
  // spineRenderer.spineAnimation.addSeparateSlot("eye-front-up-eyelid-back");
  // setTimeout(() => {
  //   spineRenderer.skinName = "girl";
  // }, 3000);

  // // slot texture
  // spineRenderer.skinName = "skin1";
  // spineRenderer.animationName = "02_walk";
  // const { spineAnimation } = spineRenderer;
  // spineAnimation.addSeparateSlot("defult/head_hair");
  // spineAnimation.addSeparateSlot("defult/arm_rigth_weapon");
  // spineAnimation.addSeparateSlot("defult/Sleeveless_01");

  // const resource = generateSkinResource();
  // engine.resourceManager.load(resource).then((textures) => {
  //   changeSlotTexture("hair_9", textures, spineAnimation);
  // });
}

function generateSkinResource(): LoadItem[] {
  const skinImgs = [
    "https://gw.alicdn.com/imgextra/i4/O1CN01NVzIQ61Hf7DT0jDWS_!!6000000000784-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i3/O1CN01g3HnB21FPQPnjavP3_!!6000000000479-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i1/O1CN01CvmDQl1gRFcWeh3Na_!!6000000004138-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i3/O1CN01BviZcq1Rc2iTh127L_!!6000000002131-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i3/O1CN01mkkLpR1ihrDHyYr1H_!!6000000004445-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i2/O1CN019ENsCO2992jTG9RGD_!!6000000008024-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i4/O1CN01fzyJFg1cNoBGRLSCI_!!6000000003589-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i4/O1CN01duImZL1J8iQk2YzEj_!!6000000000984-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i2/O1CN01b23DDj1QD1SoNL7ua_!!6000000001941-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i1/O1CN01powK3y29HHrZCBnbg_!!6000000008042-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i1/O1CN01n7R3dE1IRfCVUgvhE_!!6000000000890-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i3/O1CN01t0nsyV24AoBFhIfyZ_!!6000000007351-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i4/O1CN01mYwBUD1eBYp2rE0qV_!!6000000003833-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i1/O1CN01ks7zZs1mbgKwBjlFS_!!6000000004973-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i3/O1CN01mgFHl5262gO0L0JeR_!!6000000007604-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i1/O1CN01SJbFkU1udWrRhXPbd_!!6000000006060-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i3/O1CN01VGL8pe26qbYegHClp_!!6000000007713-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i2/O1CN01EeZs6N1auCy4QbXiY_!!6000000003389-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i3/O1CN01DOfF5J1UTkOMHSnwV_!!6000000002519-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i1/O1CN01iWGD1h1G0ytSTLs67_!!6000000000561-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i1/O1CN01xjhSTG245JQVrtEhL_!!6000000007339-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i3/O1CN01NJAp7c22RdV8PC1Dq_!!6000000007117-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i1/O1CN01A2Mdh01INXdP46W6B_!!6000000000881-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i3/O1CN01AqHn4524RIRMTuuNH_!!6000000007387-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i4/O1CN01yU8Z771SPVUUS0Die_!!6000000002239-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i3/O1CN01orLkIg1JOkIFur5Fj_!!6000000001019-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i3/O1CN01jRRXrV1b4HgOXGqov_!!6000000003411-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i2/O1CN01XOchrA1Mh0wFgddGl_!!6000000001465-2-tps-802-256.png",
    "https://gw.alicdn.com/imgextra/i2/O1CN01zPPHrD1pIOVHtvDqD_!!6000000005337-2-tps-802-256.png",
  ];
  return skinImgs.map((item) => {
    return {
      type: AssetType.Texture2D,
      url: item,
    };
  });
}

function changeSlotTexture(selectItem, textures, spineAnimation) {
  const slotNameMap = {
    hair: "defult/head_hair",
    weapon: "defult/arm_rigth_weapon",
    clothes: "defult/Sleeveless_01",
  };
  const slotKey = selectItem.split("_")[0];
  const slotName = slotNameMap[slotKey];
  const index = selectItem.split("_")[1];
  spineAnimation.hackSeparateSlotTexture(slotName, textures[index]);
}
