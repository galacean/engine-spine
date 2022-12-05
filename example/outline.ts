import {
  Entity,
  Vector3,
  MeshRenderer,
  Renderer,
  Camera,
  BoundingBox,
  ModelMesh,
  MeshTopology,
  Engine,
  Material,
  Shader,
  BlendFactor,
  RenderQueueType,
  CullMode,
  Vector4,
} from 'oasis-engine';

export default class BoundingBoxLine extends MeshRenderer {
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
    const { renderers } = this;
    renderers.length = 0;
    this.attachedEntity.getComponentsIncludeChildren(Renderer, renderers);

    const rendererCount = renderers.length;
    if (rendererCount > 0) {
      this.updateVertices();
    } else {
      this.entity.isActive = false;
    }
  }

  attachToEntity(entity: Entity): void {
    this.attachedEntity = entity;
    this.updateBoundingBox();
  }

  private updateVertices() {
    const {
      boundingBox: { min, max },
      renderers
    } = this;

    const rendererCount = renderers.length;
    if (rendererCount > 0) {
      const { min: baseMin, max: baseMax } = renderers[0].bounds;
      min.set(baseMin.x, baseMin.y, baseMin.z);
      max.set(baseMax.x, baseMax.y, baseMax.z);
    } else {
      min.set(0, 0, 0);
      max.set(0, 0, 0);
    }

    const mesh = <ModelMesh>this.mesh;
    const positions = mesh.getPositions();
    const { x: minX, y: minY, z: minZ } = min;
    const { x: maxX, y: maxY, z: maxZ } = max;
    positions[0].set(minX, minY, maxZ);
    positions[1].set(maxX, minY, maxZ);
    positions[2].set(maxX, minY, minZ);
    positions[3].set(minX, minY, minZ);
    positions[4].set(minX, maxY, maxZ);
    positions[5].set(maxX, maxY, maxZ);
    positions[6].set(maxX, maxY, minZ);
    positions[7].set(minX, maxY, minZ);
    mesh.setPositions(positions);
    mesh.uploadData(false);
    this.entity.isActive = true;
  }

  _render(camera: Camera) {
    this.updateVertices();
    // @ts-ignore
    super._render(camera);
  }
}

const defaultOptions = {
  color: new Vector4(1.0, 1.0, 1.0, 1.0),
  depthTest: true,
  blend: false,
  doubleSide: false
};

type Option = typeof defaultOptions;

const VERT_SHADER = `
uniform mat4 u_MVPMat;
attribute vec3 POSITION;
void main() {
  gl_Position = u_MVPMat * vec4(POSITION, 1.0);
}
`;

const FRAG_SHADER = `
precision mediump float;
uniform vec4 u_color;
void main() {
  gl_FragColor = u_color;
}
`;

Shader.create('outline-shader', VERT_SHADER, FRAG_SHADER);

export function createGeometryMaterial(engine: Engine, options: Partial<Option> = {}) {
  options = { ...defaultOptions, ...options };
  const material = new Material(engine, Shader.find('outline-shader'));
  material.shaderData.setVector4('u_color', options.color);

  if (options.doubleSide) {
    material.renderState.rasterState.cullMode = CullMode.Off;
  }
  if (!options.depthTest) {
    material.renderState.depthState.enabled = false;
  }

  if (options.blend) {
    const { renderState } = material;
    const target = renderState.blendState.targetBlendState;
    target.sourceColorBlendFactor = target.sourceAlphaBlendFactor = BlendFactor.SourceAlpha;
    target.destinationColorBlendFactor = target.destinationAlphaBlendFactor = BlendFactor.OneMinusSourceAlpha;
    renderState.depthState.writeEnabled = false;

    material.renderQueueType = RenderQueueType.Transparent;
  }
  return material;
}