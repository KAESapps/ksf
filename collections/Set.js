define([
	"compose/compose",
	"ksf/base/Evented",
	"./Observable",
	"./Bindable",
	"../base/Destroyable",
	'./GenericMap',
], function(
	compose,
	Evented,
	Observable,
	Bindable,
	Destroyable,
	GenericMap
){
	var GenericSet = {
		difference: function(otherSet) {
			var res = this.clone();
			res.removeEach(otherSet);
			return res;
		},

	};

	return compose(
		Evented,
		Observable,
		Bindable,
		Destroyable,
		GenericMap,
		GenericSet,
		function(values) {
			this._store = new Set();
			values && this.addEach(values);
		}, {
			add: function(value){
				this._startChanges();
				this._store.add(value);
				this._pushChanges([{type: "add", value: value, key: value}]);
				this._stopChanges();
			},
			set: function(key, value) {
				return this.add(value);
			},
			remove: function(value){
				this._startChanges();
				this._store.delete(value);
				this._pushChanges([{type: "remove", value: value, key: value}]);
				this._stopChanges();
			},
			forEach: function(cb, scope) {
				return this._store.forEach(function(v, k) {
					cb.call(scope || this, v, k, this);
				}.bind(this));
			},
		}
	);



});