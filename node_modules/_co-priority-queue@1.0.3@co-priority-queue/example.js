var co = require('co');
var Queue = require('./');

co(function *(){
  var queue = new Queue;

  queue.push('a', 1);
  queue.push('b', 2);
  queue.push('c', 2);

  // One consumer:
  console.log(yield queue.next());
  console.log(yield queue.next());
  console.log(yield queue.next());

  queue.push('a', 1);
  queue.push('b', 2);
  queue.push('c', 2);

  // Three parallel consumers:
  var consumers = [queue.next(), queue.next(), queue.next()];
  console.log(yield consumers);
}).catch(function(err) {
  console.error(err.stack);
});
