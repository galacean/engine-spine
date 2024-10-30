import { expect } from 'chai';
import { BlinnPhongMaterial, WebGLEngine, BlendFactor, BlendOperation } from "@galacean/engine";
import { BlendMode } from "@esotericsoftware/spine-core";
import { setBlendMode, getBlendMode } from '../../src/util/BlendMode';
import { createEngine } from '../testUtils';

const { SourceAlpha, One, DestinationColor, Zero, OneMinusSourceColor, OneMinusSourceAlpha } = BlendFactor;
const { Add } = BlendOperation;

describe('BlendMode Utility Functions', function() {
  let material;
  let engine;

  beforeEach(async () => {
    engine = await createEngine();
    material = new BlinnPhongMaterial(engine);
  });

  describe('setBlendMode', function() {
    it('should set additive blend mode correctly', function() {
      setBlendMode(material, BlendMode.Additive);
      const { targetBlendState } = material.renderState.blendState;
      expect(targetBlendState.sourceColorBlendFactor).to.equal(SourceAlpha);
      expect(targetBlendState.destinationColorBlendFactor).to.equal(One);
      expect(targetBlendState.sourceAlphaBlendFactor).to.equal(One);
      expect(targetBlendState.destinationAlphaBlendFactor).to.equal(One);
      expect(targetBlendState.colorBlendOperation).to.equal(Add);
      expect(targetBlendState.alphaBlendOperation).to.equal(Add);
    });

    it('should set multiply blend mode correctly', function() {
      setBlendMode(material, BlendMode.Multiply);
      const { targetBlendState } = material.renderState.blendState;
      expect(targetBlendState.sourceColorBlendFactor).to.equal(DestinationColor);
      expect(targetBlendState.destinationColorBlendFactor).to.equal(Zero);
      expect(targetBlendState.sourceAlphaBlendFactor).to.equal(One);
      expect(targetBlendState.destinationAlphaBlendFactor).to.equal(Zero);
      expect(targetBlendState.colorBlendOperation).to.equal(Add);
      expect(targetBlendState.alphaBlendOperation).to.equal(Add);
    });

    it('should set screen blend mode correctly', function() {
      setBlendMode(material, BlendMode.Screen);
      const { targetBlendState } = material.renderState.blendState;
      expect(targetBlendState.sourceColorBlendFactor).to.equal(One);
      expect(targetBlendState.destinationColorBlendFactor).to.equal(OneMinusSourceColor);
      expect(targetBlendState.sourceAlphaBlendFactor).to.equal(One);
      expect(targetBlendState.destinationAlphaBlendFactor).to.equal(OneMinusSourceColor);
      expect(targetBlendState.colorBlendOperation).to.equal(Add);
      expect(targetBlendState.alphaBlendOperation).to.equal(Add);
    });

    it('should set default blend mode', function() {
      // @ts-ignore
      setBlendMode(material, 4);
      const { targetBlendState } = material.renderState.blendState;
      expect(targetBlendState.sourceColorBlendFactor).to.equal(SourceAlpha);
      expect(targetBlendState.destinationColorBlendFactor).to.equal(OneMinusSourceAlpha);
      expect(targetBlendState.sourceAlphaBlendFactor).to.equal(One);
      expect(targetBlendState.destinationAlphaBlendFactor).to.equal(OneMinusSourceAlpha);
      expect(targetBlendState.colorBlendOperation).to.equal(Add);
      expect(targetBlendState.alphaBlendOperation).to.equal(Add);
    });

  });

  describe('getBlendMode', function() {
    it('should return the correct blend mode', function() {
      setBlendMode(material, BlendMode.Additive);
      expect(getBlendMode(material)).to.equal(BlendMode.Additive);

      setBlendMode(material, BlendMode.Multiply);
      expect(getBlendMode(material)).to.equal(BlendMode.Multiply);

      setBlendMode(material, BlendMode.Screen);
      expect(getBlendMode(material)).to.equal(BlendMode.Screen);

      // @ts-ignore
      setBlendMode(material, 4);
      expect(getBlendMode(material)).to.equal(BlendMode.Normal);
    });
  });
});
