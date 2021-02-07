/**
 *
 * ported from https://github.com/BabylonJS/Babylon.js/blob/master/src/Tools/babylon.khronosTextureContainer.ts
 */
import { KTXContainer } from "./type";
/**
 * for description see https://www.khronos.org/opengles/sdk/tools/KTX/
 * for file layout see https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/
 */
export declare const khronosTextureContainerParser: {
    /**
     *
     * @param buffer contents of the KTX container file
     * @param facesExpected should be either 1 or 6, based whether a cube texture or or
     * @param threeDExpected provision for indicating that data should be a 3D texture, not implemented
     * @param textureArrayExpected provision for indicating that data should be a texture array, not implemented
     * @param mapEngineFormat get Oasis Engine native TextureFormat?
     */
    parse(buffer: ArrayBuffer, facesExpected: number, withMipmaps: boolean, mapEngineFormat?: boolean): KTXContainer;
};
