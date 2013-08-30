define([

], function(

){
	var GenericList = {
		addEach: function(values, index){
			this._startChanges();
			values.forEach(function(value, key){
				this.add(value, index+key);
			}, this);
			this._stopChanges();
		},
		set: function(index, value){
			this._startChanges();
			this.remove(index);
			this.add(value, index);
			this._stopChanges();
		},
		removeEach: function(indexes){
			this._startChanges();
			indexes.forEach(this.remove, this);
			this._stopChanges();
		},
		removeRange: function(index, length){
			this._startChanges();
			for (var i = index; i < length; i++){
				this.remove(i);
			}
			this._stopChanges();
		},
		clear: function(){
			this._startChanges();
			for (var i = this.length; i > 0 ; i--){
				this.remove(0);
			}
			this._stopChanges();
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
		// apply changes to current content
		updateContent: function(changes){
			this._startChanges();
			changes.forEach(function(change){
				if (change.type === "add"){
					this.add(change.value, change.index);
				}
				if (change.type === "remove"){
					this.remove(change.index);
				}
			}, this);
			this._stopChanges();
		},
		// update content of this with changes from stream
		// store handler, to call it on destroy
		updateContentR: function(changesStream){
			return this.own(changesStream.onValue(this, "updateContent"));
		},
		// replace content of this with items from source and keep updating it incrementally
		setContentIncremental: function(source){
			this.setContent(source);
			return this.updateContentR(source.asStream("changes"));
		},
		move: function(from, to){
			this._startChanges();
			var value = this.get(from);
			this.remove(from);
			this.add(value, to);
			this._stopChanges();
		},
		has: function(value){
			return this.indexOf(value) !== -1;
		},
		clone: function(){
			var clone = new this.constructor();
			clone.addEach(this);
			return clone;
		},
		concat: function(list){
			var output = new this.constructor();
			output.addEach(this);
			output.addEach(list);
			return output;
		},
		toChanges: function(type){
			if (type === "remove"){
				return this.map(function(item){
					return {type: "remove", value: item, index: 0};
				});
			}
			return this.map(function(item, index){
				return {type: "add", value: item, index: index};
			});
		},
	};
	return GenericList;
});