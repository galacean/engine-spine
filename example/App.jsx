import React, { useEffect, useRef } from 'react';
import { Stats } from '@oasis-engine/stats'
import "./App.css";
import * as o3 from 'oasis-engine'
import { OrbitControl } from "@oasis-engine/controls";
import { SpineAnimation } from '../src/index';

let engine;
let root;

o3.Engine.registerFeature(Stats);


function App() {

  const oasisRef = useRef(null)

  useEffect(() => {

    init()

    function init() {
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
      cameraEntity.transform.position = new o3.Vector3(0, 0, 12)

      cameraEntity.addComponent(OrbitControl)

      loadSpine(root);

      engine.run();
    }

    async function loadSpine(root) {
      const spineEntity = await engine.resourceManager.load(
        {
          url: 'http://alipay-rmsdeploy-image.cn-hangzhou.alipay.aliyun-inc.com/bakery/Fish.json',
          type: 'spine',
          scale: 0.007
        },
        // {
        //   urls: [
        //     'https://gw.alipayobjects.com/os/OasisHub/8081ad50-ee54-4212-b095-3d56caaea321/1612507101048.json',
        //     'https://gw.alipayobjects.com/os/OasisHub/b25bae97-a622-40e4-9965-15fb4f4e5b8a/1612507101049.atlas',
        //     'https://gw.alipayobjects.com/zos/OasisHub/78502992-5fba-4d9c-8a6d-2011f7ead213/1612507101049.png'
        //   ],
        //   type: 'spine',
        //   scale: 0.007
        // }
      );
      root.addChild(spineEntity);
      const spineAnimation = spineEntity.getComponent(SpineAnimation);
      spineAnimation.state.setAnimation(0, 'animation', true);
    }

  }, []);

  return <canvas ref={oasisRef} id="canvas"></canvas>;
}

export default App;