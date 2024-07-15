import { expect } from 'chai';
import { ReturnablePool } from '../../src/util/ReturnablePool'; // 确保导入路径正确

// 定义一个简单的测试类
class TestClass {
  constructor(public id = Math.random()) {}
}

describe('ReturnablePool', function() {
  let pool;

  beforeEach(() => {
    pool = new ReturnablePool(TestClass, 2);
  });

  describe('Initialization', function() {
    it('should initialize with the specified number of elements', function() {
      expect(pool._elements).to.be.an('array').with.lengthOf(2);
      expect(pool._elements.every(item => item instanceof TestClass)).to.be.true;
      expect(pool._lastElementIndex).to.equal(1); // Index should be last element
    });
  });

  describe('get method', function() {
    it('should return an existing instance from the pool', function() {
      const firstInstance = pool.get();
      expect(firstInstance).to.be.an.instanceof(TestClass);
      expect(pool._lastElementIndex).to.equal(0); // Decremented index
    });

    it('should create a new instance when pool is empty', function() {
      pool.get(); // Get first instance
      pool.get(); // Get second instance
      const newElement = pool.get(); // This should create a new element
      expect(newElement).to.be.an.instanceof(TestClass);
      expect(pool._lastElementIndex).to.equal(-1); // Pool is now officially empty
    });
  });

  describe('return method', function() {
    it('should add an element back to the pool', function() {
      const element = new TestClass();
      pool.get(); // Remove one element to change the state of the pool
      pool.return(element);
      expect(pool._lastElementIndex).to.equal(1); // Index should be incremented back
      expect(pool._elements[1]).to.equal(element);
    });

    it('should correctly manage returned elements', function() {
      const element1 = pool.get();
      const element2 = pool.get();
      expect(pool._lastElementIndex).to.equal(-1); // Pool is empty

      pool.return(element2);
      expect(pool._elements[0]).to.equal(element2);
      pool.return(element1);
      expect(pool._elements[1]).to.equal(element1);
    });
  });
});
