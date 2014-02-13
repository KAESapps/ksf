define([
	'compose',
	'./Stateful'
], function(
	compose,
	Stateful
){
	return compose(function() {
		this._observableState = new Stateful({});
	}, {
		get: function() {
			return this._observableState.get();
		},
		_setState: function(state) {
			this._observableState.set(state);
		},
		_computeStateFromSet: function(arg) {
			// hook for converting set() argument into a state
		},
		set: function(arg) {
			this._setState(this._computeStateFromSet(arg));
		},
		onValue: function(listener) {
			return this._observableState.onValue(listener);
		}
	});
});