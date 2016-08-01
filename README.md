# trigger-maker
Simple event trigger maker for JavaScript.

## About

A lightweight Node.js module for adding events to any object.

## Installation

```sh
$ npm install trigger-maker
```

## Use

Add event trigger functions to an existing object, or
create a new trigger object that can be used to register event listeners
and trigger events.

The trigger object will get three new functions: `on()`, `off()` and
`trigger()`. If properties already exist with these names, they will
be overwritten.

Keep in mind that if you expose this object directly to clients, they
will have access to the `trigger()` function. If this is not desirable,
you may want to copy the `on()` and `off()` functions from the trigger
object so as to only expose them (these functions do not use `this` so
you don't have to worry about object binding).

## Existing Object

To add functionality to an existing object:

```javascript
var triggerMaker = require('trigger-maker');

var myObject = {};
triggerMaker.create(myObject);
```

## New Object

To create a new trigger object:

```javascript
var triggerMaker = require('trigger-maker');

var myTrigger = triggerMaker.create();
```

## Add a Listener

To register a listener:

```javascript
function onEvent() {
	console.log('event fired');
}

myTrigger.on('event', onEvent);
```

## Remove a Listener

To remove a previously registered listener:

```javascript
function onEvent() {
	console.log('event fired');
}

...

myTrigger.off('event', onEvent);
```

## Remove All Listeners

You can remove all listeners for an event:

```javascript
myTrigger.off('event');
```

## Fire an Event

```javascript
myTrigger.fire('event', arg1, arg2);
```

### Put It All Together

```javascript
var triggerMaker = require('trigger-maker');

var myTrigger = triggerMaker.create();

function onEvent(arg1, arg2) {
	console.log('event fired: ' + arg1 + ', ' + arg2);
}

myTrigger.on('event', onEvent);

// this will invoke onEvent()
myTrigger.fire('event', 1, 2);

myTrigger.off('event');

// this will not invoke onEvent()
myTrigger.fire('event', 3, 4);
```
