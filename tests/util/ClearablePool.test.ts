import { expect } from 'chai';
import { ClearablePool } from '../../src/util/ClearablePool'; // 确保导入路径正确

// 定义一个简单的测试类
class TestClass {
  constructor(public id = Math.random()) {}
}

describe('ClearablePool', function() {
  let pool;

  beforeEach(() => {
    pool = new ClearablePool(TestClass);
  });

  describe('Initialization', function() {
    it('should initialize with an empty pool', function() {
      expect(pool).to.have.property('_elements').that.is.an('array').that.is.empty;
      expect(pool._usedElementCount).to.equal(0);
    });
  });

  describe('get method', function() {
    it('should return a new instance if the pool is empty', function() {
      const instance = pool.get();
      expect(instance).to.be.an.instanceof(TestClass);
      expect(pool._usedElementCount).to.equal(1);
      expect(pool._elements).to.have.lengthOf(1);
    });

    it('should reuse an existing instance if available', function() {
      const firstInstance = pool.get();
      pool.clear(); // Reset usage count
      const secondInstance = pool.get();
      expect(secondInstance).to.equal(firstInstance);
      expect(pool._usedElementCount).to.equal(1);
      expect(pool._elements).to.have.lengthOf(1);
    });

    it('should create a new instance if all existing instances are in use', function() {
      const firstInstance = pool.get();
      const secondInstance = pool.get();
      expect(secondInstance).to.not.equal(firstInstance);
      expect(pool._usedElementCount).to.equal(2);
      expect(pool._elements).to.have.lengthOf(2);
    });
  });

  describe('clear method', function() {
    it('should reset the used element count but not the elements themselves', function() {
      pool.get(); // Get an element to increase the count
      pool.clear();
      expect(pool._usedElementCount).to.equal(0);
      expect(pool._elements).to.have.lengthOf(1); // The elements should still be there
    });
  });
});
