define([
	"compose/compose",
	"./Dict",
	'../utils/destroy',
], function(
	compose,
	Dict,
	destroy
){
	var WithGetOrCreate = function() {
		this._counters = {}; // TODO: should we store the counter on each component to improve performance ?
	};
	WithGetOrCreate.prototype = {
		getOrCreate: function(id) {
			if (this.has(id)){
				// only count lazily created components
				if (id in this._counters) {
					this._counters[id]++;
				}
				return this.get(id);
			} else {
				var factory = this.factories.get(id);
				if (typeof factory !== 'function'){
					throw 'No factory for this id';
				}
				var cmp = factory();
				this.set(id, cmp);
				this._counters[id] = 1;
				return cmp;
			}
		},
		release: function(id) {
			// only count and destroy lazily created components
			if (id in this._counters){
				var counter = --this._counters[id];
				if (counter === 0) {
					destroy(this.get(id));
					this.remove(id);
					delete this._counters[id];
				} else {
					this._counters[id]--;
				}
			}
		},

	};

	return compose(Dict, WithGetOrCreate, function() {
		this.factories = new Dict();
	});

});