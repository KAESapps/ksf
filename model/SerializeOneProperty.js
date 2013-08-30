define([

], function(

){
	var SerializeOneProperty = function(args){
		var propName = args.property;
		this.serialize = function(rsc){
			var propMng = this.propertyManagers[propName];
			return propMng.serialize(this.getPropValue(rsc, propName));
		};
		this.deserialize = function(rsc, data){
			var propMng = this.propertyManagers[propName];
			this.setPropValue(rsc, propName, propMng.deserialize(data));
		};
	};
	return SerializeOneProperty;
});