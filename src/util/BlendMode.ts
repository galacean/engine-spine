import { BlendMode } from "@esotericsoftware/spine-core";
import { BlendFactor, BlendOperation, Material } from "@galacean/engine";


export function setBlendMode(material: Material, blendMode: BlendMode) {
  const target = material.renderState.blendState.targetBlendState;
  switch (blendMode) {
    case BlendMode.Additive:
      target.sourceColorBlendFactor = BlendFactor.SourceAlpha;
      target.destinationColorBlendFactor = BlendFactor.One;
      target.sourceAlphaBlendFactor = BlendFactor.One;
      target.destinationAlphaBlendFactor = BlendFactor.One;
      target.colorBlendOperation = target.alphaBlendOperation =
        BlendOperation.Add;
      break;
    case BlendMode.Multiply:
      target.sourceColorBlendFactor = BlendFactor.DestinationColor;
      target.destinationColorBlendFactor = BlendFactor.Zero;
      target.sourceAlphaBlendFactor = BlendFactor.One;
      target.destinationAlphaBlendFactor = BlendFactor.Zero;
      target.colorBlendOperation = target.alphaBlendOperation =
        BlendOperation.Add;
      break;
    case BlendMode.Screen:
      target.sourceColorBlendFactor = BlendFactor.One;
      target.destinationColorBlendFactor = BlendFactor.OneMinusSourceColor;
      target.sourceAlphaBlendFactor = BlendFactor.One;
      target.destinationAlphaBlendFactor = BlendFactor.OneMinusSourceColor;
      target.colorBlendOperation = target.alphaBlendOperation =
        BlendOperation.Add;
      break;
    default: // Normal 混合模式，还不支持的混合模式都走这个
      target.sourceColorBlendFactor = BlendFactor.SourceAlpha;
      target.destinationColorBlendFactor = BlendFactor.OneMinusSourceAlpha;
      target.sourceAlphaBlendFactor = BlendFactor.One;
      target.destinationAlphaBlendFactor = BlendFactor.OneMinusSourceAlpha;
      target.colorBlendOperation = target.alphaBlendOperation =
        BlendOperation.Add;
      break;
  }
}

export function getBlendMode(material: Material): BlendMode {
  const target = material.renderState.blendState.targetBlendState;

  if (
    target.sourceColorBlendFactor === BlendFactor.SourceAlpha &&
    target.destinationColorBlendFactor === BlendFactor.One &&
    target.sourceAlphaBlendFactor === BlendFactor.One &&
    target.destinationAlphaBlendFactor === BlendFactor.One &&
    target.colorBlendOperation === BlendOperation.Add &&
    target.alphaBlendOperation === BlendOperation.Add
  ) {
    return BlendMode.Additive;
  }

  if (
    target.sourceColorBlendFactor === BlendFactor.DestinationColor &&
    target.destinationColorBlendFactor === BlendFactor.Zero &&
    target.sourceAlphaBlendFactor === BlendFactor.One &&
    target.destinationAlphaBlendFactor === BlendFactor.Zero &&
    target.colorBlendOperation === BlendOperation.Add &&
    target.alphaBlendOperation === BlendOperation.Add
  ) {
    return BlendMode.Multiply;
  }

  if (
    target.sourceColorBlendFactor === BlendFactor.One &&
    target.destinationColorBlendFactor === BlendFactor.OneMinusSourceColor &&
    target.sourceAlphaBlendFactor === BlendFactor.One &&
    target.destinationAlphaBlendFactor === BlendFactor.OneMinusSourceColor &&
    target.colorBlendOperation === BlendOperation.Add &&
    target.alphaBlendOperation === BlendOperation.Add
  ) {
    return BlendMode.Screen;
  }

  if (
    target.sourceColorBlendFactor === BlendFactor.SourceAlpha &&
    target.destinationColorBlendFactor === BlendFactor.OneMinusSourceAlpha &&
    target.sourceAlphaBlendFactor === BlendFactor.One &&
    target.destinationAlphaBlendFactor === BlendFactor.OneMinusSourceAlpha &&
    target.colorBlendOperation === BlendOperation.Add &&
    target.alphaBlendOperation === BlendOperation.Add
  ) {
    return BlendMode.Normal;
  }
  return BlendMode.Normal;
}