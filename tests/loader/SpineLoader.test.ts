import { expect } from 'chai';
import sinon from 'sinon';
import { Engine, ResourceManager, Texture2D } from "@galacean/engine";
// import { SkeletonData, TextureAtlas } from "@esotericsoftware/spine-core";
import { SpineLoader } from '../../src/loader/SpineLoader';
import { createSkeletonData, createTextureAtlas, loadTextureAtlas, loadTexturesByPath } from '../../src/loader/LoaderUtils';
import { SkeletonDataResource } from '../../src/loader/SkeletonDataResource';
import { BufferReader } from '../../src/util/BufferReader';

describe('SpineLoader', () => {
    // let engine, resourceManager, mockTexture, buffer, skeletonData, skeletonDataResource, textureAtlas, skeletonTextData;

    // beforeEach(() => {
    //     engine = new Engine();
    //     resourceManager = new ResourceManager(engine);
    //     mockTexture = new Texture2D();
    //     buffer = new ArrayBuffer(8);
    //     skeletonData = new SkeletonData();
    //     skeletonDataResource = new SkeletonDataResource(engine, skeletonData);
    //     textureAtlas = new TextureAtlas();
    //     skeletonTextData = '{"bones": [], "slots": [], "skins": []}';

    //     sinon.stub(resourceManager, 'getResourceByRef').resolves(textureAtlas);
    //     sinon.stub(resourceManager, 'load').resolves(mockTexture);
    //     sinon.stub(SpineLoader.prototype, 'request').resolves(skeletonTextData);
    //     sinon.stub(createSkeletonData, 'call').returns(skeletonData);
    //     sinon.stub(createTextureAtlas, 'call').returns(textureAtlas);
    //     sinon.stub(loadTextureAtlas, 'call').resolves(textureAtlas);
    //     sinon.stub(loadTexturesByPath, 'call').resolves([mockTexture]);
    // });

    // afterEach(() => {
    //     sinon.restore();
    // });

    // describe('静态方法', () => {
    //     describe('parseAndAssignSpineAsset', () => {
    //         it('应正确解析并分配Spine资源路径', () => {
    //             const bundle = {
    //                 skeletonPath: '',
    //                 skeletonExtension: '',
    //                 atlasPath: '',
    //                 imagePaths: [],
    //                 imageExtensions: []
    //             };
    //             SpineLoader.parseAndAssignSpineAsset('http://example.com/spine.json', 'json', bundle);
    //             expect(bundle.skeletonPath).to.equal('http://example.com/spine.json');
    //             expect(bundle.skeletonExtension).to.equal('json');
    //         });
    //     });

    //     describe('deriveAndAssignSpineAsset', () => {
    //         it('应正确派生并分配Spine资源路径', () => {
    //             const bundle = {
    //                 skeletonPath: '',
    //                 skeletonExtension: '',
    //                 atlasPath: '',
    //                 imagePaths: [],
    //                 imageExtensions: []
    //             };
    //             SpineLoader.deriveAndAssignSpineAsset('http://example.com/spine.skel', 'skel', bundle);
    //             expect(bundle.skeletonPath).to.equal('http://example.com/spine.skel');
    //             expect(bundle.skeletonExtension).to.equal('skel');
    //             expect(bundle.atlasPath).to.equal('http://example.com/spine.atlas');
    //         });
    //     });

    //     describe('verifyFileExtensions', () => {
    //         it('应验证文件扩展名是否为数组', () => {
    //             const result = SpineLoader.verifyFileExtensions(['json', 'skel'], true);
    //             expect(result).to.deep.equal(['json', 'skel']);
    //         });

    //         it('应验证文件扩展名是否为字符串', () => {
    //             const result = SpineLoader.verifyFileExtensions('json', false);
    //             expect(result).to.equal('json');
    //         });
    //     });

    //     describe('getUrlExtension', () => {
    //         it('应从URL中获取扩展名', () => {
    //             const result = SpineLoader.getUrlExtension('http://example.com/spine.json', null);
    //             expect(result).to.equal('json');
    //         });
    //     });
    // });

    // describe('实例方法', () => {
    //     describe('load', () => {
    //         it('应加载Spine资源', async () => {
    //             const loadItem = {
    //                 url: 'http://example.com/spine.skel',
    //                 params: { fileExtensions: 'skel' }
    //             };
    //             const loader = new SpineLoader();
    //             const result = await loader.load(loadItem, resourceManager);
    //             expect(result).to.be.instanceof(SkeletonDataResource);
    //         });
    //     });

    //     describe('_handleEditorAsset', () => {
    //         it('应处理编辑器资产', async () => {
    //             const reader = new BufferReader(new Uint8Array(buffer));
    //             const loader = new SpineLoader();
    //             const result = await loader._handleEditorAsset(buffer, reader, 'spine:skel', resourceManager);
    //             expect(result).to.be.instanceof(SkeletonDataResource);
    //         });
    //     });

    //     describe('_handleOriginAsset', () => {
    //         it('应处理原始资产', async () => {
    //             const loadItem = {
    //                 url: 'http://example.com/spine.skel',
    //                 params: { fileExtensions: 'skel' }
    //             };
    //             const loader = new SpineLoader();
    //             const result = await loader._handleOriginAsset(loadItem, resourceManager, buffer);
    //             expect(result).to.be.instanceof(SkeletonDataResource);
    //         });
    //     });

    //     describe('determineSkeletonDataType', () => {
    //         it('应确定骨架数据类型', () => {
    //             const loader = new SpineLoader();
    //             const { data, type } = loader.determineSkeletonDataType(buffer);
    //             expect(data).to.be.a('string');
    //             expect(type).to.equal('json');
    //         });
    //     });
    // });
});
