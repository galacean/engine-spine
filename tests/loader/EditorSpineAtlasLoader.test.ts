import { expect } from 'chai';
import sinon from 'sinon';
import { EditorSpineAtlasLoader } from '../../src/loader/EditorSpineAtlasLoader'; // 确保导入路径正确
import { ResourceManager, AssetPromise } from '@galacean/engine';
// import { TextureAtlas } from '@esotericsoftware/spine-core';
import { createTextureAtlas } from '../../src/loader/LoaderUtils';

describe('EditorSpineAtlasLoader', function() {
  let loader, resourceManager, loadItem, fakeUrl, fakeResponse, fakeTexture;

  // beforeEach(() => {
  //   loader = new EditorSpineAtlasLoader();
  //   resourceManager = new ResourceManager();
  //   fakeUrl = 'http://example.com/assets/spine.atlas';
  //   loadItem = { url: fakeUrl };
  //   fakeResponse = JSON.stringify({
  //     data: 'some atlas data',
  //     textures: [{ refId: 'texture1' }]
  //   });
  //   fakeTexture = {}; // 模拟纹理对象

  //   sinon.stub(loader, 'request').resolves(fakeResponse);
  //   sinon.stub(resourceManager, 'getResourceByRef').returns(Promise.resolve(fakeTexture));
  //   sinon.stub(createTextureAtlas, 'call').returns(new TextureAtlas());
  // });

  // describe('load', function() {
  //   it('should load texture atlas from a URL', async function() {
  //     const promise = loader.load(loadItem, resourceManager);
  //     expect(promise).to.be.instanceOf(AssetPromise);
      
  //     const result = await promise;
  //     expect(result).to.be.instanceOf(TextureAtlas);
  //     expect(loader.request.calledWith(fakeUrl, { type: 'text' })).to.be.true;
  //     expect(resourceManager.getResourceByRef.calledOnceWith({ refId: 'texture1' })).to.be.true;
  //     expect(createTextureAtlas.call.calledOnceWith('some atlas data', [fakeTexture])).to.be.true;
  //   });
  // });

  // afterEach(() => {
  //   sinon.restore();
  // });
});
