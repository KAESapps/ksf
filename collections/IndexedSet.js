define([
	'collections/set',
	'collections/map',
	'ksf/utils/proxyFunctions',
	'../base/Evented',
], function(
	Set,
	Map,
	proxy,
	Evented
) {
	/*
	* IndexedSet is designed to store unique values (like a Set) but to allow an access by key if it is provided (mutiple values can have the same key)
	* The key can be a property of stored values or any value
	*/

	function IndexedSet(args){
		this._keyProperty = args && args.keyProperty || undefined;
		this._values = new Map();
		this._index = new Map();
		this._changing = 0;
		if (args && args.values) {
			this.addEach(args.values);
		}
	}

	var proto = IndexedSet.prototype;


	proto.add = function(value, key){
		// prevent adding a value twice
		if (this.has(value)) {
			throw "A value can not be added twice";
		}
		// if no key is provided and that key should be available on the value, get it
		if (key === undefined && this._keyProperty) {
			key = value[this._keyProperty];
		}
		// store value
		this._values.set(value, key);
		// index value by key
		this._indexValue(value, key);
		// emit event
		this._emit("added", {key: key, value: value});
		if (! this._changing) this._emit("changed");
	};

	proto.setKey = function(value, key){
		this._unindexValue(value);
		this._indexValue(value, key);
		// this._emit("changed"); // this is not really a change since all the items are still the same but only the index has changed

	};

	proto._indexValue = function(value, key){
		var values = this._index.get(key);
		if(!values){
			values = new Set();
			this._index.set(key, values);
		}
		values.add(value);
	};
	proto._unindexValue = function(value){
		var key = this.getKey(value);
		var values = this._index.get(key);
		values.delete(value);
		if (values.length === 0){
			this._index.delete(key);
		}
	};

	proto.addEach = function(values){
		this._changing++;
		var added = [];
		if (typeof values.forEach === "function") {
			values.forEach(function (value, key) {
				var done = this.add(value, key);
				if (done) { added.push(value); }
			}, this);
		} else {
			// copy other objects as map-alikes
			Object.keys(values).forEach(function (key) {
				var done = this.add(values[key], key);
				if (done) { added.push({value: values[key], key: key}); }
			}, this);
		}
		this._changing--;
		this._emit("addedMany", {
			values: added,
		});
		if (! this._changing) this._emit("changed");
	};

	proto.remove = function(value){
		var key = this.getKey(value);
		// remove value
		this._values.delete(value);
		// remove index
		var values = this._index.get(key);
		values.delete(value);
		if (values.length === 0){
			this._index.delete(key);
		}
		// emit event
		this._emit("removed", {key: key, value: value});
		if (! this._changing) this._emit("changed");


	};
	proto.removeEach = function(values){
		this._changing++;
		var removed = [];
		if (typeof values.forEach === "function") {
			values.forEach(function (value) {
				var done = this.remove(value);
				if (done) removed.push({value: value});
			}, this);
		} else {
			Object.keys(values).forEach(function (key) {
				var done = this.remove(values[key]);
				if (done) { removed.push({value: values[key]}); }
			}, this);
		}
		this._emit("removedEach", {
			values: removed,
		});
		this._changing--;
		if (! this._changing) this._emit("changed");
	};
	proto.removeAll = proto.clear = function(){
		this.removeEach(this._values.keys());
	};

	proto.swap = function(itemsToRemove, itemsToAdd){
		this._changing++;
		this.removeEach(itemsToRemove);
		this.addEach(itemsToAdd);
		this._changing--;
		this.emit("swapped", {
			added: [],
			removed: [],
		});
		if (! this._changing) this._emit("changed");
	};

	proto.getValues = function(key){
		var valuesSet = this._index.get(key);
		return valuesSet ? valuesSet.toArray() : [];
	};

	proto.forEach = function(cb){
		return this._values.forEach(function(value, key){
			cb(key, value, this);
		});
	};

	proxy.props(proto, "_values", ["length"]);

	proxy.methods(proto, "_values", {
		"has": "has",
		"getKey": "get",
	});

	proxy.methods(proto, "_index", {
		"hasKey": "has",
	});

	// Provider API
	proto.get = function(key){
		return this.getValues(key)[0];
	};
	proto.release = function(){};

	// Evented API
	proto.on = Evented.on;
	proto._emit = Evented._emit;

	return IndexedSet;
});
