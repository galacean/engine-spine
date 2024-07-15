import { expect } from 'chai';
import { BufferReader } from '../../src/util/BufferReader'; // 确保导入路径正确

describe('BufferReader', function() {
  let bufferReader;
  let buffer;

  beforeEach(() => {
    const data = new Uint8Array([0x01, 0x02, 0x00, 0x03, 'h'.charCodeAt(0), 'i'.charCodeAt(0), '！'.charCodeAt(0)]);
    buffer = data;
    bufferReader = new BufferReader(buffer);
  });

  describe('Initialization', function() {
    it('should initialize with a DataView', function() {
      expect(bufferReader).to.have.property('_dataView').that.is.instanceof(DataView);
      expect(bufferReader._dataView.byteLength).to.equal(buffer.byteLength);
    });
  });

  describe('nextUint16', function() {
    it('should correctly read the next Uint16 value', function() {
      const value = bufferReader.nextUint16();
      expect(value).to.equal(0x0201);
      expect(bufferReader._position).to.equal(2);
    });
  });

  describe('nextStr', function() {
    it('should handle multi-byte characters', function() {
      const canvas = document.createElement("canvas");
      console.log(canvas);
      const data = new Uint8Array([0x05, 0x00, 0x48, 0x65, 0x6C, 0x6C, 0x6F]); // Length 5, "Hello"
      const localBufferReader = new BufferReader(data);
      const str = localBufferReader.nextStr();
      expect(str).to.equal('Hello');
    });
  });

  describe('nextImageData', function() {
    it('should return a Uint8Array starting from the current position', function() {
      bufferReader.nextUint16(); // Skip to simulate some reading
      const imageData = bufferReader.nextImageData();
      expect(imageData).to.be.instanceOf(Uint8Array);
      expect(imageData.byteOffset).to.equal(buffer.byteOffset + 2);
    });
  });
});
