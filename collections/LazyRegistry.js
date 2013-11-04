define([
	"compose/compose",
	"./Dict",
	'../utils/destroy',
], function(
	compose,
	Dict,
	destroy
){
	return compose(function() {
		this.registry = new Dict();
		this.factories = new Dict();
		this._counters = {}; // TODO: should we store the counter on each component to improve performance ?
	}, {
		get: function(id) {
			if (this.registry.has(id)){
				// only count lazily created components
				if (id in this._counters) {
					this._counters[id]++;
				}
				return this.registry.get(id);
			} else {
				var factory = this.factories.get(id);
				if (typeof factory !== 'function'){
					throw 'No factory for this id';
				}
				var cmp = factory();
				this.registry.set(id, cmp);
				this._counters[id] = 1;
				return cmp;
			}
		},
		has: function(id) {
			if (this.registry.has(id)){
				return true;
			}
			if (this.factories.has(id)){
				return true;
			}
			return false;
		},
		release: function(id) {
			// only count and destroy lazily created components
			if (id in this._counters){
				var counter = --this._counters[id];
				if (counter === 0) {
					destroy(this.registry.get(id));
					this.registry.remove(id);
					delete this._counters[id];
				} else {
					this._counters[id]--;
				}
			}
		},
		// shortcuts to "this.registry" in order to be backward compatible and allow shorter syntax in composite implementations
		// but that can be sometimes incoherent since we can have <code> this.has('cmp1') === true </code> and after that we can receive a change of type 'add' for this key when the component is effectively created and added to this.registry
		set: function() { return this.registry.set.apply(this.registry, arguments); },
		setEach: function() { return this.registry.setEach.apply(this.registry, arguments); },
		add: function() { return this.registry.add.apply(this.registry, arguments); },
		addEach: function() { return this.registry.addEach.apply(this.registry, arguments); },
		remove: function() { return this.registry.remove.apply(this.registry, arguments); },
		asChangesStream: function() { return this.registry.asChangesStream.apply(this.registry, arguments); },
		whenChanged: function() { return this.registry.whenChanged.apply(this.registry, arguments); },
		whenDefined: function() { return this.registry.whenDefined.apply(this.registry, arguments); },
		whenDefinedEach: function() { return this.registry.whenDefinedEach.apply(this.registry, arguments); },
	});

});