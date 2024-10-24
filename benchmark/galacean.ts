import {
  WebGLEngine,
  Camera,
  Entity,
  Vector3,
  KTX2TargetFormat,
  Engine,
} from "@galacean/engine";
import { Stats } from "@galacean/engine-toolkit";
import { SpineAnimationRenderer } from "../src/index";
import { SkeletonDataResource } from "../src/loader/SkeletonDataResource";


let root;

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
  engine.canvas.resizeByClientSize(1);
  engine.run();

  const scene = engine.sceneManager.activeScene;
  scene.background.solidColor.set(0, 0, 0, 1);
  root = scene.createRootEntity();
  scene.addRootEntity(root);

  const cameraEntity = root.createChild("camera_node");
  const camera = cameraEntity.addComponent(Camera);
  cameraEntity.addComponent(Stats);
  cameraEntity.transform.position = new Vector3(0, 0, 10);
  camera.isOrthographic = true;
  camera.orthographicSize = 3.5;
  camera.enableFrustumCulling = false;

  loadSpine(root, engine);
});

async function loadSpine(root: Entity, engine: Engine) {
  const spineResouce = (await engine.resourceManager.load({
    urls: ["/spineboy.json", "/spineboy.atlas"],
    type: 'spine'
  })) as SkeletonDataResource;
  
  const spineEntity = new Entity(engine, "spine");
  spineEntity.transform.setScale(0.3, 0.3, 0.3);
  const spineRenderer = spineEntity.addComponent(SpineAnimationRenderer);
  spineRenderer.resource = spineResouce;
  spineRenderer.defaultState.animationName = 'run';
  spineRenderer.defaultState.scale = 0.02;
  for (let i = 0; i < 500; i++) {
    const clone = spineEntity.clone();
    clone.transform.setPosition(-1.75 + i * 0.005, -2, 0);
    root.addChild(clone);
  }

}

