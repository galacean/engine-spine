import { Engine } from "../Engine";
import { ShaderMacro } from "./ShaderMacro";
import { ShaderProperty } from "./ShaderProperty";
/**
 * Shader containing vertex and fragment source.
 */
export declare class Shader {
    private static _shaderCounter;
    private static _shaderMap;
    private static _propertyNameMap;
    private static _macroMaskMap;
    private static _macroCounter;
    private static _macroMap;
    private static _shaderExtension;
    /**
     * Create a shader.
     * @param name - Name of the shader
     * @param vertexSource - Vertex source code
     * @param fragmentSource - Fragment source code
     */
    static create(name: string, vertexSource: string, fragmentSource: string): Shader;
    /**
     * Find a shader by name.
     * @param name - Name of the shader
     */
    static find(name: string): Shader;
    /**
     * Get shader macro by name.
     * @param name - Name of the shader macro
     * @returns Shader macro
     */
    static getMacroByName(name: string): ShaderMacro;
    /**
     * Get shader property by name.
     * @param name - Name of the shader property
     * @returns Shader property
     */
    static getPropertyByName(name: string): ShaderProperty;
    private static _getNamesByMacros;
    /** The name of shader. */
    readonly name: string;
    private _vertexSource;
    private _fragmentSource;
    private constructor();
    /**
     * Compile shader variant by macro name list.
     *
     * @remarks
     * Usually a shader contains some macros,any combination of macros is called shader variant.
     *
     * @param engine - Engine to which the shader variant belongs
     * @param macros - Macro name list
     */
    compileVariant(engine: Engine, macros: string[]): void;
}
