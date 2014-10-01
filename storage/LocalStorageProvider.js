define([
	'../utils/compose',
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
			var self = this;
			var ret = {};
			this.keys().forEach(function(itemKey) {
				ret[itemKey] = self.getItem(itemKey);
			});
			return ret;
		},
		set: function(value) {
			var self = this;
			this.clear();
			Object.keys(value).forEach(function(itemKey) {
				self.setItem(itemKey, value[itemKey]);
			});
		},
		getItem: function(itemKey) {
			var nameSpace = this._nameSpace;
			var json = localStorage.getItem(nameSpace+'/'+itemKey);
			return deserialize(json);
		},
		setItem: function(itemKey, value) {
			var json = serialize(value);
			localStorage.setItem(this._nameSpace+'/'+itemKey, json);
		},
		removeItem: function(itemKey) {
			localStorage.removeItem(this._nameSpace+'/'+itemKey);
		},
		clear: function() {
			var self = this;
			this.keys().forEach(function(key) {
				self.removeItem(key);
			});
		},
		keys: function() {
			var nameSpace = this._nameSpace;
			var nameSpaceLength = nameSpace.length;
			return Object.keys(localStorage).reduce(function(itemKeys, lsKey) {
				if (lsKey.slice(0, nameSpaceLength) === nameSpace) {
					var itemKey = lsKey.slice(nameSpaceLength+1);
					itemKeys.push(itemKey);
				}
				return itemKeys;
			}, []);
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

	LocalStorageProvider.Store = IncrementalLocalStorage;
	LocalStorageProvider.Item = LocalStorage;

	return LocalStorageProvider;
});