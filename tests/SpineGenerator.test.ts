import { expect } from 'chai';
import {
  BlendMode
} from '../src/index';
import { Entity, Texture2D, WebGLEngine, Material } from '@galacean/engine';
import { SpineAnimationRenderer } from '../src/SpineAnimationRenderer';
import { SpineGenerator } from '../src/SpineGenerator';
import { SpineResource } from '../src/loader/SpineResource';
import { getBlendMode } from '../src/util/BlendMode';
import { createEngine, mockSkeletonDataResource } from './testUtils';

describe('SpineGenerator', function() {
  let spineGenerator: SpineGenerator;
  let engine: WebGLEngine;
  let spineEntity: Entity;
  let spineAnimation: SpineAnimationRenderer;
  let skeletonDataResource: SpineResource;

  beforeAll(async () => {
    engine = await createEngine();
    spineGenerator = new SpineGenerator();
    skeletonDataResource = await engine.resourceManager.load({
      url: 'https://mdn.alipayobjects.com/huamei_kz4wfo/uri/file/as/2/kz4wfo/4/mp/yKbdfgijyLGzQDyQ/spineboy/spineboy.json',
      type: 'spine',
    });
    const scene = engine.sceneManager.activeScene;
    const root = scene.createRootEntity();
    scene.addRootEntity(root);
    const entity = new Entity(engine);
    spineAnimation = entity.addComponent(SpineAnimationRenderer);
    spineAnimation.resource = skeletonDataResource;
    root.addChild(spineEntity);
  }, 100000000000000);

  it('buildPrimitive', async function() {
    // console.log(skeletonDataResource);
    // @ts-ignore
    // SpineAnimationRenderer._spineGenerator.buildPrimitive(skeleton, spineAnimation);
    
  });

  it('expandByPoint', function() {
    // @ts-ignore
    spineGenerator.expandByPoint(-10, -10, -10);
    // @ts-ignore
    spineGenerator.expandByPoint(10, 10, 10);

    // @ts-ignore
    const { bounds } = SpineGenerator;
    expect(bounds.min.x).to.equal(-10);
    expect(bounds.min.y).to.equal(-10);
    expect(bounds.min.z).to.equal(-10);
    expect(bounds.max.x).to.equal(10);
    expect(bounds.max.y).to.equal(10);
    expect(bounds.max.z).to.equal(10);
  });

  it('createMaterialForTexture', function() {
    const texture = new Texture2D(engine, 1, 1);
    const additive = BlendMode.Additive;
    // @ts-ignore
    const material = spineGenerator.createMaterialForTexture(texture, engine, additive);

    expect(material).to.be.instanceOf(Material);
    expect(material.shaderData.getTexture('material_SpineTexture')).to.equal(texture);
    const blendMode = getBlendMode(material);
    expect(blendMode).to.equal(additive);
  });

  it('getMaxVertexCount', async function() {
    // const vertexCount = spineGenerator.getMaxVertexCount(skeletonDataResource.skeletonData);
    // console.log(vertexCount);
    // expect(vertexCount).to.equal(12); // 6 vertices from RegionAttachment and 6 from MeshAttachment
  });

  it('addSeparateSlot', async function() {
    const slotName = 'arm';
    spineGenerator.addSeparateSlot(slotName);
    // @ts-ignore
    expect(spineGenerator._separateSlots.has(slotName)).to.be.true;
    // @ts-ignore
    expect(spineGenerator._separateSlots.get(slotName)).to.equal(slotName);
  });

  it('addSeparateSlotTexture', function() {
    const slotName = 'leg';
    const texture = new Texture2D(engine, 1, 1); // Assuming Texture2D is a class that can be instantiated
    spineGenerator.addSeparateSlotTexture(slotName, texture);
    // @ts-ignore
    expect(spineGenerator._separateSlotTextureMap.has(slotName)).to.be.true;
    // @ts-ignore
    expect(spineGenerator._separateSlotTextureMap.get(slotName)).to.equal(texture);
  });
});
