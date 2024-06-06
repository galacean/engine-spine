import {
  WebGLEngine,
  Camera,
  Entity,
  Vector3,
  AssetType,
  Texture2D,
  Logger,
  KTX2TargetFormat,
  Engine,
  MeshRenderer,
} from "@galacean/engine";
import { OrbitControl, Stats } from "@galacean/engine-toolkit";
import * as dat from 'dat.gui';
import { SpineAnimation, SkeletonData, SpineRenderer } from "../src/index";
import BoundingBoxLine from './outline';

Logger.enable();
console.log(SpineAnimation);

document.getElementById("canvas")!.oncontextmenu = function (e) {
  e.preventDefault();
  e.stopPropagation();
};

const gui = new dat.GUI({ name: 'My GUI' });

let animationController; // 动画切换
let skinController; // 皮肤切换
let slotHackController1, slotHackController2, slotHackController3; // 小人换装切换
let attachmentController; // 小鸡部件替换
let outline; // 包围盒
const blobResource: any = {
  urls: [],
  params: {
    fileExtensions: [],
  }
};

const baseDemo = 'spineBoy-单json';
const demos = {
  'spineBoy-单json': {
    url: "https://mdn.alipayobjects.com/huamei_kz4wfo/uri/file/as/2/kz4wfo/4/mp/oP9vu3gAVaoXN9T2/spineboy/spineboy.json",
  },
  'raptor-三文件json': {
    urls: [
      "https://mdn.alipayobjects.com/huamei_kz4wfo/uri/file/as/2/kz4wfo/4/mp/l2dB0YnwaP1PUMkl/raptor/raptor.json",
      "https://mdn.alipayobjects.com/huamei_kz4wfo/uri/file/as/2/kz4wfo/4/mp/l2dB0YnwaP1PUMkl/raptor/raptor.atlas",
      "https://mdn.alipayobjects.com/huamei_kz4wfo/uri/file/as/2/kz4wfo/4/mp/l2dB0YnwaP1PUMkl/raptor/raptor.png",
    ],
  },
  '三文件-无后缀bin': {
    urls: [
      'https://mdn.alipayobjects.com/portal_h1wdez/afts/file/A*Rk3CRppqDZ0AAAAAAAAAAAAAAQAAAQ',
      'https://mdn.alipayobjects.com/portal_h1wdez/afts/file/A*5ygeSLpO9W0AAAAAAAAAAAAAAQAAAQ',
      'https://mdn.alipayobjects.com/portal_h1wdez/afts/img/A*MPAYRbBDhFsAAAAAAAAAAAAAAQAAAQ/original',
    ],
    params: {
      fileExtensions: [
        'bin', // skel
        'atlas',
        'png',
      ],
    }
  },
  'ktx2': {
    urls: [
      "https://mdn.alipayobjects.com/portal_h1wdez/afts/file/A*Rk3CRppqDZ0AAAAAAAAAAAAAAQAAAQ",
      "https://mdn.alipayobjects.com/portal_h1wdez/afts/file/A*5ygeSLpO9W0AAAAAAAAAAAAAAQAAAQ",
      //"https://mdn.alipayobjects.com/oasis_be/afts/img/A*M0r_SJID4m0AAAAAAAAAAAAADkp5AQ/original/DR.ktx2",
      "https://mdn.alipayobjects.com/portal_h1wdez/afts/file/A*KX8kSrNciCcAAAAAAAAAAAAAAQAAAQ?a=1&query=.ktx2",
    ],
    params: {
      fileExtensions: [
        'bin',
        'atlas',
      ],
    }
  },
  '皮肤切换': {
    urls: [
      "https://mdn.alipayobjects.com/huamei_kz4wfo/uri/file/as/2/kz4wfo/4/mp/kfBdctpMQ9C6Ltdd/mix-and-match/mix-and-match.json",
      "https://mdn.alipayobjects.com/huamei_kz4wfo/uri/file/as/2/kz4wfo/4/mp/kfBdctpMQ9C6Ltdd/mix-and-match/mix-and-match.atlas",
      "https://mdn.alipayobjects.com/huamei_kz4wfo/uri/file/as/2/kz4wfo/4/mp/kfBdctpMQ9C6Ltdd/mix-and-match/mix-and-match.png",
    ],
    scene: 'changeSkin'
  },
  '鱼-多贴图': {
    urls: [
      "https://mdn.alipayobjects.com/portal_h1wdez/afts/file/A*aNM1TqIt7QUAAAAAAAAAAAAAAQAAAQ?af_fileName=dr.skel",
      "https://mdn.alipayobjects.com/portal_h1wdez/afts/file/A*0aNHR7VY4tcAAAAAAAAAAAAAAQAAAQ?af_fileName=dr.atlas",
      "https://mdn.alipayobjects.com/portal_h1wdez/afts/img/A*K0NVS6ncInMAAAAAAAAAAAAAAQAAAQ/original?af_fileName=your_file1.png",
      "https://mdn.alipayobjects.com/portal_h1wdez/afts/img/A*Z9umQrI1AlUAAAAAAAAAAAAAAQAAAQ/original?af_fileName=your_file2.png",
      "https://mdn.alipayobjects.com/portal_h1wdez/afts/img/A*IH_uT67UEvQAAAAAAAAAAAAAAQAAAQ/original?af_fileName=your_file3.png",
      "https://mdn.alipayobjects.com/portal_h1wdez/afts/img/A*Q3edT7Ufj1wAAAAAAAAAAAAAAQAAAQ/original?af_fileName=your_file4.png",
      "https://mdn.alipayobjects.com/portal_h1wdez/afts/img/A*NnZIRZ6jMu8AAAAAAAAAAAAAAQAAAQ/original?af_fileName=your_file5.png",
      "https://mdn.alipayobjects.com/portal_h1wdez/afts/img/A*SvlJRpWf6hoAAAAAAAAAAAAAAQAAAQ/original?af_fileName=your_file6.png",
      "https://mdn.alipayobjects.com/portal_h1wdez/afts/img/A*AQfdQpb0u54AAAAAAAAAAAAAAQAAAQ/original?af_fileName=your_file7.png",
      "https://mdn.alipayobjects.com/portal_h1wdez/afts/img/A*otBQSrDL3aMAAAAAAAAAAAAAAQAAAQ/original?af_fileName=your_file8.png",
      "https://mdn.alipayobjects.com/portal_h1wdez/afts/img/A*QabPS4gzIBwAAAAAAAAAAAAAAQAAAQ/original?af_fileName=your_file9.png",
    ],
  },
  '本地上传文件': {
    url: "https://mdn.alipayobjects.com/huamei_kz4wfo/uri/file/as/2/kz4wfo/4/mp/kx5353rrNIDn4CsX/spineboy-pro/spineboy-pro.json",
    scene: 'upload',
  },
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

  const cameraEntity = root.createChild("camera_node");
  const camera = cameraEntity.addComponent(Camera);
  cameraEntity.transform.position = new Vector3(0, 0, 80);
  camera.nearClipPlane = 0.001;
  camera.farClipPlane = 20000;
  
  cameraEntity.addComponent(OrbitControl);
  cameraEntity.addComponent(Stats);

  const outlineEntity = root.createChild('outline');
  outline = outlineEntity.addComponent(BoundingBoxLine);

  loadSpine(root, engine, demos[baseDemo]);

  gui.add({ name: baseDemo }, 'name', Object.keys(demos)).onChange((demoName) => {
    const spineEntity = root.findByName('spine-entity');
    if (spineEntity) {
      spineEntity.destroy();
    }
		loadSpine(root, engine, demos[demoName]);
	});
});

async function loadSpine(root: Entity, engine: Engine, resource) {
  let skeletonData: SkeletonData | null = null;
  const { scene } = resource;
  try {
    skeletonData = (await engine.resourceManager.load({
      ...resource,
      type: 'spine'
    })) as SkeletonData;
  } catch (err) {
    console.error('spine asset load error: ', err);
  }
  if (!skeletonData) return;
  if (scene === 'upload') {
    console.log(blobResource);
    loadSpine(root, engine, blobResource);
    return;
  }
  console.log('spine asset loaded =>', skeletonData);
  removeController();
  const animationNames = skeletonData.animations.map(item => item.name);
  const firstAnimation = animationNames[0];

  const spineEntity = root.createChild('spine-entity');
  spineEntity.transform.setPosition(0, -15, 0);
  const meshRenderer = spineEntity.addComponent(MeshRenderer);
  const mtl = SpineRenderer.getDefaultMaterial(engine);
  meshRenderer.setMaterial(mtl);
  const spineAnimation = spineEntity.addComponent(SpineAnimation);
  spineAnimation.initialize(skeletonData);
  spineAnimation.skeleton.scaleX = 0.05;
  spineAnimation.skeleton.scaleY = 0.05;

  // outline.attachToEntity(spineEntity);
  // outline.isActive = true;
  // setInterval(() => {
  //   outline.updateVertices();
  // }, 67);

  spineAnimation.state.setAnimation(0, firstAnimation, true);
  animationController = gui.add({ animation: firstAnimation  }, 'animation', animationNames).onChange((animationName) => {
		spineAnimation.state.setAnimation(0, animationName, true);
	});

  if (scene === 'changeSkin') {
    handleChangeSkinScene(spineAnimation);
  } else if (scene === 'hackSlotTexture') {
    handleHackSlotTexture(spineAnimation, engine);
  } else if (scene === 'changeAttachment') {
    handleChangeAttachment(spineAnimation, skeletonData);
  }
}

function handleChangeAttachment(spineAnimation: SpineAnimation, skeletonData: SkeletonData) {
  const { skeleton, state } = spineAnimation;
  skeleton.setSkinByName("fullskin/0101"); // 1. Set the active skin
  skeleton.setSlotsToSetupPose(); // 2. Use setup pose to set base attachments.
  state.apply(skeleton);
  const slotName = "fBody";
  const info = {
    更换衣服部件: "fullskin/0101",
  };
  attachmentController = gui
    .add(info, "更换衣服部件", [
      "fullskin/0101",
      "fullskin/autumn",
      "fullskin/carnival",
      "fullskin/fishing",
      "fullskin/football",
      "fullskin/newyear",
      "fullskin/painter",
      "fullskin/snowman",
    ])
    .onChange((skinName) => {
      const currentSkin = skeleton.skin;
      const slotIndex = skeleton.findSlotIndex(slotName);
      const changeSkin = skeletonData.findSkin(skinName);
      const changeAttachment = changeSkin!.getAttachment(
        slotIndex,
        slotName
      );
      if (changeAttachment) {
        currentSkin.removeAttachment(slotIndex, slotName);
        currentSkin.setAttachment(slotIndex, slotName, changeAttachment);
      }
    });
}

function handleChangeSkinScene(spineAnimation: SpineAnimation) {
  const { skeleton, state } = spineAnimation;
  skeleton.setSkinByName("full-skins/girl"); // 1. Set the active skin
  skeleton.setSlotsToSetupPose(); // 2. Use setup pose to set base attachments.
  state.apply(skeleton);
  const info = {
    skin: "full-skins/girl",
  };
  skinController = gui
  .add(info, "skin", [
    "full-skins/girl",
    "full-skins/girl-blue-cape",
    "full-skins/girl-spring-dress",
    "full-skins/boy",
  ])
  .onChange((skinName) => {
    skeleton.setSkinByName(skinName); // 1. Set the active skin
    skeleton.setSlotsToSetupPose(); // 2. Use setup pose to set base attachments.
    state.apply(skeleton);
  });
}

async function handleHackSlotTexture(spineAnimation: SpineAnimation, engine: Engine) {
  spineAnimation.skeleton.setSkinByName("skin1");
  spineAnimation.skeleton.scaleX = 0.07;
  spineAnimation.skeleton.scaleY = 0.07;

  spineAnimation.addSeparateSlot("defult/head_hair");
  spineAnimation.addSeparateSlot("defult/arm_rigth_weapon");
  spineAnimation.addSeparateSlot("defult/Sleeveless_01");

  const textures = await generateSkinResource(engine);
  const info = {
    换头饰: "hair_0",
    换衣服: "clothes_0",
    换武器: "weapon_0",
  };

  const hatConfig: string[] = [];
  const clothConfig: string[] = [];
  const weaponConfig: string[] = [];
  for (let i = 0; i < textures.length; i++) {
    hatConfig.push(`hair_${i}`);
    clothConfig.push(`clothes_${i}`);
    weaponConfig.push(`weapon_${i}`);
  }
  slotHackController1 = gui.add(info, "换头饰", hatConfig).onChange((v) => {
    changeSlotTexture(v, textures, spineAnimation);
  });
  slotHackController2 = gui.add(info, "换衣服", clothConfig).onChange((v) => {
    changeSlotTexture(v, textures, spineAnimation);
  });
  slotHackController3 = gui.add(info, "换武器", weaponConfig).onChange((v) => {
    changeSlotTexture(v, textures, spineAnimation);
  });
}

async function generateSkinResource(engine: Engine) {
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
  const resource = skinImgs.map((item) => {
    return {
      type: AssetType.Texture2D,
      url: item,
    };
  });
  return await engine.resourceManager.load(resource) as Texture2D[];
}

function changeSlotTexture(selectItem, textures: Texture2D[], spineAnimation: SpineAnimation) {
  const slotNameMap = {
    hair: "defult/head_hair",
    weapon: "defult/arm_rigth_weapon",
    clothes: "defult/Sleeveless_01",
  };
  const slotKey = selectItem.split("_")[0];
  const slotName = slotNameMap[slotKey];
  const index = selectItem.split("_")[1];
  console.log(slotKey, slotName, index);
  spineAnimation.hackSeparateSlotTexture(slotName, textures[index]);
}

function removeController() {
  if (animationController) {
    animationController.remove();
    animationController = null;
  }
  if (skinController) {
    skinController.remove();
    skinController = null;
  }
  if (slotHackController1) {
    slotHackController1.remove();
    slotHackController1 = null;
  }
  if (slotHackController2) {
    slotHackController2.remove();
    slotHackController2 = null;
  }
  if (slotHackController3) {
    slotHackController3.remove();
    slotHackController3 = null;
  }
  if (attachmentController) {
    attachmentController.remove();
    attachmentController = null;
  }
}

window.onload = function() {
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  const linkContainer = document.getElementById('linkContainer');
  fileInput.addEventListener('change', function(event) {
    const files = fileInput.files;
    if (files) {
      // Clear previous links
      if (linkContainer) {
        linkContainer.innerHTML = '';
      }

      // Create and display a temporary link for each file
      Array.from(files).forEach((file, index) => {
        const tempLink = URL.createObjectURL(file);
        const ext = getFileExtension(file);
        blobResource.urls.push(tempLink);
        blobResource.params.fileExtensions.push(ext);
        console.log(blobResource);
      });
    }
  });
};

function getFileExtension(file: File): string {
  const fileName = file.name;
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return '';
  }
  return fileName.substring(lastDotIndex + 1);
}

function delay(time: number) {
  return new Promise((res) => {
    setTimeout(() => {
      res(true);
    }, time);
  });
}