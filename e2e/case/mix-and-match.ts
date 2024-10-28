/**
 * @title Animation Additive
 * @category Animation
 */
import {
  Camera,
  DirectLight,
  Entity,
  Logger,
  Vector3,
  WebGLEngine
} from "@galacean/engine";
import { SkeletonDataResource, SpineAnimationRenderer } from "../../src";
import { initScreenshot, updateForE2E } from "./.mockForE2E";

Logger.enable();

WebGLEngine.create({ canvas: "canvas" }).then((engine) => {
  engine.canvas.resizeByClientSize(2);
  const scene = engine.sceneManager.activeScene;
  const rootEntity = scene.createRootEntity();

  // camera
  const cameraEntity = rootEntity.createChild("camera_node");
  cameraEntity.transform.position = new Vector3(0, 0, 100);
  const camera = cameraEntity.addComponent(Camera);
  camera.nearClipPlane = 0.001;
  camera.farClipPlane = 20000;

  engine.resourceManager
    .load<SkeletonDataResource>({
      url: 'https://mdn.alipayobjects.com/huamei_kz4wfo/uri/file/as/2/kz4wfo/4/mp/24ejL92gvbWxsXRi/mix-and-match/mix-and-match.json',
      type: 'spine',
    })
    .then((resource) => {
      const spineEntity = new Entity(engine);
      const spine = spineEntity.addComponent(SpineAnimationRenderer);
      spine.resource = resource;
      spineEntity.transform.setPosition(0, -15, 0);
      spine.defaultState.scale = 0.05;
      spine.defaultState.skinName = 'full-skins/girl';
      rootEntity.addChild(spineEntity);
      updateForE2E(engine);
      initScreenshot(engine, camera);
    });
});
