import { Component, Entity } from "@oasis-engine/core";
import { Oasis } from "../Oasis";
import { SchemaResource } from "../resources";
import { Plugin } from "./Plugin";
export declare class PluginManager implements PluginHook {
    private registeredPlugins;
    private plugins;
    register(plugin: Plugin): void;
    boot(oasis: Oasis): void;
    reset(): void;
    nodeAdded(entity: Entity): void;
    private delegateMethod;
}
export interface PluginHook {
    oasis?: Oasis;
    nodeAdded?(entity: Entity): any;
    beforeNodeUpdated?(id: string, key: string, value: any): any;
    nodeUpdated?(updateConfig?: {
        id: string;
        key: string;
        value: any;
    }): any;
    abilityAdded?(ability: Component): any;
    beforeAbilityAdded?(config: any): any;
    beforeAbilityUpdated?(id: string, key: string, value: any): any;
    abilityUpdated?(updateConfig?: {
        id: string;
        key: string;
        value: any;
    }): any;
    schemaParsed?(): any;
    abilityDeleted?(id: string): any;
    beforeAbilityDeleted?(id: string): any;
    beforeNodeDeleted?(config: any): any;
    beforeResourceRemove?(id: string): any;
    resourceUpdated?(info: {
        resource: SchemaResource;
        id: string;
        key: string;
        value: any;
    }): any;
    beforeResourceUpdate?(id: string, key: string, value: any): any;
    beforeResourceAdd?(resource: any): any;
    resourceAdded?(resource: any): any;
}
export declare function pluginHook(options: Partial<{
    before: keyof PluginHook;
    after: keyof PluginHook;
}>): MethodDecorator;
