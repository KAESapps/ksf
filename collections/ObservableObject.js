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
			this._store = new Map();
		},
		{
			_Getter: function(prop){
				return this._store.get(prop);
			},
			_Setter: function(prop, value){
				this._store.set(prop, value);
			},
			_Detector: function(prop){
				return this._store.has(prop);
			},
			_Remover: function(prop){
				this._store.delete(prop);
			},
			forEach: function(cb, scope) {
				return this._store.forEach(cb, scope || this);
			},
			map: function(cb) {
				// return this._store.map(cb, this);
				var res = new Map();
				this._store.forEach(function(v, k) {
					res.set(k, cb(v));
				});
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