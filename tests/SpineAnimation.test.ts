import { expect } from 'chai';
import sinon from 'sinon';
import {
  Entity,
  Engine,
  Material
} from '@galacean/engine';
// import {  
//   Skeleton,
//   SkeletonData
// } from '@esotericsoftware/spine-core';
import { SpineAnimation } from '../src/SpineAnimation';
import { SpineGenerator } from '../src/SpineGenerator';

describe('SpineAnimation', function() {
  // let engine, entity, spineAnimation, skeletonData;

  // beforeEach(() => {
  //   engine = new Engine();
  //   entity = new Entity();
  //   skeletonData = new SkeletonData();
  //   spineAnimation = new SpineAnimation(entity);
  //   spineAnimation.engine = engine; // 假设engine是公开的，或者通过构造函数传入
  // });

  // describe('Initialization', function() {
  //   it('should initialize with default values', function() {
  //     expect(spineAnimation.initialState.scale).to.equal(1);
  //     expect(spineAnimation.initialState.loop).to.be.false;
  //     expect(spineAnimation.initialState.skinName).to.equal('default');
  //     expect(spineAnimation.initialState.animationName).to.be.null;
  //   });
  // });

  // describe('Resource Management', function() {
  //   it('should set resource correctly', function() {
  //     const resource = { skeletonData: skeletonData };
  //     spineAnimation.resource = resource;
      
  //     expect(spineAnimation._resource).to.equal(resource);
  //     expect(spineAnimation._skeleton).to.be.instanceOf(Skeleton);
  //   });

  //   it('should clear resource correctly', function() {
  //     spineAnimation.resource = null;
      
  //     expect(spineAnimation._resource).to.be.null;
  //     expect(spineAnimation._skeleton).to.be.null;
  //     expect(spineAnimation._state).to.be.null;
  //   });
  // });

  // describe('Animation State Control', function() {
  //   beforeEach(() => {
  //     spineAnimation.resource = { skeletonData: skeletonData };
  //   });

  //   it('should start animation correctly', function() {
  //     const stub = sinon.stub(spineAnimation._state, 'setAnimation');
  //     spineAnimation.initialState.animationName = 'walk';
  //     spineAnimation.initialState.loop = true;
      
  //     spineAnimation._onEnable();

  //     expect(stub.calledOnceWith(0, 'walk', true)).to.be.true;
  //   });
  // });

  // describe('Buffer Management', function() {
  //   it('should create buffer with appropriate size', function() {
  //     const maxVertexCount = 1000;
  //     sinon.stub(SpineGenerator, 'getMaxVertexCount').returns(maxVertexCount);
  //     spineAnimation._createBuffer(maxVertexCount);

  //     expect(spineAnimation._vertices.length).to.equal(maxVertexCount * SpineGenerator.VERTEX_STRIDE);
  //     expect(spineAnimation._indices.length).to.equal(maxVertexCount);
  //   });
  // });

  // describe('Material Management', function() {
  //   it('should retrieve and cache material correctly', function() {
  //     const material = spineAnimation.getDefaultMaterial(engine);
  //     expect(material).to.be.instanceOf(Material);
  //     expect(SpineAnimation.materialCache.has(material.shaderData.getTexture('material_SpineTexture').instanceId)).to.be.true;
  //   });
  // });

  // afterEach(() => {
  //   sinon.restore(); // Restore sinon stubs to original methods
  // });
});
