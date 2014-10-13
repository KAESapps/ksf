define([
	'../utils/compose',
	'../utils/JSONParseWithDates'
], function(
	compose,
	JSONParseWithDates
){
	var serialize = JSON.stringify;
	var deserialize = JSONParseWithDates;

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