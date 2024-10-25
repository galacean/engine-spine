import { expect } from 'chai';
import sinon from 'sinon';
import { Engine, Texture2D, ReferResource } from "@galacean/engine";
// import { SkeletonData, Skin, Attachment } from "@esotericsoftware/spine-core";
import { SpineResource } from '../../src/loader/SpineResource'; // 确保导入路径正确
import { SpineAnimationRenderer } from '../../src/SpineAnimationRenderer';

describe('SpineResource', () => {
  // let engine, skeletonData, texture, skin, attachment;

  // beforeEach(() => {
  //   engine = new Engine();
  //   texture = sinon.createStubInstance(Texture2D);
  //   skeletonData = new SkeletonData();
  //   skin = sinon.createStubInstance(Skin);
  //   attachment = { region: { texture: { texture } } };
    
  //   skeletonData.skins = [skin];
  //   skin.attachments = [ { attachment1: attachment } ];
  // });

  // describe('构造函数和属性', () => {
  //   it('应正确初始化并关联纹理', () => {
  //     const resource = new SpineResource(engine, skeletonData);
  //     expect(resource.skeletonData).to.equal(skeletonData);
  //     expect(resource.textures).to.include(texture);
  //   });
  // });

  // describe('资源销毁', () => {
  //   it('应正确解除纹理关联并清除缓存', () => {
  //     const resource = new SpineResource(engine, skeletonData);
  //     sinon.stub(resource, '_disassociationSuperResource');
  //     sinon.stub(resource, '_clearAttachmentTextures');

  //     resource.destroy();

  //     expect(resource._disassociationSuperResource.calledOnceWith(resource.textures)).to.be.true;
  //     expect(resource._clearAttachmentTextures.calledOnceWith(skeletonData)).to.be.true;
  //     expect(SpineAnimationRenderer.animationDataCache.has(skeletonData)).to.be.false;
  //   });
  // });

  // describe('私有方法 _disassociationSuperResource', () => {
  //   it('应解除关联超级资源', () => {
  //     const resource = new SpineResource(engine, skeletonData);
  //     const otherResource = sinon.createStubInstance(ReferResource);
  //     otherResource._disassociationSuperResource = sinon.spy();
  //     resource.textures.push(otherResource);

  //     resource._disassociationSuperResource([otherResource]);

  //     expect(otherResource._disassociationSuperResource.calledOnceWith(resource)).to.be.true;
  //   });
  // });

  // describe('私有方法 _associationTextureInSkeletonData', () => {
  //   it('应正确关联纹理', () => {
  //     const resource = new SpineResource(engine, skeletonData);
  //     expect(resource.textures).to.include(texture);
  //   });
  // });

  // describe('私有方法 _clearAttachmentTextures', () => {
  //   it('应正确清除附件纹理', () => {
  //     const resource = new SpineResource(engine, skeletonData);
  //     resource._clearAttachmentTextures(skeletonData);
  //     expect(attachment.region.texture.texture).to.be.null;
  //   });
  // });
});
