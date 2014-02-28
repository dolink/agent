"use strict";


var taskit = module.exports = exports = {};

/**
 * Run a queue of functions as quickly as possible, passing
 * value to each.
 */
taskit.runTasks = function runTasks(queue, value) {
    for (var i = 0; i < queue.length; i++) {
        queue[i](value);
    }
};

taskit.queue = function () {
    //
    // handler queue processing
    //
    // Credit to Twisol (https://github.com/Twisol) for suggesting
    // this type of extensible queue + trampoline approach for
    // next-tick conflation.

    var queue = [];

    /**
     * Drain the handler queue entirely, being careful to allow the
     * queue to be extended while it is being processed, and to continue
     * processing until it is truly empty.
     */
    function drainQueue() {
        taskit.runTasks(queue);
        queue = [];
    }

    /**
     * Enqueue a task. If the queue is not currently scheduled to be
     * drained, schedule it.
     * @param {function} task
     */
    return function enqueue(task) {
        if(queue.push(task) === 1) {
            process.nextTick(drainQueue);
        }
    }
};