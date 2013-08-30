define([
	'collections/listen/property-changes',
], function(
	propChange
){
	// mixin for mirroring the value setted here on a property of the resource
	// and for setting a new value here when it is changed on the resource directly
	var WithPropertyValueBindedOnResource = function(args){
		var install = this.install;
		var uninstall = this.uninstall;
		var set = this.set;
		var activeResources = [];

		this.install = function(rsc, arg){
			install.apply(this, arguments);
			// if no initial value was provided and that the resource property is defined, use it's value as the initial value
			// so if an initial value is provided at creation, the resource property value is overridden otherwise we use the resource initial property value if it is defined
			if (arguments.length === 1 && (args.name in rsc)) {
				this.set(rsc, rsc[args.name]);
			}
			// start observing value changes for this property on resource
			propChange.addOwnPropertyChangeListener(rsc, args.name, function(value){
				if (! activeResources.has(rsc)){
					activeResources.add(rsc);
					this.set(rsc, value);
					activeResources.delete(rsc);
				}
			}.bind(this));
		};
		this.set = function(rsc, value){
			set.apply(this, arguments);
			if (! activeResources.has(rsc)){
				activeResources.add(rsc);
				value = this.get(rsc); // use getter
				rsc[args.name] = value;
				activeResources.delete(rsc);
			}
		};
	};
	return WithPropertyValueBindedOnResource;
});