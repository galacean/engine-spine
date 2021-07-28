import {
  Entity,
  Vector3,
  MeshRenderer,
  Component,
  UpdateFlag,
  Renderer,
  Camera,
  BoundingBox,
  ModelMesh,
  MeshTopology
} from "oasis-engine";
import { createGeometryMaterial } from './utils';

export class OutlineAbility extends MeshRenderer {
  private flags: UpdateFlag[] = [];
  private attachedEntity: Entity;
  private renderers: Renderer[] = [];
  private boundingBox: BoundingBox = new BoundingBox();

  constructor(entity: Entity) {
    super(entity);

    const mesh = new ModelMesh(this._engine);
    const positions = [];
    positions.push(
      new Vector3(0, 0, 0),
      new Vector3(1, 0, 0),
      new Vector3(1, 0, -1),
      new Vector3(0, 0, -1),
      new Vector3(0, 1, 0),
      new Vector3(1, 1, 0),
      new Vector3(1, 1, -1),
      new Vector3(0, 1, -1)
    );
    mesh.setPositions(positions);
    mesh.setIndices(
      // prettier-ignore
      new Uint8Array([0, 1, 1, 2, 2, 3, 0, 3, 4, 5, 5, 6, 6, 7, 4, 7, 0, 4, 1, 5, 2, 6, 3, 7])
    );
    mesh.addSubMesh(0, 24, MeshTopology.Lines);
    mesh.uploadData(false);

    this.mesh = mesh;
    this.setMaterial(createGeometryMaterial(this.engine));
    this.entity.isActive = false;
  }

  updateBoundingBox() {
    if (!this.attachedEntity) {
      return;
    }
    this.removeEventListeners();
    const { renderers } = this;
    renderers.length = 0;
    // @ts-ignore
    this.attachedEntity.getComponentsIncludeChildren(Renderer, renderers);

    const rendererCount = renderers.length;
    if (rendererCount > 0) {
      this.addEventListeners();
      this.updateVertices();
    } else {
      this.flags.length = 0;
      this.entity.isActive = false;
    }
  }

  updateSelectedNode(entity: Entity): void {
    this.attachedEntity = entity;
    this.updateBoundingBox();
  }

  private updateVertices() {
    const {
      boundingBox: { min, max },
      boundingBox,
      renderers
    } = this;

    const rendererCount = renderers.length;
    if (rendererCount > 0) {
      const { min: baseMin, max: baseMax } = renderers[0].mesh.bounds;
      min.setValue(baseMin.x, baseMin.y, baseMin.z);
      max.setValue(baseMax.x, baseMax.y, baseMax.z);
    } else {
      min.setValue(0, 0, 0);
      max.setValue(0, 0, 0);
    }

    const mesh = <ModelMesh>this.mesh;
    const positions = mesh.getPositions();
    positions[0].setValue(min.x, min.y, max.z);
    positions[1].setValue(max.x, min.y, max.z);
    positions[2].setValue(max.x, min.y, min.z);
    positions[3].setValue(min.x, min.y, min.z);
    positions[4].setValue(min.x, max.y, max.z);
    positions[5].setValue(max.x, max.y, max.z);
    positions[6].setValue(max.x, max.y, min.z);
    positions[7].setValue(min.x, max.y, min.z);
    mesh.setPositions(positions);
    mesh.uploadData(false);
    this.entity.isActive = true;
  }

  private addEventListeners() {
    const addListener = (component: Component) => {
      this.flags.push(component.entity?.transform.registerWorldChangeFlag());
    };
    this.flags.length = 0;
    this.renderers.forEach(addListener);
  }

  private removeEventListeners() {
    this.flags.forEach((flag) => flag.destroy());
  }

  _render(camera: Camera) {
    for (let i = 0; i < this.flags.length; i++) {
      const flag = this.flags[i];
      if (flag.flag) {
        this.updateVertices();
        flag.flag = false;
        break;
      }
    }
    // @ts-ignore
    super._render(camera);
  }
}