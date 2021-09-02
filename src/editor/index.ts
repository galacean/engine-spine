import { Parser, registerResource } from 'oasis-engine';
import { SpineComponent } from './SpineComponent';
import { SpineResource } from './SpineResource';
import '../SpineLoader';

Parser.registerComponents('o3', {
  SpineComponent,
});

registerResource('spine', SpineResource);

export { SpineComponent } from './SpineComponent';
export { SpineResource } from './SpineResource';
