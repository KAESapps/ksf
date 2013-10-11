define([
], function(
){
	// The value for this property is a map
	// The property is read only : another value cannot be set after installation (but the content of the value can be changed)

	return function(args){
		var setValue = this.setValue;
		var install = this.install;
		this.install = function(rsc){
			install.apply(this, arguments);
			setValue.call(this, rsc, {});
			// call this.setValue at install time to notify "observers" (WithPropertyValueBindedOnResource) of the initial value
			this.setValue(rsc, this.getValue(rsc));
		};
		// the value is read only, so the setValue method does not change the value of the property
		// it only changes the content of the value (it is an helper method)
		this.setValue = function(rsc, items){
			if (typeof items !== "object"){return;}
			var collection = this.getValue(rsc);
			// remove items
			Object.keys(collection).forEach(function(key) {
				delete collection[key];
			});
			// update current keys and add new ones
			Object.keys(items).forEach(function(key) {
				collection[key] = items[key];
			});
		};
	};
});