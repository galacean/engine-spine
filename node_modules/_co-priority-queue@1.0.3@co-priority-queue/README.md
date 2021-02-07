# co-priority-queue [![Build Status](https://travis-ci.org/mvila/co-priority-queue.svg?branch=master)](https://travis-ci.org/mvila/co-priority-queue)

A simple priority queue for co.

## Installation

In your project folder, type:

    npm install co-priority-queue

## Example

Queue with one consumer:

    var co = require('co');
    var Queue = require('co-priority-queue');

    co(function *(){
      var queue = new Queue;
      queue.push('a', 1);
      queue.push('b', 2);
      queue.push('c', 2);
      console.log(yield queue.next());
      console.log(yield queue.next());
      console.log(yield queue.next());
    })();

The output is:

    b
    c
    a

Queue with multiple consumers:

    var co = require('co');
    var Queue = require('co-priority-queue');

    co(function *(){
      queue.push('a', 1);
      queue.push('b', 2);
      queue.push('c', 2);
      var consumers = [queue.next(), queue.next(), queue.next()];
      console.log(yield consumers);
    })();

The output is:

    ['b', 'c', 'a']

## API

### Queue()

Create a new priority queue.

### Queue#push(data, priority)

Add `data` into the queue with the specified `priority`.

### Queue#next()

Return the data with the highest priority. If the queue is empty, waits until a new data is added.

## Credits

API and implementation heavily inspired from [co-queue](https://github.com/segmentio/co-queue) created by Julian Gruber. Thanks to him.

## License

co-priority-queue is distributed under the MIT license.
