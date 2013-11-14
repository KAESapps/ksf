define([
], function(
){
	// mixin for mirroring the value setted here on a property of the resource
	// and for setting a new value here when it is changed on the resource directly
	var WithPropertyValueBindedOnResource = function(args){
		var install = this.install;
		var uninstall = this.uninstall;
		var setValue = this.setValue;
		var activeResources = new Set();

		this.install = function(rsc, arg){
			install.apply(this, arguments);
			// if no initial value was provided and that the resource property is defined, use it's value as the initial value
			// so if an initial value is provided at creation, the resource property value is overridden otherwise we use the resource initial property value if it is defined
			if (arguments.length === 1 && (rsc.has(args.name))) {
				this.setValue(rsc, rsc.get(args.name));
			}
			// start observing value changes for this property on resource
			rsc.getR(args.name).onValue(function(value){
				if (! activeResources.has(rsc)){
					activeResources.add(rsc);
					this.setValue(rsc, value);
					activeResources.delete(rsc);
				}
			}.bind(this));
		};
		this.setValue = function(rsc, value){
			setValue.apply(this, arguments);
			if (! activeResources.has(rsc)){
				activeResources.add(rsc);
				value = this.getValue(rsc); // use getter
				rsc.set(args.name, value);
				activeResources.delete(rsc);
			}
		};
	};
	return WithPropertyValueBindedOnResource;
});