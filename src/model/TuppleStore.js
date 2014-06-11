define([
	'compose',
], function(
	compose
){
	/**
		Transforme des changements de la forme 'tupple' en key/value et inversement pour les notifications
	*/
	var TuppleStore = compose(function(storage) {
		this._storage = storage;
	}, {
		_pathValue2tupple: function(pathValue) {
			var path = pathValue[0];
			var value = pathValue[1];
			var tupple = path.split('/');
			tupple.push(value);
			return tupple;
		},
		_tupple2pathValue: function(tupple) {
			var length = tupple.length;
			var value = tupple[length-1];
			var path = tupple[0];
			for (var i = 1; i < length-1; i++) {
				path = path + '/' + tupple[i];
			}
			return [path, value];
		},
		change: function(tupple) {
			var pathValue = this._tupple2pathValue(tupple);
			return this._storage.set(pathValue[0], pathValue[1]).then(this._pathValue2tupple);
		},
		onChange: function(cb) {
			var pathValue2tupple = this._pathValue2tupple;
			return this._storage.onChange(function(change) {
				cb(pathValue2tupple(change));
			});
		},
		getAll: function() {
			var pathValue2tupple = this._pathValue2tupple;
			return this._storage.getAll().then(function(values) {
				return Object.keys(values).map(function(path) {
					var value = values[path];
					return pathValue2tupple([path, value]);
				});
			});
		},
	});
	return TuppleStore;
});