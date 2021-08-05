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
    const engine = this.engine;
    const mesh = new ModelMesh(engine);
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
    this.setMaterial(createGeometryMaterial(engine));
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
    const { x: minX, y: minY, z: minZ } = min;
    const { x: maxX, y: maxY, z: maxZ } = max;
    positions[0].setValue(minX, minY, maxZ);
    positions[1].setValue(maxX, minY, maxZ);
    positions[2].setValue(maxX, minY, minZ);
    positions[3].setValue(minX, minY, minZ);
    positions[4].setValue(minX, maxY, maxZ);
    positions[5].setValue(maxX, maxY, maxZ);
    positions[6].setValue(maxX, maxY, minZ);
    positions[7].setValue(minX, maxY, minZ);
    mesh.setPositions(positions);
    mesh.uploadData(false);
    this.entity.isActive = true;
  }

  private addEventListeners() {
    const { flags } = this;
    const addListener = (component: Component) => {
      flags.push(component.entity?.transform.registerWorldChangeFlag());
    };
    flags.length = 0;
    const { renderers } = this;
    const rendererLength = renderers.length;
    for (let i = 0; i < rendererLength; i += 1) {
      addListener(renderers[i]);
    }
  }

  private removeEventListeners() {
    this.flags.forEach((flag) => flag.destroy());
  }

  _render(camera: Camera) {
    const { flags } = this;
    const flagLength = flags.length;
    for (let i = 0; i < flagLength; i++) {
      const flag = flags[i];
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