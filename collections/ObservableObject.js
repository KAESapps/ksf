define([
	"compose/compose",
	"./WithGetSet",
	"ksf/base/Evented",
	"./Observable",
	"./Bindable",
	"../base/Destroyable"
], function(
	compose,
	WithGetSet,
	Evented,
	Observable,
	Bindable,
	Destroyable
){

	var WithMapChanges = {
		toChanges: function(type){
			return this.map(function(item, key){
				return {type: type || "add", value: item, key: key};
			});
		},
	};

	var ObservableObject = compose(
		Evented,
		Observable,
		Bindable,
		Destroyable,
		WithMapChanges,
		WithGetSet,
		function() {
			this._store = {};
		},
		{
			_Getter: function(prop){
				return this._store[prop];
			},
			_Setter: function(prop, value){
				this._store[prop] = value;
			},
			_Detector: function(prop){
				return Object.hasOwnProperty(this._store, prop);
			},
			_Remover: function(prop){
				delete this._store[prop];
			},
			forEach: function(cb, scope) {
				return Object.keys(this._store).forEach(function(k) {
					cb.call(scope || this, this._store[k], k, this);
				});
			},
			map: function(cb) {
				// return this._store.map(cb, this);
				var res = new this.constructor();
				this.forEach(function(v, k) {
					res.set(k, cb(v, k, this));
				}.bind(this));
				return res;
			},
			add: function(value, prop) {
				this.set(prop, value);
			},
			addEach: function(values) {
				this.setEach(values);
			}

		}
	);

	return ObservableObject;
});