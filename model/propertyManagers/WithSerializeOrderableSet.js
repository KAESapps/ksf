define([

], function(

){
	return	function(args){
		this.serialize = function(value){
			return value && value.toArray && value.toArray();
		};
		this.deserialize = function(value){
			return value;
		};
		this.serializePropName = args.serializePropName;
	};
});