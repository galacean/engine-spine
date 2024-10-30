// import { expect } from 'chai';
// import sinon from 'sinon';
// import { Engine, Texture2D } from "@galacean/engine";
// import { 
//   TextureAtlas, 
//   AtlasAttachmentLoader, 
//   SkeletonJson, 
//   SkeletonBinary, 
//   SkeletonData, 
//   TextureFilter, 
//   TextureWrap 
// } from "@esotericsoftware/spine-core";
// import { 
//   createSkeletonData, 
//   loadTexturesByPath, 
//   loadTextureAtlas, 
//   createTextureAtlas, 
//   loadTexture, 
//   createAdaptiveTexture, 
//   getBaseUrl, 
//   AdaptiveTexture,
// } from '../../src/loader/LoaderUtils';

// describe('Spine相关加载器和工具函数的单元测试', () => {
//     let engine, mockTexture, atlasText, fakeImage;

//     beforeEach(() => {
//         engine = new Engine();
//         atlasText = 'some atlas data';
//         mockTexture = new Texture2D();
//         fakeImage = new Image();
//         sinon.stub(engine.resourceManager, 'load').resolves(mockTexture);
//     });

//     afterEach(() => {
//         sinon.restore();
//     });

//     describe('createSkeletonData 函数', () => {
//         it('根据JSON或二进制数据创建SkeletonData', () => {
//             const textureAtlas = new TextureAtlas();
//             const atlasLoader = new AtlasAttachmentLoader(textureAtlas);
//             sinon.stub(SkeletonJson.prototype, 'readSkeletonData').returns(new SkeletonData());
//             sinon.stub(SkeletonBinary.prototype, 'readSkeletonData').returns(new SkeletonData());

//             const jsonSkeletonData = '{"bones": [], "slots": [], "skins": []}';
//             const binarySkeletonData = new ArrayBuffer(10);
//             expect(createSkeletonData(textureAtlas, jsonSkeletonData, 'json')).to.be.instanceof(SkeletonData);
//             expect(createSkeletonData(textureAtlas, binarySkeletonData, 'skel')).to.be.instanceof(SkeletonData);
//         });
//     });

//     describe('loadTexturesByPath 函数', () => {
//         it('从给定路径加载多个纹理', async () => {
//             const paths = ['texture1.png', 'texture2.ktx'];
//             const extensions = ['png', 'ktx'];
//             const textures = await loadTexturesByPath(paths, extensions, engine);
//             expect(textures).to.have.lengthOf(2);
//             expect(textures.every(t => t instanceof Texture2D)).to.be.true;
//         });
//     });

//     describe('loadTextureAtlas 函数', () => {
//         it('从路径加载纹理图集及其纹理', async () => {
//             const atlasPath = 'http://example.com/assets/myAtlas.atlas';
//             sinon.stub(request, 'call').resolves('name: "example.atlas"');
//             const textureAtlas = await loadTextureAtlas(atlasPath, engine);
//             expect(textureAtlas).to.be.instanceof(TextureAtlas);
//         });
//     });

//     describe('createTextureAtlas 函数', () => {
//         it('基于纹理和图集文本创建TextureAtlas', () => {
//             const textures = [new Texture2D(), new Texture2D()];
//             const textureAtlas = createTextureAtlas(atlasText, textures);
//             expect(textureAtlas).to.be.instanceof(TextureAtlas);
//         });
//     });

//     describe('loadTexture 函数', () => {
//         it('加载指定URL的纹理', async () => {
//             const texture = await loadTexture('http://example.com/texture.png', engine);
//             expect(texture).to.be.instanceof(Texture2D);
//         });
//     });

//     describe('createAdaptiveTexture 函数', () => {
//         it('创建自适应纹理', () => {
//             const adaptiveTexture = createAdaptiveTexture(mockTexture);
//             expect(adaptiveTexture.texture).to.equal(mockTexture);
//         });
//     });

//     describe('getBaseUrl 函数', () => {
//         it('从URL中提取基本路径', () => {
//             const url = "http://example.com/assets/spine/character.atlas";
//             expect(getBaseUrl(url)).to.equal("http://example.com/assets/spine/");
//         });
//     });

//     describe('AdaptiveTexture 类', () => {
//         let adaptiveTexture;

//         beforeEach(() => {
//             adaptiveTexture = new AdaptiveTexture(fakeImage, mockTexture);
//         });

//         it('设置纹理过滤和包裹模式', () => {
//             adaptiveTexture.setFilters(TextureFilter.Nearest, TextureFilter.MipMapLinearLinear);
//             adaptiveTexture.setWraps(TextureWrap.ClampToEdge, TextureWrap.Repeat);
//             expect(mockTexture.filterMode).to.satisfy(mode => mode === TextureFilterMode.Trilinear || mode === TextureFilterMode.Bilinear);
//             expect(mockTexture.wrapModeU).to.equal(TextureWrapMode.Clamp);
//             expect(mockTexture.wrapModeV).to.equal(TextureWrapMode.Repeat);
//         });
//     });
// });
