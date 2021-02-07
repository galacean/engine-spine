"use strict";

// Most of the code comes from co-queue created by Julian Gruber
// https://github.com/segmentio/co-queue

var Queue = function() {
  this.buffer = [];
  this.fns = [];
};

Queue.prototype.push = function(data, priority) {
  if (this.fns.length)
    return this.fns.shift()(null, data);
  var item = { data: data, priority: priority };
  var index = sortedIndex(this.buffer, item, function(item) {
    return item.priority;
  });
  this.buffer.splice(index, 0, item);
};

Queue.prototype.next = function() {
  var that = this;
  return function(fn) {
    if (that.buffer.length)
      return fn(null, that.buffer.pop().data);
    that.fns.push(fn);
  };
};

var sortedIndex = function(array, value, transformer) {
  // Copied from https://github.com/lodash/lodash
  value = transformer(value);
  var low = 0;
  var high = array ? array.length : low;
  while (low < high) {
    var mid = (low + high) >>> 1;
    (transformer(array[mid]) < value)
      ? (low = mid + 1)
      : (high = mid);
  }
  return low;
}

module.exports = Queue;
