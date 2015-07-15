import compose from 'compose';
import event from '../../event';
import _Evented from 'ksf/base/_Evented';
var ObservableWithEvent = compose(function() {
    this.onValue = event();
    this.onChanges = event();
    this.onKeys = event();
});
var ObservableWithEvented = compose(_Evented);


// instanciate
var observableWithEvent = new ObservableWithEvent();
// add observers
observableWithEvent.onValue(function() {});
observableWithEvent.onValue(function() {});
observableWithEvent.onValue(function() {});

JSLitmus.test('event full test', function() {
    observableWithEvent.onValue.emit("value");
    observableWithEvent.onKeys.emit("keys");
});


// instanciate
var observableWithEvented = new ObservableWithEvented();
// add observers
observableWithEvented.on('value', function() {});
observableWithEvented.on('value', function() {});
observableWithEvented.on('value', function() {});


JSLitmus.test('Evented full test', function() {
    // emit events
    observableWithEvented._emit('value', "value");
    observableWithEvented._emit('keys', "keys");
});