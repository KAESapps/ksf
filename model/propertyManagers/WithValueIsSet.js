define([
	"collections/set",
], function(
	Set
){
	// The value for this property is a Set collection created at installation time
	// The property is read only : another value cannot be set after installation (but the content of the value can be changed)
	var WithValueIsSet = function(args){
		var set = this.set;
		var install = this.install;
		this.install = function(rsc, arg){
			install.apply(this, arguments);
			set.call(this, rsc, new Set());
			// call this.set at install time to notify "observers" (WithPropertyValueBindedOnResource) of the initial value
			this.set(rsc, this.get(rsc));
		};
		// the value is read only, so the set method does not change the value of the property
		// it only changes the content of the value (as an helper method)
		this.set = function(rsc, items){
			var collection = this.get(rsc);
			items = new Set(items);
			var added = items.difference(collection);
			var removed = collection.difference(items);
			collection.deleteEach(removed);
			collection.addEach(added);
		};
	};
	return WithValueIsSet;
});