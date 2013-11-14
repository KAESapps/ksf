define([

], function(

){
	var GenericMap = {
		addEach: function(values) {
			this._startChanges();
			if (values.forEach) { // for an iterable
				values.forEach(this.add, this);
			} else { // for an Object instance
				Object.keys(values).forEach(function(key) {
					this.add(values[key], key);
				}, this);
			}
			this._stopChanges();
		},
		// addEach is the default implementation because "add" it is more universal : we can add only a value or a key/value pair
		setEach: function(values){
			return this.addEach(values);
		},
		removeEach: function(keys){
			this._startChanges();
			keys.forEach(this.remove, this);
			this._stopChanges();
		},
		clear: function(){
			this._startChanges();
			this.keys().forEach(this.remove, this);
			this._stopChanges();
		},
		map: function(cb) {
			var res = new this.constructor();
			this.forEach(function(v, k) {
				res.set(k, cb(v, k, this));
			}.bind(this));
			return res;
		},
		filter: function(cb) {
			var res = new this.constructor();
			this.forEach(function(v, k) {
				if (cb(v, k, this)) {
					res.set(k, v);
				}
			}.bind(this));
			return res;
		},
		keys: function() {
			var res = [];
			this.forEach(function(v, k) {
				res.push(k);
			});
			return res;
		},
		values: function() {
			var res = [];
			this.forEach(function(v, k) {
				res.push(v);
			});
			return res;
		},
		toArray: function() {
			return this.values();
		},
		entries: function() {
			var res = [];
			this.forEach(function(v, k) {
				res.push([k,v]);
			});
			return res;
		},
		toJSON: function() {
			return this.entries();
		},
		// replace the current values by the new ones
		setContent: function(values){
			this._startChanges();
			this.clear();
			this.addEach(values);
			this._stopChanges();
		},
		// replace content of this every time a new collection is pushed by the stream
		setContentR: function(valuesStream){
			return this.own(this.onValue(this, "setContent"));
		},
		clone: function(){
			var clone = new this.constructor();
			clone.addEach(this);
			return clone;
		},

		concat: function(list){
			var res = new this.constructor();
			res.addEach(this);
			res.addEach(list);
			return res;
		},
		toChanges: function(type){
			var changes = [];
			this.forEach(function(item, key){
				changes.push({type: type || "add", value: item, key: key});
			});
			return changes;
		},

	};
	return GenericMap;
});