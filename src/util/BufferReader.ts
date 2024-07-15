export class BufferReader {
  private _dataView: DataView;
  private _position: number;
  constructor(
    public data: Uint8Array,
    byteOffset: number = 0,
    byteLength?: number,
  ) {
    this._dataView = new DataView(
      data.buffer,
      data.byteOffset + byteOffset,
      byteLength ?? data.byteLength - byteOffset
    );
    this._position = 0;
  }

  nextUint16() {
    const value = this._dataView.getUint16(this._position, true);
    this._position += 2;
    return value;
  }

  nextStr(): string {
    const strByteLength = this.nextUint16();
    const uint8Array = new Uint8Array(this.data.buffer, this._position + this._dataView.byteOffset, strByteLength);
    this._position += strByteLength;
    return this.decodeText(uint8Array);
  }

  nextImageData(): Uint8Array {
    return new Uint8Array(this.data.buffer, this.data.byteOffset + this._position);
  }

  private decodeText(array: Uint8Array): string {
    return new TextDecoder().decode(array);
  }

}
