import { PluginHook } from "./PluginManager";
import { Oasis } from "../Oasis";
export declare type Plugin = ((oasis: Oasis) => PluginHook) | PluginHook;
