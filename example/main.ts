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
import { SpineAnimationRenderer } from "../src/index";
import BoundingBoxLine from './outline';
import { SpineResource } from "../src/loader/SpineResource";

Logger.enable();
console.log(SpineAnimationRenderer);

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
    url: "https://mdn.alipayobjects.com/huamei_kz4wfo/uri/file/as/2/kz4wfo/4/mp/7nFdjoEMDrIhD5DC/spineboy/spineboy.json",
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
      'https://mdn.alipayobjects.com/huamei_kz4wfo/uri/file/as/2/kz4wfo/4/mp/cvoqFrmAXZnsTECM/mix-and-match/mix-and-match.json',
      'https://mdn.alipayobjects.com/huamei_kz4wfo/uri/file/as/2/kz4wfo/4/mp/cvoqFrmAXZnsTECM/mix-and-match/mix-and-match.atlas',
      'https://mdn.alipayobjects.com/huamei_kz4wfo/uri/file/as/2/kz4wfo/4/mp/cvoqFrmAXZnsTECM/mix-and-match/mix-and-match.png',
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
  cameraEntity.transform.position = new Vector3(0, 0, 2000);
  camera.nearClipPlane = 0.001;
  camera.farClipPlane = 20000;
  
  // cameraEntity.addComponent(OrbitControl);
  // cameraEntity.addComponent(Stats);

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
  let spineResource: SpineResource | null = null;
  const { scene } = resource;
  try {
    spineResource = (await engine.resourceManager.load({
      ...resource,
      type: 'spine'
    })) as SpineResource;
  } catch (err) {
    console.error('spine asset load error: ', err);
  }
  if (!spineResource) return;
  if (scene === 'upload') {
    console.log(blobResource);
    loadSpine(root, engine, blobResource);
    return;
  }
  console.log('spine asset loaded =>', spineResource.skeletonData);
  removeController();
  const animationNames = spineResource.skeletonData.animations.map(item => item.name);
  const firstAnimation = animationNames[0];

  const spineEntity = new Entity(engine, 'spine-entity');
  spineEntity.transform.setPosition(-25 + Math.random() * 50, -250, 0);
  const spineAnimation = spineEntity.addComponent(SpineAnimationRenderer);
  if (scene === 'physic') {
    spineEntity.transform.setScale(0.5, 0.5, 0.5);
  }
  spineAnimation.resource = spineResource;
  root.addChild(spineEntity);

  // const clone = spineEntity.clone();
  // clone.name = 'test';
  // clone.transform.setPosition(25, -15, 0);
  // const animation2 = clone.getComponent(SpineAnimationRenderer);
  // animation2!.defaultState.skinName = 'full-skins/boy';
  // animation2!.defaultState.scale = 0.04;
  // animation2!.defaultState.animationName = 'dance';
  // animation2!.defaultState.loop = true;
  // root.addChild(clone);

  // const outlineEntity = root.createChild('outline');
  // outline = outlineEntity.addComponent(BoundingBoxLine);
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
  }

  if (scene === 'changeResource') {
    handleChangeResource(engine, spineAnimation);
  }

}

function handleChangeSkinScene(spineAnimation: SpineAnimationRenderer) {
  const { skeleton } = spineAnimation;
  skeleton.setSkinByName("full-skins/girl"); // 1. Set the active skin
  skeleton.setSlotsToSetupPose(); // 2. Use setup pose to set base attachments.
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
  });
}

async function handleChangeResource(engine: Engine, spineAnimation: SpineAnimationRenderer) {
  const newResource = (await engine.resourceManager.load({
    urls: [
      "https://mdn.alipayobjects.com/huamei_kz4wfo/uri/file/as/2/kz4wfo/4/mp/jdjQ6mGxWknZ7TtQ/raptor/raptor.json",
      "https://mdn.alipayobjects.com/huamei_kz4wfo/uri/file/as/2/kz4wfo/4/mp/jdjQ6mGxWknZ7TtQ/raptor/raptor.atlas",
      "https://mdn.alipayobjects.com/huamei_kz4wfo/uri/file/as/2/kz4wfo/4/mp/jdjQ6mGxWknZ7TtQ/raptor/raptor.png",
    ],
    type: 'spine'
  })) as SpineResource;
  setTimeout(() => {
    spineAnimation.defaultConfig.animationName = 'roar';
    spineAnimation.resource = newResource;
  }, 1000);
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