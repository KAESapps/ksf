import registerSuite from 'intern!object';
import assert from 'intern/chai!assert';
import _Evented from '../_Evented';
import compose from 'compose';

var o;
var EventedObject = compose(_Evented);

registerSuite({
    beforeEach: function() {

        o = new EventedObject();
    },
    "emit without listener": function() {
        o._emit('value', "hello");
    },
    "one listener": function() {
        var observedEvents = [];
        o._on('value', function(ev) {
            observedEvents.push(ev);
        });
        o._emit('value', "hello");
        assert.deepEqual(observedEvents, [
            "hello",
        ]);
    },
    "many listeners": function() {
        var observedEvents1 = [];
        var observedEvents2 = [];
        o._on('value', function(ev) {
            observedEvents1.push(ev);
        });
        o._on('value', function(ev) {
            observedEvents2.push(ev);
        });
        o._emit('value', "hello");
        assert.deepEqual(observedEvents1, [
            "hello",
        ]);
        assert.deepEqual(observedEvents2, [
            "hello",
        ]);
    },
    "remove one listener from many": function() {
        var observedEvents1 = [];
        var observedEvents2 = [];
        var canceler1 = o._on('value', function(ev) {
            observedEvents1.push(ev);
        });
        o._on('value', function(ev) {
            observedEvents2.push(ev);
        });
        canceler1();
        o._emit('value', "hello");
        assert.deepEqual(observedEvents1, []);
        assert.deepEqual(observedEvents2, [
            "hello",
        ]);
    },
    'listening once': function() {
        var observedEvents1 = [];
        var observedEvents2 = [];
        var canceler1 = o._on('value', function(ev) {
            canceler1();
            observedEvents1.push(ev);
        });
        o._on('value', function(ev) {
            observedEvents2.push(ev);
        });
        o._emit('value', "ev1");
        o._emit('value', "ev2");

        assert.deepEqual(observedEvents1, [
            "ev1",
        ]);
        assert.deepEqual(observedEvents2, [
            "ev1",
            "ev2",
        ]);
    }
});