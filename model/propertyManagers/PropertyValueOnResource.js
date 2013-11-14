define([
], function(
){
	// Property manager that stores the value on resource
	var PropertyValue = function(args){
		this.propName = args.propName;
	};
	PropertyValue.prototype = {
		install: function(rsc, arg){
		},
		uninstall: function(rsc){
			rsc.remove(this.propName);
		},
		getValue: function(rsc){
			return rsc.get(this.propName);
		},
		setValue: function(rsc, value){
			rsc.set(this.propName, value);
		},
		getRsc: function(valueToFind){
			console.warn('getRsc is not able to find the resource with', this.propName, 'equals', valueToFind);
		},
	};
	return PropertyValue;
});