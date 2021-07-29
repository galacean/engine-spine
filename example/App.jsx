import React, { useEffect, useRef } from 'react';
import { Stats } from '@oasis-engine/stats'
import "./App.css";
import * as o3 from 'oasis-engine'
import { OrbitControl } from "@oasis-engine/controls";
import { SpineAnimation } from '../src/index';
import { OutlineAbility } from './outline/OutlineAbility';

let engine;
let root;
let outline;

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
      cameraEntity.transform.position = new o3.Vector3(0, 0, 12);

      cameraEntity.addComponent(OrbitControl);

      const outlineEntity = root.createChild('outline');
      outline = outlineEntity.addComponent(OutlineAbility);

      loadSpine(root);

      engine.run();
    }

    async function loadSpine(root) {
      const spineEntity = await engine.resourceManager.load(
        // {
        //   url: 'http://alipay-rmsdeploy-image.cn-hangzhou.alipay.aliyun-inc.com/bakery/Fish.json',
        //   type: 'spine',
        // },
        {
          url: 'http://alipay-rmsdeploy-image.cn-hangzhou.alipay.aliyun-inc.com/bakery/Fish.json',
          type: 'spine',
        },
        // {
        //   urls: [
        //     'https://gw.alipayobjects.com/os/OasisHub/416cae15-691b-4b19-bb68-fa691c042d30/1626354535504.json',
        //     'https://gw.alipayobjects.com/os/OasisHub/174a2e33-8946-489f-b93e-7a27a90de4ec/1626354535507.atlas',
        //     'https://gw.alipayobjects.com/zos/OasisHub/4319fb1d-97dd-4509-9af3-da9c25350452/1626354535507.png'
        //   ],
        //   type: 'spine'
        // }
      );
      root.addChild(spineEntity);
      const spineAnimation = spineEntity.getComponent(SpineAnimation);
      spineAnimation.state.setAnimation(0, 'animation', true);
      spineAnimation.scale = 0.007;

      outline.updateSelectedNode(spineEntity);
      outline.isActive = true;
      setInterval(() => {
        outline.updateVertices();
      }, 67);
    }

  }, []);

  return <canvas ref={oasisRef} id="canvas"></canvas>;
}

export default App;