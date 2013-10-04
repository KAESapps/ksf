define([
	'ksf/collections/OrderableSet',
], function(
	OrderableSet
){
	// The value for this property is an OrderableSet created at installation time
	// The property is read only : another value cannot be set after installation (but the content of the value can be changed)

	return function(args){
		var setValue = this.setValue;
		var install = this.install;
		this.install = function(rsc){
			install.apply(this, arguments);
			setValue.call(this, rsc, new OrderableSet());
			// call this.setValue at install time to notify "observers" (WithPropertyValueBindedOnResource) of the initial value
			this.setValue(rsc, this.getValue(rsc));
		};
		// the value is read only, so the setValue method does not change the value of the property
		// it only changes the content of the value (it is an helper method)
		this.setValue = function(rsc, items){
			if (!items || !items.forEach || items.length === 0){return;}
			var collection = this.getValue(rsc);

			collection._startChanges();
			// remove items
			collection.clone().forEach(function(item){
				if (items.indexOf(item) === -1){
					collection.remove(item);
				}
			});
			// order current items and add new items
			items.forEach(function(item, index){
				if (collection.get(index) !== item) {
					var currentIndex = collection.indexOf(item);
					if (currentIndex !== -1) {
						collection.remove(currentIndex);
					}
					collection.add(item, index);
				}
			});
			collection._stopChanges();
		};
	};
});