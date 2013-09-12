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

	var ObservableMap = compose(
		Evented,
		Observable,
		Bindable,
		Destroyable,
		GenericMap,
		function(values) {
			this._store = new Map();
			values && this.setEach(values);
		}, {
			get: function(key) {
				return this._store.get(key);
			},
			set: function(key, value){
				this._startChanges();
				if (this.has(key)) {
					this._pushChanges([{type: "remove", value: this.get(key), key: key}]);
				}
				this._store.set(key, value);
				this._pushChanges([{type: "add", value: value, key: key}]);
				this._stopChanges();
			},
			setEach: function(values) {
				this._startChanges();
				if (values.forEach) { // for an iterable
					// allow for an array of [key, value] arrays
					if (Array.isArray(values) && values.every(function(v) {
						return Array.isArray(v) && v.length === 2;
					})) {
						values.forEach(function(v) {
							this.set(v[0], v[1]);
						}, this);
					} else {
						values.forEach(this.add, this);
					}
				} else { // for an Object instance
					Object.keys(values).forEach(function(key) {
						this.add(values[key], key);
					}, this);
				}
				this._stopChanges();
			},
			add: function(value, key) {
				return this.set(key, value);
			},
			remove: function(key){
				this._startChanges();
				this._pushChanges([{type: "remove", value: this.get(key), key: key}]);
				this._store.delete(key);
				this._stopChanges();
			},
			has: function(key) {
				return this._store.has(key);
			},
			forEach: function(cb) {
				var scope = arguments.length > 1 ? arguments[1] : null;
				return this._store.forEach(function(v, k) {
					cb.call(scope, v, k, this);
				}.bind(this));
			},
		}
	);

	Object.defineProperty(ObservableMap.prototype, "length", {
		get: function(){
			return this._store.size;
		}
	});

	return ObservableMap;




});