var expect = require('chai').expect;
var trigger = require('../index.js');

describe('trigger', function() {
	'use strict';

	var t;
	beforeEach(function() {
		// create a new trigger for testing
		t = trigger.create();
	});

	it('does not accept invalid argument types', function() {
		expect(function() {
			trigger.create(3);
		}).to.throw(Error);
		expect(function() {
			t.on(1, 2);
		}).to.throw(Error);
		expect(function() {
			t.on('e', 2);
		}).to.throw(Error);
		expect(function() {
			t.off(1, 2);
		}).to.throw(Error);
		expect(function() {
			t.off('e', 2);
		}).to.throw(Error);
		expect(function() {
			t.fire(1);
		}).to.throw(Error);
	});

	it('can create a trigger from an existing object', function() {
		var obj = {};
		trigger.create(obj);
		expect(obj.on).to.be.instanceof(Function);
		expect(obj.off).to.be.instanceof(Function);
		expect(obj.fire).to.be.instanceof(Function);
	});

	it('can fire events with no listeners', function() {
		t.fire('e');
	});

	it('invokes all listeners for a fired event', function() {
		var c = 0;
		t.on('e', function() {
			c++;
		});
		t.on('e', function() {
			c++;
		});
		t.on('e', function() {
			c++;
		});
		t.fire('e');
		expect(c).to.equal(3);
	});

	it('only invokes listeners registered for the fired event', function() {
		var c = 0;
		t.on('e', function() {
			c++;
		});
		t.on('f', function() {
			c++;
		});
		t.on('g', function() {
			c++;
		});
		t.fire('e');
		expect(c).to.equal(1);
		t.fire('h');
		expect(c).to.equal(1);
	});

	it('does not invoke unregistered listeners', function() {
		var c = 0;
		var f;
		t.on('e', function() {
			c++;
		});
		t.on('e', f = function() {
			c++;
		});
		t.on('e', function() {
			c++;
		});
		t.off('e', f);
		t.fire('e');
		expect(c).to.equal(2);
	});

	it('does not invoke any listeners after all are unregistered', function() {
		var c = 0;
		t.on('e', function() {
			c++;
		});
		t.on('e', function() {
			c++;
		});
		t.on('e', function() {
			c++;
		});
		t.off('e');
		t.fire('e');
		expect(c).to.equal(0);
	});

	it('unregisters listeners that are not actually registered', function() {
		t.off('a');
		t.off('a', function() {
		});
		t.on('a', function() {
		});
		t.off('a', function() {
		});
	});

	it('passes arguments to listeners', function() {
		var a = [1, 'hello', {}];
		var p = undefined;
		t.on('e', function() {
			p = Array.prototype.slice.call(arguments, 0);
		});
		t.fire('e', a[0], a[1], a[2]);
		expect(p).to.deep.equal(a);
	});

	it('can fire event asynchronously', function(done) {
		var fired = false;
		var timeoutToken = null;
		t.on('e', function() {
			done();
		});
		t.fire('e');
		expect(fired).to.be.false;
	});

	it('does not register callbacks twice', function() {
		function cb() {
		}

		expect(t.on('event', cb)).to.be.true;
		expect(t.on('event', cb)).to.be.false;
		expect(t.listenerCount('event')).to.equal(1);
	});

	it('does not unregister callbacks not registered', function() {
		function cb() {
		}

		expect(t.off('event', cb)).to.be.false;
	});

	it('accurately counts registered callbacks', function() {
		function cb1() {
		}

		function cb2() {
		}

		expect(t.listenerCount('e')).to.equal(0);
		expect(t.hasListener('e', cb1)).to.be.false;
		expect(t.hasListener('e', cb2)).to.be.false;
		expect(t.hasListeners('e')).to.be.false;
		t.on('e', cb1);
		expect(t.listenerCount('e')).to.equal(1);
		expect(t.hasListener('e', cb1)).to.be.true;
		expect(t.hasListener('e', cb2)).to.be.false;
		expect(t.hasListeners('e')).to.be.true;
		t.on('e', cb2);
		expect(t.listenerCount('e')).to.equal(2);
		expect(t.hasListener('e', cb1)).to.be.true;
		expect(t.hasListener('e', cb2)).to.be.true;
		expect(t.hasListeners('e')).to.be.true;
		t.off('e', cb1);
		expect(t.listenerCount('e')).to.equal(1);
		expect(t.hasListener('e', cb1)).to.be.false;
		expect(t.hasListener('e', cb2)).to.be.true;
		expect(t.hasListeners('e')).to.be.true;
		t.off('e', cb2);
		expect(t.listenerCount('e')).to.equal(0);
		expect(t.hasListener('e', cb1)).to.be.false;
		expect(t.hasListener('e', cb2)).to.be.false;
		expect(t.hasListeners('e')).to.be.false;
	});

	it('reports active events', function() {
		function cb() {
		}
		expect(t.activeEvents().sort()).to.deep.equal([]);
		t.on('e1', cb);
		expect(t.activeEvents().sort()).to.deep.equal(['e1']);
		t.on('e2', cb);
		expect(t.activeEvents().sort()).to.deep.equal(['e1', 'e2']);
		t.off('e1');
		expect(t.activeEvents().sort()).to.deep.equal(['e2']);
		t.off('e2');
		expect(t.activeEvents().sort()).to.deep.equal([]);
	});
});
