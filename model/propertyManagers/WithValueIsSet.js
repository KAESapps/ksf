define([
	"ksf/collections/Set",
], function(
	Set
){
	// The value for this property is a Set collection created at installation time
	// The property is read only : another value cannot be set after installation (but the content of the value can be changed)
	var WithValueIsSet = function(args){
		var setValue = this.setValue;
		var install = this.install;
		this.install = function(rsc, arg){
			install.apply(this, arguments);
			setValue.call(this, rsc, new Set());
			// call this.setValue at install time to notify "observers" (WithPropertyValueBindedOnResource) of the initial value
			this.setValue(rsc, this.getValue(rsc));
		};
		// the value is read only, so the setValue method does not change the value of the property
		// it only changes the content of the value (as an helper method)
		this.setValue = function(rsc, items){
			var collection = this.getValue(rsc);
			items = new Set(items);
			var added = items.difference(collection);
			var removed = collection.difference(items);
			collection.removeEach(removed);
			collection.addEach(added);
		};
	};
	return WithValueIsSet;
});