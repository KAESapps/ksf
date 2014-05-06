define([
	'compose',
], function(
	compose
){

	var jsonDateRx = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)(Z|([+\-])(\d{2}):(\d{2}))$/;

	var serialize = JSON.stringify;
	var deserialize = function(json) {
		return json && JSON.parse(json, function(key, value) {
			var match;
			if (typeof value === 'string') {
				match = jsonDateRx.exec(value);
				if (match) {
					return new Date(Date.UTC(
						+match[1], +match[2] - 1, +match[3], +match[4], +match[5], +match[6])
					);
				}
			}
			return value;
		});
	};

	var LocalStorage = compose(function(nameSpace) {
		this._nameSpace = nameSpace;
	}, {
		get: function() {
			var key = this._nameSpace;
			var json = localStorage.getItem(key);
			return deserialize(json);
		},
		set: function(value) {
			// console.time('stringify');
			var json = serialize(value);
			// console.timeEnd('stringify');
			// console.time('store');
			localStorage.setItem(this._nameSpace, json);
			// console.timeEnd('store');
		}
	});

	var IncrementalLocalStorage = compose(function(nameSpace) {
		this._nameSpace = nameSpace;
	}, {
		get: function() {
			var nameSpace = this._nameSpace;
			var nameSpaceLength = nameSpace.length;
			var ret = {};
			Object.keys(localStorage).forEach(function(lsKey) {
				if (lsKey.slice(0, nameSpaceLength) === nameSpace) {
					var itemKey = lsKey.slice(nameSpaceLength+1);
					ret[itemKey] = deserialize(localStorage[lsKey]);
				}
			});
			return ret;
		},
		set: function(value) {
			var self = this;
			var nameSpace = this._nameSpace;
			var nameSpaceLength = nameSpace.length;
			Object.keys(localStorage).forEach(function(lsKey) {
				if (lsKey.slice(0, nameSpaceLength) === nameSpace) {
					var itemKey = lsKey.slice(nameSpaceLength+2);
					if (itemKey in value) {
						self.setItem(itemKey, value[itemKey]);
					} else {
						self.removeItem(itemKey);
					}
				}
			});
		},
		getItem: function(itemKey) {
			var nameSpace = this._nameSpace;
			var json = localStorage.getItem(nameSpace+'/'+itemKey);
			return deserialize(json);
		},
		setItem: function(itemKey, value) {
			// console.time('stringify');
			var json = serialize(value);
			// console.timeEnd('stringify');
			// console.time('store');
			localStorage.setItem(this._nameSpace+'/'+itemKey, json);
			// console.timeEnd('store');
		},
		removeItem: function(itemKey) {
			localStorage.removeItem(this._nameSpace+'/'+itemKey);
		},
	});

	var LocalStorageProvider = compose(function(nameSpace) {
		this._nameSpace = nameSpace;
	}, {
		item: function(itemKey) {
			return new LocalStorage(this._nameSpace + '/' + itemKey);
		},
		store: function(nameSpace) {
			return new IncrementalLocalStorage(this._nameSpace + '/' + nameSpace);
		}
	});
	return LocalStorageProvider;
});