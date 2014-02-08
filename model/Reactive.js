define([
	'compose',
	'ksf/base/Evented',

], function(
	compose,
	Evented
){
	var Reactive = compose(Evented, function() {
		this._data = {};
		this._waitingChanges = [];
	},
	{
		set: function(prop, value) {
			this.queueChanges([{
				type: 'set',
				key: prop,
				value: value,
			}]);
			this.digest();
		},
		_set: function(prop, value) {

		},
		get: function(prop) {
			return this._data[prop];
		},
		queueChanges: function(changes) {
			this._waitingChanges.push(changes);
		},
		digest: function() {
			if (! this._digesting) {
				this._digesting = true;
				while(this._waitingChanges.length > 0){
					var changes = this._waitingChanges.pop();
					changes = this._applyChanges(changes);
					this._emit('changes', changes);
				}
				this._digesting = false;
			}
		},
		_applyChanges: function(changes) {
			changes = this._processChanges(changes);

			changes.forEach(function(change) {
				if (change.type === 'set') {
					this._data[change.key] = change.value;
				}
			}.bind(this));
			return changes;
		},
		_processChanges: function(changes) {
			return changes;
		},
	});

	return Reactive;
});