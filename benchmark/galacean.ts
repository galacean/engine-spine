import {
  WebGLEngine,
  Camera,
  Entity,
  Vector3,
  Logger,
  KTX2TargetFormat,
  Engine,
} from "@galacean/engine";
import { Stats } from "@galacean/engine-toolkit";
import { SpineAnimationRenderer } from "../src/index";
import { SkeletonDataResource } from "../src/loader/SkeletonDataResource";


// let count = 100;
let count = 500;
// let count = 3000;

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
  cameraEntity.transform.position = new Vector3(0, 0, 2000);
  camera.fieldOfView = 45;
  camera.aspectRatio = window.innerWidth / window.innerHeight;
  camera.nearClipPlane = 1;
  camera.farClipPlane = 3000;

  loadSpine(root, engine);
});

async function loadSpine(root: Entity, engine: Engine) {
  const skeletonDataResource = (await engine.resourceManager.load({
      urls: ["/spineboy-pro.json", "/spineboy-pma.atlas"],
      type: 'spine'
    })) as SkeletonDataResource;
  if (!skeletonDataResource) return;
  const spineEntity = new Entity(engine, 'spine-entity');
  spineEntity.transform.setPosition(0, 0, 0);
  const spineAnimation = spineEntity.addComponent(SpineAnimationRenderer);
  spineAnimation.defaultState.scale = 1;
  spineAnimation.defaultState.animationName = 'walk';
  spineAnimation.resource = skeletonDataResource;

  if (count === 100) {
    createArrayOfObjects(spineEntity, 10, 10);
  } else if (count === 500) {
    createArrayOfObjects(spineEntity, 20, 25);
  } else if (count === 3000) {
    createArrayOfObjects(spineEntity, 50, 60);
  }

}

function createArrayOfObjects(entity: Entity, countX: number, countY: number, countZ: number = 1) {
  const spacing = 150; // 每个物体之间的间距
    const halfX = Math.floor(countX / 2);
    const halfY = Math.floor(countY / 2);

    let count = 0; // 计数器

    for (let x = -halfX; x < halfX; x++) {
        for (let y = -halfY; y < halfY; y++) {
            if (count >= 3000) return; // 确保总数不超过3000

            const clone = entity.clone(); // 创建物体实例
            clone.transform.position.set(
                x * spacing,
                y * spacing,
                0,
            );
            root.addChild(clone); // 将物体添加到场景中
            count++;
        }
    }
}

