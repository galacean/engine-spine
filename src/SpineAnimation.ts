
import { SpineRenderScript } from './core/SpineRenderScript';
import { MeshRenderer, Entity } from 'oasis-engine';
import { SkeletonMaterial } from './core/SkeletonMaterial';

export class SpineAnimation extends SpineRenderScript {
  
  meshRenderer: MeshRenderer;

  constructor(entity: Entity) {
    super(entity);
    this.meshRenderer = this.entity.addComponent(MeshRenderer);
    const mtl = new SkeletonMaterial(this.engine);
    this.meshRenderer.setMaterial(mtl);
  }
}