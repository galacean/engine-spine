import React, { useEffect, useRef } from 'react';
import {
  SpineRenderer,
  AssetManager,
  AtlasAttachmentLoader,
  TextureAtlas,
  SkeletonJson
} from '../src';
import { Stats } from '@oasis-engine/stats'
import "./App.css";
import * as o3 from 'oasis-engine'
import { OrbitControl } from "@oasis-engine/controls";

let assetManager
let engine
let root

o3.Engine.registerFeature(Stats);


const sourceId = 0
const source = [
  {
    atlasFile:
      "https://gw.alipayobjects.com/os/Naya/b9db5199-3254-46a2-91b2-1759b2141b6c/home/admin/release/app/controller/tmp/temp-dc76800d3a5904332bc6c8e0be83719a/bahe.atlas",
    skeletonFile:
      "https://gw.alipayobjects.com/os/Naya/1fa818e4-4af4-4d70-8291-a1eb2d54db5b/home/admin/release/app/controller/tmp/temp-dc76800d3a5904332bc6c8e0be83719a/bahe.json",
    textureFile:
      "https://gw.alipayobjects.com/zos/Naya/e0d4fef1-9205-48a5-9e1d-9ac5f9c43959/home/admin/release/app/controller/tmp/temp-dc76800d3a5904332bc6c8e0be83719a/bahe.png",
  },
  {
    skeletonFile: 'https://gw.alipayobjects.com/os/Naya/b04f0def-6eab-4989-8057-1bdb4ef03fdc/home/admin/release/app/controller/tmp/temp-dc4f8fb7a90c8b3b87b897aac941aff5/dancev4.json',
    textureFile: 'https://gw.alipayobjects.com/zos/Naya/9225807e-87f4-4661-b3fe-aa4983118ca3/home/admin/release/app/controller/tmp/temp-6708549183dfa6ceb975c96fbede4073/dancev4.png',
    atlasFile: 'https://gw.alipayobjects.com/os/Naya/f013d56c-d0c5-476e-be30-7f2684bdb418/home/admin/release/app/controller/tmp/temp-49e5dcb75805be4a69210abe81b41630/dancev4.atlas',
  },
  {
    skeletonFile: "https://gw.alipayobjects.com/os/Naya/ec763100-aeab-4c29-862e-8efc4897ea50/home/admin/release/app/controller/tmp/temp-10c1989c1c5fa07e7fe2a3908ad30cdd/%25CE%25A6%25C3%25AC%25C3%25AB%25CF%2583%25C2%25A2%25E2%2595%259B0107-spine-1.json",
    textureFile: "https://gw.alipayobjects.com/zos/Naya/242f0ea2-a002-46a7-b3df-8fdbe19e20b1/home/admin/release/app/controller/tmp/temp-10c1989c1c5fa07e7fe2a3908ad30cdd/%25CE%25A6%25C3%25AC%25C3%25AB%25CF%2583%25C2%25A2%25E2%2595%259B0107-spine-1.png",
    atlasFile: "https://gw.alipayobjects.com/os/Naya/ef7942c1-8159-4c2a-84f6-343218f3ab40/home/admin/release/app/controller/tmp/temp-10c1989c1c5fa07e7fe2a3908ad30cdd/%25CE%25A6%25C3%25AC%25C3%25AB%25CF%2583%25C2%25A2%25E2%2595%259B0107-spine-1.atlas"
  },
  {
    skeletonFile: "https://gw.alipayobjects.com/os/OasisHub/ab1b0bfe-f81c-4575-88f1-943f3e3cad0f/1607567929366.json",
    atlasFile: "https://gw.alipayobjects.com/os/OasisHub/d49c1322-e7ec-472a-86d7-0f37292a8212/1607567929367.atlas",
    textureFile: "https://gw.alipayobjects.com/zos/OasisHub/84d8fc57-d39a-4b38-a62b-8805073c8de7/1607567929367.png"
  },
  {
    skeletonFile: 'https://gw.alipayobjects.com/os/OasisHub/63ed7989-204b-4a19-9bd3-b43b5b79b9ab/1607657981128.json',
    atlasFile: 'https://gw.alipayobjects.com/os/OasisHub/c50b45bb-d3a4-48ec-a6b8-6a93fb872355/1607657981128.atlas',
    textureFile: 'https://gw.alipayobjects.com/zos/OasisHub/7499f628-60fe-4d15-aa19-7d0c5af9f7e9/1607657981128.png',
  },
  {
    skeletonFile: 'https://gw.alipayobjects.com/os/OasisHub/3a400dff-f89d-4d7c-bd1b-06a1d6e06bb0/1607682528291.json',
    atlasFile: 'https://gw.alipayobjects.com/os/OasisHub/77d13f9a-3ab7-4cd0-989d-2a046c83590d/1607682528292.atlas',
    textureFile: 'https://gw.alipayobjects.com/zos/OasisHub/5ea8f72e-45a9-477c-a6e0-3bcd2636db8d/1607682528292.png',
  },
  {
    skeletonFile: 'https://gw.alipayobjects.com/os/OasisHub/457a2338-6c0c-4b03-a9bf-11a05c2fd27c/1607849361133.json',
    atlasFile: 'https://gw.alipayobjects.com/os/OasisHub/8caf2236-b74a-4c29-8a06-1132463506d4/1607849361134.atlas',
    textureFile: 'https://gw.alipayobjects.com/zos/OasisHub/23968630-f0a0-43d9-ae36-825bb257eb19/1607849361134.png',
  },
  {
    skeletonFile: 'https://gw.alipayobjects.com/os/OasisHub/5c6bfe3a-9c4e-4a3b-8300-bb4031c53317/1607937932591.json',
    atlasFile: 'https://gw.alipayobjects.com/os/OasisHub/55e5847a-fa6c-4ec7-bd2f-927d5b383aa5/1607937932592.atlas',
    // textureFile: 'https://gw.alipayobjects.com/zos/gltf-asset/mars-cli/XOFIQHNFOFPO/602916839-29161.png',
    textureFile: 'https://gw.alipayobjects.com/os/gltf-asset/mars-cli/XOFIQHNFOFPO/1224698583-80b92.ktx', // android
    // textureFile: 'https://gw.alipayobjects.com/os/gltf-asset/mars-cli/XOFIQHNFOFPO/1224698591-02f63.ktx', // ios
  },
  {
    skeletonFile: 'https://gw.alipayobjects.com/os/OasisHub/94d62d60-5d22-4576-ad42-ed8e967a9448/1608041668573.json',
    atlasFile: 'https://gw.alipayobjects.com/os/OasisHub/157ceb70-3bfc-4df8-b1e9-d2b5048a0394/1608041668575.atlas',
    textureFile: 'https://gw.alipayobjects.com/zos/OasisHub/46216fd5-8598-459b-bf3b-a11ed17513ed/1608041668574.png',
    // textureFile: 'https://gw.alicdn.com/tfs/TB1DCfu4VP7gK0jSZFjXXc5aXXa-1024-1024.png'    
  },
  {
    skeletonFile: 'https://gw.alipayobjects.com/os/OasisHub/94d62d60-5d22-4576-ad42-ed8e967a9448/1608041668573.json',
    atlasFile: 'https://gw.alipayobjects.com/os/OasisHub/157ceb70-3bfc-4df8-b1e9-d2b5048a0394/1608041668575.atlas',
    textureFile: 'https://gw.alipayobjects.com/zos/OasisHub/46216fd5-8598-459b-bf3b-a11ed17513ed/1608041668574.png'
  },
  {
    skeletonFile: 'https://gw.alipayobjects.com/os/OasisHub/7a380e4d-fccd-4aeb-99e5-26039ce5f55d/1607849298747.json',
    atlasFile: 'https://gw.alipayobjects.com/os/OasisHub/dbe87cf6-ba82-493f-b37b-e314ab106d73/1607849298747.atlas',
    textureFile: 'https://gw.alipayobjects.com/zos/OasisHub/6b88649e-d6ab-4f9f-9268-1409a766bf82/1607849298747.png',
  },
  {
    skeletonFile: 'https://gw.alipayobjects.com/os/OasisHub/7a380e4d-fccd-4aeb-99e5-26039ce5f55d/1607849298747.json',
    atlasFile: 'https://gw.alipayobjects.com/os/OasisHub/dbe87cf6-ba82-493f-b37b-e314ab106d73/1607849298747.atlas',
    textureFile: 'https://gw.alipayobjects.com/zos/OasisHub/6b88649e-d6ab-4f9f-9268-1409a766bf82/1607849298747.png'
  },
  {
    skeletonFile: 'https://gw.alipayobjects.com/os/OasisHub/5c6bfe3a-9c4e-4a3b-8300-bb4031c53317/1607937932591.json',
    atlasFile: 'https://gw.alipayobjects.com/os/OasisHub/55e5847a-fa6c-4ec7-bd2f-927d5b383aa5/1607937932592.atlas',
    textureFile: 'https://gw.alipayobjects.com/zos/gltf-asset/mars-cli/XOFIQHNFOFPO/602916839-29161.png'
  }
]


const skeletonFile = source[sourceId].skeletonFile
const textureFile = source[sourceId].textureFile
const atlasFile = source[sourceId].atlasFile



function App() {

  const oasisRef = useRef(null)

  useEffect(() => {

    init()
    // addCube2()
    // loadSpine3() // souceId = 7 compressed texture
    // loadUseSpineLoader()
    // loadSpine2() // sourceId = 12 load image

    function loadUseSpineLoader() {
      assetManager = new AssetManager(engine);
      assetManager.loadCompressedTexture(textureFile);
      assetManager.onLoad().then(() => {
        console.log(assetManager.get(textureFile).texture)
        const t = assetManager.get(textureFile).texture;
        createCube(t)
      });
    }

    function createCube(t) {
      const cube = root.createChild(name);
      const cubeRenderer = cube.addComponent(o3.GeometryRenderer);
      cubeRenderer.renderPriority = 2;
      const geo = new o3.CuboidGeometry(engine, 3, 3, 3);
      cubeRenderer.geometry = geo;

      const mtl = new o3.PBRMaterial(engine, 'cube_mtl')
      mtl.baseColorTexture = t;
      mtl.unlit = true;
      cubeRenderer.material = mtl;
      cube.transform.setRotation(0, 50, 0)
    }

    function init() {
      requestAnimationFrame(() => {
        const domCanvas = oasisRef.current
        const canvas = new o3.WebCanvas(domCanvas);
        canvas.width = window.innerWidth * o3.SystemInfo.devicePixelRatio;
        canvas.height = window.innerHeight * o3.SystemInfo.devicePixelRatio;
        engine = new o3.Engine(canvas, new o3.WebGLRenderer());
        const scene = engine.sceneManager.activeScene;
        root = new o3.Entity(engine);
        scene.addRootEntity(root);

        const cameraEntity = root.createChild('camera');
        const camera = cameraEntity.addComponent(o3.Camera);
        camera.farClipPlane = 2000000;
        camera.nearClipPlane = 0.001;
        cameraEntity.transform.position = new o3.Vector3(0, 0, 10);

        cameraEntity.addComponent(OrbitControl)

        loadSpine()
        engine.run()
      });
    }


    // function loadSpine() {
    //   assetManager = new AssetManager(engine);
    //   assetManager.loadText(skeletonFile);
    //   if (sourceId === 7) {
    //     assetManager.loadCompressedTexture(textureFile);
    //   } else {
    //     assetManager.loadTexture(textureFile);
    //   }
    //   assetManager.loadText(atlasFile);
    //   assetManager.onLoad().then(() => {
    //     initSpine();
    //   });
    // }

    function loadSpine() {
      assetManager = new AssetManager(engine);
      assetManager.loadText(skeletonFile);
      assetManager.loadImage(textureFile);
      assetManager.loadText(atlasFile);
      assetManager.onLoad().then(() => {
        initSpine();
      });
    }
    
    function loadSpine2() {
      assetManager = new AssetManager(engine);
      assetManager.loadText(skeletonFile);
      assetManager.loadImage(textureFile);
      assetManager.loadText(atlasFile);
      assetManager.onLoad().then(() => {
        initSpine();
      });
    }

    function loadSpine3() {
      assetManager = new AssetManager(engine);
      assetManager.loadText(skeletonFile);
      assetManager.loadCompressedTexture(textureFile, 995, 995);
      assetManager.loadText(atlasFile);
      assetManager.onLoad().then(() => {
        initSpine();
      });
    }

    function initSpine() {
      let textureData = assetManager.get(textureFile);
      // if (sourceId === 7) textureData = assetManager.get(textureFile);
      // if (sourceId === 12) textureData = assetManager.get(textureFile);
        const atlas = new TextureAtlas(assetManager.get(atlasFile), function (line, w, h) {
        // 使用压缩纹理时，atlas的textureLoader内，resize纹理至atlas大小
        console.log(sourceId)
        console.log(textureData)
        // if (sourceId === 7) assetManager.createCompressedTexture(textureFile, textureData, w, h);
        // if (sourceId === 12) assetManager.createTexture(textureFile, textureData, w, h);
        assetManager.createTexture(textureFile, textureData);
        return assetManager.get(textureFile);
      });
      const atlasLoader = new AtlasAttachmentLoader(atlas);
      const skeletonJson = new SkeletonJson(atlasLoader);
      skeletonJson.scale = 0.0065;
      const skeletonData = skeletonJson.readSkeletonData(assetManager.get(skeletonFile));
      const skeletonNode = root.createChild("skeleton");
      // skeletonNode.transform.setRotation(0, -20, 0);
      const spineRenderer = skeletonNode.addComponent(SpineRenderer);
      spineRenderer.setSkeletonData(skeletonData);
      spineRenderer.skeleton.setToSetupPose();
      spineRenderer.state.setAnimation(0, "animation", true);
      window.spineRenderer = spineRenderer;
      skeletonNode.transform.position = new o3.Vector3(-2, 5, 0)
      // skeletonNode.transform.position = new o3.Vector3(0, 0, 0)
    }

  }, []);

  return <canvas ref={oasisRef} id="canvas"></canvas>;
}

export default App;