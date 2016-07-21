/**
 * Creates a new trigger. A trigger manages the firing of events and the
 * listeners listening to those events.
 * @param [triggerObject] the object to receive the trigger functionality; if
 * not provided a new object will be created and returned
 */
module.exports.create = function(triggerObject) {
	'use strict';

	// create the trigger object if needed
	triggerObject = triggerObject || {};

	if (!(triggerObject instanceof Object)) {
		throw new Error('"triggerObject" not an Object');
	}

	// listeners registered for different events
	var listeners = {};

	/**
	 * Registers a listener for a type of event.
	 * @param {string} event the event type
	 * @param {Function} fn the function to invoke to handle the event
	 * @return {boolean} true if listener set was modified, false if not
	 */
	function on(event, fn) {
		if (typeof event !== 'string') {
			throw new Error('"event" not a string');
		}
		if (!(fn instanceof Function)) {
			throw new Error('"fn" not a Function');
		}

		if (hasListener(event, fn)) {
			return false;
		}

		if (!hasListeners(event)) {
			listeners[event] = [];
		}
		listeners[event].push(fn);

		return true;
	}

	/**
	 * Unregisters one or all listeners for an event.
	 * @param event the event to unregister for
	 * @param [fn] if provided, the listener function to unregister; if not
	 * provided, all listeners will be unregistered
	 * @return {boolean} true if listener set was modified, false if not
	 */
	function off(event, fn) {
		if (typeof event !== 'string') {
			throw new Error('"event" not a string');
		}
		if (fn !== undefined && !(fn instanceof Function)) {
			throw new Error('"fn" not a Function');
		}

		if (fn) {
			// do we event have this listener
			if (!hasListener(event, fn)) {
				return false;
			}

			// unregistering a specific listener for the event
			listeners[event] = listeners[event].filter(function(l) {
				return l !== fn;
			});
			if (listeners[event].length === 0) {
				delete listeners[event];
			}
		} else {
			// do we have any listeners for this event?
			if (!hasListeners(event)) {
				return false;
			}

			// unregistering all listeners for the event
			delete listeners[event];
		}

		return true;
	}

	/**
	 * Fires an event.
	 * @param {string} event the event to fire
	 * @param {...*} arguments to pass to the event listeners
	 * @returns {Object} this trigger object
	 */
	function fire(event) {
		if (typeof event !== 'string') {
			throw new Error('"event" not a string');
		}

		// any listeners registered?
		if (!hasListeners(event)) {
			return triggerObject;
		}

		// get optional arguments
		var args = Array.prototype.slice.call(arguments, 1);

		// invoke listener functions
		listeners[event].slice(0).forEach(function(fn) {
			fn.apply(global, args);
		});

		return triggerObject;
	}

	/**
	 * Fires an event asynchronously. Event listeners are invoked
	 * on the next tick rather than immediately.
	 * @param {string} event the event to fire
	 * @param {...*} arguments to pass to the event listeners
	 * @returns {Object} this trigger object
	 */
	function fireAsync(event) {
		var args = Array.prototype.slice.call(arguments);
		setTimeout(function() {
			fire.apply(triggerObject, args);
		}, 0);
		return triggerObject;
	}

	/**
	 * Returns the number of listeners registered for the specified event.
	 * @param event the event to return the number of listeners for
	 * @returns {number} the number of listeners for the specified event
	 */
	function listenerCount(event) {
		return listeners[event] ? listeners[event].length : 0;
	}

	/**
	 * Returns whether the specified event has any listeners.
	 * @param event the event to check for listeners
	 * @returns {boolean} whether the event has listeners
	 */
	function hasListeners(event) {
		return listenerCount(event) > 0;
	}

	/**
	 * Returns whether the specified event has the specified listener.
	 * @param event the event to check for the listener
	 * @param fn the listener to check for
	 * @returns {boolean} whether the specified event has the specified listener
	 */
	function hasListener(event, fn) {
		return listeners[event] ?
			listeners[event].some(function(l) {
				return l === fn;
			}) :
			false;
	}

	/**
	 * Returns the events that have active listeners.
	 * @returns {Array} an array of events that have listeners registered
	 */
	function activeEvents() {
		return Object.keys(listeners);
	}

	// add our functions to the trigger object
	triggerObject.on = on;
	triggerObject.off = off;
	triggerObject.fire = fire;
	triggerObject.fireAsync = fireAsync;
	triggerObject.listenerCount = listenerCount;
	triggerObject.hasListeners = hasListeners;
	triggerObject.hasListener = hasListener;
	triggerObject.activeEvents = activeEvents;

	// return the trigger object
	return triggerObject;
};
