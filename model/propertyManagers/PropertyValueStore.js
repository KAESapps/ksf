define([
	"collections/map",
], function(
	Map
){
	// Property manager that stores the values of resources
	var PropertyValueStore = function(args){
		this.store = new Map();
		// TODO: use an indexedSet for quicker getBy and allow to constraint to unique values
		// this.unique = args.unique;
	};
	PropertyValueStore.prototype = {
		install: function(rsc, arg){
		},
		uninstall: function(rsc){
			this.store.delete(rsc);
		},
		get: function(rsc){
			return this.store.get(rsc);
		},
		set: function(rsc, value){
			this.store.set(rsc, value);
		},
		getBy: function(valueToFind){
			var findedRsc;
			this.store.some(function(value, rsc){
				if (value === valueToFind){
					findedRsc = rsc;
					return true;
				}
			});
			return findedRsc;
		},
	};
	return PropertyValueStore;
});