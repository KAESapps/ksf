define([
], function(
){
	// The value for this property is an array created at installation time
	// For implementation and usage simplicity, the ordered set is implemented with an array that is suppose to contain only unique values
	// The property is read only : another value cannot be set after installation (but the content of the value can be changed)
	//
	return function(args){
		var setValue = this.setValue;
		var install = this.install;
		this.install = function(rsc){
			install.apply(this, arguments);
			setValue.call(this, rsc, []);
			// call this.setValue at install time to notify "observers" (WithPropertyValueBindedOnResource) of the initial value
			this.setValue(rsc, this.getValue(rsc));
		};
		// the value is read only, so the setValue method does not change the value of the property
		// it only changes the content of the value (it is an helper method)
		this.setValue = function(rsc, items){
			if (!items || !items.forEach || items.length === 0){return;}
			var collection = this.getValue(rsc);
			// remove items
			collection.slice().forEach(function(item){
				if (items.find(item) === -1){
					collection.delete(item);
				}
			});
			// order current items and add new items
			items.forEach(function(item, index){
				if (collection.get(index) !== item){
					collection.delete(item);
					collection.splice(index, 0, item);
				}
			});
		};
	};
});