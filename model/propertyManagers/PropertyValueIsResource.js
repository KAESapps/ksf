define([

], function(

){
	// the value for this property is the resource directly
	// so, it is a read only property
	var PropertyValueIsResource = function(args){
	};
	PropertyValueIsResource.prototype = {
		install: function(rsc){
		},
		uninstall: function(rsc){
		},
		hasRsc: function(rsc){
			return true;
		},
		getValue: function(rsc){
			return rsc;
		},
		setValue: function(rsc, value){
		},
	};
	return PropertyValueIsResource;
});