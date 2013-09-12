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

	var ObservableSet = compose(
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
			has: function(value) {
				return this._store.has(value);
			},
			forEach: function(cb) {
				var scope = arguments.length > 1 ? arguments[1] : null;
				return this._store.forEach(function(v, k) {
					cb.call(scope, v, k, this);
				}.bind(this));
			},
		}
	);

	Object.defineProperty(ObservableSet.prototype, "length", {
		get: function(){
			return this._store.size;
		}
	});

	return ObservableSet;



});